import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../api.js';
import { fmtDt, fmtCoords, cloudLabel, degToCompass, markerColor, fmtWeight, fmtLength } from '../utils.js';

// leaflet's default icon breaks with bundlers, point it at the CDN instead
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

export default function Detail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [c, setC] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [settingCover, setSettingCover] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(null);
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [lengthUnit, setLengthUnit] = useState('in');

  const ref = searchParams.get('ref');

  useEffect(() => {
    Promise.all([api.getCatch(id), api.getSettings()]).then(([data, s]) => {
      setC(data);
      setActivePhoto(data.primary_filename);
      setWeightUnit(s.weight_unit || 'lbs');
      setLengthUnit(s.length_unit || 'in');
    });
  }, [id]);

  if (!c) return <div className="container mt-4"><div className="spinner-border text-secondary" /></div>;

  async function handleDelete() {
    if (!confirm('Delete this catch?')) return;
    setDeleting(true);
    await api.deleteCatch(id);
    navigate('/');
  }

  const allPhotos = c.photos?.length > 0
    ? c.photos
    : c.photo_filename ? [{ filename: c.photo_filename, is_primary: true }] : [];

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <div className="mb-3">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(ref === 'map' ? '/map' : '/')}>
          ← Back
        </button>
      </div>

      {/* Photos */}
      {activePhoto && (
        <img
          src={`/uploads/${activePhoto}`}
          alt=""
          className="detail-photo mb-2"
        />
      )}
      {allPhotos.length > 0 && (
        <div className="mb-3">
          <div className="d-flex gap-2 flex-wrap mb-2">
            {allPhotos.map(p => (
              <div key={p.filename} style={{ position: 'relative' }}>
                <img
                  src={`/uploads/thumbs/${p.filename}`}
                  alt=""
                  className={`gallery-thumb${activePhoto === p.filename ? ' active' : ''}`}
                  onClick={() => setActivePhoto(p.filename)}
                />
                {p.is_primary && allPhotos.length > 1 ? (
                  <div style={{ position: 'absolute', bottom: 3, left: 3, background: 'var(--teal)', borderRadius: 3, padding: '1px 4px', fontSize: '.6rem', color: '#fff', fontWeight: 600 }}>
                    Cover
                  </div>
                ) : null}
                {p.id != null && (
                  <button
                    style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, padding: 0, lineHeight: 1, fontSize: '.6rem', background: 'rgba(0,0,0,.55)', border: 'none', borderRadius: 3, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    disabled={deletingPhoto === p.id}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm('Delete this photo?')) return;
                      setDeletingPhoto(p.id);
                      const updated = await api.deletePhoto(id, p.id);
                      setC(updated);
                      setActivePhoto(updated.primary_filename);
                      setDeletingPhoto(null);
                    }}
                    title="Delete photo"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {allPhotos.length > 1 && activePhoto && !allPhotos.find(p => p.filename === activePhoto)?.is_primary && (
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={settingCover}
              onClick={async () => {
                setSettingCover(true);
                await api.setPrimaryPhoto(id, activePhoto);
                const updated = await api.getCatch(id);
                setC(updated);
                setSettingCover(false);
              }}
            >
              {settingCover ? 'Saving…' : 'Set as cover photo'}
            </button>
          )}
        </div>
      )}

      {/* Details */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-2">
            {c.species && <span className="badge badge-teal fs-6">{c.species}</span>}
            {c.timestamp_est && <span className="badge bg-warning text-dark">Est. time</span>}
          </div>
          <table className="table table-sm info-table mb-0">
            <tbody>
              <tr><td>Date</td><td>{fmtDt(c.photo_taken_at, true)}</td></tr>
              {c.location_name && <tr><td>Location</td><td>{c.location_name}</td></tr>}
              <tr><td>Coords</td><td className="font-monospace small">{fmtCoords(c.latitude, c.longitude)}</td></tr>
              {c.weight != null && <tr><td>Weight</td><td>{fmtWeight(c.weight, weightUnit)}</td></tr>}
              {c.length != null && <tr><td>Length</td><td>{fmtLength(c.length, lengthUnit)}</td></tr>}
              {c.lure && <tr><td>Lure</td><td>{c.lure}</td></tr>}
              {c.notes && <tr><td>Notes</td><td style={{ whiteSpace: 'pre-wrap' }}>{c.notes}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weather */}
      {c.temp != null && (
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <h6 className="card-title">Weather</h6>
            <table className="table table-sm info-table mb-0">
              <tbody>
                <tr><td>Conditions</td><td>{cloudLabel(c.cloud_cover)}</td></tr>
                <tr><td>Temp</td><td>{Math.round(c.temp)}°F</td></tr>
                <tr><td>Wind</td><td>{Math.round(c.wind_speed)} mph {degToCompass(c.wind_dir)}</td></tr>
                {c.precip > 0 && <tr><td>Precip</td><td>{c.precip}" </td></tr>}
                <tr><td>Cloud</td><td>{Math.round(c.cloud_cover)}%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mini map */}
      {c.latitude && c.longitude && (
        <div id="map-detail" className="mb-3">
          <MapContainer
            center={[c.latitude, c.longitude]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[c.latitude, c.longitude]} icon={makeIcon(markerColor(c.species))}>
              <Popup>{c.species || 'Catch'}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {/* Actions */}
      <div className="d-flex gap-2 mb-5">
        <Link to={`/catch/${id}/edit${ref ? `?ref=${ref}` : ''}`} className="btn btn-outline-secondary flex-grow-1">
          Edit
        </Link>
        <button className="btn btn-outline-danger flex-grow-1" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
