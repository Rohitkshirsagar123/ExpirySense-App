import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../DatabaseConnection/firebaseConfig';

const documentsCollection = collection(db, 'documents');

const documentService = {
  // Add document for current user
  async addDocument(document, userId) {
    try {
      const newDoc = {
        ...document,
        userId: userId,  // Associate document with user
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(documentsCollection, newDoc);
      return {
        success: true,
        id: docRef.id,
        document: newDoc,
      };
    } catch (error) {
      console.error('Error adding document:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get documents for current user only
  async getDocuments(userId) {
    try {
      // Query only documents where userId matches current user
      const q = query(documentsCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      return {
        success: true,
        documents: documents,
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return {
        success: false,
        documents: [],
        error: error.message,
      };
    }
  },

  // Update document (only by owner)
  async updateDocument(docId, data, userId) {
    try {
      const docRef = doc(db, 'documents', docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating document:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Delete document (only by owner)
  async deleteDocument(docId, userId) {
    try {
      const docRef = doc(db, 'documents', docId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default documentService;