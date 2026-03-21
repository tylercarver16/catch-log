import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import SpeciesSelect from '../components/SpeciesSelect.jsx';

const CHUNK_SIZE = 25;

export default function Import() {
  const [settings, setSettings]   = useState({ common_species: [], extended_species: [] });
  const [species, setSpecies]     = useState('');
  const [fileCount, setFileCount] = useState(0);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  // Progress state
  const [chunkIdx, setChunkIdx]       = useState(0);
  const [totalChunks, setTotalChunks] = useState(1);
  const [uploadPct, setUploadPct]     = useState(0);   // per-chunk upload %
  const [savedSoFar, setSavedSoFar]   = useState(0);

  const fileRef  = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.getSettings().then(s => { setSettings(s); setSpecies(s.default_species || ''); });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const files = Array.from(fileRef.current.files);
    if (!files.length) { setError('No files selected.'); return; }

    const notes  = e.target.notes.value;
    const chunks = [];
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      chunks.push(files.slice(i, i + CHUNK_SIZE));
    }

    setSaving(true);
    setError('');
    setChunkIdx(0);
    setTotalChunks(chunks.length);
    setUploadPct(0);
    setSavedSoFar(0);

    let running = 0;
    const allResults = [];

    try {
      for (let i = 0; i < chunks.length; i++) {
        setChunkIdx(i);
        setUploadPct(0);

        const form = new FormData();
        chunks[i].forEach(f => form.append('photos', f));
        form.set('species', species);
        if (notes) form.set('notes', notes);

        const result = await api.bulkImport(form, evt => {
          if (evt.total) setUploadPct(Math.round((evt.loaded / evt.total) * 100));
        });

        running += result.saved;
        setSavedSoFar(running);
        allResults.push(...result.results);
      }

      navigate('/import/results', {
        state: { saved: running, total: files.length, results: allResults },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed');
      setSaving(false);
    }
  }

  // Overall progress: each completed chunk is worth (1/totalChunks), current chunk contributes its upload %
  const overallPct = saving
    ? Math.round(((chunkIdx + uploadPct / 100) / totalChunks) * 100)
    : 0;

  const progressLabel = () => {
    if (!saving) return '';
    if (totalChunks > 1) {
      const phase = uploadPct < 100 ? `uploading ${uploadPct}%` : 'processing…';
      return `Batch ${chunkIdx + 1} of ${totalChunks} — ${phase}`;
    }
    return uploadPct < 100 ? `Uploading ${uploadPct}%…` : 'Processing…';
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 520 }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/settings')}>← Settings</button>
        <h4 className="fw-bold mb-0">Bulk Import</h4>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Photos</label>
          <input
            ref={fileRef}
            type="file"
            className="form-control"
            accept="image/*"
            multiple
            onChange={e => setFileCount(e.target.files.length)}
          />
          {fileCount > 0 && (
            <div className="form-text">
              {fileCount} photo{fileCount !== 1 ? 's' : ''} selected
              {fileCount > CHUNK_SIZE && ` — will upload in ${Math.ceil(fileCount / CHUNK_SIZE)} batches`}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Species (optional — applies to all)</label>
          <SpeciesSelect
            value={species}
            onChange={setSpecies}
            commonSpecies={settings.common_species}
            extendedSpecies={settings.extended_species}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Notes (optional — applies to all)</label>
          <textarea className="form-control" name="notes" rows={2} />
        </div>

        {saving && (
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <small className="text-muted">{progressLabel()}</small>
              {savedSoFar > 0 && (
                <small className="text-muted">{savedSoFar} saved</small>
              )}
            </div>
            <div className="progress" style={{ height: 6 }}>
              <div
                className="progress-bar bg-teal"
                style={{ width: `${overallPct}%`, transition: 'width 0.2s' }}
              />
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-teal w-100" disabled={saving}>
          {saving
            ? <><span className="spinner-border spinner-border-sm me-2" />{progressLabel()}</>
            : `Import${fileCount ? ` ${fileCount} photo${fileCount !== 1 ? 's' : ''}` : ''}`}
        </button>
      </form>
    </div>
  );
}
