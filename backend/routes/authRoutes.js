const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const TOKEN_EXPIRY = '7d'; // Token expires in 7 days

// Helper: Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      uid: user.uid,
      email: user.email,
      name: user.displayName || '',
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Missing email, password, or name'
      });
    }

    // Create user in Firebase Auth using Admin SDK
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name,
    });

    // Store user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Generate JWT token
    const token = generateToken(userRecord);

    res.json({
      success: true,
      message: 'User registered successfully',
      token: token,
      user: {
        uid: userRecord.uid,
        email: email,
        name: name,
      }
    });
  } catch (error) {
    const errorMessage = error.code === 'auth/email-already-exists'
      ? 'Email already registered'
      : error.message;

    res.status(400).json({
      success: false,
      message: errorMessage,
      error: error.code
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing email or password'
      });
    }

    // Verify password using Firebase REST API
    const apiKey = process.env.FIREBASE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: FIREBASE_API_KEY not set. Please contact administrator.',
        error: 'MISSING_API_KEY'
      });
    }

    try {
      const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        })
      });

      const authResult = await response.json();

      if (!response.ok) {
        const errorMessage = authResult.error?.message === 'INVALID_PASSWORD'
          ? 'Invalid password'
          : authResult.error?.message === 'EMAIL_NOT_FOUND'
          ? 'User not found'
          : authResult.error?.message || 'Login failed';

        return res.status(401).json({
          success: false,
          message: errorMessage,
          error: authResult.error?.message
        });
      }

      // Get user details from Firestore
      const uid = authResult.localId;
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data();

      // Generate JWT token
      const token = generateToken({
        uid: uid,
        email: email,
        displayName: userData?.name || '',
      });

      res.json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          uid: uid,
          email: email,
          name: userData?.name || '',
        }
      });
    } catch (fetchError) {
      console.error('Firebase REST API error:', fetchError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify credentials. Check server logs.',
        error: fetchError.message
      });
    }
  } catch (error) {
    console.error('Login endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message,
      error: error.message
    });
  }
});

// Logout user (invalidate token on client side)
router.post('/logout', async (req, res) => {
  try {
    // In JWT-based auth, logout is handled client-side by removing token
    // But we can track logout on server if needed
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
});

// Verify token (helper endpoint for client)
router.post('/verify', async (req, res) => {
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

    res.json({
      success: true,
      message: 'Token is valid',
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
});

module.exports = router;
