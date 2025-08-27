const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middlewares/authMiddleware');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  shareDocument,
  deleteDocument,
} = require('../controllers/documentController');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10),
  },
});

router.route('/')
  .post(protect, upload.single('document'), uploadDocument)
  .get(protect, getDocuments);

router.route('/:id')
  .get(protect, getDocument)
  .delete(protect, deleteDocument);

router.put('/:id/share', protect, shareDocument);

module.exports = router;
