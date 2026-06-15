const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboard, saveJob, unsaveJob, getSavedJobs, updateProfile } = require('../controllers/userController');

// Dashboard — role-aware (both recruiter and candidate)
router.get('/dashboard', protect, getDashboard);

// Profile update (any authenticated user)
router.put('/profile', protect, updateProfile);

// Saved Jobs (candidate only)
router.get('/saved-jobs', protect, authorize('candidate'), getSavedJobs);
router.post('/saved-jobs/:jobId', protect, authorize('candidate'), saveJob);
router.delete('/saved-jobs/:jobId', protect, authorize('candidate'), unsaveJob);

module.exports = router;
