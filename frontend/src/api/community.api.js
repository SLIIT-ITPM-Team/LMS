import axios from './axios';

// ── Channels ──────────────────────────────
const base = '/api/community';

export const getChannels = () => axios.get(`${base}/channels`);
export const getChannel = (id) => axios.get(`${base}/channels/${id}`);
export const createChannel = (data) => axios.post(`${base}/channels`, data);
export const updateChannel = (id, data) => axios.put(`${base}/channels/${id}`, data);
export const deleteChannel = (id) => axios.delete(`${base}/channels/${id}`);

// ── Posts ─────────────────────────────────
export const getPostsByChannel = (channelId) =>
  axios.get(`${base}/channels/${channelId}/posts`);
export const createPost = (data) => axios.post(`${base}/posts`, data);
export const updatePost = (id, data) => axios.put(`${base}/posts/${id}`, data);
export const deletePost = (id) => axios.delete(`${base}/posts/${id}`);

// ── Likes ─────────────────────────────────
export const toggleLike = (postId) => axios.post(`${base}/posts/${postId}/like`);

// ── Comments ──────────────────────────────
export const getCommentsByPost = (postId) =>
  axios.get(`${base}/posts/${postId}/comments`);
export const createComment = (postId, data) =>
  axios.post(`${base}/posts/${postId}/comments`, data);
export const updateComment = (id, data) => axios.put(`${base}/comments/${id}`, data);
export const deleteComment = (id) => axios.delete(`${base}/comments/${id}`);
