const express = require("express");
const db = require("../db");

const router = express.Router();

// GET schedules by month (for calendar view) - MUST BE BEFORE /:id
router.get("/month/:year/:month", (req, res) => {
  const { year, month } = req.params;
  const { userId } = req.query;
  
  console.log(`[schedules] GET month ${year}-${month}, userId=${userId}`);

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

  let sql = `
    SELECT s.*, t.code as ticket_code, t.equipment, t.status as ticket_status
    FROM schedules s
    LEFT JOIN tickets t ON s.ticket_id = t.id
    WHERE s.date BETWEEN ? AND ?
  `;
  
  const params = [startDate, endDate];
  
  // Filter by userId if provided
  if (userId) {
    sql += " AND s.technician_id = ?";
    params.push(userId);
  }
  
  sql += " ORDER BY s.date, s.shift";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("[schedules] GET month error:", err);
      return res.status(500).json({ message: "Lỗi khi tải lịch tháng", error: err });
    }
    res.json(results || []);
  });
});

// GET all schedules (with filters)
router.get("/", (req, res) => {
  console.log("[schedules] GET /");
  const { date, ticket_id, technician_id } = req.query;

  let sql = "SELECT * FROM schedules WHERE 1=1";
  const params = [];

  if (date) {
    sql += " AND date = ?";
    params.push(date);
  }
  if (ticket_id) {
    sql += " AND ticket_id = ?";
    params.push(ticket_id);
  }
  if (technician_id) {
    sql += " AND technician_id = ?";
    params.push(technician_id);
  }

  sql += " ORDER BY date DESC, shift ASC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("[schedules] GET error:", err);
      return res.status(500).json({ message: "Lỗi khi tải lịch trình", error: err });
    }
    res.json(results || []);
  });
});

// GET single schedule
router.get("/:id", (req, res) => {
  const id = req.params.id;
  console.log("[schedules] GET /:id", id);

  const sql = `
    SELECT s.*, t.code as ticket_code, t.equipment, t.status as ticket_status
    FROM schedules s
    LEFT JOIN tickets t ON s.ticket_id = t.id
    WHERE s.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("[schedules] GET /:id error:", err);
      return res.status(500).json({ message: "Lỗi khi tải lịch", error: err });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy lịch" });
    }
    res.json(results[0]);
  });
});

// CREATE new schedule
router.post("/", (req, res) => {
  const { ticket_id, technician_id, date, shift, status } = req.body;
  console.log("[schedules] POST", { ticket_id, date, shift });

  // Validate required fields
  if (!ticket_id || !date) {
    return res.status(400).json({ message: "ticket_id và date là bắt buộc" });
  }

  // Validate ticket exists
  db.query("SELECT id FROM tickets WHERE id = ?", [ticket_id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("[schedules] POST ticket check error:", checkErr);
      return res.status(500).json({ message: "Lỗi khi kiểm tra phiếu", error: checkErr });
    }
    if (!checkResults || checkResults.length === 0) {
      return res.status(404).json({ message: "Phiếu không tồn tại" });
    }

    const sql = `
      INSERT INTO schedules (ticket_id, technician_id, date, shift, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      ticket_id,
      technician_id || null,
      date,
      shift || "Morning",
      status || "Scheduled",
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("[schedules] POST error:", err);
        return res.status(500).json({ message: "Lỗi khi tạo lịch", error: err });
      }
      res.status(201).json({
        message: "Tạo lịch thành công",
        id: result.insertId,
        ...req.body,
      });
    });
  });
});

// UPDATE schedule
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { ticket_id, technician_id, date, shift, status } = req.body;
  console.log("[schedules] PUT /:id", id, { date, shift, status });

  // If ticket_id changes, validate new ticket exists
  if (ticket_id) {
    db.query("SELECT id FROM tickets WHERE id = ?", [ticket_id], (checkErr, checkResults) => {
      if (checkErr || !checkResults || checkResults.length === 0) {
        return res.status(404).json({ message: "Phiếu không tồn tại" });
      }
      performUpdate();
    });
  } else {
    performUpdate();
  }

  function performUpdate() {
    const fields = [];
    const values = [];

    if (ticket_id !== undefined) {
      fields.push("ticket_id = ?");
      values.push(ticket_id);
    }
    if (technician_id !== undefined) {
      fields.push("technician_id = ?");
      values.push(technician_id);
    }
    if (date !== undefined) {
      fields.push("date = ?");
      values.push(date);
    }
    if (shift !== undefined) {
      fields.push("shift = ?");
      values.push(shift);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      values.push(status);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "Không có trường nào để cập nhật" });
    }

    values.push(id);
    const sql = `UPDATE schedules SET ${fields.join(", ")} WHERE id = ?`;

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("[schedules] PUT error:", err);
        return res.status(500).json({ message: "Lỗi khi cập nhật lịch", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Lịch không tồn tại" });
      }
      res.json({ message: "Cập nhật lịch thành công" });
    });
  }
});

// DELETE schedule
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  console.log("[schedules] DELETE /:id", id);

  const sql = "DELETE FROM schedules WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("[schedules] DELETE error:", err);
      return res.status(500).json({ message: "Lỗi khi xóa lịch", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lịch không tồn tại" });
    }
    res.json({ message: "Xóa lịch thành công" });
  });
});

// === NEW ENDPOINTS FOR EXTENDED SCHEMA ===

// GET schedules by date range (startDate, endDate)
router.get("/date-range/:startDate/:endDate", (req, res) => {
  const { startDate, endDate } = req.params;
  const { technicianId } = req.query;

  console.log(`[schedules] GET date-range ${startDate} to ${endDate}, technicianId=${technicianId}`);

  let sql = `
    SELECT s.*, t.code as ticket_code, t.equipment, t.status as ticket_status
    FROM schedules s
    LEFT JOIN tickets t ON s.ticket_id = t.id
    WHERE (s.startDate BETWEEN ? AND ? OR s.endDate BETWEEN ? AND ? OR (s.startDate <= ? AND s.endDate >= ?))
  `;

  const params = [startDate, endDate, startDate, endDate, startDate, endDate];

  if (technicianId) {
    sql += " AND s.technician_id = ?";
    params.push(technicianId);
  }

  sql += " ORDER BY s.startDate, s.endDate";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("[schedules] GET date-range error:", err);
      return res.status(500).json({ message: "Lỗi khi tải lịch", error: err });
    }
    res.json(results || []);
  });
});

// CREATE schedule with new schema
router.post("/new", (req, res) => {
  const { ticket_id, technician_id, startDate, endDate, note } = req.body;

  console.log("[schedules] POST /new", { ticket_id, technician_id, startDate, endDate, note });

  if (!ticket_id || !technician_id || !startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "ticket_id, technician_id, startDate, endDate bắt buộc" });
  }

  // Validate ticket exists
  const validateSql = "SELECT id FROM tickets WHERE id = ?";
  db.query(validateSql, [ticket_id], (err, ticketResult) => {
    if (err) {
      console.error("[schedules] Validate error:", err);
      return res.status(500).json({ message: "Lỗi server", error: err });
    }

    if (!ticketResult || ticketResult.length === 0) {
      return res.status(404).json({ message: "Phiếu không tồn tại" });
    }

    const sql =
      "INSERT INTO schedules (ticket_id, technician_id, startDate, endDate, note) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [ticket_id, technician_id, startDate, endDate, note || ""], (err, result) => {
      if (err) {
        console.error("[schedules] POST /new error:", err);
        return res.status(500).json({ message: "Lỗi khi tạo lịch", error: err });
      }

      res.json({
        message: "✅ Tạo lịch thành công",
        id: result.insertId,
        ticket_id,
        technician_id,
        startDate,
        endDate,
        note,
      });
    });
  });
});

// UPDATE schedule with new schema
router.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { ticket_id, technician_id, startDate, endDate, note } = req.body;

  console.log("[schedules] PUT /update/:id", id, { ticket_id, technician_id, startDate, endDate, note });

  let sql = "UPDATE schedules SET ";
  const params = [];
  const updates = [];

  if (ticket_id !== undefined) {
    updates.push("ticket_id = ?");
    params.push(ticket_id);
  }
  if (technician_id !== undefined) {
    updates.push("technician_id = ?");
    params.push(technician_id);
  }
  if (startDate !== undefined) {
    updates.push("startDate = ?");
    params.push(startDate);
  }
  if (endDate !== undefined) {
    updates.push("endDate = ?");
    params.push(endDate);
  }
  if (note !== undefined) {
    updates.push("note = ?");
    params.push(note);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "Không có dữ liệu cần cập nhật" });
  }

  sql += updates.join(", ") + " WHERE id = ?";
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("[schedules] PUT /update error:", err);
      return res.status(500).json({ message: "Lỗi khi cập nhật lịch", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lịch không tồn tại" });
    }

    res.json({ message: "✅ Cập nhật lịch thành công" });
  });
});

module.exports = router;
