const express = require("express");
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ensure upload directory exists
const uploadsRoot = path.join(__dirname, "..", "uploads");
const ticketUploadsDir = path.join(uploadsRoot, "tickets");
fs.mkdirSync(ticketUploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ticketUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const safeExt = ext.split("?")[0];
    cb(null, `ticket_${req.params.id || "unknown"}_${Date.now()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// GET alerts: overdue and completed tickets
router.get("/alerts/summary", (req, res) => {
  console.log("[tickets] GET /alerts/summary");
  const sql = `
    SELECT 
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_count,
      SUM(CASE WHEN status != 'Completed' AND due_date < CURDATE() THEN 1 ELSE 0 END) as overdue_count
    FROM tickets
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("[tickets] GET alerts error:", err);
      return res.status(500).json({ message: "Lỗi khi lấy thống kê" });
    }
    const result = results[0] || { completed_count: 0, overdue_count: 0 };
    res.json(result);
  });
});

// GET all tickets
router.get("/", (req, res) => {
  console.log("[tickets] GET /");
  const sql = "SELECT * FROM tickets";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("[tickets] GET error:", err);
      return res.status(500).json({ message: "Lỗi khi tải danh sách phiếu", error: err });
    }
    res.json(results);
  });
});

// GET single ticket
router.get("/:id", (req, res) => {
  const id = req.params.id;
  console.log("[tickets] GET /:id", id);
  if (typeof id === "string" && id.startsWith("local-")) {
    return res.status(404).json({ message: "Phiếu cục bộ (guest) — không có trên server" });
  }
  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "ID phiếu không hợp lệ" });
  }
  const sql = "SELECT * FROM tickets WHERE id = ?";
  db.query(sql, [ticketId], (err, results) => {
    if (err) {
      console.error("[tickets] GET/:id error:", err);
      return res.status(500).json({ message: "Lỗi khi tải phiếu", error: err });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy phiếu" });
    }
    res.json(results[0]);
  });
});

// GET comments for a ticket
router.get("/:id/comments", (req, res) => {
  const id = req.params.id;
  console.log("[tickets] GET /:id/comments", id);

  if (typeof id === "string" && id.startsWith("local-")) {
    return res.json([]);
  }

  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "ID phiếu không hợp lệ" });
  }

  const sql = "SELECT id, ticket_id, user_name, message, created_at FROM comments WHERE ticket_id = ? ORDER BY created_at ASC";
  db.query(sql, [ticketId], (err, results) => {
    if (err) {
      console.error("[tickets] GET comments error:", err);
      if (err.code === "ER_NO_SUCH_TABLE") {
        return res.status(500).json({
          message: "Thiếu bảng comments trong database.",
          hint: "CREATE TABLE comments (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT, user_name VARCHAR(100), message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);",
          error: err,
        });
      }
      return res.status(500).json({ message: "Lỗi khi tải bình luận", error: err });
    }
    res.json(results || []);
  });
});

// POST comment for a ticket (non-realtime fallback)
router.post("/:id/comments", (req, res) => {
  const id = req.params.id;
  const { user_name, message } = req.body || {};
  console.log("[tickets] POST /:id/comments", id, { user_name });

  if (!message || typeof message !== "string") {
    return res.status(400).json({ message: "Nội dung bình luận là bắt buộc" });
  }

  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "ID phiếu không hợp lệ" });
  }

  const safeName = (user_name || "Technician").toString().slice(0, 100);
  const sql = "INSERT INTO comments (ticket_id, user_name, message) VALUES (?, ?, ?)";
  db.query(sql, [ticketId, safeName, message], (err, result) => {
    if (err) {
      console.error("[tickets] POST comment error:", err);
      if (err.code === "ER_NO_SUCH_TABLE") {
        return res.status(500).json({
          message: "Thiếu bảng comments trong database.",
          hint: "CREATE TABLE comments (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT, user_name VARCHAR(100), message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);",
          error: err,
        });
      }
      return res.status(500).json({ message: "Lỗi khi lưu bình luận", error: err });
    }

    const comment = {
      id: result.insertId,
      ticket_id: ticketId,
      user_name: safeName,
      message,
      created_at: new Date().toISOString(),
    };
    res.status(201).json(comment);
  });
});

// helper to create new ticket
const createTicket = (req, res) => {
  console.log("[tickets] CREATE payload:", req.body);
  const { code, equipment, priority, status, due_date, location, assigned_to, description } = req.body || {};

  if (!code || !equipment) {
    return res.status(400).json({ message: "Mã phiếu và Thiết bị là bắt buộc" });
  }

  // Use correct column name based on what exists in database
  const sql = "INSERT INTO tickets (code, equipment, priority, status, due_date, location, assigned_to, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [code, equipment, priority || null, status || null, due_date || null, location || null, assigned_to || null, description || null], (err, result) => {
    if (err) {
      console.error("[tickets] CREATE error:", err);
      if (err.code === "ER_BAD_FIELD_ERROR") {
        return res.status(500).json({
          message: "Thiếu trường trong bảng tickets.",
          hint: "Kiểm tra lại cấu trúc bảng tickets",
          error: err,
        });
      }
      return res.status(500).json({ message: "Lỗi khi tạo phiếu", error: err });
    }
    res.status(201).json({ message: "Phiếu đã được tạo", id: result.insertId });
  });
};

// POST: Create new ticket (backwards-compatible)
router.post("/", (req, res) => {
  console.log("[tickets] POST / -> create");
  createTicket(req, res);
});

// POST: Create new ticket (explicit /create)
router.post("/create", (req, res) => {
  console.log("[tickets] POST /create");
  createTicket(req, res);
});

// PUT: Update ticket
router.put("/:id", (req, res) => {
  const id = req.params.id;
  console.log("[tickets] PUT /:id", id, "payload:", req.body);

  if (typeof id === "string" && id.startsWith("local-")) {
    return res.status(400).json({ message: "Không thể cập nhật phiếu cục bộ (guest) trên server" });
  }

  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "ID phiếu không hợp lệ" });
  }

  const { code, equipment, priority, status, due_date, location, notes, assigned_to, description } = req.body || {};
  const fields = [];
  const values = [];
  if (code !== undefined) { fields.push("code = ?"); values.push(code); }
  if (equipment !== undefined) { fields.push("equipment = ?"); values.push(equipment); }
  if (priority !== undefined) { fields.push("priority = ?"); values.push(priority); }
  if (status !== undefined) { fields.push("status = ?"); values.push(status); }
  if (due_date !== undefined) { fields.push("due_date = ?"); values.push(due_date); }
  if (location !== undefined) { fields.push("location = ?"); values.push(location); }
  if (notes !== undefined) { fields.push("notes = ?"); values.push(notes); }
  if (assigned_to !== undefined) { fields.push("assigned_to = ?"); values.push(assigned_to); }
  if (description !== undefined) { fields.push("description = ?"); values.push(description); }

  if (fields.length === 0) {
    return res.status(400).json({ message: "Không có trường nào để cập nhật" });
  }

  const sql = `UPDATE tickets SET ${fields.join(", ")} WHERE id = ?`;
  values.push(ticketId);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("[tickets] PUT update error:", err);
      if (err.code === "ER_BAD_FIELD_ERROR") {
        return res.status(500).json({
          message: "Thiếu trường trong bảng tickets. Hãy kiểm tra schema.",
          hint: "ALTER TABLE tickets ADD COLUMN ...",
          error: err,
        });
      }
      return res.status(500).json({ message: "Lỗi khi cập nhật phiếu", error: err });
    }

    // insert log row (best-effort)
    const logSql = "INSERT INTO ticket_logs (ticket_id, status, notes, created_at) VALUES (?, ?, ?, NOW())";
    const logStatus = status !== undefined ? status : null;
    const logNotes = notes !== undefined ? notes : null;
    db.query(logSql, [ticketId, logStatus, logNotes], (logErr) => {
      if (logErr) {
        console.error("[tickets] PUT log insert error:", logErr);
        // do not fail main request if logging fails
      }
      
      // Create notification for the update
      const notificationMsg = `Phiếu ${id} (${code || "N/A"}) đã được cập nhật${status ? ` - Trạng thái: ${status}` : ""}`;
      const notifSql = "INSERT INTO notifications (user_id, message, is_read, created_at) VALUES (?, ?, 0, NOW())";
      db.query(notifSql, [1, notificationMsg], (notifErr) => {
        if (notifErr) {
          console.error("[tickets] PUT notification insert error:", notifErr);
        }
      });
      
      res.json({ message: "Phiếu đã được cập nhật" });
    });
  });
});

// DELETE: Delete ticket
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  console.log("[tickets] DELETE /:id", id);

  if (typeof id === "string" && id.startsWith("local-")) {
    return res.status(400).json({ message: "Không thể xóa phiếu cục bộ (guest) trên server" });
  }

  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "ID phiếu không hợp lệ" });
  }

  const sql = "DELETE FROM tickets WHERE id = ?";
  db.query(sql, [ticketId], (err, result) => {
    if (err) {
      console.error("[tickets] DELETE error:", err);
      return res.status(500).json({ message: "Lỗi khi xóa phiếu", error: err });
    }
    res.json({ message: "Phiếu đã bị xóa" });
  });
});

// POST: Save/Update note for ticket
router.post("/:id/notes", (req, res) => {
  const id = req.params.id;
  console.log("[tickets] POST /:id/notes", id, "payload:", req.body);

  if (typeof id === "string" && id.startsWith("local-")) {
    return res.status(400).json({ message: "Không thể lưu ghi chú cho phiếu cục bộ (guest) trên server" });
  }

  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "ID phiếu không hợp lệ" });
  }

  const { notes } = req.body || {};
  if (typeof notes !== "string") {
    return res.status(400).json({ message: "Ghi chú (notes) phải là chuỗi" });
  }

  const sql = "UPDATE tickets SET notes = ? WHERE id = ?";
  db.query(sql, [notes, ticketId], (err, result) => {
    if (err) {
      console.error("[tickets] POST notes error:", err);
      if (err.code === "ER_BAD_FIELD_ERROR") {
        return res.status(500).json({
          message: "Thiếu trường 'notes' trong bảng tickets",
          hint: "ALTER TABLE tickets ADD COLUMN notes TEXT;",
          error: err,
        });
      }
      return res.status(500).json({ message: "Lỗi khi lưu ghi chú", error: err });
    }
    res.json({ message: "Ghi chú đã được lưu" });
  });
});

// DELETE: Delete note for ticket (set NULL)
router.delete("/:id/notes", (req, res) => {
  const id = req.params.id;
  console.log("[tickets] DELETE /:id/notes", id);

  if (typeof id === "string" && id.startsWith("local-")) {
    return res.status(400).json({ message: "Không thể xóa ghi chú cho phiếu cục bộ (guest) trên server" });
  }

  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "ID phiếu không hợp lệ" });
  }

  const sql = "UPDATE tickets SET notes = NULL WHERE id = ?";
  db.query(sql, [ticketId], (err, result) => {
    if (err) {
      console.error("[tickets] DELETE notes error:", err);
      if (err.code === "ER_BAD_FIELD_ERROR") {
        return res.status(500).json({
          message: "Thiếu trường 'notes' trong bảng tickets",
          hint: "ALTER TABLE tickets ADD COLUMN notes TEXT;",
          error: err,
        });
      }
      return res.status(500).json({ message: "Lỗi khi xóa ghi chú", error: err });
    }
    res.json({ message: "Ghi chú đã bị xóa" });
  });
});

// GET: activity logs for ticket
router.get("/:id/logs", (req, res) => {
  const id = req.params.id;
  console.log("[tickets] GET /:id/logs", id);

  if (typeof id === "string" && id.startsWith("local-")) {
    // guest/local tickets do not have server logs
    return res.json([]);
  }

  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "ID phiếu không hợp lệ" });
  }

  const sql = "SELECT id, status, notes, created_at FROM ticket_logs WHERE ticket_id = ? ORDER BY created_at DESC";
  db.query(sql, [ticketId], (err, results) => {
    if (err) {
      console.error("[tickets] GET logs error:", err);
      if (err.code === "ER_NO_SUCH_TABLE") {
        return res.status(500).json({
          message: "Thiếu bảng ticket_logs trong database.",
          hint: "CREATE TABLE ticket_logs (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT, status VARCHAR(50), notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);",
          error: err,
        });
      }
      return res.status(500).json({ message: "Lỗi khi tải lịch sử phiếu", error: err });
    }
    res.json(results || []);
  });
});

// POST: upload attachment (image/file) for a ticket
router.post("/:id/attachment", upload.single("file"), (req, res) => {
  const id = req.params.id;
  console.log("[tickets] POST /:id/attachment", id, "file:", req.file);

  if (typeof id === "string" && id.startsWith("local-")) {
    return res.status(400).json({ message: "Không thể upload file cho phiếu cục bộ (guest) trên server" });
  }

  const ticketId = parseInt(id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "ID phiếu không hợp lệ" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Thiếu file upload" });
  }

  const publicPath = `/uploads/tickets/${req.file.filename}`;

  const sql = "UPDATE tickets SET attachment_url = ? WHERE id = ?";
  db.query(sql, [publicPath, ticketId], (err) => {
    if (err) {
      console.error("[tickets] POST attachment error:", err);
      if (err.code === "ER_BAD_FIELD_ERROR") {
        return res.status(500).json({
          message: "Thiếu trường 'attachment_url' trong bảng tickets",
          hint: "ALTER TABLE tickets ADD COLUMN attachment_url VARCHAR(255);",
          error: err,
        });
      }
      return res.status(500).json({ message: "Lỗi khi lưu thông tin file đính kèm", error: err });
    }
    res.json({ message: "File đã được upload", url: publicPath });
  });
});

module.exports = router;
