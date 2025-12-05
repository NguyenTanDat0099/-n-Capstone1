require("dotenv").config();
const db = require("./db");

const seedSchedules = async () => {
  console.log("🌱 Bắt đầu seed dữ liệu lịch trình...");

  const shifts = ["Morning", "Afternoon", "Evening", "Night"];
  const statuses = ["Scheduled", "In Progress", "Completed"];

  try {
    // Get all tickets
    db.query("SELECT id FROM tickets LIMIT 100", async (err, tickets) => {
      if (err) {
        console.error("❌ Lỗi:", err);
        process.exit(1);
      }

      let inserted = 0;
      const promises = [];

      // Create 200 schedules
      for (let i = 0; i < 200; i++) {
        const ticketId = tickets[i % tickets.length].id;
        const daysOffset = Math.floor(Math.random() * 30);
        const date = new Date(2025, 11, 1 + daysOffset).toISOString().split("T")[0];
        const shift = shifts[Math.floor(Math.random() * shifts.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const technicianId = Math.floor(Math.random() * 4) + 1;

        const promise = new Promise((resolve) => {
          const sql = `
            INSERT INTO schedules (ticket_id, technician_id, date, shift, status)
            VALUES (?, ?, ?, ?, ?)
          `;
          db.query(sql, [ticketId, technicianId, date, shift, status], (err) => {
            if (err) {
              console.error(`❌ Lỗi insert schedule ${i + 1}:`, err.message);
            } else {
              inserted++;
              if (inserted % 50 === 0) {
                console.log(`✅ Đã insert ${inserted}/200 lịch...`);
              }
            }
            resolve();
          });
        });
        promises.push(promise);
      }

      await Promise.all(promises);
      console.log(`\n✅ Hoàn tất! Đã insert ${inserted}/200 lịch trình`);
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ Lỗi:", err);
    process.exit(1);
  }
};

seedSchedules();
