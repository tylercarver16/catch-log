import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { fmtWeight, fmtLength } from '../utils.js';

function computeStats(catches, weightUnit, lengthUnit) {
  if (!catches.length) return null;

  const withWeight = catches.filter(c => c.weight != null);
  const totalWeight = withWeight.reduce((s, c) => s + c.weight, 0);
  const avgWeight   = withWeight.length ? totalWeight / withWeight.length : null;
  const best        = withWeight.length ? withWeight.reduce((a, b) => b.weight > a.weight ? b : a) : null;
  const longest     = catches.filter(c => c.length != null)
                             .reduce((a, b) => (!a || b.length > a.length) ? b : a, null);

  // Species breakdown
  const speciesCounts = {};
  catches.forEach(c => {
    const s = c.species || 'Unknown';
    speciesCounts[s] = (speciesCounts[s] || 0) + 1;
  });
  const speciesList = Object.entries(speciesCounts)
    .sort((a, b) => b[1] - a[1]);

  // Personal bests per species (heaviest)
  const speciesBests = {};
  withWeight.forEach(c => {
    const s = c.species || 'Unknown';
    if (!speciesBests[s] || c.weight > speciesBests[s].weight) speciesBests[s] = c;
  });
  const bestsList = Object.entries(speciesBests)
    .sort((a, b) => b[1].weight - a[1].weight);

  // Catches by month (last 12 months)
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), count: 0, key: `${d.getFullYear()}-${d.getMonth()}` };
  });
  catches.forEach(c => {
    if (!c.photo_taken_at) return;
    const d = new Date(c.photo_taken_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find(m => m.key === key);
    if (m) m.count++;
  });

  // Top lures
  const lureCounts = {};
  catches.forEach(c => {
    if (!c.lure) return;
    lureCounts[c.lure] = (lureCounts[c.lure] || 0) + 1;
  });
  const lureList = Object.entries(lureCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Top locations
  const locCounts = {};
  catches.forEach(c => {
    if (!c.location_name) return;
    locCounts[c.location_name] = (locCounts[c.location_name] || 0) + 1;
  });
  const locList = Object.entries(locCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Time of day buckets
  const timeBuckets = { 'Early Morning\n5–8am': 0, 'Morning\n8–11am': 0, 'Midday\n11am–2pm': 0, 'Afternoon\n2–5pm': 0, 'Evening\n5–8pm': 0, 'Night\n8pm–5am': 0 };
  catches.forEach(c => {
    if (!c.photo_taken_at) return;
    const h = new Date(c.photo_taken_at).getHours();
    if (h >= 5  && h < 8)  timeBuckets['Early Morning\n5–8am']++;
    else if (h >= 8  && h < 11) timeBuckets['Morning\n8–11am']++;
    else if (h >= 11 && h < 14) timeBuckets['Midday\n11am–2pm']++;
    else if (h >= 14 && h < 17) timeBuckets['Afternoon\n2–5pm']++;
    else if (h >= 17 && h < 20) timeBuckets['Evening\n5–8pm']++;
    else                        timeBuckets['Night\n8pm–5am']++;
  });

  return { totalWeight, avgWeight, best, longest, speciesList, bestsList, months, lureList, locList, timeBuckets };
}

function BarChart({ data, maxVal, color = 'var(--teal)' }) {
  return (
    <div className="d-flex align-items-end gap-1" style={{ height: 80 }}>
      {data.map(({ label, count }) => (
        <div key={label} className="d-flex flex-column align-items-center flex-grow-1" style={{ minWidth: 0 }}>
          <div style={{ fontSize: '.65rem', color: '#6c757d', marginBottom: 2 }}>{count || ''}</div>
          <div style={{
            width: '100%',
            height: maxVal ? `${Math.round((count / maxVal) * 60)}px` : '2px',
            background: count ? color : '#e9ecef',
            borderRadius: '3px 3px 0 0',
            minHeight: 2,
            transition: 'height .3s',
          }} />
          <div style={{ fontSize: '.6rem', color: '#6c757d', marginTop: 4, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function HBar({ label, count, max, suffix = '' }) {
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between mb-1" style={{ fontSize: '.85rem' }}>
        <span>{label}</span>
        <span className="text-muted">{count}{suffix}</span>
      </div>
      <div style={{ height: 6, background: '#e9ecef', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${Math.round((count / max) * 100)}%`, background: 'var(--teal)', borderRadius: 3, transition: 'width .4s' }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card flex-grow-1">
      <div className="stat-value" style={{ fontSize: '1.6rem' }}>{value}</div>
      {sub && <div style={{ fontSize: '.75rem', color: 'var(--teal)', fontWeight: 600 }}>{sub}</div>}
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h6 className="fw-bold mb-3" style={{ color: 'var(--teal)' }}>{title}</h6>
        {children}
      </div>
    </div>
  );
}

export default function Stats() {
  const [catches, setCatches]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [lengthUnit, setLengthUnit] = useState('in');

  useEffect(() => {
    Promise.all([api.getCatches(), api.getSettings()])
      .then(([data, s]) => {
        setCatches(data);
        setWeightUnit(s.weight_unit || 'lbs');
        setLengthUnit(s.length_unit || 'in');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mt-4"><div className="spinner-border text-secondary" /></div>;

  if (!catches.length) return (
    <div className="container mt-4 text-center text-muted py-5">
      <p>No catches yet — add some to see stats.</p>
    </div>
  );

  const s = computeStats(catches, weightUnit, lengthUnit);
  const monthMax = Math.max(...s.months.map(m => m.count), 1);
  const timeEntries = Object.entries(s.timeBuckets).map(([label, count]) => ({ label: label.split('\n')[0], sub: label.split('\n')[1], count }));
  const timeMax = Math.max(...timeEntries.map(t => t.count), 1);

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h4 className="fw-bold mb-3">Stats</h4>

      {/* Summary */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <StatCard label="Total Catches" value={catches.length} />
        {s.totalWeight > 0 && (
          <StatCard label="Total Weight" value={fmtWeight(s.totalWeight, weightUnit)} />
        )}
        {s.best && (
          <StatCard
            label="Best Catch"
            value={fmtWeight(s.best.weight, weightUnit)}
            sub={s.best.species || undefined}
          />
        )}
        {s.avgWeight != null && (
          <StatCard label="Avg Weight" value={fmtWeight(parseFloat(s.avgWeight.toFixed(2)), weightUnit)} />
        )}
        {s.longest && (
          <StatCard
            label="Longest"
            value={fmtLength(s.longest.length, lengthUnit)}
            sub={s.longest.species || undefined}
          />
        )}
      </div>

      {/* Catches by month */}
      <Section title="Catches by Month">
        <BarChart data={s.months.map(m => ({ label: m.label, count: m.count }))} maxVal={monthMax} />
      </Section>

      {/* Time of day */}
      {catches.some(c => c.photo_taken_at) && (
        <Section title="Time of Day">
          <div className="d-flex align-items-end gap-1" style={{ height: 90 }}>
            {timeEntries.map(({ label, sub, count }) => (
              <div key={label} className="d-flex flex-column align-items-center flex-grow-1" style={{ minWidth: 0 }}>
                <div style={{ fontSize: '.65rem', color: '#6c757d', marginBottom: 2 }}>{count || ''}</div>
                <div style={{
                  width: '100%',
                  height: `${Math.round((count / timeMax) * 60)}px`,
                  background: count ? 'var(--teal)' : '#e9ecef',
                  borderRadius: '3px 3px 0 0',
                  minHeight: 2,
                }} />
                <div style={{ fontSize: '.6rem', color: '#6c757d', marginTop: 4, textAlign: 'center', lineHeight: 1.2 }}>
                  <div>{label}</div>
                  <div style={{ color: '#adb5bd' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Species breakdown */}
      {s.speciesList.length > 0 && (
        <Section title="Species Breakdown">
          {s.speciesList.map(([name, count]) => (
            <HBar key={name} label={name} count={count} max={s.speciesList[0][1]} suffix={` catch${count !== 1 ? 'es' : ''}`} />
          ))}
        </Section>
      )}

      {/* Personal bests by species */}
      {s.bestsList.length > 0 && (
        <Section title="Personal Bests by Species">
          <table className="table table-sm info-table mb-0">
            <tbody>
              {s.bestsList.map(([name, c]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>
                    {fmtWeight(c.weight, weightUnit)}
                    {c.length != null && <span className="text-muted ms-2">{fmtLength(c.length, lengthUnit)}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Top lures */}
      {s.lureList.length > 0 && (
        <Section title="Top Lures &amp; Baits">
          {s.lureList.map(([lure, count]) => (
            <HBar key={lure} label={lure} count={count} max={s.lureList[0][1]} suffix={` catch${count !== 1 ? 'es' : ''}`} />
          ))}
        </Section>
      )}

      {/* Top locations */}
      {s.locList.length > 0 && (
        <Section title="Top Spots">
          {s.locList.map(([loc, count]) => (
            <HBar key={loc} label={loc} count={count} max={s.locList[0][1]} suffix={` catch${count !== 1 ? 'es' : ''}`} />
          ))}
        </Section>
      )}
    </div>
  );
}
