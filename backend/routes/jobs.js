const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  checkApplied,
  getApplications,
  updateApplicationStatus,
} = require('../controllers/jobController');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Recruiter-only routes
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);
router.get('/:id/applications', protect, authorize('recruiter'), getApplications);
router.patch('/:id/applications/:appId', protect, authorize('recruiter'), updateApplicationStatus);

// Candidate-only routes
router.post('/:id/apply', protect, authorize('candidate'), applyToJob);
router.get('/:id/applied', protect, authorize('candidate'), checkApplied);

module.exports = router;
