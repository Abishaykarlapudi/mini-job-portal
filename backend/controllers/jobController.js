const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc  Get all jobs (with search, filter, sort, pagination)
// @route GET /api/jobs
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
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
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
const createJob = async (req, res, next) => {
  try {
    const { title, company, location, type, salary, description, logoUrl } = req.body;
    const job = await Job.create({ title, company, location, type, salary, description, logoUrl });
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc  Update a job
// @route PUT /api/jobs/:id
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete a job
// @route DELETE /api/jobs/:id
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    // Also delete all applications for this job
    await Application.deleteMany({ jobId: req.params.id });
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc  Apply to a job
// @route POST /api/jobs/:id/apply
const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const { name, email, phone } = req.body;

    // Check for duplicate application
    const existing = await Application.findOne({ jobId: req.params.id, email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }

    const application = await Application.create({
      jobId: req.params.id,
      name,
      email,
      phone,
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all applications for a job
// @route GET /api/jobs/:id/applications
const getApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applications = await Application.find({ jobId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: applications.length, data: applications });
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
  getApplications,
};
