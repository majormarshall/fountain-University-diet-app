const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dietRoutes = require('./routes/diet');
const foodsRoute = require('./routes/foods');
const sosRoute = require('./routes/sos');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/foods', foodsRoute);
app.use('/api/sos', sosRoute);

if (!process.env.NEXT_RUNTIME && (process.env.NODE_ENV !== 'production' || !process.env.VERCEL)) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log('Server listening on', PORT);
  });
}

module.exports = app;
