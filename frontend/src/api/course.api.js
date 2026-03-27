import api from './axios';

export const courseApi = {
  // Create a new course
  createCourse: async (data) => {
    try {
      const response = await api.post('/api/courses', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all courses with pagination and filtering
  getAllCourses: async (params = {}) => {
    try {
      const response = await api.get('/api/courses', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await api.get(`/api/courses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update course
  updateCourse: async (id, data) => {
    try {
      const response = await api.put(`/api/courses/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`/api/courses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get courses by module
  getCoursesByModule: async (moduleId) => {
    try {
      const response = await api.get(`/api/courses/module/${moduleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Regenerate summary for a course
  regenerateSummary: async (id) => {
    try {
      const response = await api.post(`/api/courses/${id}/regenerate-summary`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Download PDF summary
  downloadPDF: async (pdfUrl) => {
    try {
      const response = await api.get(pdfUrl, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default courseApi;