import api from "./axios";

export const getNotifications = (params = {}) =>
  api.get("/api/notifications", { params });

export const getUnreadCount = () =>
  api.get("/api/notifications/unread-count");

export const markAsRead = (notificationId) =>
  api.patch(`/api/notifications/${notificationId}/read`);

export const markAllAsRead = () =>
  api.patch("/api/notifications/read-all");
