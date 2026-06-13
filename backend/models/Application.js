const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const interviewSchema = new mongoose.Schema({
  date: { type: String },        // e.g. "2026-06-20"
  time: { type: String },        // e.g. "10:30 AM"
  mode: {
    type: String,
    enum: ['Online', 'Offline'],
  },
  meetingLink: { type: String, default: '' },  // for Online
  location: { type: String, default: '' },     // for Offline
  remarks: { type: String, default: '' },
  scheduledAt: { type: Date, default: Date.now },
}, { _id: false });

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: '',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'],
      default: 'Applied',
    },
    notes: {
      type: [noteSchema],
      default: [],
    },
    interview: {
      type: interviewSchema,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
