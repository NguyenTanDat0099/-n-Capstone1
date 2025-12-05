import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Password change form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  axios.defaults.baseURL = "http://localhost:5000";

  // Get user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get user_id from localStorage (should be set during login)
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user_id");

        if (!userId) {
          alert("Chưa đăng nhập");
          return;
        }

        const res = await axios.get(`/api/auth/user/${userId}`);
        setUser(res.data);
        setAvatarPreview(res.data.avatar || "https://via.placeholder.com/150");
      } catch (err) {
        console.error("Lỗi tải thông tin:", err);
        alert("Lỗi khi tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Load theme preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    applyTheme(savedDarkMode);
  }, []);

  // Apply theme
  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    applyTheme(newDarkMode);
  };

  // Toggle notifications
  const handleToggleNotifications = () => {
    setNotifications(!notifications);
    localStorage.setItem("notifications", !notifications);
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("Mật khẩu mới không khớp");
      return;
    }

    if (passwordForm.new_password.length < 6) {
      alert("Mật khẩu mới phải ít nhất 6 ký tự");
      return;
    }

    try {
      const userId = localStorage.getItem("user_id");
      await axios.post("/api/auth/change-password", {
        user_id: parseInt(userId),
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });

      alert("✅ Đổi mật khẩu thành công");
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
      setShowPasswordForm(false);
    } catch (err) {
      console.error("Lỗi:", err);
      alert("❌ " + (err.response?.data?.message || "Lỗi đổi mật khẩu"));
    }
  };

  // Handle avatar file select
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload avatar
  const handleUploadAvatar = async () => {
    if (!avatarFile) {
      alert("Vui lòng chọn ảnh");
      return;
    }

    // In a real app, you would upload to a server/cloud storage
    // For now, we'll convert to base64 and save to DB
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Avatar = reader.result;
        const userId = localStorage.getItem("user_id");

        await axios.put("/api/auth/update-avatar", {
          user_id: parseInt(userId),
          avatar: base64Avatar,
        });

        alert("✅ Cập nhật avatar thành công");
        setUser({ ...user, avatar: base64Avatar });
        setAvatarFile(null);
      };
      reader.readAsDataURL(avatarFile);
    } catch (err) {
      console.error("Lỗi:", err);
      alert("❌ Lỗi cập nhật avatar");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải...</div>;
  }

  if (!user) {
    return <div className="p-6 text-center text-red-500">Không thể tải thông tin người dùng</div>;
  }

  return (
    <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
      <h1 className="text-3xl font-bold mb-6">⚙️ Cài Đặt</h1>

      {/* Account Information Card */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded shadow-lg p-6 mb-6`}>
        <h2 className="text-2xl font-bold mb-6">👤 Thông Tin Tài Khoản</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-500"
            />
            <div className="space-y-2 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="block w-full text-sm border rounded px-3 py-2"
              />
              <button
                onClick={handleUploadAvatar}
                disabled={!avatarFile}
                className={`w-full px-4 py-2 rounded font-bold text-white ${
                  avatarFile ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                📸 Cập Nhật Avatar
              </button>
            </div>
          </div>

          {/* User Info Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Tên</label>
              <input
                type="text"
                value={user.fullname}
                disabled
                className={`w-full border rounded px-3 py-2 ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className={`w-full border rounded px-3 py-2 ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Role</label>
              <input
                type="text"
                value={user.role || "Technician"}
                disabled
                className={`w-full border rounded px-3 py-2 ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        <div className="mt-6 border-t pt-6">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 font-bold"
          >
            🔐 Đổi Mật Khẩu
          </button>

          {/* Password Form */}
          {showPasswordForm && (
            <div className="mt-4 space-y-4 p-4 border rounded bg-gray-50 dark:bg-gray-700">
              <div>
                <label className="block text-sm font-bold mb-2">Mật Khẩu Cũ</label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, old_password: e.target.value })
                  }
                  className={`w-full border rounded px-3 py-2 ${
                    darkMode ? "bg-gray-600 border-gray-500" : ""
                  }`}
                  placeholder="Nhập mật khẩu cũ"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Mật Khẩu Mới</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, new_password: e.target.value })
                  }
                  className={`w-full border rounded px-3 py-2 ${
                    darkMode ? "bg-gray-600 border-gray-500" : ""
                  }`}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Xác Nhận Mật Khẩu Mới</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                  }
                  className={`w-full border rounded px-3 py-2 ${
                    darkMode ? "bg-gray-600 border-gray-500" : ""
                  }`}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-bold"
                >
                  ✅ Xác Nhận
                </button>
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-bold"
                >
                  ❌ Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Settings Card */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded shadow-lg p-6`}>
        <h2 className="text-2xl font-bold mb-6">🛠️ Thiết Lập Hệ Thống</h2>

        <div className="space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 className="font-bold text-lg">🌙 Chế Độ Tối</h3>
              <p className="text-sm text-gray-500">Bật/Tắt chế độ tối</p>
            </div>
            <button
              onClick={handleToggleDarkMode}
              className={`relative w-14 h-8 rounded-full transition ${
                darkMode ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  darkMode ? "transform translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 className="font-bold text-lg">🔔 Thông Báo</h3>
              <p className="text-sm text-gray-500">Bật/Tắt thông báo hệ thống</p>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`relative w-14 h-8 rounded-full transition ${
                notifications ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  notifications ? "transform translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* Theme Info */}
          <div className="p-4 border rounded bg-blue-50 dark:bg-blue-900">
            <p className="text-sm">
              <strong>Chế độ hiện tại:</strong> {darkMode ? "Tối 🌙" : "Sáng ☀️"}
            </p>
            <p className="text-sm">
              <strong>Thông báo:</strong> {notifications ? "Bật 📢" : "Tắt 🔇"}
            </p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 font-bold text-lg"
        >
          🚪 Đăng Xuất
        </button>
      </div>
    </div>
  );
}
