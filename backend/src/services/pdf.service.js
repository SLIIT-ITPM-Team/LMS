import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const SUPPORTED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
};

export const isSupportedMime = (mimetype = '') =>
  Boolean(SUPPORTED_MIME_TYPES[mimetype]);

export const resolveFileType = (mimetype = '') => SUPPORTED_MIME_TYPES[mimetype];

const loadBuffer = async (file) => {
  if (!file) throw new Error('File missing');
  if (file.buffer) return file.buffer;
  if (file.path) return fs.readFile(file.path);
  throw new Error('File buffer not available');
};

export const extractTextFromFile = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!isSupportedMime(file.mimetype)) {
    throw new Error('Unsupported file type. Only PDF and DOCX are allowed.');
  }

  const buffer = await loadBuffer(file);
  const type = resolveFileType(file.mimetype);

  if (type === 'pdf') {
    const { text } = await pdfParse(buffer);
    return text?.trim() || '';
  }

  if (type === 'docx') {
    const { value } = await mammoth.extractRawText({ buffer });
    return value?.trim() || '';
  }

  return '';
};
