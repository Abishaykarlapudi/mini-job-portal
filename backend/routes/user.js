const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboard, saveJob, unsaveJob, getSavedJobs } = require('../controllers/userController');

// Dashboard — role-aware (both recruiter and candidate)
router.get('/dashboard', protect, getDashboard);

// Saved Jobs (candidate only)
router.get('/saved-jobs', protect, authorize('candidate'), getSavedJobs);
router.post('/saved-jobs/:jobId', protect, authorize('candidate'), saveJob);
router.delete('/saved-jobs/:jobId', protect, authorize('candidate'), unsaveJob);

module.exports = router;
