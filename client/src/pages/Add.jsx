import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import { api } from '../api.js';
import { inputToLbs, inputToInches } from '../utils.js';
import SpeciesSelect from '../components/SpeciesSelect.jsx';
import LureSelect from '../components/LureSelect.jsx';
import MapPicker from '../components/MapPicker.jsx';

const STEP_UPLOAD   = 0;
const STEP_LOCATION = 1;
const STEP_DETAILS  = 2;

function WeatherChips({ weather }) {
  if (!weather) return <span className="text-muted small">No weather data</span>;
  const items = [
    weather.temp        != null && `${Math.round(weather.temp)}°F`,
    weather.wind_speed  != null && `${Math.round(weather.wind_speed)} mph`,
    weather.cloud_cover != null && `${Math.round(weather.cloud_cover)}% cloud`,
  ].filter(Boolean);
  return <span className="text-muted small">{items.join(' · ')}</span>;
}

export default function Add() {
  const navigate = useNavigate();
  const fileRef  = useRef();

  const [step, setStep] = useState(STEP_UPLOAD);

  // Settings
  const [settings, setSettings]   = useState({ default_species: '', common_species: [], extended_species: [] });
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [lengthUnit, setLengthUnit] = useState('in');

  // Step 1
  const [preview, setPreview]       = useState(null);
  const [primaryName, setPrimaryName] = useState('');
  const [extras, setExtras]         = useState([]);
  const [preparing, setPreparing]   = useState(false);
  const [prepError, setPrepError]   = useState('');

  // Step 2 — from prepare response
  const [prepareId, setPrepareId]   = useState('');
  const [prepData, setPrepData]     = useState(null);
  const [lat, setLat]               = useState('');
  const [lng, setLng]               = useState('');

  // Step 3
  const [species, setSpecies]           = useState('');
  const [weightVal, setWeightVal]       = useState('');
  const [weightOz, setWeightOz]         = useState('');
  const [lengthVal, setLengthVal]       = useState('');
  const [lureType, setLureType]         = useState('');
  const [lureName, setLureName]         = useState('');
  const [lureAdvanced, setLureAdvanced] = useState({});
  const [notes, setNotes]               = useState('');
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState('');

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

  async function handlePrepare() {
    const files = fileRef.current?._files;
    if (!files?.length) { setPrepError('Please select at least one photo.'); return; }
    setPreparing(true);
    setPrepError('');
    const form = new FormData();
    Array.from(files).forEach(f => form.append('photos', f));
    try {
      const data = await api.prepareCatch(form);
      setPrepareId(data.prepareId);
      setPrepData(data);
      setLat(data.lat ?? '');
      setLng(data.lng ?? '');
      setStep(STEP_LOCATION);
    } catch (err) {
      setPrepError(err.response?.data?.error || 'Upload failed');
    } finally {
      setPreparing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    const form = new FormData();
    form.append('prepareId', prepareId);
    if (lat !== '') form.append('lat', lat);
    if (lng !== '') form.append('lng', lng);
    form.append('species', species);
    form.append('weight', inputToLbs(weightVal, weightUnit, weightOz) ?? '');
    form.append('length', inputToInches(lengthVal, lengthUnit) ?? '');
    form.append('lure_type', lureType);
    form.append('lure_name', lureName);
    form.append('lure_advanced', JSON.stringify(lureAdvanced));
    form.append('notes', notes);
    try {
      await api.createCatch(form);
      navigate('/');
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Save failed');
      setSaving(false);
    }
  }

  const hasGps = lat !== '' && lng !== '' && lat != null && lng != null;
  const mapCenter = hasGps ? [parseFloat(lat), parseFloat(lng)] : [39.5, -98.35];
  const mapZoom   = hasGps ? 13 : 4;

  // ── Step 1: Upload ────────────────────────────────────────────────────────
  if (step === STEP_UPLOAD) return (
    <div className="container mt-4" style={{ maxWidth: 520 }}>
      <h4 className="fw-bold mb-3">Add Catch</h4>
      {prepError && <div className="alert alert-danger">{prepError}</div>}

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

      <button
        className="btn btn-teal w-100"
        disabled={preparing || (!preview && !primaryName)}
        onClick={handlePrepare}
      >
        {preparing
          ? <><span className="spinner-border spinner-border-sm me-2" />Reading photo…</>
          : 'Continue'}
      </button>
    </div>
  );

  // ── Step 2: Location ──────────────────────────────────────────────────────
  if (step === STEP_LOCATION) return (
    <div className="container mt-4" style={{ maxWidth: 520 }}>
      <h4 className="fw-bold mb-3">Confirm Location</h4>

      <div style={{ height: 260, borderRadius: 10, overflow: 'hidden' }} className="mb-2">
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapPicker
            lat={hasGps ? parseFloat(lat) : null}
            lng={hasGps ? parseFloat(lng) : null}
            onChange={(newLat, newLng) => {
              setLat(newLat.toFixed(6));
              setLng(newLng.toFixed(6));
            }}
          />
        </MapContainer>
      </div>

      <div className="mb-1">
        {prepData?.location_name
          ? <span className="fw-semibold">{prepData.location_name}</span>
          : <span className="text-muted">No location detected</span>
        }
      </div>
      <div className="mb-3">
        <WeatherChips weather={prepData?.weather} />
      </div>

      <div className="d-flex gap-2 mb-2">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {
          navigator.geolocation.getCurrentPosition(pos => {
            setLat(pos.coords.latitude.toFixed(6));
            setLng(pos.coords.longitude.toFixed(6));
          });
        }}>My Location</button>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {
          setLat(''); setLng('');
        }}>No Location</button>
      </div>
      <div className="row g-2 mb-4">
        <div className="col">
          <input type="number" step="0.000001" className="form-control form-control-sm" placeholder="Latitude"
            value={lat} onChange={e => setLat(e.target.value)} />
        </div>
        <div className="col">
          <input type="number" step="0.000001" className="form-control form-control-sm" placeholder="Longitude"
            value={lng} onChange={e => setLng(e.target.value)} />
        </div>
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-outline-secondary" onClick={() => setStep(STEP_UPLOAD)}>Back</button>
        <button className="btn btn-teal flex-grow-1" onClick={() => setStep(STEP_DETAILS)}>Continue</button>
      </div>
    </div>
  );

  // ── Step 3: Details ───────────────────────────────────────────────────────
  return (
    <div className="container mt-4" style={{ maxWidth: 520 }}>
      <h4 className="fw-bold mb-3">Catch Details</h4>
      {saveError && <div className="alert alert-danger">{saveError}</div>}

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
          <label className="form-label">Weight ({weightUnit === 'lbs_oz' ? 'lbs & oz' : weightUnit})</label>
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

      <div className="mb-4">
        <label className="form-label">Notes</label>
        <textarea className="form-control" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-outline-secondary" onClick={() => setStep(STEP_LOCATION)} disabled={saving}>Back</button>
        <button className="btn btn-teal flex-grow-1" onClick={handleSave} disabled={saving}>
          {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : 'Save Catch'}
        </button>
      </div>
    </div>
  );
}
