
import express from 'express';
import { injectDisruptiveDevice } from './disruptiveDeviceInjector';

const router = express.Router();

router.post('/disruptive-pass', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    
    const result = await injectDisruptiveDevice(req.body);
    res.json(result);
  } catch (err) {
    console.error("Disruptive Device injection failed:", err);
    // Return original data instead of error to prevent campaign generation from failing
    res.json(req.body);
  }
});

export default router;
