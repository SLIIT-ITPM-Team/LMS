import api from "./axios";

// Study Materials API layer
// Each function corresponds to a backend endpoint for materials.

export const uploadMaterial = async (formData) => {
  const { data } = await api.post("/api/materials/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getAllMaterials = async (params = {}) => {
  const { data } = await api.get("/api/materials", { params });
  return data;
};

export const searchMaterials = async (params = {}) => {
  const { data } = await api.get("/api/materials/search", { params });
  return data;
};

export const getMaterialsByModule = async (moduleId) => {
  const { data } = await api.get(`/api/materials/module/${moduleId}`);
  return data;
};

export const getMaterialById = async (id) => {
  const { data } = await api.get(`/api/materials/${id}`);
  return data;
};

export const downloadMaterial = async (id) => {
  const response = await api.get(`/api/materials/${id}/download`, {
    responseType: "blob",
  });

  // Build a temporary URL and trigger download
  const disposition = response.headers["content-disposition"] || "";
  const match = disposition.match(/filename=\"?([^\";]+)\"?/);
  const fileName = match ? match[1] : `material-${id}`;

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return true;
};

export const deleteMaterial = async (id) => {
  const { data } = await api.delete(`/api/materials/${id}`);
  return data;
};

export const updateMaterial = async (id, payload) => {
  const { data } = await api.put(`/api/materials/${id}`, payload);
  return data;
};
