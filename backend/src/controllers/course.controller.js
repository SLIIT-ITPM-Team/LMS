const Course = require('../models/Course');
const Module = require('../models/Module');
const { extractTranscript } = require('../services/transcript.service');
const { processSummary } = require('../services/summarizer.service');
const { generateCoursePDF } = require('../services/pdf.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Create a new course
 * Admin only
 */
const createCourse = asyncHandler(async (req, res) => {
  const {
    moduleId,
    title,
    videoUrl,
    departmentId,
    academicYear,
    academicSemester,
    manualTranscript,
    manualTranscriptText,
    transcriptText: transcriptTextFromBody,
  } = req.body;

  // Validate module exists
  const module = await Module.findById(moduleId);
  if (!module) {
    return res.status(404).json({
      success: false,
      message: 'Module not found'
    });
  }

  if (departmentId && String(module.department) !== String(departmentId)) {
    return res.status(400).json({
      success: false,
      message: 'Selected module does not belong to the selected department'
    });
  }

  if (academicYear && module.academicYear !== academicYear) {
    return res.status(400).json({
      success: false,
      message: 'Selected module does not match the selected academic year'
    });
  }

  if (academicSemester && module.academicSemester !== academicSemester) {
    return res.status(400).json({
      success: false,
      message: 'Selected module does not match the selected academic semester'
    });
  }

  // Validate input
  if (!title || !videoUrl) {
    return res.status(400).json({
      success: false,
      message: 'Title and video URL are required'
    });
  }

  try {
    const warnings = [];

    // Step 2: Extract transcript from YouTube captions when possible.
    let transcriptText = String(
      manualTranscriptText || manualTranscript || transcriptTextFromBody || ''
    ).trim();

    if (!transcriptText) {
      try {
        transcriptText = await extractTranscript(videoUrl);
      } catch (transcriptError) {
        transcriptText = '';
        warnings.push(
          'Transcript was not available from YouTube captions. Upload a manual transcript to enable summary generation.'
        );
        console.warn('Transcript extraction skipped:', transcriptError.message);
      }
    }

    // Step 3: Generate summary with TextRank when transcript is present.
    let summaryText = '';
    let summaryPdfUrl = '';

    if (transcriptText) {
      try {
        const summaryResult = processSummary(transcriptText, 500);
        summaryText = summaryResult.summary;
      } catch (summaryError) {
        warnings.push('Summary generation failed. The course was created without summary.');
        console.error('Summary generation failed:', summaryError);
      }

      if (summaryText) {
        try {
          const pdfPath = await generateCoursePDF({
            title,
            moduleName: module.name,
            department: module.department,
            videoUrl,
            summaryText
          });
          summaryPdfUrl = pdfPath;
        } catch (pdfError) {
          console.error('PDF generation failed:', pdfError);
          warnings.push('PDF generation failed. Summary text is still saved.');
        }
      }
    } else {
      warnings.push('Summary generation is disabled because no transcript is available.');
    }

    // Create course
    const course = new Course({
      moduleId,
      title,
      videoUrl,
      transcriptText,
      summaryText,
      summaryPdfUrl
    });

    await course.save();

    // Populate module details
    await course.populate({
      path: 'moduleId',
      select: 'code name department academicYear academicSemester',
      populate: { path: 'department', select: 'name' },
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      warnings,
      data: course
    });

  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
});

/**
 * Get all courses with pagination and filtering
 * Both roles
 */
const getAllCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, moduleId, department, academicYear, academicSemester } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};

  const moduleFilter = {};
  if (department) moduleFilter.department = department;
  if (academicYear) moduleFilter.academicYear = academicYear;
  if (academicSemester) moduleFilter.academicSemester = academicSemester;

  if (Object.keys(moduleFilter).length > 0) {
    const moduleIds = await Module.find(moduleFilter).select('_id');
    const departmentModuleIds = moduleIds.map((mod) => String(mod._id));

    if (moduleId) {
      filter.moduleId = departmentModuleIds.includes(String(moduleId)) ? moduleId : null;
    } else {
      filter.moduleId = { $in: moduleIds.map((mod) => mod._id) };
    }
  } else if (moduleId) {
    filter.moduleId = moduleId;
  }

  try {
    const courses = await Course.find(filter)
      .populate({
        path: 'moduleId',
        select: 'code name department academicYear academicSemester',
        populate: { path: 'department', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCourses: total,
        hasNextPage: skip + courses.length < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

/**
 * Get course by ID
 * Both roles
 */
const getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id)
      .populate({
        path: 'moduleId',
        select: 'code name department academicYear academicSemester',
        populate: { path: 'department', select: 'name' },
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user has access (for students, check if they're in the same department)
    if (req.user.role === 'student') {
      // For now, allow access to all courses for students
      // In a real implementation, you might want to check enrollment
    }

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
});

/**
 * Update course
 * Admin only
 */
const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    videoUrl,
    regenerateTranscript,
    regenerateSummary: regenerateSummaryRequested,
    manualTranscriptText
  } = req.body;

  let shouldRegenerateSummary = Boolean(regenerateSummaryRequested);

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Update basic fields
    if (title) course.title = title;
    if (videoUrl) course.videoUrl = videoUrl;

    // Update transcript if manual transcript provided
    if (manualTranscriptText && typeof manualTranscriptText === 'string') {
      const transcript = manualTranscriptText.trim();
      if (transcript) {
        course.transcriptText = transcript;
        shouldRegenerateSummary = true; // Auto-regenerate summary when transcript updated
      }
    }

    // Regenerate transcript from video if requested
    if (regenerateTranscript && videoUrl) {
      try {
        course.transcriptText = await extractTranscript(videoUrl);
      } catch (error) {
        console.warn('Transcript extraction failed:', error.message);
        // Don't fail the update, just skip transcript regeneration
      }
    }

    // Regenerate summary if requested or if transcript changed
    if (shouldRegenerateSummary && course.transcriptText) {
      try {
        const summaryResult = processSummary(course.transcriptText, 500);
        course.summaryText = summaryResult.summary;
      } catch (error) {
        console.error('Summary generation failed:', error);
        // Continue without summary update
      }
    }

    // Regenerate PDF if summary changed
    if (course.summaryText && (shouldRegenerateSummary || regenerateTranscript)) {
      try {
        // Delete old PDF if exists
        if (course.summaryPdfUrl) {
          const { deletePDF } = require('../services/pdf.service');
          await deletePDF(course.summaryPdfUrl);
        }

        // Generate new PDF
        const module = await Module.findById(course.moduleId);
        const pdfPath = await generateCoursePDF({
          title: course.title,
          moduleName: module?.name || 'Unknown Module',
          department: module?.department || 'Unknown',
          videoUrl: course.videoUrl,
          summaryText: course.summaryText
        });
        course.summaryPdfUrl = pdfPath;
      } catch (error) {
        console.error('PDF regeneration failed:', error);
        // Continue without PDF
      }
    }

    await course.save();

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
});

/**
 * Delete course
 * Admin only
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete associated PDF file
    if (course.summaryPdfUrl) {
      const { deletePDF } = require('../services/pdf.service');
      try {
        await deletePDF(course.summaryPdfUrl);
      } catch (error) {
        console.error('Failed to delete PDF:', error);
      }
    }

    await Course.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
});

/**
 * Get courses by module
 * Both roles
 */
const getCoursesByModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;

  try {
    const courses = await Course.findByModule(moduleId);

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('Get courses by module error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

/**
 * Regenerate summary for a course
 * Admin only
 */
const regenerateSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.transcriptText) {
      return res.status(400).json({
        success: false,
        message: 'No transcript available to regenerate summary'
      });
    }

    // Generate new summary
    const summaryResult = processSummary(course.transcriptText, 500);
    course.summaryText = summaryResult.summary;

    // Generate new PDF
    const module = await Module.findById(course.moduleId);
    const pdfPath = await generateCoursePDF({
      title: course.title,
      moduleName: module?.name || 'Unknown Module',
      department: module?.department || 'Unknown',
      videoUrl: course.videoUrl,
      summaryText: course.summaryText
    });
    course.summaryPdfUrl = pdfPath;

    await course.save();

    res.json({
      success: true,
      message: 'Summary regenerated successfully',
      data: course
    });

  } catch (error) {
    console.error('Regenerate summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate summary',
      error: error.message
    });
  }
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCoursesByModule,
  regenerateSummary
};