import { LURE_TYPES } from '../constants/lureTypes.js';

export default function LureSelect({ lureType = '', lureName = '', onChange }) {
  function setType(val) { onChange(val, lureName); }
  function setName(val) { onChange(lureType, val); }

  return (
    <div>
      <label className="form-label">Lure / Bait</label>
      <div className="d-flex gap-2">
        <select
          className="form-select"
          value={lureType}
          onChange={e => setType(e.target.value)}
          style={{ maxWidth: 150 }}
        >
          <option value="">— type —</option>
          {LURE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          type="text"
          className="form-control"
          placeholder="Name / description"
          value={lureName}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="mt-1 text-end">
        <button type="button" className="btn btn-link btn-sm p-0 text-muted" disabled>
          + Advanced
        </button>
      </div>
    </div>
  );
}
