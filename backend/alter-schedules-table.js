const db = require("./db");

// Thử thêm từng cột, bỏ qua nếu đã tồn tại
const queries = [
  "ALTER TABLE schedules ADD COLUMN startDate DATE AFTER date",
  "ALTER TABLE schedules ADD COLUMN endDate DATE AFTER startDate",
  "ALTER TABLE schedules ADD COLUMN note VARCHAR(500) AFTER endDate",
];

let completed = 0;

queries.forEach((sql, index) => {
  db.query(sql, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log(`⏭️  Cột ${index + 1} đã tồn tại`);
      } else {
        console.error(`⚠️  Lỗi query ${index + 1}:`, err.message);
      }
    } else {
      console.log(`✅ Thêm cột ${index + 1} thành công`);
    }

    completed++;
    if (completed === queries.length) {
      console.log("✅ Cập nhật schema schedules hoàn tất!");
      console.log("📊 Cấu trúc bảng: id, ticketId, technicianId, startDate, endDate, date, shift, note, created_at");
      db.end();
    }
  });
});
