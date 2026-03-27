const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    validate: {
      validator: function(v) {
        // Basic YouTube URL validation
        return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/.test(v);
      },
      message: 'Please provide a valid YouTube URL'
    }
  },
  transcriptText: {
    type: String,
    required: false
  },
  summaryText: {
    type: String,
    required: false
  },
  summaryPdfUrl: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
courseSchema.index({ moduleId: 1, createdAt: -1 });
courseSchema.index({ title: 'text' });

// Virtual for department (populated from module)
courseSchema.virtual('department').get(function() {
  return this.moduleId?.department?.name || this.moduleId?.department || 'Unknown';
});

// Virtual for module name (populated from module)
courseSchema.virtual('moduleName').get(function() {
  return this.moduleId?.name || 'Unknown Module';
});

// Pre-save middleware to update updatedAt
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find courses by module
courseSchema.statics.findByModule = function(moduleId) {
  return this.find({ moduleId })
    .populate({
      path: 'moduleId',
      select: 'code name department',
      populate: { path: 'department', select: 'name' },
    })
    .sort({ createdAt: -1 });
};

// Static method to find courses by department
courseSchema.statics.findByDepartment = function(department) {
  return this.find()
    .populate({
      path: 'moduleId',
      match: { department: department }
    })
    .then(courses => courses.filter(course => course.moduleId));
};

module.exports = mongoose.model('Course', courseSchema);