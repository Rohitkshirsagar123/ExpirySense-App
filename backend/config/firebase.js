const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'expirysense-e9541'
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
