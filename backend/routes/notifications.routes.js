const express = require("express");
const db = require("../db");
const router = express.Router();

// GET all notifications for a user (with pagination)
router.get("/user/:user_id", (req, res) => {
  const { user_id } = req.params;
  const limit = req.query.limit || 10;
  const offset = req.query.offset || 0;

  console.log(`[notifications] Lấy thông báo cho user ${user_id}`);

  const sql =
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";

  db.query(sql, [user_id, parseInt(limit), parseInt(offset)], (err, result) => {
    if (err) {
      console.error("[notifications] DB error:", err);
      return res.status(500).json({ message: "Server error", error: err });
    }

    res.json(result);
  });
});

// GET unread notification count
router.get("/user/:user_id/unread-count", (req, res) => {
  const { user_id } = req.params;

  console.log(`[notifications] Lấy số thông báo chưa đọc cho user ${user_id}`);

  const sql = "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE";

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("[notifications] DB error:", err);
      return res.status(500).json({ message: "Server error", error: err });
    }

    res.json({ count: result[0].count });
  });
});

// Mark notification as read
router.put("/:id/read", (req, res) => {
  const { id } = req.params;

  console.log(`[notifications] Đánh dấu thông báo ${id} là đã đọc`);

  const sql = "UPDATE notifications SET is_read = TRUE WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("[notifications] DB error:", err);
      return res.status(500).json({ message: "Server error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Thông báo không tìm thấy" });
    }

    res.json({ message: "✅ Đánh dấu đã đọc thành công" });
  });
});

// Mark all notifications as read for a user
router.put("/user/:user_id/read-all", (req, res) => {
  const { user_id } = req.params;

  console.log(`[notifications] Đánh dấu tất cả thông báo của user ${user_id} là đã đọc`);

  const sql = "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE";

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("[notifications] DB error:", err);
      return res.status(500).json({ message: "Server error", error: err });
    }

    res.json({ message: `✅ Đánh dấu ${result.affectedRows} thông báo là đã đọc` });
  });
});

// DELETE a notification
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  console.log(`[notifications] Xóa thông báo ${id}`);

  const sql = "DELETE FROM notifications WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("[notifications] DB error:", err);
      return res.status(500).json({ message: "Server error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Thông báo không tìm thấy" });
    }

    res.json({ message: "✅ Xóa thông báo thành công" });
  });
});

// CREATE a test notification (for testing)
router.post("/create-test", (req, res) => {
  const { user_id, message } = req.body;

  if (!user_id || !message) {
    return res.status(400).json({ message: "user_id và message là bắt buộc" });
  }

  console.log(`[notifications] Tạo thông báo test cho user ${user_id}`);

  const sql = "INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, FALSE)";

  db.query(sql, [user_id, message], (err, result) => {
    if (err) {
      console.error("[notifications] DB error:", err);
      return res.status(500).json({ message: "Server error", error: err });
    }

    res.json({
      message: "✅ Tạo thông báo test thành công",
      notification: {
        id: result.insertId,
        user_id,
        message,
        is_read: false,
      },
    });
  });
});

module.exports = router;
