const admin = require('firebase-admin');
const logger = require('../utils/logger');
require('dotenv').config();

const initializeFirebase = async () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
    }

    logger.info(`Firebase Admin SDK initialized for project: ${process.env.FIREBASE_PROJECT_ID}`);
  } catch (error) {
    logger.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
  }
};

const getFirestore = () => {
  return admin.firestore();
};

const getAuth = () => {
  return admin.auth();
};

module.exports = { initializeFirebase, getFirestore, getAuth };
