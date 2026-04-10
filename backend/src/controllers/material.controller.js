const path = require('path');
const Material = require('../models/Material');
const Module = require('../models/Module');
const Department = require('../models/Department');
const { processSummary } = require('../services/summarizer.service');

const buildTagsArray = (tags) => {
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
};

const buildPagination = (page, limit, total) => ({
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  limit,
});

const resolveFileType = (mimeType = '') => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('msword')) return 'doc';
  return 'docx';
};

const isAdmin = (req) => req.user?.role === 'admin';

const uploadMaterial = async (req, res) => {
  try {
    const {
      title,
      description,
      materialType,
      departmentId,
      academicYear,
      academicSemester,
      moduleId,
      moduleCode,
      tags,
    } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    if (!moduleId || !departmentId || !academicYear || !academicSemester || !moduleCode || !materialType) {
      return res.status(400).json({
        success: false,
        message:
          'departmentId, academicYear, academicSemester, moduleId, moduleCode and materialType are required.',
      });
    }

    const moduleDoc = await Module.findById(moduleId).select('code department academicYear academicSemester');
    if (!moduleDoc) {
      return res.status(404).json({ success: false, message: 'Module not found.' });
    }

    if (String(moduleDoc.department) !== String(departmentId)) {
      return res.status(400).json({ success: false, message: 'Selected module does not belong to the selected department.' });
    }

    if (moduleDoc.academicYear !== academicYear || moduleDoc.academicSemester !== academicSemester) {
      return res.status(400).json({ success: false, message: 'Module does not match selected academic year/semester.' });
    }

    const fileUrl =
      file.secure_url ||
      file.path ||
      file.location ||
      (file.filename ? `/uploads/${file.filename}` : '');

    const createdByAdmin = isAdmin(req);

    const material = await Material.create({
      title: title?.trim() || `${moduleDoc.code} ${materialType}`,
      description,
      materialType,
      department: departmentId,
      academicYear,
      academicSemester,
      module: moduleId,
      moduleCode: moduleCode?.trim() || moduleDoc.code,
      uploadedBy: req.user?._id || null,
      submissionStatus: createdByAdmin ? 'approved' : 'pending',
      reviewedBy: createdByAdmin ? req.user._id : null,
      reviewedAt: createdByAdmin ? new Date() : null,
      fileUrl,
      fileType: resolveFileType(file.mimetype),
      originalFileName: file.originalname,
      extractedText: '',
      summaryText: '',
      fileSize: file.size,
      tags: buildTagsArray(tags),
    });

    return res.status(201).json({
      success: true,
      message: createdByAdmin
        ? 'Material uploaded and published successfully.'
        : 'Material submitted successfully and sent to admin review.',
      data: material,
    });
  } catch (error) {
    console.error('uploadMaterial error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload material.' });
  }
};

const getAllMaterials = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sort = req.query.sort === 'oldest' ? 1 : -1;

    const filter = {};
    if (!isAdmin(req)) {
      filter.submissionStatus = 'approved';
    } else if (req.query.submissionStatus) {
      filter.submissionStatus = req.query.submissionStatus;
    }

    if (req.query.moduleId) filter.module = req.query.moduleId;
    if (req.query.departmentId) filter.department = req.query.departmentId;
    if (req.query.materialType) filter.materialType = req.query.materialType;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.academicSemester) filter.academicSemester = req.query.academicSemester;
    if (req.query.fileType) filter.fileType = req.query.fileType;

    const total = await Material.countDocuments(filter);
    const materials = await Material.find(filter)
      .populate('department', 'name')
      .populate('module', 'name code')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: sort })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Materials fetched successfully.',
      data: materials,
      pagination: buildPagination(page, limit, total),
    });
  } catch (error) {
    console.error('getAllMaterials error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch materials.' });
  }
};

const getPendingMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ submissionStatus: 'pending' })
      .populate('department', 'name')
      .populate('module', 'name code')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Pending materials fetched successfully.',
      data: materials,
    });
  } catch (error) {
    console.error('getPendingMaterials error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch pending materials.' });
  }
};

const reviewMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reviewNote = '' } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'action must be approve or reject.' });
    }

    const material = await Material.findById(id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    material.submissionStatus = action === 'approve' ? 'approved' : 'rejected';
    material.reviewNote = String(reviewNote || '').trim();
    material.reviewedBy = req.user._id;
    material.reviewedAt = new Date();
    await material.save();

    return res.status(200).json({
      success: true,
      message: action === 'approve' ? 'Material approved.' : 'Material rejected.',
      data: material,
    });
  } catch (error) {
    console.error('reviewMaterial error:', error);
    return res.status(500).json({ success: false, message: 'Failed to review material.' });
  }
};

const getMaterialsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const filter = { module: moduleId };
    if (!isAdmin(req)) filter.submissionStatus = 'approved';

    const materials = await Material.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Module materials fetched successfully.',
      data: materials,
    });
  } catch (error) {
    console.error('getMaterialsByModule error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch materials.' });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id)
      .populate('department', 'name')
      .populate('module', 'name code');

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    if (!isAdmin(req) && material.submissionStatus !== 'approved') {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Material fetched successfully.',
      data: material,
    });
  } catch (error) {
    console.error('getMaterialById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch material.' });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags, materialType } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (tags) updates.tags = buildTagsArray(tags);
    if (materialType) updates.materialType = materialType;

    const material = await Material.findByIdAndUpdate(id, updates, { new: true });

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Material updated successfully.',
      data: material,
    });
  } catch (error) {
    console.error('updateMaterial error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update material.' });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByIdAndDelete(id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Material deleted successfully.',
    });
  } catch (error) {
    console.error('deleteMaterial error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete material.' });
  }
};

const searchMaterials = async (req, res) => {
  try {
    const { q, moduleId, fileType, departmentId, academicYear, academicSemester } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sort = req.query.sort === 'oldest' ? 1 : -1;

    const filter = {};
    if (!isAdmin(req)) filter.submissionStatus = 'approved';
    if (moduleId) filter.module = moduleId;
    if (departmentId) filter.department = departmentId;
    if (academicYear) filter.academicYear = academicYear;
    if (academicSemester) filter.academicSemester = academicSemester;
    if (fileType) filter.fileType = fileType;

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { tags: regex }, { moduleCode: regex }];
    }

    const total = await Material.countDocuments(filter);
    const materials = await Material.find(filter)
      .sort({ createdAt: sort })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Materials search completed.',
      data: materials,
      pagination: buildPagination(page, limit, total),
    });
  } catch (error) {
    console.error('searchMaterials error:', error);
    return res.status(500).json({ success: false, message: 'Failed to search materials.' });
  }
};

const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const mode = req.query.mode === 'view' ? 'view' : 'download';
    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    if (!isAdmin(req) && material.submissionStatus !== 'approved') {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    material.downloadCount += 1;
    await material.save();

    const fileUrl = material.fileUrl;
    const isHttp = /^https?:\/\//i.test(fileUrl);
    const fallbackName = `material-${id}.pdf`;
    const baseName = (material.originalFileName || fallbackName).replace(/[\r\n]/g, '').trim();
    const safeFileName = /\.[A-Za-z0-9]{2,5}$/.test(baseName)
      ? baseName
      : `${baseName}.pdf`;
    const asciiFileName = safeFileName.replace(/[^\x20-\x7E]/g, '_');
    const encodedName = encodeURIComponent(safeFileName);
    const contentTypeByFileType = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const contentType = contentTypeByFileType[material.fileType] || 'application/octet-stream';
    const dispositionType = mode === 'view' ? 'inline' : 'attachment';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `${dispositionType}; filename="${asciiFileName}"; filename*=UTF-8''${encodedName}`
    );

    if (!isHttp && fileUrl) {
      const absolutePath = path.isAbsolute(fileUrl)
        ? fileUrl
        : path.join(process.cwd(), fileUrl.replace(/^\/+/, ''));
      return res.sendFile(absolutePath, (err) => {
        if (err) {
          console.error('downloadMaterial sendFile error:', err);
          res.status(500).json({ success: false, message: 'Failed to download file.' });
        }
      });
    }

    if (isHttp) {
      const upstreamResponse = await fetch(fileUrl);
      if (!upstreamResponse.ok) {
        return res.status(502).json({ success: false, message: 'Failed to fetch file from storage provider.' });
      }

      const arrayBuffer = await upstreamResponse.arrayBuffer();
      return res.status(200).send(Buffer.from(arrayBuffer));
    }

    return res.status(404).json({ success: false, message: 'File not found.' });
  } catch (error) {
    console.error('downloadMaterial error:', error);
    return res.status(500).json({ success: false, message: 'Failed to prepare download.' });
  }
};

const generateMaterialSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found.' });
    }

    if (!material.extractedText) {
      return res.status(400).json({
        success: false,
        message: 'No extracted text available to summarize.',
      });
    }

    material.summaryText = (await processSummary(material.extractedText, 500)).summary;
    await material.save();

    return res.status(200).json({
      success: true,
      message: 'Summary generated successfully.',
      data: { summaryText: material.summaryText },
    });
  } catch (error) {
    console.error('generateMaterialSummary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate summary.' });
  }
};

const getMaterialHierarchy = async (req, res) => {
  try {
    const departments = await Department.find().select('name').sort({ name: 1 });
    const modules = await Module.find()
      .select('name code department academicYear academicSemester')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: {
        departments,
        modules,
      },
    });
  } catch (error) {
    console.error('getMaterialHierarchy error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch hierarchy.' });
  }
};

module.exports = {
  uploadMaterial,
  getAllMaterials,
  getPendingMaterials,
  reviewMaterial,
  getMaterialHierarchy,
  getMaterialsByModule,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  searchMaterials,
  downloadMaterial,
  generateMaterialSummary,
};
