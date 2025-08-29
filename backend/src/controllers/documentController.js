const asyncHandler = require('express-async-handler');
const { AppError } = require('../middlewares/errorHandler');
const { analyzeDocument } = require('../services/analysisService');
const logger = require('../utils/logger');
const {
  createDocument,
  findDocumentsByUser,
  findDocumentById,
  updateDocument,
  deleteDocument
} = require('../services/documentService');

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload a file', 400);
  }

  const { filename, mimetype, size, path } = req.file;

  const document = await createDocument({
    user: req.user._id,
    fileName: filename,
    fileType: mimetype,
    fileSize: size,
    filePath: path,
  });

  analyzeDocument(document._id).catch(err => {
    logger.error('Error analyzing document:', err);
  });

  res.status(201).json({
    success: true,
    data: document,
  });
});

const getDocuments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await findDocumentsByUser(req.user._id, page, limit);

  res.json({
    success: true,
    count: result.documents.length,
    total: result.total,
    pagination: {
      page: result.page,
      pages: result.pages,
    },
    data: result.documents,
  });
});

const getDocument = asyncHandler(async (req, res) => {
  const document = await findDocumentById(req.params.id);

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  if (
    document.user !== req.user._id &&
    !document.sharedWith.some(share => 
      share.user === req.user._id
    )
  ) {
    throw new AppError('Not authorized to access this document', 403);
  }

  res.json({
    success: true,
    data: document,
  });
});

const shareDocument = asyncHandler(async (req, res) => {
  const { userId, permissions } = req.body;

  const document = await findDocumentById(req.params.id);

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  if (document.user !== req.user._id) {
    throw new AppError('Not authorized to share this document', 403);
  }

  const shareIndex = document.sharedWith.findIndex(
    share => share.user === userId
  );

  if (shareIndex >= 0) {
    document.sharedWith[shareIndex].permissions = permissions;
  } else {
    document.sharedWith.push({ user: userId, permissions });
  }

  const updatedDocument = await updateDocument(req.params.id, {
    sharedWith: document.sharedWith
  });

  res.json({
    success: true,
    data: updatedDocument,
  });
});

const deleteDocumentHandler = asyncHandler(async (req, res) => {
  const document = await findDocumentById(req.params.id);

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  if (document.user !== req.user._id) {
    throw new AppError('Not authorized to delete this document', 403);
  }

  await deleteDocument(req.params.id);

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
  deleteDocument: deleteDocumentHandler,
};
