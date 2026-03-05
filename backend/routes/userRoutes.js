const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebase');
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

// Get user profile
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can only access their own profile
    if (req.user.uid !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot access other user profiles'
      });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    res.json({
      success: true,
      message: 'User profile retrieved',
      user: {
        uid: userId,
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;

    // Verify user can only update their own profile
    if (req.user.uid !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot update other user profiles'
      });
    }

    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing name or email to update'
      });
    }

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (name) {
      updateData.name = name;
      // Also update Firebase Auth display name
      await auth.updateUser(userId, { displayName: name });
    }

    if (email) {
      updateData.email = email;
      // Also update Firebase Auth email
      await auth.updateUser(userId, { email: email });
    }

    await db.collection('users').doc(userId).update(updateData);

    res.json({
      success: true,
      message: 'User profile updated',
      user: {
        uid: userId,
        name: name || req.user.name,
        email: email || req.user.email,
      }
    });
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
});

// Delete user account
router.delete('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can only delete their own account
    if (req.user.uid !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot delete other accounts'
      });
    }

    // Delete user documents
    const userDocsSnapshot = await db.collection('documents')
      .where('userId', '==', userId)
      .get();

    const deletePromises = [];
    userDocsSnapshot.forEach((doc) => {
      deletePromises.push(db.collection('documents').doc(doc.id).delete());
    });

    // Delete user profile
    deletePromises.push(db.collection('users').doc(userId).delete());

    // Delete Firebase Auth user
    deletePromises.push(auth.deleteUser(userId));

    await Promise.all(deletePromises);

    res.json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user account',
      error: error.message
    });
  }
});

module.exports = router;
