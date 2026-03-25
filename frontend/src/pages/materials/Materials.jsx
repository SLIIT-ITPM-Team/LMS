import React, { useEffect, useState } from "react";
import {
  uploadMaterial,
  getAllMaterials,
  searchMaterials,
  deleteMaterial,
  downloadMaterial,
} from "../../api/material.api";
import MaterialUploadForm from "../../components/materials/MaterialUploadForm";
import MaterialsList from "../../components/materials/MaterialsList";
import SearchFilterBar from "../../components/materials/SearchFilterBar";
import Loader from "../../components/common/Loader";
import "../../styles/materials.css";

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMaterials = async (params = {}) => {
    setLoading(true);
    try {
      const data = await getAllMaterials(params);
      setMaterials(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load materials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUpload = async (formData) => {
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      await uploadMaterial(formData);
      setSuccess("Material uploaded successfully.");
      await fetchMaterials();
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFilter = async ({ search, type, module }) => {
    setError("");
    setLoading(true);
    try {
      const params = {};
      if (type && type !== "all") params.type = type;
      if (module) params.module = module;

      let data;
      if (search) {
        data = await searchMaterials({ q: search, ...params });
      } else if (Object.keys(params).length) {
        data = await getAllMaterials(params);
      } else {
        data = await getAllMaterials();
      }

      setMaterials(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to apply filters.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this material? This cannot be undone."
    );
    if (!confirmDelete) return;

    setError("");
    try {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete material.");
    }
  };

  const handleDownload = async (id) => {
    setError("");
    try {
      await downloadMaterial(id);
    } catch (err) {
      setError(err?.response?.data?.message || "Download failed.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Study Materials</p>
          <h1>Resources &amp; Past Papers</h1>
          <p className="muted">
            Upload PDF or DOCX files, browse summaries, and download resources
            for your modules.
          </p>
        </div>
      </div>

      <div className="layout-grid">
        <div className="sidebar">
          <MaterialUploadForm
            onUpload={handleUpload}
            uploading={uploading}
            onErrorClear={() => setError("")}
          />
          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}
        </div>

        <div className="content">
          <SearchFilterBar onApply={handleFilter} loading={loading} />
          {loading ? (
            <Loader />
          ) : (
            <MaterialsList
              materials={materials}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Materials;
