import { Router } from 'express';
import db from '../db.js';
import { COMMON_SPECIES, EXTENDED_SPECIES } from '../helpers/species.js';

const router = Router();

router.get('/', (req, res) => {
  const s = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json({ ...s, common_species: COMMON_SPECIES, extended_species: EXTENDED_SPECIES });
});

router.put('/', (req, res) => {
  const { default_species, weight_unit, length_unit } = req.body;
  db.prepare('UPDATE settings SET default_species = ?, weight_unit = ?, length_unit = ? WHERE id = 1')
    .run(default_species?.trim() || '', weight_unit || 'lbs', length_unit || 'in');
  const s = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json(s);
});

export default router;
