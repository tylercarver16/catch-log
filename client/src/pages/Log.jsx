import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { fmtDt, degToCompass } from '../utils.js';

export default function Log() {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCatches()
      .then(setCatches)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mt-4"><div className="spinner-border text-secondary" /></div>;

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0 fw-bold">Catch Log</h4>
        <button className="btn btn-teal btn-sm" onClick={() => navigate('/add')}>+ Add Catch</button>
      </div>

      {catches.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p className="mt-2">No catches yet. Add your first one!</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {catches.map(c => (
            <CatchCard key={c.id} c={c} onClick={() => navigate(`/catch/${c.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function CatchCard({ c, onClick }) {
  const thumb = c.primary_filename ? `/uploads/thumbs/${c.primary_filename}` : null;

  return (
    <div className="card catch-card shadow-sm" onClick={onClick}>
      <div className="card-body d-flex align-items-center gap-3 py-2">
        {thumb
          ? <img src={thumb} alt="" className="thumb" />
          : <div className="thumb bg-light d-flex align-items-center justify-content-center rounded text-muted" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>NO PHOTO</div>
        }
        <div className="flex-grow-1 min-width-0">
          <div className="d-flex align-items-center gap-2 mb-1">
            {c.species && (
              <span className="badge badge-teal">{c.species}</span>
            )}
            {c.timestamp_est && (
              <span className="badge bg-warning text-dark" style={{ fontSize: '.7rem' }}>Est.</span>
            )}
          </div>
          <div className="text-muted small">{fmtDt(c.photo_taken_at)}</div>
          {c.location_name && (
            <div className="text-muted small">{c.location_name}</div>
          )}
        </div>
        <div className="text-end text-muted small flex-shrink-0">
          {c.temp != null && <span>{Math.round(c.temp)}°F</span>}
          {c.wind_speed != null && (
            <div>{Math.round(c.wind_speed)} mph {degToCompass(c.wind_dir)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
