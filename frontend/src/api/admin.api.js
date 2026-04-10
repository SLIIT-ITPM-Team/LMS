import api from './axios';

export const getAllUsers = async (params = {}) => {
  const response = await api.get('/api/admin/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/api/admin/users/${id}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post('/api/admin/users', data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/api/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id, permanent = false) => {
  const response = await api.delete(`/api/admin/users/${id}`, {
    params: { permanent },
  });
  return response.data;
};

export const assignModule = async (userId, moduleIds) => {
  const payload = Array.isArray(moduleIds)
    ? { moduleIds }
    : { moduleId: moduleIds };

  const response = await api.post(`/api/admin/users/${userId}/assign-module`, payload);
  return response.data;
};

export const getStatistics = async () => {
  const response = await api.get('/api/admin/statistics');
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get('/api/admin/departments');
  return response.data;
};

export const createDepartment = async (data) => {
  const response = await api.post('/api/admin/departments', data);
  return response.data;
};

export const updateDepartment = async (id, data) => {
  const response = await api.put(`/api/admin/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/api/admin/departments/${id}`);
  return response.data;
};

export const getModules = async (params = {}) => {
  const response = await api.get('/api/admin/modules', { params });
  return response.data;
};

export const createModule = async (data) => {
  const response = await api.post('/api/admin/modules', data);
  return response.data;
};

export const updateModule = async (id, data) => {
  const response = await api.put(`/api/admin/modules/${id}`, data);
  return response.data;
};

export const deleteModule = async (id) => {
  const response = await api.delete(`/api/admin/modules/${id}`);
  return response.data;
};
