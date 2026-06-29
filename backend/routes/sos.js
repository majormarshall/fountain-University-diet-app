const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fuo_diet_secret_2024';

function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// POST /api/sos — student/staff sends a distress alert
router.post('/', auth, async (req, res) => {
  const { alertType, message } = req.body;
  if (!alertType) return res.status(400).json({ message: 'Alert type is required' });

  try {
    // Look up full user record from DB using id from JWT
    const { data: userRows, error: userErr } = await supabase
      .from('users')
      .select('id, name, username')
      .eq('id', req.user.id)
      .limit(1);

    if (userErr || !userRows || userRows.length === 0) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    const sender = userRows[0];

    const { data, error } = await supabase
      .from('sos_alerts')
      .insert([{
        user_id: sender.id,
        username: sender.username,
        name: sender.name,
        alert_type: alertType,
        message: message || '',
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('SOS insert error:', error);
      return res.status(500).json({ message: 'Failed to send SOS alert', detail: error.message });
    }

    return res.status(201).json({ message: 'SOS alert sent successfully', id: data.id });
  } catch (err) {
    console.error('SOS error:', err);
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// GET /api/sos — nutritionist/doctor/admin fetches all pending alerts
router.get('/', auth, async (req, res) => {
  const allowed = ['nutritionist', 'doctor', 'admin'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const { data, error } = await supabase
      .from('sos_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ message: error.message });
    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/sos/:id/acknowledge — nutritionist/doctor marks alert as acknowledged
router.put('/:id/acknowledge', auth, async (req, res) => {
  const allowed = ['nutritionist', 'doctor', 'admin'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const { error } = await supabase
      .from('sos_alerts')
      .update({ status: 'acknowledged', acknowledged_by: req.user.name || req.user.username })
      .eq('id', req.params.id);

    if (error) return res.status(500).json({ message: error.message });
    return res.json({ message: 'Alert acknowledged' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
