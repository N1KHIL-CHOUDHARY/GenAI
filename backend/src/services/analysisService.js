const Document = require('../models/documentModel');
const logger = require('../utils/logger');
const { AppError } = require('../middlewares/errorHandler');

// Mock AI analysis function (replace with actual AI service integration)
const performAIAnalysis = async (text) => {
  // Simulate AI processing time
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
    const document = await Document.findById(documentId);
    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Update status to processing
    document.analysis.status = 'processing';
    await document.save();

    // Read file content (implement actual file reading logic)
    const fileContent = "Sample document content for testing";

    // Perform AI analysis
    const analysisResult = await performAIAnalysis(fileContent);

    // Update document with analysis results
    document.analysis = {
      ...document.analysis,
      ...analysisResult,
      status: 'completed',
      completedAt: Date.now()
    };

    await document.save();

    logger.info(`Analysis completed for document: ${documentId}`);
    return document;

  } catch (error) {
    logger.error('Analysis error:', error);

    // Update document with error status
    const document = await Document.findById(documentId);
    if (document) {
      document.analysis.status = 'failed';
      document.analysis.error = error.message;
      await document.save();
    }

    throw error;
  }
};

// Queue analysis jobs
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
