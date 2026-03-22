export const LURE_TYPES = [
  { value: 'soft_plastic', label: 'Soft Plastic' },
  { value: 'crankbait',    label: 'Crankbait' },
  { value: 'jerkbait',     label: 'Jerkbait' },
  { value: 'topwater',     label: 'Topwater' },
  { value: 'jig',          label: 'Jig' },
  { value: 'spinnerbait',  label: 'Spinnerbait' },
  { value: 'swimbait',     label: 'Swimbait' },
  { value: 'spoon',        label: 'Spoon' },
  { value: 'live_bait',    label: 'Live Bait' },
  { value: 'fly',          label: 'Fly' },
  { value: 'other',        label: 'Other' },
];

export function lureTypeLabel(value) {
  return LURE_TYPES.find(t => t.value === value)?.label ?? null;
}

export function fmtLure(lure_type, lure_name) {
  const typeLabel = lureTypeLabel(lure_type);
  if (typeLabel && lure_name) return `${typeLabel} — ${lure_name}`;
  if (typeLabel) return typeLabel;
  if (lure_name) return lure_name;
  return null;
}
