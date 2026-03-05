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

export const SPECIES_MARKER_COLORS = { 'Largemouth Bass': '#2d6a4f' };
export const DEFAULT_MARKER_COLOR  = '#0d7377';
export function markerColor(species) {
  return SPECIES_MARKER_COLORS[species || ''] || DEFAULT_MARKER_COLOR;
}
