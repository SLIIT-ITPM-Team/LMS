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

export const getMaterialHierarchy = async () => {
  const { data } = await api.get("/api/materials/hierarchy");
  return data;
};

export const getPendingMaterials = async () => {
  const { data } = await api.get("/api/materials/admin/pending");
  return data;
};

export const reviewMaterial = async (id, payload) => {
  const { data } = await api.patch(`/api/materials/${id}/review`, payload);
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
  const response = await api.get(`/api/materials/${id}/download?mode=download`, {
    responseType: "blob",
  });

  // Build a temporary URL and trigger download.
  // Support both `filename=` and RFC5987 `filename*=` header formats.
  const disposition = response.headers["content-disposition"] || "";
  const utf8FileNameMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const quotedFileNameMatch = disposition.match(/filename=\"?([^\";]+)\"?/i);

  let fileName = `material-${id}.pdf`;
  if (utf8FileNameMatch?.[1]) {
    fileName = decodeURIComponent(utf8FileNameMatch[1]);
  } else if (quotedFileNameMatch?.[1]) {
    fileName = quotedFileNameMatch[1];
  }

  const contentType = response.headers["content-type"] || "";
  const isPdf = contentType.toLowerCase().includes("application/pdf");
  if (isPdf && !/\.pdf$/i.test(fileName)) {
    fileName = `${fileName}.pdf`;
  }

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

export const openMaterialInNewTab = async (id) => {
  const response = await api.get(`/api/materials/${id}/download?mode=view`, {
    responseType: "blob",
  });

  const contentType = response.headers["content-type"] || "application/pdf";
  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
  window.open(blobUrl, "_blank", "noopener,noreferrer");

  // Give the new tab time to consume the blob URL before revoking.
  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 60_000);

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
