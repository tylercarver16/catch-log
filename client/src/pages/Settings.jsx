import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../api.js';
import SpeciesSelect from '../components/SpeciesSelect.jsx';

export default function Settings() {
  const [settings, setSettings]   = useState({ default_species: '', common_species: [], extended_species: [] });
  const [species, setSpecies]     = useState('');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [lengthUnit, setLengthUnit] = useState('in');
  const [saved, setSaved]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getSettings().then(s => {
      setSettings(s);
      setSpecies(s.default_species || '');
      setWeightUnit(s.weight_unit || 'lbs');
      setLengthUnit(s.length_unit || 'in');
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await api.updateSettings({ default_species: species, weight_unit: weightUnit, length_unit: lengthUnit });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 480 }}>
      <h4 className="fw-bold mb-3">Settings</h4>

      {saved && <div className="alert alert-success">Settings saved.</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Default Species</label>
          <SpeciesSelect
            value={species}
            onChange={setSpecies}
            commonSpecies={settings.common_species}
            extendedSpecies={settings.extended_species}
          />
          <div className="form-text">Pre-selected when adding a new catch.</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Weight Unit</label>
          <select className="form-select" value={weightUnit} onChange={e => setWeightUnit(e.target.value)}>
            <option value="lbs">lbs</option>
            <option value="oz">oz</option>
            <option value="lbs_oz">lbs &amp; oz</option>
            <option value="kg">kg</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Length Unit</label>
          <select className="form-select" value={lengthUnit} onChange={e => setLengthUnit(e.target.value)}>
            <option value="in">inches (in)</option>
            <option value="cm">centimeters (cm)</option>
          </select>
        </div>

        <button type="submit" className="btn btn-teal" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>

      <hr className="my-4" />
      <h6>Tools</h6>
      <Link to="/import" className="btn btn-outline-secondary btn-sm">Bulk Import Photos</Link>

      <hr className="my-4" />
      <h6 className="text-danger">Danger Zone</h6>
      <button
        className="btn btn-outline-danger btn-sm"
        disabled={resetting}
        onClick={async () => {
          if (!confirm('Delete ALL catches and photos? This cannot be undone.')) return;
          setResetting(true);
          await axios.delete('/api/catches/all');
          setResetting(false);
          navigate('/');
        }}
      >
        {resetting ? 'Deleting…' : 'Reset All Catches'}
      </button>
    </div>
  );
}
