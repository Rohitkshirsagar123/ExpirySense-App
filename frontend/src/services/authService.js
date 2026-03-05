import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../DatabaseConnection/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const usersCollection = collection(db, 'users');

const authService = {
  // Register new user
  async register(email, password, name) {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Store user profile in Firestore
      await setDoc(doc(db, 'users', userId), {
        uid: userId,
        name: name,
        email: email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        userId: userId,
        user: {
          uid: userId,
          email: email,
          name: name,
        },
      };
    } catch (error) {
      console.log('Register Error Code:', error.code);
      console.log('Register Error Message:', error.message);
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error.code),
      };
    }
  },

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user profile from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();

      // Save login state in AsyncStorage
      await AsyncStorage.setItem('isLoggedIn', 'true');

      return {
        success: true,
        userId: user.uid,
        user: {
          uid: user.uid,
          email: user.email,
          name: userData?.name || '',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error.code),
      };
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);

      // Clear login state from AsyncStorage
      await AsyncStorage.removeItem('isLoggedIn');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error.code),
      };
    }
  },

  // Get current user
  async getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data();
            resolve({
              uid: user.uid,
              email: user.email,
              name: userData?.name || '',
            });
          } catch (error) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  },

  // Update user profile
  async updateUserProfile(userId, data) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getFirebaseErrorMessage(error.code),
      };
    }
  },

  // Map Firebase error codes to user-friendly messages
  getFirebaseErrorMessage(code) {
    const errorMessages = {
      'auth/email-already-in-use': 'Account already exists with this email.',
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'Account not found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many failed attempts. Try again later.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/operation-not-allowed': 'Account creation is not enabled.',
      'auth/invalid-password': 'Password is invalid.',
    };
    console.log('Error Code:', code);
    return errorMessages[code] || `Error: ${code}`;
  },
};

export default authService;
