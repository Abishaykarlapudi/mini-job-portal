const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['job', 'application'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
