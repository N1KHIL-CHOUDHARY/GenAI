const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    fileName: {
      type: String,
      required: [true, 'Please add a file name'],
    },
    fileType: {
      type: String,
      required: [true, 'Please add a file type'],
    },
    fileSize: {
      type: Number,
      required: [true, 'Please add a file size'],
    },
    filePath: {
      type: String,
      required: [true, 'Please add a file path'],
    },
    analysis: {
      summary: String,
      riskClauses: [
        {
          text: String,
          type: {
            type: String,
            enum: ['high', 'medium', 'low'],
          },
          explanation: String,
          position: Number,
        },
      ],
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
      },
      completedAt: Date,
      error: String,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        permissions: {
          type: String,
          enum: ['read', 'write'],
          default: 'read',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ 'analysis.status': 1 });

// Add middleware to clean up file when document is deleted
documentSchema.pre('remove', async function (next) {
  try {
    // Add file cleanup logic here
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Document', documentSchema);
