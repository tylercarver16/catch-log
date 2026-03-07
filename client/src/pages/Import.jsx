import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import SpeciesSelect from '../components/SpeciesSelect.jsx';

export default function Import() {
  const [settings, setSettings]   = useState({ common_species: [], extended_species: [] });
  const [species, setSpecies]     = useState('');
  const [fileCount, setFileCount] = useState(0);
  const [saving, setSaving]       = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError]         = useState('');
  const fileRef  = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.getSettings().then(s => { setSettings(s); setSpecies(s.default_species || ''); });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const files = fileRef.current.files;
    if (!files.length) { setError('No files selected.'); return; }
    setSaving(true);
    setUploadPct(0);
    setError('');
    const form = new FormData(e.target);
    form.delete('photos');
    Array.from(files).forEach(f => form.append('photos', f));
    form.set('species', species);
    try {
      const result = await api.bulkImport(form, e => {
        if (e.total) setUploadPct(Math.round((e.loaded / e.total) * 100));
      });
      navigate('/import/results', { state: result });
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed');
      setSaving(false);
    }
  }

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
          {fileCount > 0 && <div className="form-text">{fileCount} photo{fileCount !== 1 ? 's' : ''} selected</div>}
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
              <small className="text-muted">
                {uploadPct < 100 ? `Uploading… ${uploadPct}%` : 'Processing photos…'}
              </small>
              <small className="text-muted">{fileCount} photo{fileCount !== 1 ? 's' : ''}</small>
            </div>
            <div className="progress" style={{ height: 6 }}>
              <div
                className="progress-bar bg-teal"
                style={{ width: uploadPct < 100 ? `${uploadPct}%` : '100%', transition: 'width 0.2s' }}
              />
            </div>
          </div>
        )}
        <button type="submit" className="btn btn-teal w-100" disabled={saving}>
          {saving
            ? <><span className="spinner-border spinner-border-sm me-2" />{uploadPct < 100 ? `Uploading ${uploadPct}%…` : 'Processing…'}</>
            : `Import${fileCount ? ` ${fileCount} photo${fileCount !== 1 ? 's' : ''}` : ''}`}
        </button>
      </form>
    </div>
  );
}
