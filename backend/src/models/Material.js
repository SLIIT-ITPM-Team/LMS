import mongoose from 'mongoose';

const { Schema } = mongoose;

const MaterialSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
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

const Material =
  mongoose.models.Material || mongoose.model('Material', MaterialSchema);

export default Material;
