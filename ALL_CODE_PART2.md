# Fountain Diet App — All Code (Part 2 of 3)
# Backend Express Server

---

## 📁 backend/index.js

```js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dietRoutes = require('./routes/diet');
const foodsRoute = require('./routes/foods');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/foods', foodsRoute);

if (!process.env.NEXT_RUNTIME && (process.env.NODE_ENV !== 'production' || !process.env.VERCEL)) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log('Server listening on', PORT));
}

module.exports = app;
```

---

## 📁 backend/utils/supabase.js

```js
const { createClient } = require('@supabase/supabase-js');

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ckzzaqzkmozozgmejbpz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseUrl.startsWith('postgresql://')) {
  const match = supabaseUrl.match(/@db\.(.+?)\.supabase\.co/);
  if (match && match[1]) supabaseUrl = `https://${match[1]}.supabase.co`;
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing. Check backend/.env.local');
}

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = { supabase };
```

---

## 📁 backend/utils/email.js

```js
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return sgMail.send({ to, from: process.env.EMAIL_FROM, subject, html });
  } else {
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net', port: 587,
      auth: { user: process.env.SENDGRID_SMTP_USER || 'apikey', pass: process.env.SENDGRID_SMTP_PASSWORD || '' }
    });
    return transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  }
};

module.exports = { sendEmail };
```

---

## 📁 backend/routes/auth.js

```js
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

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { data: users, error } = await supabase
      .from('users').select('*')
      .or(`username.ilike."${username}",email.ilike."${username}"`);
    if (error) return res.status(500).json({ message: 'Internal database error' });
    const user = users && users[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role, meta: user.meta || {} } });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { data: users } = await supabase.from('users').select('*').eq('email', email);
    const user = users && users[0];
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    await supabase.from('users').update({ reset_token: token, reset_token_expiry: expiry }).eq('id', user.id);
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&username=${encodeURIComponent(user.username)}`;
    const html = `<p>Hello ${user.name || user.username},</p><p>Click <a href="${resetUrl}">here</a> to reset your password (expires in 1 hour).</p>`;
    await sendEmail({ to: user.email, subject: 'FUO Diet - Password reset', html });
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, username, newPassword } = req.body;
  try {
    const { data: users } = await supabase.from('users').select('*')
      .eq('username', username).eq('reset_token', token)
      .gt('reset_token_expiry', new Date().toISOString());
    const user = users && users[0];
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await supabase.from('users').update({ password_hash: passwordHash, reset_token: null, reset_token_expiry: null }).eq('id', user.id);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
```

---

## 📁 backend/routes/users.js

```js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../utils/supabase');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Unauthorized' });
  try { req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch (e) { return res.status(401).json({ message: 'Unauthorized' }); }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
}

// GET /api/users — list all users (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  const { data: users, error } = await supabase
    .from('users').select('id, username, name, role, email, meta, created_at, updated_at')
    .order('name', { ascending: true });
  if (error) return res.status(500).json({ message: 'Internal server database error' });
  res.json(users);
});

// POST /api/users — create user (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  const { username, name, role, email, password, meta } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password || 'fuo123', 10);
    const { data: newUser, error } = await supabase.from('users')
      .insert([{ username, name, role, email, password_hash: passwordHash, meta: meta || {} }])
      .select('id, username, name, role, email, meta').single();
    if (error) return res.status(400).json({ message: error.message || 'Failed to create user.' });
    res.json(newUser);
  } catch (err) { res.status(500).json({ message: 'Internal server error' }); }
});

// POST /api/users/bulk — bulk create (admin only)
router.post('/bulk', auth, adminOnly, async (req, res) => {
  const { users } = req.body;
  if (!Array.isArray(users) || users.length === 0)
    return res.status(400).json({ message: 'Users array is required and cannot be empty.' });
  try {
    const errors = [];
    const preparedUsers = [];
    for (let u of users) {
      if (!u.username || !u.name || !u.role) { errors.push(`User skipped: missing fields.`); continue; }
      const passwordHash = await bcrypt.hash(u.password || 'fuo123', 10);
      preparedUsers.push({ username: u.username, name: u.name, role: u.role, email: u.email || null, password_hash: passwordHash, meta: u.meta || {} });
    }
    if (preparedUsers.length === 0) return res.status(400).json({ message: 'No valid users to insert.', errors });
    const { data: newUsers, error } = await supabase.from('users').insert(preparedUsers).select('id, username, name, role, email, meta');
    if (error) return res.status(400).json({ message: error.message || 'Failed to insert users.', errors });
    res.json({ message: `Successfully onboarded ${newUsers.length} users.`, users: newUsers, errors });
  } catch (err) { res.status(500).json({ message: 'Internal server error' }); }
});

// PUT /api/users/:id — update user (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  const { name, role, email, password, meta } = req.body;
  const updates = { name, role, email };
  try {
    if (password) updates.password_hash = await bcrypt.hash(password, 10);
    if (meta !== undefined) updates.meta = meta;
    const { data: updatedUser, error } = await supabase.from('users').update(updates)
      .eq('id', req.params.id).select('id, username, name, role, email, meta').single();
    if (error) return res.status(400).json({ message: error.message || 'Failed to update user.' });
    res.json(updatedUser);
  } catch (err) { res.status(500).json({ message: 'Internal server error' }); }
});

// DELETE /api/users/:id — delete user (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await supabase.from('sickle_meal_logs').delete().eq('user_id', req.params.id);
    await supabase.from('diet_plans').delete().eq('student_id', req.params.id);
    await supabase.from('diet_plans').delete().eq('created_by', req.params.id);
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ message: error.message || 'Failed to delete user.' });
    res.json({ message: 'User successfully deleted.' });
  } catch (err) { res.status(500).json({ message: 'Internal server error' }); }
});

// POST /api/users/me/change-password
router.post('/me/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const { data: users } = await supabase.from('users').select('*').eq('id', req.user.id);
    const user = users && users[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) return res.status(400).json({ message: 'Current password incorrect' });
    const newHash = await bcrypt.hash(newPassword, 10);
    await supabase.from('users').update({ password_hash: newHash }).eq('id', req.user.id);
    res.json({ message: 'Password changed' });
  } catch (err) { res.status(500).json({ message: 'Internal server error' }); }
});

module.exports = router;
```

---

## 📁 backend/routes/foods.js

```js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../utils/supabase');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Unauthorized' });
  try { req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch (e) { return res.status(401).json({ message: 'Unauthorized' }); }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
}

// GET /api/foods
router.get('/', async (req, res) => {
  const { data: foods, error } = await supabase.from('food_items').select('*').order('name', { ascending: true });
  if (error) return res.status(500).json({ message: 'Failed to retrieve food items' });
  res.json(foods);
});

// POST /api/foods (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  const { name, category, calories, protein_g, carbs_g, fat_g, notes } = req.body;
  const { data: food, error } = await supabase.from('food_items')
    .insert([{ name, category, calories: Number(calories||0), protein_g: Number(protein_g||0), carbs_g: Number(carbs_g||0), fat_g: Number(fat_g||0), notes }])
    .select().single();
  if (error) return res.status(400).json({ message: error.message || 'Failed to create food item.' });
  res.json(food);
});

// PUT /api/foods/:id (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  const { name, category, calories, protein_g, carbs_g, fat_g, notes } = req.body;
  const { data: food, error } = await supabase.from('food_items')
    .update({ name, category, calories: Number(calories||0), protein_g: Number(protein_g||0), carbs_g: Number(carbs_g||0), fat_g: Number(fat_g||0), notes })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ message: error.message || 'Failed to update food item.' });
  res.json(food);
});

// DELETE /api/foods/:id (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  const { error } = await supabase.from('food_items').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ message: error.message || 'Failed to delete food item.' });
  res.json({ message: 'Food item successfully deleted.' });
});

module.exports = router;
```

---

## 📁 backend/routes/diet.js

```js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../utils/supabase');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Unauthorized' });
  try { req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); next(); }
  catch (e) { return res.status(401).json({ message: 'Unauthorized' }); }
}

async function populateMeals(plans) {
  if (!plans || plans.length === 0) return plans;
  const foodIds = new Set();
  plans.forEach(plan => {
    if (Array.isArray(plan.meals)) {
      plan.meals.forEach(meal => {
        if (Array.isArray(meal.items)) meal.items.forEach(item => { if (item.food) foodIds.add(item.food); });
      });
    }
  });
  const validUUIDs = Array.from(foodIds).filter(id =>
    typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
  if (validUUIDs.length === 0) return plans;
  try {
    const { data: foods } = await supabase.from('food_items').select('*').in('id', validUUIDs);
    if (!foods) return plans;
    const foodMap = {};
    foods.forEach(f => { foodMap[f.id] = f; });
    return plans.map(plan => ({
      ...plan,
      meals: plan.meals.map(meal => ({
        ...meal,
        items: meal.items.map(item => ({ ...item, food: foodMap[item.food] || item.food }))
      }))
    }));
  } catch (err) { return plans; }
}

// GET /api/diet/:studentUsername
router.get('/:studentUsername', auth, async (req, res) => {
  const { studentUsername } = req.params;
  try {
    const { data: students } = await supabase.from('users').select('*').ilike('username', studentUsername);
    const student = students && students[0];
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (req.user.role === 'student' && String(req.user.id) !== String(student.id))
      return res.status(403).json({ message: 'Forbidden' });
    const { data: plans, error: plansError } = await supabase.from('diet_plans')
      .select('*, created_by:users(id, name, username)').eq('student_id', student.id);
    if (plansError) return res.status(500).json({ message: 'Failed to retrieve diet plans' });
    const populated = await populateMeals(plans);
    const formatted = populated.map(plan => ({
      id: plan.id, _id: plan.id, studentId: plan.student_id,
      createdBy: plan.created_by, date: plan.date, meals: plan.meals,
      notes: plan.notes, forSickleCell: plan.for_sickle_cell
    }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ message: 'Internal server error' }); }
});

// POST /api/diet/:studentUsername
router.post('/:studentUsername', auth, async (req, res) => {
  if (req.user.role !== 'nutritionist' && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });
  const { studentUsername } = req.params;
  try {
    const { data: students } = await supabase.from('users').select('*').ilike('username', studentUsername);
    const student = students && students[0];
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const { data: plan, error } = await supabase.from('diet_plans').insert([{
      student_id: student.id, created_by: req.user.id,
      meals: req.body.meals, notes: req.body.notes,
      for_sickle_cell: !!req.body.forSickleCell
    }]).select().single();
    if (error) return res.status(500).json({ message: 'Failed to create diet plan' });
    res.json({
      id: plan.id, _id: plan.id, studentId: plan.student_id,
      createdBy: plan.created_by, date: plan.date, meals: plan.meals,
      notes: plan.notes, forSickleCell: plan.for_sickle_cell
    });
  } catch (err) { res.status(500).json({ message: 'Internal server error' }); }
});

module.exports = router;
```

---

## 📁 backend/package.json

```json
{
  "name": "fountain-diet-backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": { "start": "node index.js", "dev": "nodemon index.js" },
  "dependencies": {
    "@sendgrid/mail": "^8.1.6",
    "@supabase/supabase-js": "^2.43.4",
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "nodemailer": "^7.0.11"
  }
}
```
