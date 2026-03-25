import api from './axios';

export const register = async (data) => {
	const response = await api.post('/api/auth/register', data);
	return response.data;
};

export const login = async (data) => {
	const response = await api.post('/api/auth/login', data);
	return response.data;
};

export const getMe = async () => {
	const response = await api.get('/api/auth/me');
	return response.data;
};

export const updateProfile = async (data) => {
	const response = await api.put('/api/auth/profile', data);
	return response.data;
};

export const changePassword = async (data) => {
	const response = await api.post('/api/auth/change-password', data);
	return response.data;
};

export const logout = async () => {
	const response = await api.post('/api/auth/logout');
	return response.data;
};
