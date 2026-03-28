const mongoose = require('mongoose');

const { Schema } = mongoose;

const MaterialSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    materialType: {
      type: String,
      enum: ['Lecture Note', 'Past Paper', 'Model Paper', 'Short Note'],
      required: true,
    },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    academicYear: {
      type: String,
      enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
      required: true,
    },
    academicSemester: {
      type: String,
      enum: ['1st Semester', '2nd Semester'],
      required: true,
    },
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    moduleCode: { type: String, required: true, trim: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, trim: true, default: '' },
    submissionStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'doc', 'docx'], required: true },
    originalFileName: { type: String, required: true },
    extractedText: { type: String },
    summaryText: { type: String },
    fileSize: { type: Number },
    tags: [{ type: String, trim: true }],
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MaterialSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
});

module.exports = mongoose.models.Material || mongoose.model('Material', MaterialSchema);
