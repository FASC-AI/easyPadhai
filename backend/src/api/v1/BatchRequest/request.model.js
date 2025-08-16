const mongoose = require('mongoose');

const batchRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    approve: {
      type: Boolean,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BatchRequest', batchRequestSchema);
