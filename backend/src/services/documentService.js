const { getFirestore } = require('../config/db');

const convertFirestoreData = (doc) => {
  const data = doc.data();
  const converted = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && value.toDate) {
      converted[key] = value.toDate();
    } else {
      converted[key] = value;
    }
  }
  
  return {
    _id: doc.id,
    ...converted
  };
};

const createDocument = async (documentData) => {
  const db = getFirestore();
  const documentsCollection = db.collection('documents');
  
  documentData.createdAt = new Date();
  documentData.updatedAt = new Date();
  
  const docRef = await documentsCollection.add(documentData);
  const document = await docRef.get();
  
  return convertFirestoreData(document);
};

const findDocumentsByUser = async (userId, page = 1, limit = 10) => {
  const db = getFirestore();
  const documentsCollection = db.collection('documents');
  
  const startIndex = (page - 1) * limit;
  
  const snapshot = await documentsCollection
    .where('user', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  const documents = snapshot.docs.map(doc => convertFirestoreData(doc));
  
  const total = documents.length;
  const paginatedDocuments = documents.slice(startIndex, startIndex + limit);
  
  return {
    documents: paginatedDocuments,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

const findDocumentById = async (id) => {
  const db = getFirestore();
  const documentsCollection = db.collection('documents');
  
  const doc = await documentsCollection.doc(id).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return convertFirestoreData(doc);
};

const updateDocument = async (id, updateData) => {
  const db = getFirestore();
  const documentsCollection = db.collection('documents');
  
  updateData.updatedAt = new Date();
  
  await documentsCollection.doc(id).update(updateData);
  
  return findDocumentById(id);
};

const deleteDocument = async (id) => {
  const db = getFirestore();
  const documentsCollection = db.collection('documents');
  
  await documentsCollection.doc(id).delete();
  return true;
};

const findDocumentsByStatus = async (status) => {
  const db = getFirestore();
  const documentsCollection = db.collection('documents');
  
  const snapshot = await documentsCollection
    .where('analysis.status', '==', status)
    .get();
  
  return snapshot.docs.map(doc => convertFirestoreData(doc));
};

module.exports = {
  createDocument,
  findDocumentsByUser,
  findDocumentById,
  updateDocument,
  deleteDocument,
  findDocumentsByStatus
};
