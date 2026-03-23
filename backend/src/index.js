require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const ridesRoutes = require('./routes/rides');
const driversRoutes = require('./routes/drivers');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// In production, restrict CORS to the admin dashboard origin.
// Set ALLOWED_ORIGINS as a comma-separated list in Railway env vars.
// In development, allow all origins.
const corsOptions = process.env.ALLOWED_ORIGINS
  ? {
      origin: process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
    }
  : {};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/rides', ridesRoutes);
app.use('/drivers', driversRoutes);
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 SwiftRide Backend running on port ${PORT}`);
});
