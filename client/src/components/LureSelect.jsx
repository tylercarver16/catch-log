import { useState } from 'react';
import { LURE_TYPES } from '../constants/lureTypes.js';
import { ADVANCED_CONFIG } from '../constants/lureAdvancedConfig.js';

export default function LureSelect({ lureType = '', lureName = '', lureAdvanced = {}, onChange }) {
  const [showAdvanced, setShowAdvanced] = useState(
    () => !!(lureAdvanced && Object.values(lureAdvanced).some(Boolean))
  );

  const config = ADVANCED_CONFIG[lureType] || [];

  function handleTypeChange(type) {
    setShowAdvanced(false);
    onChange(type, lureName, {});
  }

  function handleNameChange(name) {
    onChange(lureType, name, lureAdvanced);
  }

  function handleAdvancedChange(key, value) {
    onChange(lureType, lureName, { ...lureAdvanced, [key]: value });
  }

  return (
    <div>
      <label className="form-label">Lure / Bait</label>
      <div className="d-flex gap-2">
        <select
          className="form-select"
          value={lureType}
          onChange={e => handleTypeChange(e.target.value)}
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
          onChange={e => handleNameChange(e.target.value)}
        />
      </div>

      {config.length > 0 && (
        <div className="mt-1 text-end">
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-muted"
            onClick={() => setShowAdvanced(v => !v)}
          >
            {showAdvanced ? '− Advanced' : '+ Advanced'}
          </button>
        </div>
      )}

      {showAdvanced && config.length > 0 && (
        <div className="mt-2 p-3 rounded" style={{ background: 'var(--bb-surface-alt, rgba(0,0,0,.04))' }}>
          <div className="row g-2">
            {config.map(field => (
              <div key={field.key} className={field.wide ? 'col-12' : 'col-6'}>
                <label className="form-label form-label-sm mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    className="form-select form-select-sm"
                    value={lureAdvanced?.[field.key] || ''}
                    onChange={e => handleAdvancedChange(field.key, e.target.value)}
                  >
                    <option value="">—</option>
                    {field.options.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={field.placeholder}
                    value={lureAdvanced?.[field.key] || ''}
                    onChange={e => handleAdvancedChange(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
