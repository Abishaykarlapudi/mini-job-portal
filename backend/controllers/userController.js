const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const ActivityLog = require('../models/ActivityLog');

// @desc  Role-aware dashboard
// @route GET /api/user/dashboard
// @access Private
const getDashboard = async (req, res, next) => {
  try {
    if (req.user.role === 'recruiter') {
      // --- Recruiter Dashboard ---
      const postedJobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });

      const jobsWithCounts = await Promise.all(
        postedJobs.map(async (job) => {
          const appCount = await Application.countDocuments({ jobId: job._id });
          return { ...job.toObject(), applicationCount: appCount };
        })
      );

      const totalApplications = jobsWithCounts.reduce((sum, j) => sum + j.applicationCount, 0);
      const activeJobs = postedJobs.filter(j => j.status === 'Open').length;
      const closedJobs = postedJobs.filter(j => j.status === 'Closed').length;

      const jobIds = postedJobs.map(j => j._id);
      const shortlistedCount = await Application.countDocuments({ jobId: { $in: jobIds }, status: 'Shortlisted' });
      const hiredCount = await Application.countDocuments({ jobId: { $in: jobIds }, status: 'Hired' });

      // Recent activity (last 10)
      const recentActivity = await ActivityLog.find({ recruiterId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(10);

      return res.json({
        success: true,
        role: 'recruiter',
        stats: {
          totalJobsPosted: postedJobs.length,
          activeJobs,
          closedJobs,
          totalApplicationsReceived: totalApplications,
          shortlistedCount,
          hiredCount,
        },
        jobs: jobsWithCounts,
        recentActivity,
      });
    }

    // --- Candidate Dashboard ---
    const applications = await Application.find({ applicantId: req.user.id })
      .populate('jobId', 'title company location type salary')
      .sort({ createdAt: -1 });

    const savedJobDocs = await SavedJob.find({ userId: req.user.id })
      .populate('jobId', 'title company location type salary logoUrl')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      role: 'candidate',
      stats: {
        totalApplications: applications.length,
        totalSavedJobs: savedJobDocs.length,
      },
      applications,
      savedJobs: savedJobDocs,
    });
  } catch (err) { next(err); }
};

// @desc  Save a job
// @route POST /api/user/saved-jobs/:jobId
// @access Private (candidate)
const saveJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const saved = await SavedJob.create({ userId: req.user.id, jobId: req.params.jobId });
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Job already saved' });
    }
    next(err);
  }
};

// @desc  Unsave a job
// @route DELETE /api/user/saved-jobs/:jobId
// @access Private (candidate)
const unsaveJob = async (req, res, next) => {
  try {
    const result = await SavedJob.findOneAndDelete({ userId: req.user.id, jobId: req.params.jobId });
    if (!result) return res.status(404).json({ success: false, message: 'Saved job not found' });
    res.json({ success: true, message: 'Job removed from saved list' });
  } catch (err) { next(err); }
};

// @desc  Get saved jobs list
// @route GET /api/user/saved-jobs
// @access Private (candidate)
const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ userId: req.user.id })
      .populate('jobId', 'title company location type salary logoUrl createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: savedJobs.length, data: savedJobs });
  } catch (err) { next(err); }
};

const User = require('../models/User');

// @desc  Update own profile (name, email, password)
// @route PUT /api/user/profile
// @access Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (name) user.name = name;
    if (email) user.email = email;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      user.password = newPassword;
    }

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

module.exports = { getDashboard, saveJob, unsaveJob, getSavedJobs, updateProfile };

