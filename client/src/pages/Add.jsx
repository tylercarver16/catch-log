import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { inputToLbs, inputToInches } from '../utils.js';
import SpeciesSelect from '../components/SpeciesSelect.jsx';
import LureSelect from '../components/LureSelect.jsx';

export default function Add() {
  const [settings, setSettings] = useState({ default_species: '', common_species: [], extended_species: [] });
  const [species, setSpecies]   = useState('');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [lengthUnit, setLengthUnit] = useState('in');
  const [weightVal, setWeightVal] = useState('');
  const [weightOz, setWeightOz]   = useState('');
  const [lengthVal, setLengthVal] = useState('');
  const [preview, setPreview]   = useState(null);   // object URL or null
  const [primaryName, setPrimaryName] = useState(''); // original filename for HEIC label
  const [extras, setExtras]     = useState([]);
  const [lureType, setLureType]       = useState('');
  const [lureName, setLureName]       = useState('');
  const [lureAdvanced, setLureAdvanced] = useState({});
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const fileRef  = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.getSettings().then(s => {
      setSettings(s);
      setSpecies(s.default_species || '');
      setWeightUnit(s.weight_unit || 'lbs');
      setLengthUnit(s.length_unit || 'in');
    });
  }, []);

  function isHeic(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    return ext === 'heic' || ext === 'heif';
  }

  function handleFiles(files) {
    if (!files.length) return;
    const primary = files[0];
    setPrimaryName(primary.name);
    setPreview(isHeic(primary) ? null : URL.createObjectURL(primary));
    setExtras(Array.from(files).slice(1).map(f => isHeic(f) ? null : URL.createObjectURL(f)));
    fileRef.current._files = files;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const files = fileRef.current._files;
    if (!files?.length) { setError('Please select at least one photo.'); return; }
    setSaving(true);
    setError('');
    const form = new FormData(e.target);
    Array.from(files).forEach(f => form.append('photos', f));
    form.set('species', species);
    form.set('weight', inputToLbs(weightVal, weightUnit, weightOz) ?? '');
    form.set('length', inputToInches(lengthVal, lengthUnit) ?? '');
    form.set('lure_type', lureType);
    form.set('lure_name', lureName);
    form.set('lure_advanced', JSON.stringify(lureAdvanced));
    try {
      await api.createCatch(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setSaving(false);
    }
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 520 }}>
      <h4 className="fw-bold mb-3">Add Catch</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* Photo picker */}
        <div
          className={`photo-drop mb-3${preview || primaryName ? ' has-preview' : ''}`}
          onClick={() => fileRef.current.click()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          onDragOver={e => e.preventDefault()}
        >
          {primaryName && !preview
            ? <div className="text-muted"><p className="mb-1 fw-semibold">{primaryName}</p><small>HEIC photo selected</small></div>
            : preview
              ? <img src={preview} alt="preview" />
              : <div className="text-muted"><p className="mb-1 fw-semibold">Click or drop photos here</p><small>GPS &amp; weather read automatically from EXIF</small></div>
          }
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        {extras.length > 0 && (
          <div className="d-flex gap-2 flex-wrap mb-3">
            {extras.map((url, i) => (
              url
                ? <img key={i} src={url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                : <div key={i} style={{ width: 60, height: 60, borderRadius: 6, background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <small className="text-muted" style={{ fontSize: 9 }}>HEIC</small>
                  </div>
            ))}
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Species</label>
          <SpeciesSelect
            value={species}
            onChange={setSpecies}
            commonSpecies={settings.common_species}
            extendedSpecies={settings.extended_species}
          />
        </div>

        <div className="row g-2 mb-3">
          <div className={weightUnit === 'lbs_oz' ? 'col-12' : 'col'}>
            <label className="form-label">
              Weight ({weightUnit === 'lbs_oz' ? 'lbs & oz' : weightUnit})
            </label>
            {weightUnit === 'lbs_oz' ? (
              <div className="d-flex gap-2">
                <input type="number" step="1" min="0" className="form-control" placeholder="lbs"
                  value={weightVal} onChange={e => setWeightVal(e.target.value)} />
                <input type="number" step="0.1" min="0" max="15.9" className="form-control" placeholder="oz"
                  value={weightOz} onChange={e => setWeightOz(e.target.value)} />
              </div>
            ) : (
              <input type="number"
                step={weightUnit === 'kg' ? '0.001' : weightUnit === 'oz' ? '0.1' : '0.01'}
                min="0" className="form-control"
                value={weightVal} onChange={e => setWeightVal(e.target.value)} />
            )}
          </div>
          <div className="col">
            <label className="form-label">Length ({lengthUnit})</label>
            <input type="number" step="0.1" min="0" className="form-control"
              value={lengthVal} onChange={e => setLengthVal(e.target.value)} />
          </div>
        </div>

        <div className="mb-3">
          <LureSelect
            lureType={lureType}
            lureName={lureName}
            lureAdvanced={lureAdvanced}
            onChange={(type, name, advanced) => { setLureType(type); setLureName(name); setLureAdvanced(advanced); }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea className="form-control" name="notes" rows={3} />
        </div>

        <button type="submit" className="btn btn-teal w-100" disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : 'Save Catch'}
        </button>
      </form>
    </div>
  );
}
