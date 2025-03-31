import express from 'express';
import { injectDisruptiveDevice } from './disruptiveDeviceInjector';

const router = express.Router();

router.post('/disruptive-pass', async (req, res) => {
  try {
    const result = await injectDisruptiveDevice(req.body);
    res.json(result);
  } catch (err) {
    console.error("Disruptive Device injection failed:", err);
    res.status(500).json({ error: 'Disruptive Device pass error' });
  }
});

export default router;