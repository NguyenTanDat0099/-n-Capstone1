const express = require("express");
const db = require("../db");

const router = express.Router();

// GET schedules by month (for calendar view) - support both date and startDate/endDate
router.get("/month/:year/:month", (req, res) => {
  const { year, month } = req.params;
  const { userId } = req.query;
  
  console.log(`[schedules] GET month ${year}-${month}, userId=${userId}`);

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

  // Query that works with both single date and range dates
  let sql = `
    SELECT s.*, t.code as ticket_code, t.equipment, t.status as ticket_status
    FROM schedules s
    LEFT JOIN tickets t ON s.ticket_id = t.id
    WHERE 
      (s.date BETWEEN ? AND ?) OR
      (s.startDate <= ? AND s.endDate >= ?)
  `;
  
  const params = [startDate, endDate, endDate, startDate];
  
  // Filter by userId if provided
  if (userId) {
    sql += " AND s.technician_id = ?";
    params.push(userId);
  }
  
  sql += " ORDER BY COALESCE(s.startDate, s.date), s.shift";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("[schedules] GET month error:", err);
      return res.status(500).json({ message: "Lỗi khi tải lịch tháng", error: err.message });
    }
    res.json(results || []);
  });
});

// GET all schedules (with filters: date, ticket_id, technician_id, month, year)
router.get("/", (req, res) => {
  console.log("[schedules] GET /", req.query);
  const { date, ticket_id, technician_id, month, year } = req.query;

  let sql = `
    SELECT s.*, t.code as ticket_code, t.equipment, t.status as ticket_status
    FROM schedules s
    LEFT JOIN tickets t ON s.ticket_id = t.id
    WHERE 1=1
  `;
  const params = [];

  if (date) {
    sql += " AND s.date = ?";
    params.push(date);
  }
  
  if (ticket_id) {
    sql += " AND s.ticket_id = ?";
    params.push(ticket_id);
  }
  
  if (technician_id) {
    sql += " AND s.technician_id = ?";
    params.push(technician_id);
  }

  // Support month/year filter
  if (month && year) {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
    sql += " AND ((s.date BETWEEN ? AND ?) OR (s.startDate <= ? AND s.endDate >= ?))";
    params.push(startDate, endDate, endDate, startDate);
  }

  sql += " ORDER BY COALESCE(s.startDate, s.date) ASC, s.shift ASC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("[schedules] GET error:", err);
      return res.status(500).json({ message: "Lỗi khi tải lịch trình", error: err.message });
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
      return res.status(500).json({ message: "Lỗi khi tải lịch", error: err.message });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy lịch" });
    }
    res.json(results[0]);
  });
});

// CREATE new schedule (single day with date)
router.post("/", (req, res) => {
  const { ticket_id, technician_id, date, shift, status } = req.body;
  console.log("[schedules] POST /", { ticket_id, date, shift });

  if (!ticket_id || !date) {
    return res.status(400).json({ message: "ticket_id và date là bắt buộc" });
  }

  db.query("SELECT id FROM tickets WHERE id = ?", [ticket_id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("[schedules] POST ticket check error:", checkErr);
      return res.status(500).json({ message: "Lỗi khi kiểm tra phiếu", error: checkErr.message });
    }
    if (!checkResults || checkResults.length === 0) {
      return res.status(404).json({ message: `Phiếu ID ${ticket_id} không tồn tại` });
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
        return res.status(500).json({ message: "Lỗi khi tạo lịch", error: err.message });
      }
      res.status(201).json({
        message: "✅ Tạo lịch thành công",
        id: result.insertId,
      });
    });
  });
});

// CREATE new schedule with date range (startDate/endDate)
router.post("/new", (req, res) => {
  const { ticket_id, technician_id, startDate, endDate, note } = req.body;
  console.log("[schedules] POST /new", { ticket_id, startDate, endDate, technician_id });

  if (!ticket_id || !startDate || !endDate) {
    console.warn("[schedules] Missing required fields:", { ticket_id, startDate, endDate });
    return res.status(400).json({ message: "ticket_id, startDate, endDate là bắt buộc" });
  }

  db.query("SELECT id FROM tickets WHERE id = ?", [ticket_id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("[schedules] POST /new ticket check error:", checkErr);
      return res.status(500).json({ message: "Lỗi khi kiểm tra phiếu", error: checkErr.message });
    }
    
    console.log("[schedules] Ticket check result:", { ticket_id, found: checkResults?.length > 0 });
    
    if (!checkResults || checkResults.length === 0) {
      console.warn("[schedules] Ticket not found:", ticket_id);
      return res.status(404).json({ message: `Phiếu ID ${ticket_id} không tồn tại` });
    }

    // Set date to startDate for compatibility
    const insertSql = `
      INSERT INTO schedules (ticket_id, technician_id, date, startDate, endDate, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      ticket_id,
      technician_id || null,
      startDate,
      startDate,
      endDate,
      note || "",
    ];

    db.query(insertSql, values, (err, result) => {
      if (err) {
        console.error("[schedules] POST /new insert error:", err);
        return res.status(500).json({ message: "Lỗi khi tạo lịch", error: err.message });
      }
      
      const scheduleId = result.insertId;
      
      // Fetch the created schedule with ticket info
      const selectSql = `
        SELECT s.*, t.code as ticket_code, t.equipment, t.status as ticket_status
        FROM schedules s
        LEFT JOIN tickets t ON s.ticket_id = t.id
        WHERE s.id = ?
      `;
      
      db.query(selectSql, [scheduleId], (selectErr, selectResults) => {
        if (selectErr) {
          console.error("[schedules] Error fetching created schedule:", selectErr);
          return res.status(201).json({
            message: "✅ Tạo lịch thành công",
            id: scheduleId,
          });
        }
        
        res.status(201).json({
          message: "✅ Tạo lịch thành công",
          data: selectResults[0] || {},
        });
      });
    });
  });
});

// UPDATE schedule
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { ticket_id, technician_id, date, shift, status, startDate, endDate, note } = req.body;
  console.log("[schedules] PUT /:id", id, req.body);

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
    if (startDate !== undefined) {
      fields.push("startDate = ?");
      values.push(startDate);
      if (!date) {
        fields.push("date = ?");
        values.push(startDate);
      }
    }
    if (endDate !== undefined) {
      fields.push("endDate = ?");
      values.push(endDate);
    }
    if (shift !== undefined) {
      fields.push("shift = ?");
      values.push(shift);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      values.push(status);
    }
    if (note !== undefined) {
      fields.push("note = ?");
      values.push(note);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "Không có trường nào để cập nhật" });
    }

    values.push(id);
    const sql = `UPDATE schedules SET ${fields.join(", ")} WHERE id = ?`;

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("[schedules] PUT error:", err);
        return res.status(500).json({ message: "Lỗi khi cập nhật lịch", error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Lịch không tồn tại" });
      }
      res.json({ message: "✅ Cập nhật lịch thành công" });
    });
  }
});

// UPDATE schedule (alternative endpoint)
router.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const { ticket_id, technician_id, startDate, endDate, note } = req.body;
  console.log("[schedules] PUT /update/:id", id, req.body);

  if (!ticket_id) {
    return res.status(400).json({ message: "ticket_id là bắt buộc" });
  }

  db.query("SELECT id FROM tickets WHERE id = ?", [ticket_id], (checkErr, checkResults) => {
    if (checkErr || !checkResults || checkResults.length === 0) {
      return res.status(404).json({ message: `Phiếu ID ${ticket_id} không tồn tại` });
    }

    const fields = [];
    const values = [];

    fields.push("ticket_id = ?");
    values.push(ticket_id);

    if (technician_id !== undefined) {
      fields.push("technician_id = ?");
      values.push(technician_id);
    }
    if (startDate !== undefined) {
      fields.push("startDate = ?");
      values.push(startDate);
      fields.push("date = ?");
      values.push(startDate);
    }
    if (endDate !== undefined) {
      fields.push("endDate = ?");
      values.push(endDate);
    }
    if (note !== undefined) {
      fields.push("note = ?");
      values.push(note);
    }

    values.push(id);
    const sql = `UPDATE schedules SET ${fields.join(", ")} WHERE id = ?`;

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("[schedules] PUT /update/:id error:", err);
        return res.status(500).json({ message: "Lỗi khi cập nhật lịch", error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Lịch không tồn tại" });
      }
      res.json({ message: "✅ Cập nhật lịch thành công" });
    });
  });
});

// DELETE schedule
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  console.log("[schedules] DELETE /:id", id);

  const sql = "DELETE FROM schedules WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("[schedules] DELETE error:", err);
      return res.status(500).json({ message: "Lỗi khi xóa lịch", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lịch không tồn tại" });
    }
    res.json({ message: "✅ Xóa lịch thành công" });
  });
});

module.exports = router;
