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

// 1. Get all users
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, name, role, email, meta, created_at, updated_at')
      .order('name', { ascending: true });
      
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

// 2. Create a new user (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  const { username, name, role, email, password } = req.body;
  
  try {
    const passwordHash = await bcrypt.hash(password || 'fuo123', 10);
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ username, name, role, email, password_hash: passwordHash }])
      .select('id, username, name, role, email')
      .single();
      
    if (error) {
      console.error('Create user database error', error);
      return res.status(400).json({ message: error.message || 'Failed to create user.' });
    }
    
    res.json(newUser);
  } catch (err) {
    console.error('Create user error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. Update an existing user (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  const { name, role, email, password } = req.body;
  const updates = { name, role, email };
  
  try {
    if (password) {
      updates.password_hash = await bcrypt.hash(password, 10);
    }
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, username, name, role, email')
      .single();
      
    if (error) {
      console.error('Update user database error', error);
      return res.status(400).json({ message: error.message || 'Failed to update user.' });
    }
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Update user error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 4. Delete a user (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    // Delete their sickle meal logs and diet plans first to avoid foreign key errors
    await supabase.from('sickle_meal_logs').delete().eq('user_id', req.params.id);
    await supabase.from('diet_plans').delete().eq('student_id', req.params.id);
    await supabase.from('diet_plans').delete().eq('created_by', req.params.id);

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);
      
    if (error) {
      console.error('Delete user database error', error);
      return res.status(400).json({ message: error.message || 'Failed to delete user.' });
    }
    
    res.json({ message: 'User successfully deleted.' });
  } catch (err) {
    console.error('Delete user error', err);
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
