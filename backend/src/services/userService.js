const { getFirestore } = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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

const createUser = async (userData) => {
  const db = getFirestore();
  const usersCollection = db.collection('users');
  
  const { password, ...userFields } = userData;
  
  if (password) {
    const salt = await bcrypt.genSalt(10);
    userFields.password = await bcrypt.hash(password, salt);
  }
  
  userFields.createdAt = new Date();
  userFields.updatedAt = new Date();
  
  const docRef = await usersCollection.add(userFields);
  const user = await docRef.get();
  
  return convertFirestoreData(user);
};

const findUserByEmail = async (email) => {
  const db = getFirestore();
  const usersCollection = db.collection('users');
  
  const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return convertFirestoreData(doc);
};

const findUserById = async (id) => {
  const db = getFirestore();
  const usersCollection = db.collection('users');
  
  const doc = await usersCollection.doc(id).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return convertFirestoreData(doc);
};

const updateUser = async (id, updateData) => {
  const db = getFirestore();
  const usersCollection = db.collection('users');
  
  const { FieldValue } = require('firebase-admin/firestore');
  
  const processedUpdateData = {};
  
  for (const [key, value] of Object.entries(updateData)) {
    if (value === undefined) {
      processedUpdateData[key] = FieldValue.delete();
    } else {
      processedUpdateData[key] = value;
    }
  }
  
  processedUpdateData.updatedAt = new Date();
  
  await usersCollection.doc(id).update(processedUpdateData);
  
  return findUserById(id);
};

const updateUserById = async (id, updateData) => {
  return updateUser(id, updateData);
};

const matchPassword = async (hashedPassword, enteredPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

const createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  return {
    resetToken,
    hashedToken,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updateUserById,
  matchPassword,
  createPasswordResetToken,
};
