import React, { useEffect, useState } from "react";
import axios from "axios";

export default function NotificationBell({ userId, darkMode }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  axios.defaults.baseURL = "http://localhost:5000";

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await axios.get(`/api/notifications/user/${userId}`);
      setNotifications(res.data);

      // Count unread
      const unread = res.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("[NotificationBell] Lỗi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count on mount and refresh
  useEffect(() => {
    fetchNotifications();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error("[NotificationBell] Lỗi đánh dấu đã đọc:", err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(`/api/notifications/user/${userId}/read-all`);
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("[NotificationBell] Lỗi đánh dấu tất cả:", err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter((n) => n.id !== notificationId));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error("[NotificationBell] Lỗi xóa thông báo:", err);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowPopup(!showPopup)}
        className={`relative p-2 rounded-full transition ${
          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
        title="Thông báo"
      >
        <svg
          className="w-6 h-6 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>

        {/* Badge with unread count */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popup */}
      {showPopup && (
        <div
          className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl z-50 ${
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">🔔 Thông Báo</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-700"
                >
                  Đánh dấu tất cả
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div
            className={`max-h-96 overflow-y-auto ${
              darkMode ? "divide-gray-700" : "divide-gray-200"
            }`}
          >
            {loading ? (
              <div className="p-4 text-center text-gray-500">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                📭 Không có thông báo
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b transition ${
                    !notification.is_read
                      ? darkMode
                        ? "bg-blue-900 bg-opacity-30"
                        : "bg-blue-50"
                      : ""
                  } ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.is_read ? "font-bold" : ""}`}>
                        {notification.message}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {new Date(notification.created_at).toLocaleString("vi-VN")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
                          title="Đánh dấu đã đọc"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                        title="Xóa"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className={`p-3 border-t text-center text-xs ${
              darkMode ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
            }`}
          >
            Tổng: {notifications.length} thông báo
          </div>
        </div>
      )}

      {/* Close popup when clicking outside */}
      {showPopup && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
