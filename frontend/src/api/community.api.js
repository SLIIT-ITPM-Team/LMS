import axios from './axios';

// ── Channels ──────────────────────────────
export const getChannels = () => axios.get('/community/channels');
export const getChannel = (id) => axios.get(`/community/channels/${id}`);
export const createChannel = (data) => axios.post('/community/channels', data);
export const updateChannel = (id, data) => axios.put(`/community/channels/${id}`, data);
export const deleteChannel = (id) => axios.delete(`/community/channels/${id}`);

// ── Posts ─────────────────────────────────
export const getPostsByChannel = (channelId) =>
  axios.get(`/community/channels/${channelId}/posts`);
export const createPost = (data) => axios.post('/community/posts', data);
export const updatePost = (id, data) => axios.put(`/community/posts/${id}`, data);
export const deletePost = (id) => axios.delete(`/community/posts/${id}`);

// ── Likes ─────────────────────────────────
export const toggleLike = (postId) => axios.post(`/community/posts/${postId}/like`);

// ── Comments ──────────────────────────────
export const getCommentsByPost = (postId) =>
  axios.get(`/community/posts/${postId}/comments`);
export const createComment = (postId, data) =>
  axios.post(`/community/posts/${postId}/comments`, data);
export const updateComment = (id, data) => axios.put(`/community/comments/${id}`, data);
export const deleteComment = (id) => axios.delete(`/community/comments/${id}`);
