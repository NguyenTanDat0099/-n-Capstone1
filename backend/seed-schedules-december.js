const db = require("./db");

// Seed schedules for user_id=2 in December 2025
const schedules = [
  { ticket_id: 1000, technician_id: 2, date: "2025-12-03", shift: "Morning" },
  { ticket_id: 1001, technician_id: 2, date: "2025-12-05", shift: "Afternoon" },
  { ticket_id: 1002, technician_id: 2, date: "2025-12-08", shift: "Morning" },
  { ticket_id: 1003, technician_id: 2, date: "2025-12-10", shift: "Evening" },
  { ticket_id: 1004, technician_id: 2, date: "2025-12-12", shift: "Night" },
  { ticket_id: 1005, technician_id: 2, date: "2025-12-15", shift: "Morning" },
  { ticket_id: 1006, technician_id: 2, date: "2025-12-18", shift: "Afternoon" },
  { ticket_id: 1007, technician_id: 2, date: "2025-12-20", shift: "Morning" },
  { ticket_id: 1008, technician_id: 2, date: "2025-12-22", shift: "Evening" },
  { ticket_id: 1009, technician_id: 2, date: "2025-12-25", shift: "Morning" },
];

async function seedSchedules() {
  return new Promise((resolve, reject) => {
    // Clear existing schedules for user 2
    db.query("DELETE FROM schedules WHERE technician_id = 2", (err) => {
      if (err) {
        console.error("❌ Lỗi xóa schedules cũ:", err);
        return reject(err);
      }

      let inserted = 0;

      schedules.forEach((schedule) => {
        const sql =
          "INSERT INTO schedules (ticket_id, technician_id, date, shift) VALUES (?, ?, ?, ?)";

        db.query(
          sql,
          [schedule.ticket_id, schedule.technician_id, schedule.date, schedule.shift],
          (err, result) => {
            if (err) {
              console.error("❌ Lỗi insert schedule:", err);
              return reject(err);
            }

            inserted++;

            if (inserted === schedules.length) {
              console.log(
                `✅ Đã insert ${inserted} lịch trình cho user 2 vào tháng 12/2025`
              );
              resolve();
            }
          }
        );
      });
    });
  });
}

seedSchedules()
  .then(() => {
    db.end();
  })
  .catch((err) => {
    console.error("❌ Lỗi:", err);
    db.end();
  });
