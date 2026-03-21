export const COMPASS = ['N','NNE','NE','ENE','E','ESE','SE','SSE',
                        'S','SSW','SW','WSW','W','WNW','NW','NNW'];

export function degToCompass(deg) {
  if (deg == null) return '—';
  return COMPASS[Math.round(deg / 22.5) % 16];
}

export function cloudLabel(pct) {
  if (pct == null) return '—';
  if (pct < 20)   return 'Clear';
  if (pct < 45)   return 'Mostly Clear';
  if (pct < 70)   return 'Partly Cloudy';
  if (pct < 90)   return 'Mostly Cloudy';
  return 'Overcast';
}


export function fmtCoords(lat, lng) {
  if (lat == null || lng == null) return 'No location';
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
}

export function fmtDt(isoStr, long = false) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  const month = d.toLocaleDateString('en-US', { month: long ? 'long' : 'short' });
  const time  = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${month} ${d.getDate()}, ${d.getFullYear()}  ${time}`;
}

export function toLocalDatetimeInput(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Weight: always stored as lbs internally
export function fmtWeight(lbs, unit = 'lbs') {
  if (lbs == null) return null;
  switch (unit) {
    case 'oz':     return `${(lbs * 16).toFixed(1)} oz`;
    case 'lbs_oz': {
      const w = Math.floor(lbs);
      const o = Math.round((lbs - w) * 16);
      if (w === 0) return `${o} oz`;
      if (o === 0) return `${w} lb`;
      return `${w} lb ${o} oz`;
    }
    case 'kg': return `${(lbs * 0.453592).toFixed(3)} kg`;
    default:   return `${lbs} lb`;
  }
}

// Length: always stored as inches internally
export function fmtLength(inches, unit = 'in') {
  if (inches == null) return null;
  return unit === 'cm' ? `${(inches * 2.54).toFixed(1)} cm` : `${inches} in`;
}

// Convert stored lbs → form input value(s)
// lbs_oz returns { lbs, oz }; all others return a string
export function lbsToInput(lbs, unit) {
  if (lbs == null) return unit === 'lbs_oz' ? { lbs: '', oz: '' } : '';
  switch (unit) {
    case 'oz':     return String(+(lbs * 16).toFixed(1));
    case 'lbs_oz': return { lbs: String(Math.floor(lbs)), oz: String(Math.round((lbs - Math.floor(lbs)) * 16)) };
    case 'kg':     return String(+(lbs * 0.453592).toFixed(3));
    default:       return String(lbs);
  }
}

// Convert form input value(s) back to lbs for storage
export function inputToLbs(val, unit, oz = '') {
  switch (unit) {
    case 'oz':     { const n = parseFloat(val); return isNaN(n) ? null : n / 16; }
    case 'lbs_oz': { const l = parseFloat(val) || 0; const o = parseFloat(oz) || 0; return (l === 0 && o === 0) ? null : l + o / 16; }
    case 'kg':     { const n = parseFloat(val); return isNaN(n) ? null : n / 0.453592; }
    default:       { const n = parseFloat(val); return isNaN(n) ? null : n; }
  }
}

// Convert stored inches → form input value
export function inchesToInput(inches, unit) {
  if (inches == null) return '';
  return unit === 'cm' ? String(+(inches * 2.54).toFixed(1)) : String(inches);
}

// Convert form input value back to inches for storage
export function inputToInches(val, unit) {
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  return unit === 'cm' ? n / 2.54 : n;
}

export const SPECIES_MARKER_COLORS = { 'Largemouth Bass': '#2d6a4f' };
export const DEFAULT_MARKER_COLOR  = '#0d7377';
export function markerColor(species) {
  return SPECIES_MARKER_COLORS[species || ''] || DEFAULT_MARKER_COLOR;
}
