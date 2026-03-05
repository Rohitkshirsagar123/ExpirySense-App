const express = require('express');
const router = express.Router();

/**
 * TESTING ROUTES FOR NOTIFICATION BACKEND
 * These routes help verify the backend is working correctly
 */

// Test 1: Basic connectivity test
router.get('/test/ping', (req, res) => {
  res.json({
    success: true,
    message: '✅ Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test 2: Firebase connection test
router.get('/test/firebase', async (req, res) => {
  try {
    const { db } = require('../config/firebase');
    
    // Try to read a document to verify Firebase connection
    const testRef = await db.collection('test').doc('connection').get();
    
    res.json({
      success: true,
      message: '✅ Firebase Firestore is connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Firebase connection failed',
      error: error.message
    });
  }
});

// Test 3: Simulate reminder scheduling
router.post('/test/schedule-demo', async (req, res) => {
  try {
    const backendReminderService = require('../services/backendReminderService');
    
    const testUserId = 'test-user-' + Date.now();
    const testDocuments = [
      {
        id: 'doc-1',
        name: 'Demo License',
        type: 'License',
        documentNumber: 'DL123456',
        expiryDate: '15/03/2026' // Tomorrow or future date
      }
    ];
    
    const reminderSettings = {
      remindersEnabled: true,
      days: {
        d30: true,
        d7: true,
        d1: true,
        onExpiry: true
      }
    };
    
    const scheduled = await backendReminderService.scheduleRemindersForDocuments(
      testUserId,
      testDocuments,
      reminderSettings
    );
    
    res.json({
      success: true,
      message: `✅ Test reminders scheduled (${scheduled.length} reminders)`,
      testUserId,
      scheduled
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Test scheduling failed',
      error: error.message
    });
  }
});

// Test 4: Retrieve created test reminders
router.get('/test/reminders/:userId', async (req, res) => {
  try {
    const backendReminderService = require('../services/backendReminderService');
    const { userId } = req.params;
    
    const reminders = await backendReminderService.getUpcomingReminders(userId);
    
    res.json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch reminders',
      error: error.message
    });
  }
});

module.exports = router;
