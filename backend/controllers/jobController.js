const Job = require('../models/Job');
const Application = require('../models/Application');
const ActivityLog = require('../models/ActivityLog');

// ── Helper ────────────────────────────────────────────────────────────────────
const logActivity = async (recruiterId, message, entityType, entityId) => {
  try {
    await ActivityLog.create({ recruiterId, message, entityType, entityId });
  } catch (_) { /* non-critical */ }
};

// @desc  Get all jobs (with search, filter, sort, pagination)
// @route GET /api/jobs
// @access Public
const getJobs = async (req, res, next) => {
  try {
    const { search, type, sort, page = 1, limit = 6 } = req.query;

    const query = { status: 'Open' }; // Only show Open jobs to public

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (type && type !== 'All') query.type = type;

    let sortObj = { createdAt: -1 };
    if (sort === 'salary_asc') sortObj = { salary: 1 };
    if (sort === 'salary_desc') sortObj = { salary: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), data: jobs });
  } catch (err) { next(err); }
};

// @desc  Get single job
// @route GET /api/jobs/:id
// @access Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) { next(err); }
};

// @desc  Create a new job
// @route POST /api/jobs
// @access Private (recruiter only)
const createJob = async (req, res, next) => {
  try {
    const { title, company, location, type, salary, description, logoUrl, openings, tags } = req.body;
    const job = await Job.create({
      title, company, location, type, salary, description, logoUrl,
      openings: ['unknown', 'below-100', 'above-100', null, undefined].includes(openings)
        ? null : Number(openings),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      postedBy: req.user.id,
    });
    await logActivity(req.user.id, `Created job posting: ${job.title}`, 'job', job._id);
    res.status(201).json({ success: true, data: job });
  } catch (err) { next(err); }
};

// @desc  Update a job
// @route PUT /api/jobs/:id
// @access Private (recruiter, own job only)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.postedBy && !job.postedBy.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this job.' });
    }
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    await logActivity(req.user.id, `Updated job posting: ${updated.title}`, 'job', updated._id);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// @desc  Delete a job
// @route DELETE /api/jobs/:id
// @access Private (recruiter, own job only)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.postedBy && !job.postedBy.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this job.' });
    }
    await job.deleteOne();
    await Application.deleteMany({ jobId: req.params.id });
    await logActivity(req.user.id, `Deleted job posting: ${job.title}`, 'job', job._id);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) { next(err); }
};

// @desc  Toggle job status Open <-> Closed
// @route PATCH /api/jobs/:id/status
// @access Private (recruiter, own job only)
const toggleJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.postedBy && !job.postedBy.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    job.status = newStatus;
    await job.save();
    const action = newStatus === 'Closed' ? 'Closed' : 'Reopened';
    await logActivity(req.user.id, `${action} job: ${job.title}`, 'job', job._id);
    res.json({ success: true, data: job });
  } catch (err) { next(err); }
};

// @desc  Apply to a job
// @route POST /api/jobs/:id/apply
// @access Private (candidate only)
const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status === 'Closed') {
      return res.status(400).json({ success: false, message: 'This job is no longer accepting applications.' });
    }

    const { name, email, phone, resumeUrl, coverLetter } = req.body;

    const existing = await Application.findOne({
      jobId: req.params.id,
      $or: [{ applicantId: req.user.id }, { email: req.user.email }],
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job' });
    }

    const application = await Application.create({
      jobId: req.params.id,
      applicantId: req.user.id,
      name: name || req.user.name,
      email: email || req.user.email,
      phone,
      resumeUrl: resumeUrl || '',
      coverLetter: coverLetter || '',
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) { next(err); }
};

// @desc  Get all applications for a job (with optional status/search filter)
// @route GET /api/jobs/:id/applications
// @access Private (recruiter only)
const getApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const { status, search } = req.query;
    const query = { jobId: req.params.id };

    if (status && status !== 'All') query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const applications = await Application.find(query)
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) { next(err); }
};

// @desc  Update application status (6-stage pipeline)
// @route PATCH /api/jobs/:id/applications/:appId
// @access Private (recruiter only)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { status },
      { returnDocument: 'after', runValidators: true }
    );

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    await logActivity(req.user.id, `Updated ${application.name}'s status to ${status}`, 'application', application._id);

    // Auto-close job if hired count reaches openings limit
    let jobAutoDeleted = false;
    if (status === 'Hired') {
      const job = await Job.findById(req.params.id);
      if (job && job.openings !== null) {
        const hiredCount = await Application.countDocuments({ jobId: req.params.id, status: 'Hired' });
        if (hiredCount >= job.openings) {
          await Application.deleteMany({ jobId: req.params.id });
          await job.deleteOne();
          jobAutoDeleted = true;
        }
      }
    }

    res.json({ success: true, data: application, jobAutoDeleted });
  } catch (err) { next(err); }
};

// @desc  Check if current candidate already applied
// @route GET /api/jobs/:id/applied
// @access Private (candidate)
const checkApplied = async (req, res, next) => {
  try {
    const existing = await Application.findOne({
      jobId: req.params.id,
      $or: [{ applicantId: req.user.id }, { email: req.user.email }],
    });
    res.json({ hasApplied: !!existing });
  } catch (err) { next(err); }
};

// @desc  Add a note to an application
// @route POST /api/jobs/:id/applications/:appId/notes
// @access Private (recruiter only)
const addNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { $push: { notes: { text: text.trim() } } },
      { returnDocument: 'after' }
    );

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    await logActivity(req.user.id, `Added note for ${application.name}`, 'application', application._id);
    res.json({ success: true, data: application.notes });
  } catch (err) { next(err); }
};

// @desc  Update a note on an application
// @route PATCH /api/jobs/:id/applications/:appId/notes/:noteId
// @access Private (recruiter only)
const updateNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const application = await Application.findOneAndUpdate(
      { _id: req.params.appId, 'notes._id': req.params.noteId },
      { $set: { 'notes.$.text': text.trim() } },
      { returnDocument: 'after' }
    );

    if (!application) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: application.notes });
  } catch (err) { next(err); }
};

// @desc  Delete a note from an application
// @route DELETE /api/jobs/:id/applications/:appId/notes/:noteId
// @access Private (recruiter only)
const deleteNote = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { $pull: { notes: { _id: req.params.noteId } } },
      { returnDocument: 'after' }
    );

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: application.notes });
  } catch (err) { next(err); }
};

// @desc  Schedule an interview for an application
// @route POST /api/jobs/:id/applications/:appId/interview
// @access Private (recruiter only)
const scheduleInterview = async (req, res, next) => {
  try {
    const { date, time, mode, meetingLink, location, remarks } = req.body;

    if (!date || !time || !mode) {
      return res.status(400).json({ success: false, message: 'Date, time, and mode are required' });
    }

    const interviewData = { date, time, mode, meetingLink: meetingLink || '', location: location || '', remarks: remarks || '', scheduledAt: new Date() };

    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { interview: interviewData, status: 'Interview Scheduled' },
      { returnDocument: 'after', runValidators: true }
    );

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    await logActivity(req.user.id, `Scheduled interview for ${application.name}`, 'application', application._id);
    res.json({ success: true, data: application });
  } catch (err) { next(err); }
};

// @desc  Update interview details
// @route PATCH /api/jobs/:id/applications/:appId/interview
// @access Private (recruiter only)
const updateInterview = async (req, res, next) => {
  try {
    const { date, time, mode, meetingLink, location, remarks } = req.body;
    const existing = await Application.findById(req.params.appId);
    if (!existing) return res.status(404).json({ success: false, message: 'Application not found' });

    const updatedInterview = {
      ...existing.interview?.toObject?.() || {},
      ...(date && { date }),
      ...(time && { time }),
      ...(mode && { mode }),
      meetingLink: meetingLink ?? existing.interview?.meetingLink ?? '',
      location: location ?? existing.interview?.location ?? '',
      remarks: remarks ?? existing.interview?.remarks ?? '',
    };

    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { interview: updatedInterview },
      { returnDocument: 'after' }
    );

    await logActivity(req.user.id, `Updated interview details for ${application.name}`, 'application', application._id);
    res.json({ success: true, data: application });
  } catch (err) { next(err); }
};

// @desc  Cancel an interview
// @route DELETE /api/jobs/:id/applications/:appId/interview
// @access Private (recruiter only)
const cancelInterview = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { interview: null, status: 'Shortlisted' },
      { returnDocument: 'after' }
    );

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    await logActivity(req.user.id, `Cancelled interview for ${application.name}`, 'application', application._id);
    res.json({ success: true, data: application });
  } catch (err) { next(err); }
};

// @desc  Bulk update application statuses
// @route PATCH /api/jobs/:id/applications/bulk
// @access Private (recruiter only)
const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { appIds, status } = req.body;
    const allowedStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'];

    if (!Array.isArray(appIds) || appIds.length === 0) {
      return res.status(400).json({ success: false, message: 'appIds array is required' });
    }
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    await Application.updateMany({ _id: { $in: appIds } }, { status });
    await logActivity(req.user.id, `Bulk updated ${appIds.length} applicants to ${status}`, 'application', null);

    res.json({ success: true, message: `Updated ${appIds.length} applications to ${status}` });
  } catch (err) { next(err); }
};

// @desc  Export applicants as CSV
// @route GET /api/jobs/:id/applications/export
// @access Private (recruiter only)
const exportApplicants = async (req, res, next) => {
  try {
    const applications = await Application.find({ jobId: req.params.id }).sort({ createdAt: -1 });
    const job = await Job.findById(req.params.id);

    const header = 'Name,Email,Phone,Applied Date,Status,Resume URL,Cover Letter\n';
    const rows = applications.map(app => {
      const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
      return [
        escape(app.name),
        escape(app.email),
        escape(app.phone),
        escape(new Date(app.createdAt).toLocaleDateString()),
        escape(app.status),
        escape(app.resumeUrl),
        escape(app.coverLetter),
      ].join(',');
    }).join('\n');

    const jobTitle = job ? job.title.replace(/[^a-z0-9]/gi, '_') : 'job';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${jobTitle}_applicants.csv"`);
    res.send(header + rows);
  } catch (err) { next(err); }
};

// @desc  Get recruitment analytics
// @route GET /api/jobs/analytics
// @access Private (recruiter only)
const getAnalytics = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;

    // Job analytics
    const allJobs = await Job.find({ postedBy: recruiterId });
    const totalJobs = allJobs.length;
    const activeJobs = allJobs.filter(j => j.status === 'Open').length;
    const closedJobs = allJobs.filter(j => j.status === 'Closed').length;

    const jobIds = allJobs.map(j => j._id);

    // Applicant analytics
    const allApplications = await Application.find({ jobId: { $in: jobIds } });
    const total = allApplications.length;
    const shortlisted = allApplications.filter(a => a.status === 'Shortlisted').length;
    const rejected = allApplications.filter(a => a.status === 'Rejected').length;
    const hired = allApplications.filter(a => a.status === 'Hired').length;
    const interviewScheduled = allApplications.filter(a => a.status === 'Interview Scheduled').length;
    const underReview = allApplications.filter(a => a.status === 'Under Review').length;

    // Top performing job (most applications)
    const jobAppCounts = {};
    allApplications.forEach(app => {
      const id = app.jobId.toString();
      jobAppCounts[id] = (jobAppCounts[id] || 0) + 1;
    });

    let topJob = null;
    let topCount = 0;
    for (const [jobId, count] of Object.entries(jobAppCounts)) {
      if (count > topCount) {
        topCount = count;
        const found = allJobs.find(j => j._id.toString() === jobId);
        topJob = found ? { _id: found._id, title: found.title, applicationCount: count } : null;
      }
    }

    // Funnel data (cumulative at each stage)
    const funnelData = [
      { stage: 'Applied', count: total },
      { stage: 'Under Review', count: underReview + shortlisted + interviewScheduled + hired },
      { stage: 'Shortlisted', count: shortlisted + interviewScheduled + hired },
      { stage: 'Interview Scheduled', count: interviewScheduled + hired },
      { stage: 'Hired', count: hired },
    ];

    // Applications per job (for bar chart)
    const jobPerformance = allJobs.map(j => ({
      jobId: j._id,
      title: j.title,
      applications: jobAppCounts[j._id.toString()] || 0,
    })).sort((a, b) => b.applications - a.applications).slice(0, 10);

    res.json({
      success: true,
      jobAnalytics: { totalJobs, activeJobs, closedJobs },
      applicantAnalytics: { total, shortlisted, rejected, hired, interviewScheduled, underReview },
      topPerformingJob: topJob,
      funnelData,
      jobPerformance,
    });
  } catch (err) { next(err); }
};

module.exports = {
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
};
