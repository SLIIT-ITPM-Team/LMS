import React, { useState } from "react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MaterialUploadForm = ({ onUpload, uploading, onErrorClear }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState("");
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setValidationError("Only PDF or DOCX files are allowed.");
      setFile(null);
      return;
    }

    setValidationError("");
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onErrorClear?.();
    setValidationError("");

    if (!title.trim()) {
      setValidationError("Title is required.");
      return;
    }

    if (!file) {
      setValidationError("Please choose a PDF or DOCX file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    if (module.trim()) formData.append("module", module.trim());
    formData.append("file", file);

    await onUpload(formData);
    // Reset form after successful upload
    setTitle("");
    setDescription("");
    setModule("");
    setFile(null);
    const input = document.getElementById("material-file-input");
    if (input) input.value = "";
  };

  return (
    <div className="card surface p-4">
      <div className="card-header">
        <div>
          <p className="eyebrow">Upload</p>
          <h3 className="card-title">Add Study Material</h3>
          <p className="muted">
            Upload PDFs or DOCX files. A summary will be generated for PDFs.
          </p>
        </div>
      </div>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="material-title">Title *</label>
          <input
            id="material-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Data Structures Notes"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="material-description">Description</label>
          <textarea
            id="material-description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe the material"
          />
        </div>

        <div className="form-inline">
          <div className="form-group grow">
            <label htmlFor="material-module">Module (optional)</label>
            <input
              id="material-module"
              type="text"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              placeholder="e.g. CS204"
            />
          </div>
          <div className="form-group">
            <label htmlFor="material-file-input">File *</label>
            <input
              id="material-file-input"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            <p className="muted tiny">Accepted: PDF or DOCX</p>
          </div>
        </div>

        {validationError && (
          <div className="alert alert-error">{validationError}</div>
        )}

        <button className="btn primary" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Material"}
        </button>
      </form>
    </div>
  );
};

export default MaterialUploadForm;
