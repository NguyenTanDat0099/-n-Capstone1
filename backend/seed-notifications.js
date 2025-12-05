const db = require("./db");

const notificationMessages = [
  "🔧 Phiếu E001 đã được giao cho bạn",
  "✅ Phiếu E002 đã hoàn thành",
  "⚠️ Phiếu E003 sắp quá hạn",
  "🔔 Lịch bảo trì hôm nay lúc 14:00",
  "📋 Bạn có 5 phiếu công việc chưa xử lý",
  "✨ Hệ thống bảo trì được cập nhật",
  "🛠️ Phiếu E004 cần phê duyệt",
  "💯 Bạn đã hoàn thành 10 phiếu tuần này",
  "📢 Thông báo bảo dưỡng định kỳ",
  "🎯 Nhiệm vụ mới được phân công",
];

async function seedNotifications() {
  return new Promise((resolve, reject) => {
    // Clear existing notifications
    db.query("DELETE FROM notifications", (err) => {
      if (err) {
        console.error("❌ Lỗi xóa notifications cũ:", err);
        return reject(err);
      }

      // Insert test notifications for user_id = 1 (demo account)
      const userId = 1;
      let inserted = 0;

      notificationMessages.forEach((message, index) => {
        const isRead = index > 6; // Mark first 6 as unread, rest as read
        const createdAt = new Date(Date.now() - (index * 60000)); // Stagger by 1 minute

        const sql =
          "INSERT INTO notifications (user_id, message, is_read, created_at) VALUES (?, ?, ?, ?)";

        db.query(sql, [userId, message, isRead, createdAt], (err, result) => {
          if (err) {
            console.error("❌ Lỗi insert notification:", err);
            return reject(err);
          }

          inserted++;

          if (inserted === notificationMessages.length) {
            console.log(`✅ Đã insert ${inserted} thông báo test cho user ${userId}`);
            resolve();
          }
        });
      });
    });
  });
}

seedNotifications()
  .then(() => {
    db.end();
  })
  .catch((err) => {
    console.error("❌ Lỗi:", err);
    db.end();
  });
