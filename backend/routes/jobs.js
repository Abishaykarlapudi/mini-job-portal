const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getApplications,
} = require('../controllers/jobController');

// Job CRUD
router.route('/').get(getJobs).post(createJob);
router.route('/:id').get(getJobById).put(updateJob).delete(deleteJob);

// Applications
router.route('/:id/apply').post(applyToJob);
router.route('/:id/applications').get(getApplications);

module.exports = router;
