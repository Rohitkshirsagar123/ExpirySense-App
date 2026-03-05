const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
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

// Helper function to calculate status from expiry date
function calculateStatus(expiryDateString) {
  const [day, month, year] = expiryDateString.split('/').map(Number);
  if (!day || !month || !year) return 'Unknown';
  
  const expiryDate = new Date(year, month - 1, day);
  expiryDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const timeDiff = expiryDate - today;
  const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  if (days < 0) return 'Expired';
  if (days <= 7) return 'Expiring Soon';
  return 'Safe';
}

// Add a new document
router.post('/add', async (req, res) => {
  try {
    const { document, userId } = req.body;

    if (!document || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing document or userId'
      });
    }

    // Calculate status from expiry date
    const calculatedStatus = calculateStatus(document.expiryDate);

    // Add document to Firestore with calculated status
    const docRef = await db.collection('documents').add({
      ...document,
      userId: userId,
      status: calculatedStatus, // Store calculated status in Firebase
      statusUpdatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      id: docRef.id,
      message: 'Document added successfully',
      document: {
        id: docRef.id,
        ...document,
        status: calculatedStatus,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add document',
      error: error.message
    });
  }
});

// Get documents for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId'
      });
    }

    const snapshot = await db.collection('documents')
      .where('userId', '==', userId)
      .get();

    const documents = [];
    const updatePromises = [];

    snapshot.forEach((doc) => {
      const docData = doc.data();
      // Calculate status dynamically
      const calculatedStatus = calculateStatus(docData.expiryDate);
      const storedStatus = docData.status;
      
      // If status has changed, update it in Firebase
      if (calculatedStatus !== storedStatus) {
        updatePromises.push(
          db.collection('documents').doc(doc.id).update({
            status: calculatedStatus,
            statusUpdatedAt: new Date().toISOString(),
          })
        );
      }
      
      documents.push({
        id: doc.id,
        ...docData,
        status: calculatedStatus, // Always use calculated status
      });
    });

    // Wait for all status updates to complete
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    res.json({
      success: true,
      documents: documents,
      count: documents.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
});

// Update a document
router.put('/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    const { data, userId } = req.body;

    if (!docId || !data || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing docId, data, or userId'
      });
    }

    // Remove status from input - will recalculate
    const { status, ...dataWithoutStatus } = data;

    // If expiryDate changed, recalculate status
    let updateData = {
      ...dataWithoutStatus,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate status based on new or existing expiryDate
    const updatingExpiryDate = dataWithoutStatus.expiryDate;
    if (updatingExpiryDate) {
      const newStatus = calculateStatus(updatingExpiryDate);
      updateData.status = newStatus;
      updateData.statusUpdatedAt = new Date().toISOString();
    }

    await db.collection('documents').doc(docId).update(updateData);

    res.json({
      success: true,
      message: 'Document updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
});

// Delete a document
router.delete('/:docId', async (req, res) => {
  try {
    const { docId } = req.params;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: 'Missing docId'
      });
    }

    await db.collection('documents').doc(docId).delete();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// Update all existing documents' statuses (for migration from old records)
router.post('/update-all-statuses/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId'
      });
    }

    const snapshot = await db.collection('documents')
      .where('userId', '==', userId)
      .get();

    const updatePromises = [];
    let updateCount = 0;

    snapshot.forEach((doc) => {
      const docData = doc.data();
      
      // Skip if no expiry date
      if (!docData.expiryDate) return;

      // Calculate current status
      const calculatedStatus = calculateStatus(docData.expiryDate);
      const storedStatus = docData.status;
      
      // Always update status to ensure it's current
      updatePromises.push(
        db.collection('documents').doc(doc.id).update({
          status: calculatedStatus,
          statusUpdatedAt: new Date().toISOString(),
        })
      );
      updateCount++;
    });

    // Wait for all updates to complete
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    res.json({
      success: true,
      message: `Updated ${updateCount} documents with current status`,
      updatedCount: updateCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update statuses',
      error: error.message
    });
  }
});

// Update all documents globally (admin endpoint - use with caution)
router.post('/update-all-statuses-global', async (req, res) => {
  try {
    const snapshot = await db.collection('documents').get();

    const updatePromises = [];
    let updateCount = 0;

    snapshot.forEach((doc) => {
      const docData = doc.data();
      
      // Skip if no expiry date
      if (!docData.expiryDate) return;

      // Calculate current status
      const calculatedStatus = calculateStatus(docData.expiryDate);
      
      // Update status
      updatePromises.push(
        db.collection('documents').doc(doc.id).update({
          status: calculatedStatus,
          statusUpdatedAt: new Date().toISOString(),
        })
      );
      updateCount++;
    });

    // Wait for all updates to complete
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    res.json({
      success: true,
      message: `Updated ${updateCount} documents globally with current status`,
      updatedCount: updateCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update statuses globally',
      error: error.message
    });
  }
});

module.exports = router;
