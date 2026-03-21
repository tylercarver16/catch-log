import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { fmtDt, degToCompass, fmtWeight, fmtLength } from '../utils.js';

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date (newest)' },
  { value: 'date-asc',  label: 'Date (oldest)' },
  { value: 'weight-desc', label: 'Weight (heaviest)' },
  { value: 'weight-asc',  label: 'Weight (lightest)' },
];

function sortCatches(catches, sort) {
  const sorted = [...catches];
  if (sort === 'date-desc')    sorted.sort((a, b) => new Date(b.photo_taken_at) - new Date(a.photo_taken_at));
  if (sort === 'date-asc')     sorted.sort((a, b) => new Date(a.photo_taken_at) - new Date(b.photo_taken_at));
  if (sort === 'weight-desc')  sorted.sort((a, b) => (b.weight ?? -Infinity) - (a.weight ?? -Infinity));
  if (sort === 'weight-asc')   sorted.sort((a, b) => (a.weight ?? Infinity)  - (b.weight ?? Infinity));
  return sorted;
}

export default function Log() {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(() => localStorage.getItem('log-sort') || 'date-desc');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [lengthUnit, setLengthUnit] = useState('in');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getCatches(), api.getSettings()])
      .then(([data, s]) => {
        setCatches(data);
        setWeightUnit(s.weight_unit || 'lbs');
        setLengthUnit(s.length_unit || 'in');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const saved = sessionStorage.getItem('log-scroll');
    if (saved) {
      window.scrollTo(0, parseInt(saved, 10));
      sessionStorage.removeItem('log-scroll');
    }
  }, [loading]);

  if (loading) return <div className="container mt-4"><div className="spinner-border text-secondary" /></div>;

  const sorted = sortCatches(catches, sort);

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0 fw-bold">Catch Log</h4>
        <button className="btn btn-teal btn-sm" onClick={() => navigate('/add')}>+ Add Catch</button>
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="stat-card">
          <div className="stat-value">{catches.length}</div>
          <div className="stat-label">Total Catches</div>
        </div>
        <select
          className="form-select form-select-sm w-auto"
          value={sort}
          onChange={e => { setSort(e.target.value); localStorage.setItem('log-sort', e.target.value); }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {catches.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p className="mt-2">No catches yet. Add your first one!</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {sorted.map(c => (
            <CatchCard key={c.id} c={c} weightUnit={weightUnit} lengthUnit={lengthUnit} onClick={() => {
              sessionStorage.setItem('log-scroll', window.scrollY);
              navigate(`/catch/${c.id}`);
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function CatchCard({ c, weightUnit = 'lbs', lengthUnit = 'in', onClick }) {
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
          {(c.weight != null || c.length != null || c.lure) && (
            <div className="text-muted small mt-1 d-flex gap-2">
              {c.weight != null && <span>{fmtWeight(c.weight, weightUnit)}</span>}
              {c.length != null && <span>{fmtLength(c.length, lengthUnit)}</span>}
              {c.lure && <span>{c.lure}</span>}
            </div>
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
