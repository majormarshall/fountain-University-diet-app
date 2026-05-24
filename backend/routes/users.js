const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../utils/supabase');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Unauthorized' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, name, role, email, meta, created_at, updated_at');
      
    if (error) {
      console.error('Fetch users error', error);
      return res.status(500).json({ message: 'Internal server database error' });
    }
    
    res.json(users);
  } catch (err) {
    console.error('Fetch users server error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/me/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id);
      
    if (error) {
      console.error('Database query for changing password failed', error);
      return res.status(500).json({ message: 'Internal database error' });
    }
    
    const user = users && users[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) {
      return res.status(400).json({ message: 'Current password incorrect' });
    }
    
    const newHash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', req.user.id);
      
    if (updateError) {
      console.error('Updating new password failed', updateError);
      return res.status(500).json({ message: 'Failed to update password' });
    }
    
    res.json({ message: 'Password changed' });
  } catch (err) {
    console.error('Password change error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
