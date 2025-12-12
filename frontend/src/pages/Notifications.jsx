import { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5000";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("user_id") || 1;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/notifications/user/${userId}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      await fetchNotifications();
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      await fetchNotifications();
    } catch (err) {
      console.error("Lỗi xóa thông báo:", err);
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📢 Thông Báo</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Không có thông báo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 border rounded-lg flex justify-between items-start ${
                notif.is_read ? "bg-white" : "bg-blue-50 border-blue-300"
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(notif.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
