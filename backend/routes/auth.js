const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { supabase } = require('../utils/supabase');
const { sendEmail } = require('../utils/email');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', username);
      
    if (error) {
      console.error('Login database error', error);
      return res.status(500).json({ message: 'Internal database error' });
    }
    
    const user = users && users[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
      
    if (error) {
      console.error('Forgot-password database error', error);
      return res.status(500).json({ message: 'Internal database error' });
    }
    
    const user = users && users[0];
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ reset_token: token, reset_token_expiry: expiry })
      .eq('id', user.id);
      
    if (updateError) {
      console.error('Reset token update error', updateError);
      return res.status(500).json({ message: 'Failed to update reset token' });
    }
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&username=${encodeURIComponent(user.username)}`;
    const html = `<p>Hello ${user.name || user.username},</p><p>Click <a href="${resetUrl}">here</a> to reset your password (expires in 1 hour).</p>`;
    
    await sendEmail({ to: user.email, subject: 'FUO Diet - Password reset', html });
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('forgot password error', err);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, username, newPassword } = req.body;
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('reset_token', token)
      .gt('reset_token_expiry', new Date().toISOString());
      
    if (error) {
      console.error('Reset password database error', error);
      return res.status(500).json({ message: 'Internal database error' });
    }
    
    const user = users && users[0];
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expiry: null
      })
      .eq('id', user.id);
      
    if (updateError) {
      console.error('Password reset update error', updateError);
      return res.status(500).json({ message: 'Failed to reset password' });
    }
    
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('reset password error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
