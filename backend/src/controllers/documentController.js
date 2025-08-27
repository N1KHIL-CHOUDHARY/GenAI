const asyncHandler = require('express-async-handler');
const Document = require('../models/documentModel');
const { AppError } = require('../middlewares/errorHandler');
const { analyzeDocument } = require('../services/analysisService');
const logger = require('../utils/logger');

// @desc    Upload and analyze a new document
// @route   POST /api/documents
// @access  Private
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload a file', 400);
  }

  const { filename, mimetype, size, path } = req.file;

  const document = await Document.create({
    user: req.user._id,
    fileName: filename,
    fileType: mimetype,
    fileSize: size,
    filePath: path,
  });

  // Start analysis in background
  analyzeDocument(document._id).catch(err => {
    logger.error('Error analyzing document:', err);
  });

  res.status(201).json({
    success: true,
    data: document,
  });
});

// @desc    Get all user's documents
// @route   GET /api/documents
// @access  Private
const getDocuments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = { user: req.user._id };

  const total = await Document.countDocuments(query);
  const documents = await Document.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate('user', 'name email');

  res.json({
    success: true,
    count: documents.length,
    total,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
    },
    data: documents,
  });
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id)
    .populate('user', 'name email')
    .populate('sharedWith.user', 'name email');

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  // Check ownership or sharing permissions
  if (
    document.user._id.toString() !== req.user._id.toString() &&
    !document.sharedWith.some(share => 
      share.user._id.toString() === req.user._id.toString()
    )
  ) {
    throw new AppError('Not authorized to access this document', 403);
  }

  res.json({
    success: true,
    data: document,
  });
});

// @desc    Update document sharing settings
// @route   PUT /api/documents/:id/share
// @access  Private
const shareDocument = asyncHandler(async (req, res) => {
  const { userId, permissions } = req.body;

  const document = await Document.findById(req.params.id);

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  if (document.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to share this document', 403);
  }

  // Update sharing settings
  const shareIndex = document.sharedWith.findIndex(
    share => share.user.toString() === userId
  );

  if (shareIndex >= 0) {
    document.sharedWith[shareIndex].permissions = permissions;
  } else {
    document.sharedWith.push({ user: userId, permissions });
  }

  await document.save();

  res.json({
    success: true,
    data: document,
  });
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  if (document.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to delete this document', 403);
  }

  await document.remove();

  res.json({
    success: true,
    data: {},
  });
});

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument,
  shareDocument,
  deleteDocument,
};
