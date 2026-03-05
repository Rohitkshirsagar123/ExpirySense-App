const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase Admin SDK
require('./config/firebase');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'ExpirySense Backend Running' });
});

// Import notification routes
const notificationRoutes = require('./routes/notificationRoutes');
const testRoutes = require('./routes/testRoutes');
const documentRoutes = require('./routes/documentRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/notifications', notificationRoutes);
app.use('/api/test', testRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ExpirySense Backend running on http://localhost:${PORT}`);
  console.log(`📝 Test endpoints available at http://localhost:${PORT}/api/test`);
});
