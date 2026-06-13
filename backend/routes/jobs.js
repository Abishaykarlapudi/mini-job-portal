const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
  applyToJob,
  checkApplied,
  getApplications,
  updateApplicationStatus,
  addNote,
  updateNote,
  deleteNote,
  scheduleInterview,
  updateInterview,
  cancelInterview,
  bulkUpdateStatus,
  exportApplicants,
  getAnalytics,
} = require('../controllers/jobController');

// ── Analytics (must be before /:id routes to avoid param conflict) ────────────
router.get('/analytics', protect, authorize('recruiter'), getAnalytics);

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/', getJobs);
router.get('/:id', getJobById);

// ── Recruiter-only routes ─────────────────────────────────────────────────────
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);
router.patch('/:id/status', protect, authorize('recruiter'), toggleJobStatus);

// Application management (recruiter)
router.get('/:id/applications/export', protect, authorize('recruiter'), exportApplicants);
router.patch('/:id/applications/bulk', protect, authorize('recruiter'), bulkUpdateStatus);
router.get('/:id/applications', protect, authorize('recruiter'), getApplications);
router.patch('/:id/applications/:appId', protect, authorize('recruiter'), updateApplicationStatus);

// Notes (recruiter)
router.post('/:id/applications/:appId/notes', protect, authorize('recruiter'), addNote);
router.patch('/:id/applications/:appId/notes/:noteId', protect, authorize('recruiter'), updateNote);
router.delete('/:id/applications/:appId/notes/:noteId', protect, authorize('recruiter'), deleteNote);

// Interview management (recruiter)
router.post('/:id/applications/:appId/interview', protect, authorize('recruiter'), scheduleInterview);
router.patch('/:id/applications/:appId/interview', protect, authorize('recruiter'), updateInterview);
router.delete('/:id/applications/:appId/interview', protect, authorize('recruiter'), cancelInterview);

// ── Candidate-only routes ─────────────────────────────────────────────────────
router.post('/:id/apply', protect, authorize('candidate'), applyToJob);
router.get('/:id/applied', protect, authorize('candidate'), checkApplied);

module.exports = router;
