const express = require('express');
const router = express.Router();
const backendReminderService = require('../services/backendReminderService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware: Verify JWT token
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid token'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
}

// Apply token verification to all routes
router.use(verifyToken);

// API: Check which documents need notifications TODAY
router.post('/check-notifications', async (req, res) => {
  try {
    const { documents, reminderSettings } = req.body;

    if (!Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid documents array'
      });
    }

    // Default reminder settings if not provided
    const settings = reminderSettings || {
      remindersEnabled: true,
      days: {
        d30: true,
        d7: true,
        d1: true,
        onExpiry: true,
      },
    };

    // Check which documents need notifications TODAY
    const notificationsToShow = backendReminderService.checkNotificationsForToday(documents, settings);

    res.json({
      success: true,
      count: notificationsToShow.length,
      notifications: notificationsToShow,
      message: `Found ${notificationsToShow.length} document(s) that need notification today`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking notifications',
      error: error.message
    });
  }
});

// API: notificationtesting - Test backend connectivity
router.get('/notificationtesting', (req, res) => {
  try {
    const response = {
      success: true,
      message: '✅ Notification API is working perfectly!',
      timestamp: new Date().toISOString(),
      data: {
        status: 'connected',
        backend: 'Node.js + Express',
        database: 'Firebase Firestore',
        apiName: 'notificationtesting'
      }
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in notification testing API',
      error: error.message
    });
  }
});

module.exports = router;
