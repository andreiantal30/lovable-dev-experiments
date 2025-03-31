import express from 'express';
import { applyCreativeDirectorPass } from './applyCreativeDirectorPass';

const router = express.Router();

router.post('/cd-pass', async (req, res) => {
  try {
    const improved = await applyCreativeDirectorPass(req.body);
    res.json(improved);
  } catch (err) {
    console.error('CD pass failed:', err);
    res.status(500).json({ error: 'CD pass error' });
  }
});

export default router;