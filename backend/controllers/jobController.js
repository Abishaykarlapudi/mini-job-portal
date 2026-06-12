const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc  Get all jobs (with search, filter, sort, pagination)
// @route GET /api/jobs
// @access Public
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      type,
      sort,
      page = 1,
      limit = 6,
    } = req.query;

    const query = {};

    // Search by title, company, or location
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by job type
    if (type && type !== 'All') {
      query.type = type;
    }

    // Sorting
    let sortObj = { createdAt: -1 }; // default: newest first
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

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single job
// @route GET /api/jobs/:id
// @access Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc  Create a new job
// @route POST /api/jobs
// @access Private (recruiter only)
const createJob = async (req, res, next) => {
  try {
    const { title, company, location, type, salary, description, logoUrl, openings } = req.body;
    const job = await Job.create({
      title,
      company,
      location,
      type,
      salary,
      description,
      logoUrl,
      openings: ['unknown', 'below-100', 'above-100', null, undefined].includes(openings)
        ? null
        : Number(openings),
      postedBy: req.user.id,
    });
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc  Update a job
// @route PUT /api/jobs/:id
// @access Private (recruiter, own job only)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Ownership check — allow if postedBy matches or job has no owner (legacy)
    if (job.postedBy && !job.postedBy.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this job.',
      });
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete a job
// @route DELETE /api/jobs/:id
// @access Private (recruiter, own job only)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Ownership check
    if (job.postedBy && !job.postedBy.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this job.',
      });
    }

    await job.deleteOne();
    // Also delete all applications for this job
    await Application.deleteMany({ jobId: req.params.id });
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc  Apply to a job
// @route POST /api/jobs/:id/apply
// @access Private (candidate only)
const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const { name, email, phone } = req.body;

    // Check for duplicate application by user or email
    const existing = await Application.findOne({
      jobId: req.params.id,
      $or: [
        { applicantId: req.user.id },
        { email: req.user.email },
      ],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }

    const application = await Application.create({
      jobId: req.params.id,
      applicantId: req.user.id,
      name: name || req.user.name,
      email: email || req.user.email,
      phone,
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all applications for a job
// @route GET /api/jobs/:id/applications
// @access Private (recruiter only)
const getApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applications = await Application.find({ jobId: req.params.id })
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
};

// @desc  Update application status
// @route PATCH /api/jobs/:id/applications/:appId
// @access Private (recruiter only)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Reviewed', 'Accepted', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    // Find the application first to check current status
    const existing = await Application.findById(req.params.appId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Lock: once Accepted or Rejected, status cannot be changed
    if (['Accepted', 'Rejected'].includes(existing.status)) {
      return res.status(403).json({
        success: false,
        message: `This application has already been ${existing.status.toLowerCase()}. The decision cannot be changed.`,
        locked: true,
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { status },
      { returnDocument: 'after', runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Auto-delete job if accepted count reaches openings limit
    let jobAutoDeleted = false;
    if (status === 'Accepted') {
      const job = await Job.findById(req.params.id);
      if (job && job.openings !== null) {
        const acceptedCount = await Application.countDocuments({
          jobId: req.params.id,
          status: 'Accepted',
        });
        if (acceptedCount >= job.openings) {
          await Application.deleteMany({ jobId: req.params.id });
          await job.deleteOne();
          jobAutoDeleted = true;
        }
      }
    }

    res.json({ success: true, data: application, jobAutoDeleted });
  } catch (err) {
    next(err);
  }
};

// @desc  Check if current candidate already applied to a job
// @route GET /api/jobs/:id/applied
// @access Private (candidate)
const checkApplied = async (req, res, next) => {
  try {
    const existing = await Application.findOne({
      jobId: req.params.id,
      $or: [
        { applicantId: req.user.id },
        { email: req.user.email },
      ],
    });
    res.json({ hasApplied: !!existing });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  checkApplied,
  getApplications,
  updateApplicationStatus,
};
