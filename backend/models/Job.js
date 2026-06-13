const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Remote', 'Internship', 'Contract'],
      required: [true, 'Job type is required'],
    },
    salary: {
      type: String,
      trim: true,
      default: 'Not specified',
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    logoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    openings: {
      type: Number,
      default: null,
      min: [1, 'Openings must be at least 1'],
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    tags: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

// Text index for search
jobSchema.index({ title: 'text', company: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);
