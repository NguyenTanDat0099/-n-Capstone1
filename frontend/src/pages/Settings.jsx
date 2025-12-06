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

        console.log("[Settings] userId from localStorage:", userId);
        console.log("[Settings] token:", token ? "exist" : "not found");

        if (!userId) {
          console.error("[Settings] No userId found");
          alert("Chưa đăng nhập");
          setLoading(false);
          return;
        }

        const url = `/api/auth/user/${userId}`;
        console.log("[Settings] Fetching from:", url);
        
        const res = await axios.get(url);
        console.log("[Settings] Response:", res.data);
        
        setUser(res.data);
        setAvatarPreview(res.data.avatar || "https://via.placeholder.com/150");
      } catch (err) {
        console.error("[Settings] Lỗi chi tiết:", err.response || err);
        console.error("[Settings] Error message:", err.message);
        console.error("[Settings] Error data:", err.response?.data);
        alert("❌ Lỗi khi tải thông tin người dùng: " + (err.response?.data?.message || err.message));
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

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Avatar = reader.result;
        const userId = localStorage.getItem("user_id");

        try {
          await axios.put("/api/auth/update-avatar", {
            user_id: parseInt(userId),
            avatar: base64Avatar,
          });

          alert("✅ Cập nhật avatar thành công");
          setUser({ ...user, avatar: base64Avatar });
          setAvatarFile(null);
          setAvatarPreview(base64Avatar);
        } catch (err) {
          console.error("Lỗi upload:", err);
          alert("❌ " + (err.response?.data?.message || "Lỗi cập nhật avatar"));
        }
      };
      reader.readAsDataURL(avatarFile);
    } catch (err) {
      console.error("Lỗi:", err);
      alert("❌ Lỗi xử lý file");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải...</div>;
  }

  if (!user) {
    return <div className="p-6 text-center text-red-500">Không thể tải thông tin người dùng</div>;
  }

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" : "bg-gradient-to-br from-blue-50 via-white to-gray-50 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-bold mb-2">⚙️ Cài Đặt</h1>
        <p className={`mb-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Quản lý tài khoản và cài đặt hệ thống</p>

        {/* Account Information Card */}
        <div className={`rounded-xl shadow-xl p-8 mb-6 transition-all ${darkMode ? "bg-gray-800 shadow-black/30" : "bg-white shadow-blue-100"} border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">👤 Thông Tin Tài Khoản</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center p-6 rounded-lg" style={{backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.05)'}}>
              <div className="relative mb-6">
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                />
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 text-white">
                  📷
                </div>
              </div>
              <div className="space-y-3 w-full">
                <label className="block">
                  <span className="block text-sm font-bold mb-2">Chọn ảnh đại diện</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className={`block w-full text-sm border-2 rounded-lg px-4 py-3 cursor-pointer transition ${
                      darkMode 
                        ? "border-gray-600 bg-gray-700 hover:border-blue-500" 
                        : "border-gray-300 hover:border-blue-500"
                    }`}
                  />
                </label>
                <button
                  onClick={handleUploadAvatar}
                  disabled={!avatarFile}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-white transition-all transform ${
                    avatarFile 
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" 
                      : "bg-gray-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  {avatarFile ? "✅ Lưu Avatar" : "📸 Chọn ảnh trước"}
                </button>
              </div>
            </div>

          {/* User Info Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">👤 Tên Đầy Đủ</label>
              <input
                type="text"
                value={user.fullname}
                disabled
                className={`w-full border-2 rounded-lg px-4 py-3 ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">📧 Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className={`w-full border-2 rounded-lg px-4 py-3 ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">🛠️ Vai Trò</label>
              <input
                type="text"
                value={user.role || "Technician"}
                disabled
                className={`w-full border-2 rounded-lg px-4 py-3 ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        <div className="mt-8 pt-8 border-t" style={{borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}}>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-all transform flex items-center gap-2 ${
              showPasswordForm
                ? "bg-red-500 hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5"
                : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {showPasswordForm ? "❌ Hủy Đổi Mật Khẩu" : "🔐 Đổi Mật Khẩu"}
          </button>

          {/* Password Form */}
          {showPasswordForm && (
            <div className={`mt-6 space-y-4 p-6 rounded-lg border-2 transition-all ${
              darkMode 
                ? "bg-gray-700 border-gray-600" 
                : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300"
            }`}>
              <h3 className="font-bold text-lg mb-4">Nhập thông tin để đổi mật khẩu</h3>
              <div>
                <label className="block text-sm font-bold mb-2">🔒 Mật Khẩu Cũ</label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, old_password: e.target.value })
                  }
                  className={`w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 transition ${
                    darkMode ? "bg-gray-600 border-gray-500" : "bg-white border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu cũ"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">🔑 Mật Khẩu Mới</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, new_password: e.target.value })
                  }
                  className={`w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 transition ${
                    darkMode ? "bg-gray-600 border-gray-500" : "bg-white border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">✓ Xác Nhận Mật Khẩu Mới</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                  }
                  className={`w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500 transition ${
                    darkMode ? "bg-gray-600 border-gray-500" : "bg-white border-gray-300"
                  }`}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 font-bold transition-all transform"
                >
                  ✅ Xác Nhận Đổi Mật Khẩu
                </button>
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all transform ${
                    darkMode
                      ? "bg-gray-600 hover:bg-gray-500 text-white"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                  } hover:shadow-lg hover:-translate-y-0.5`}
                >
                  ❌ Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Settings Card */}
      <div className={`rounded-xl shadow-xl p-8 mb-8 transition-all ${darkMode ? "bg-gray-800 shadow-black/30" : "bg-white shadow-blue-100"} border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">🛠️ Thiết Lập Hệ Thống</h2>

        <div className="space-y-4">
          {/* Dark Mode Toggle */}
          <div className={`flex items-center justify-between p-6 rounded-lg border-2 transition ${
            darkMode 
              ? "bg-gray-700 border-gray-600 hover:border-blue-500" 
              : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400"
          }`}>
            <div>
              <h3 className="font-bold text-lg">🌙 Chế Độ Tối</h3>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Chuyển đổi giữa sáng và tối</p>
            </div>
            <button
              onClick={handleToggleDarkMode}
              className={`relative w-16 h-9 rounded-full transition-all ${
                darkMode ? "bg-blue-600 shadow-lg shadow-blue-500/50" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1.5 left-1.5 w-6 h-6 bg-white rounded-full transition-all duration-300 flex items-center justify-center font-bold text-xs ${
                  darkMode ? "translate-x-7" : ""
                }`}
              >
                {darkMode ? "🌙" : "☀️"}
              </span>
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className={`flex items-center justify-between p-6 rounded-lg border-2 transition ${
            darkMode 
              ? "bg-gray-700 border-gray-600 hover:border-blue-500" 
              : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400"
          }`}>
            <div>
              <h3 className="font-bold text-lg">🔔 Thông Báo</h3>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Bật/tắt thông báo hệ thống</p>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`relative w-16 h-9 rounded-full transition-all ${
                notifications ? "bg-purple-600 shadow-lg shadow-purple-500/50" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1.5 left-1.5 w-6 h-6 bg-white rounded-full transition-all duration-300 flex items-center justify-center font-bold text-xs ${
                  notifications ? "translate-x-7" : ""
                }`}
              >
                {notifications ? "📢" : "🔇"}
              </span>
            </button>
          </div>

          {/* Theme Status */}
          <div className={`p-6 rounded-lg border-2 ${
            darkMode 
              ? "bg-blue-900/30 border-blue-600/50" 
              : "bg-blue-100 border-blue-300"
          }`}>
            <p className="text-sm font-semibold mb-2">
              📊 <strong>Trạng Thái Hiện Tại:</strong>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded text-center font-bold ${darkMode ? "bg-blue-800" : "bg-blue-200"}`}>
                Chế độ: {darkMode ? "🌙 Tối" : "☀️ Sáng"}
              </div>
              <div className={`p-3 rounded text-center font-bold ${darkMode ? "bg-purple-800" : "bg-purple-200"}`}>
                Thông báo: {notifications ? "📢 Bật" : "🔇 Tắt"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-xl hover:-translate-y-1 font-bold text-lg transition-all transform"
        >
          🚪 Đăng Xuất Khỏi Hệ Thống
        </button>
      </div>
    </div>
    </div>
  );
}
