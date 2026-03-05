import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../api.js';
import { toLocalDatetimeInput, markerColor } from '../utils.js';
import SpeciesSelect from '../components/SpeciesSelect.jsx';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapPicker({ lat, lng, onChange }) {
  const [markerPos, setMarkerPos] = useState(lat && lng ? [lat, lng] : null);
  const markerRef = useRef();

  function ClickHandler() {
    useMapEvents({
      click(e) {
        const pos = [e.latlng.lat, e.latlng.lng];
        setMarkerPos(pos);
        onChange(pos[0], pos[1]);
      },
    });
    return null;
  }

  return (
    <>
      <ClickHandler />
      {markerPos && (
        <Marker
          position={markerPos}
          draggable
          ref={markerRef}
          eventHandlers={{
            dragend() {
              const pos = markerRef.current.getLatLng();
              setMarkerPos([pos.lat, pos.lng]);
              onChange(pos.lat, pos.lng);
            },
          }}
        />
      )}
    </>
  );
}

export default function Edit() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ref = searchParams.get('ref');

  const [c, setC]           = useState(null);
  const [settings, setSettings] = useState({ common_species: [], extended_species: [] });
  const [form, setForm]     = useState({});
  const [refetch, setRefetch] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.getCatch(id), api.getSettings()]).then(([catch_, s]) => {
      setC(catch_);
      setSettings(s);
      setForm({
        species:       catch_.species || '',
        photo_taken_at: toLocalDatetimeInput(catch_.photo_taken_at),
        latitude:      catch_.latitude ?? '',
        longitude:     catch_.longitude ?? '',
        weight:        catch_.weight ?? '',
        length:        catch_.length ?? '',
        lure:          catch_.lure || '',
        notes:         catch_.notes || '',
        temp:          catch_.temp ?? '',
        wind_speed:    catch_.wind_speed ?? '',
        wind_dir:      catch_.wind_dir ?? '',
        precip:        catch_.precip ?? '',
        cloud_cover:   catch_.cloud_cover ?? '',
      });
    });
  }, [id]);

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateCatch(id, {
        ...form,
        refetch_weather: refetch,
        photo_taken_at: form.photo_taken_at ? new Date(form.photo_taken_at).toISOString() : null,
      });
      navigate(`/catch/${id}${ref ? `?ref=${ref}` : ''}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
      setSaving(false);
    }
  }

  if (!c) return <div className="container mt-4"><div className="spinner-border text-secondary" /></div>;

  const mapCenter = c.latitude && c.longitude
    ? [c.latitude, c.longitude]
    : [39.5, -98.35];
  const mapZoom   = c.latitude ? 13 : 4;

  return (
    <div className="container mt-4" style={{ maxWidth: 560 }}>
      <h4 className="fw-bold mb-3">Edit Catch</h4>
      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label className="form-label">Species</label>
          <SpeciesSelect
            value={form.species}
            onChange={v => set('species', v)}
            commonSpecies={settings.common_species}
            extendedSpecies={settings.extended_species}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Date &amp; Time</label>
          <input
            type="datetime-local"
            className="form-control"
            value={form.photo_taken_at}
            onChange={e => set('photo_taken_at', e.target.value)}
          />
        </div>

        {/* Map picker */}
        <div className="mb-2">
          <label className="form-label">Location</label>
          <div style={{ height: 260, borderRadius: 10, overflow: 'hidden' }}>
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapPicker
                lat={c.latitude}
                lng={c.longitude}
                onChange={(lat, lng) => {
                  set('latitude', lat.toFixed(6));
                  set('longitude', lng.toFixed(6));
                }}
              />
            </MapContainer>
          </div>
          <div className="d-flex gap-2 mt-2 align-items-center">
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {
              navigator.geolocation.getCurrentPosition(pos => {
                set('latitude', pos.coords.latitude.toFixed(6));
                set('longitude', pos.coords.longitude.toFixed(6));
              });
            }}>My Location</button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {
              set('latitude', ''); set('longitude', '');
            }}>No Location</button>
          </div>
        </div>
        <div className="row g-2 mb-3">
          <div className="col">
            <input
              type="number" step="0.000001" className="form-control form-control-sm" placeholder="Latitude"
              value={form.latitude} onChange={e => set('latitude', e.target.value)}
            />
          </div>
          <div className="col">
            <input
              type="number" step="0.000001" className="form-control form-control-sm" placeholder="Longitude"
              value={form.longitude} onChange={e => set('longitude', e.target.value)}
            />
          </div>
        </div>

        <div className="row g-2 mb-3">
          <div className="col">
            <label className="form-label">Weight (lbs)</label>
            <input type="number" step="0.01" className="form-control" value={form.weight} onChange={e => set('weight', e.target.value)} />
          </div>
          <div className="col">
            <label className="form-label">Length (in)</label>
            <input type="number" step="0.1" className="form-control" value={form.length} onChange={e => set('length', e.target.value)} />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Lure / Bait</label>
          <input type="text" className="form-control" value={form.lure} onChange={e => set('lure', e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        {/* Weather */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="form-check mb-2">
              <input
                type="checkbox" className="form-check-input" id="refetch"
                checked={refetch} onChange={e => setRefetch(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="refetch">Re-fetch weather from Open-Meteo</label>
            </div>
            <div style={{ opacity: refetch ? 0.4 : 1, pointerEvents: refetch ? 'none' : 'auto' }}>
              <div className="row g-2">
                {[['Temp (°F)', 'temp', 1], ['Wind Speed (mph)', 'wind_speed', 1],
                  ['Wind Dir (°)', 'wind_dir', 1], ['Precip (in)', 'precip', 0.01],
                  ['Cloud Cover (%)', 'cloud_cover', 1]].map(([label, field, step]) => (
                  <div key={field} className="col-6">
                    <label className="form-label form-label-sm">{label}</label>
                    <input
                      type="number" step={step} className="form-control form-control-sm"
                      value={form[field]} onChange={e => set(field, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 mb-5">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(`/catch/${id}${ref ? `?ref=${ref}` : ''}`)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-teal flex-grow-1" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
