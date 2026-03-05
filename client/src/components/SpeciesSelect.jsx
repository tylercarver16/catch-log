export default function SpeciesSelect({ value, onChange, commonSpecies = [], extendedSpecies = [], name = 'species' }) {
  return (
    <select className="form-select" name={name} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">— Select species —</option>
      <optgroup label="Common">
        {commonSpecies.map(s => <option key={s} value={s}>{s}</option>)}
      </optgroup>
      {extendedSpecies.length > 0 && (
        <optgroup label="All Species">
          {extendedSpecies.map(s => <option key={s} value={s}>{s}</option>)}
        </optgroup>
      )}
    </select>
  );
}
