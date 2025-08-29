const logger = require('../utils/logger');
const { AppError } = require('../middlewares/errorHandler');
const { findDocumentById, updateDocument } = require('./documentService');

const performAIAnalysis = async (text) => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    summary: `Analysis of the document reveals several key points and potential risks. ${text.slice(0, 200)}...`,
    riskClauses: [
      {
        text: "Important clause detected",
        type: "medium",
        explanation: "This clause requires careful consideration",
        position: 1
      }
    ]
  };
};

const analyzeDocument = async (documentId) => {
  try {
    const document = await findDocumentById(documentId);
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    await updateDocument(documentId, {
      'analysis.status': 'processing'
    });

    const fileContent = "Sample document content for testing";

    const analysisResult = await performAIAnalysis(fileContent);

    await updateDocument(documentId, {
      analysis: {
        ...document.analysis,
        ...analysisResult,
        status: 'completed',
        completedAt: new Date()
      }
    });

    logger.info(`Analysis completed for document: ${documentId}`);
    return document;

  } catch (error) {
    logger.error('Analysis error:', error);

    const document = await findDocumentById(documentId);
    if (document) {
      await updateDocument(documentId, {
        'analysis.status': 'failed',
        'analysis.error': error.message
      });
    }

    throw error;
  }
};

const analysisQueue = [];
let isProcessing = false;

const processAnalysisQueue = async () => {
  if (isProcessing || analysisQueue.length === 0) return;

  isProcessing = true;
  const documentId = analysisQueue.shift();

  try {
    await analyzeDocument(documentId);
  } catch (error) {
    logger.error(`Error processing document ${documentId}:`, error);
  }

  isProcessing = false;
  processAnalysisQueue();
};

const queueAnalysis = (documentId) => {
  analysisQueue.push(documentId);
  processAnalysisQueue();
};

module.exports = {
  analyzeDocument,
  queueAnalysis
};
