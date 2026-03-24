import path from 'path';
import Material from '../models/Material.js';
import {
  extractTextFromFile,
  isSupportedMime,
  resolveFileType,
} from '../services/pdf.service.js';
import summarizeText from '../services/summarizer.service.js';

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

export const uploadMaterial = async (req, res) => {
  try {
    const { title, description, moduleId, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: 'No file uploaded.' });
    }

    if (!moduleId) {
      return res
        .status(400)
        .json({ success: false, message: 'moduleId is required.' });
    }

    if (!isSupportedMime(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Only PDF and DOCX are allowed.',
      });
    }

    const fileType = resolveFileType(file.mimetype);
    const extractedText = await extractTextFromFile(file);
    const summaryText = extractedText
      ? summarizeText(extractedText)
      : 'No text available for summarization.';

    const fileUrl =
      file.secure_url ||
      file.path ||
      file.location ||
      (file.filename ? `/uploads/${file.filename}` : '');

    const material = await Material.create({
      title: title || file.originalname,
      description,
      module: moduleId,
      uploadedBy: req.user?._id || req.body.uploadedBy || null,
      fileUrl,
      fileType,
      originalFileName: file.originalname,
      extractedText,
      summaryText,
      fileSize: file.size,
      tags: buildTagsArray(tags),
    });

    return res.status(201).json({
      success: true,
      message: 'Material uploaded successfully.',
      data: material,
    });
  } catch (error) {
    console.error('uploadMaterial error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to upload material.' });
  }
};

export const getAllMaterials = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sort = req.query.sort === 'oldest' ? 1 : -1;

    const filter = {};
    if (req.query.moduleId) filter.module = req.query.moduleId;
    if (req.query.fileType) filter.fileType = req.query.fileType;

    const total = await Material.countDocuments(filter);
    const materials = await Material.find(filter)
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
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch materials.' });
  }
};

export const getMaterialsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const materials = await Material.find({ module: moduleId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: 'Module materials fetched successfully.',
      data: materials,
    });
  } catch (error) {
    console.error('getMaterialsByModule error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch materials.' });
  }
};

export const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);

    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: 'Material not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Material fetched successfully.',
      data: material,
    });
  } catch (error) {
    console.error('getMaterialById error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch material.' });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (tags) updates.tags = buildTagsArray(tags);

    const material = await Material.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: 'Material not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Material updated successfully.',
      data: material,
    });
  } catch (error) {
    console.error('updateMaterial error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to update material.' });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByIdAndDelete(id);

    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: 'Material not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Material deleted successfully.',
    });
  } catch (error) {
    console.error('deleteMaterial error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to delete material.' });
  }
};

export const searchMaterials = async (req, res) => {
  try {
    const { q, moduleId, fileType } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sort = req.query.sort === 'oldest' ? 1 : -1;

    const filter = {};
    if (moduleId) filter.module = moduleId;
    if (fileType) filter.fileType = fileType;

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
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
    return res
      .status(500)
      .json({ success: false, message: 'Failed to search materials.' });
  }
};

export const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);

    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: 'Material not found.' });
    }

    material.downloadCount += 1;
    await material.save();

    const fileUrl = material.fileUrl;
    const isHttp = /^https?:\/\//i.test(fileUrl);

    if (req.query.redirect === 'true' && isHttp) {
      return res.redirect(fileUrl);
    }

    if (!isHttp && fileUrl) {
      const absolutePath = path.isAbsolute(fileUrl)
        ? fileUrl
        : path.join(process.cwd(), fileUrl.replace(/^\/+/, ''));
      return res.sendFile(absolutePath, (err) => {
        if (err) {
          console.error('downloadMaterial sendFile error:', err);
          res
            .status(500)
            .json({ success: false, message: 'Failed to download file.' });
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Download URL ready.',
      data: { fileUrl },
    });
  } catch (error) {
    console.error('downloadMaterial error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to prepare download.' });
  }
};

export const generateMaterialSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);

    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: 'Material not found.' });
    }

    if (!material.extractedText) {
      return res.status(400).json({
        success: false,
        message: 'No extracted text available to summarize.',
      });
    }

    material.summaryText = summarizeText(material.extractedText);
    await material.save();

    return res.status(200).json({
      success: true,
      message: 'Summary generated successfully.',
      data: { summaryText: material.summaryText },
    });
  } catch (error) {
    console.error('generateMaterialSummary error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to generate summary.' });
  }
};
