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
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [showCombineModal, setShowCombineModal] = useState(false);
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

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  const selectedCatches = catches.filter(c => selected.has(c.id));

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0 fw-bold">Catch Log</h4>
        <div className="d-flex gap-2">
          {selectMode ? (
            <button className="btn btn-outline-secondary btn-sm" onClick={exitSelectMode}>Cancel</button>
          ) : (
            <>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectMode(true)}>Select</button>
              <button className="btn btn-teal btn-sm" onClick={() => navigate('/add')}>+ Add Catch</button>
            </>
          )}
        </div>
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
        <div className="d-flex flex-column gap-2" style={{ paddingBottom: selectMode ? 80 : 0 }}>
          {sorted.map(c => (
            <CatchCard
              key={c.id}
              c={c}
              weightUnit={weightUnit}
              lengthUnit={lengthUnit}
              selectable={selectMode}
              isSelected={selected.has(c.id)}
              onSelect={() => toggleSelect(c.id)}
              onClick={() => {
                if (selectMode) { toggleSelect(c.id); return; }
                sessionStorage.setItem('log-scroll', window.scrollY);
                navigate(`/catch/${c.id}`);
              }}
            />
          ))}
        </div>
      )}

      {/* Select mode bottom bar */}
      {selectMode && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #dee2e6', padding: '12px 16px', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="text-muted small">{selected.size} selected</span>
          <button
            className="btn btn-teal btn-sm"
            disabled={selected.size < 2}
            onClick={() => setShowCombineModal(true)}
          >
            Combine {selected.size >= 2 ? `(${selected.size})` : ''}
          </button>
        </div>
      )}

      {showCombineModal && (
        <CombineModal
          catches={selectedCatches}
          onClose={() => setShowCombineModal(false)}
          onCombined={(combined) => {
            exitSelectMode();
            setShowCombineModal(false);
            navigate(`/catch/${combined.id}`);
          }}
        />
      )}
    </div>
  );
}

function CatchCard({ c, weightUnit = 'lbs', lengthUnit = 'in', onClick, selectable, isSelected, onSelect }) {
  const thumb = c.primary_filename ? `/uploads/thumbs/${c.primary_filename}` : null;

  return (
    <div
      className={`card catch-card shadow-sm${isSelected ? ' border-primary' : ''}`}
      onClick={onClick}
      style={isSelected ? { borderWidth: 2 } : {}}
    >
      <div className="card-body d-flex align-items-center gap-3 py-2">
        {selectable && (
          <input
            type="checkbox"
            className="form-check-input flex-shrink-0"
            checked={isSelected}
            onChange={onSelect}
            onClick={e => e.stopPropagation()}
            style={{ width: 18, height: 18, cursor: 'pointer' }}
          />
        )}
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

function CombineModal({ catches, onClose, onCombined }) {
  const [keepId, setKeepId] = useState(catches[0]?.id);
  const [combining, setCombining] = useState(false);

  async function handleCombine() {
    setCombining(true);
    const mergeIds = catches.filter(c => c.id !== keepId).map(c => c.id);
    try {
      const result = await api.combineCatches(keepId, mergeIds);
      onCombined(result);
    } finally {
      setCombining(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card shadow" style={{ width: '100%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="card-header d-flex align-items-center justify-content-between">
          <strong>Combine Catches</strong>
          <button className="btn-close" onClick={onClose} />
        </div>
        <div className="card-body" style={{ overflowY: 'auto' }}>
          <p className="text-muted small mb-3">Choose which catch to keep the details from. All photos will be combined into it.</p>
          <div className="d-flex flex-column gap-2">
            {catches.map(c => (
              <label key={c.id} className={`d-flex align-items-center gap-3 p-2 rounded border${keepId === c.id ? ' border-primary bg-light' : ''}`} style={{ cursor: 'pointer' }}>
                <input type="radio" name="keepId" value={c.id} checked={keepId === c.id} onChange={() => setKeepId(c.id)} />
                {c.primary_filename && (
                  <img src={`/uploads/thumbs/${c.primary_filename}`} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                )}
                <div className="min-width-0">
                  {c.species && <div className="fw-semibold">{c.species}</div>}
                  <div className="text-muted small">{fmtDt(c.photo_taken_at, true)}</div>
                  {c.location_name && <div className="text-muted small">{c.location_name}</div>}
                  <div className="text-muted small">{c.photos?.length ?? 1} photo{(c.photos?.length ?? 1) !== 1 ? 's' : ''}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="card-footer d-flex gap-2 justify-content-end">
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-teal btn-sm" onClick={handleCombine} disabled={combining}>
            {combining ? 'Combining…' : 'Combine'}
          </button>
        </div>
      </div>
    </div>
  );
}
