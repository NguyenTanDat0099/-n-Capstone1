require("dotenv").config();
const db = require("./db");

const createSchedulesTable = `
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  technician_id INT,
  date DATE NOT NULL,
  shift ENUM('Morning', 'Afternoon', 'Evening', 'Night') DEFAULT 'Morning',
  status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  INDEX idx_date (date),
  INDEX idx_ticket (ticket_id),
  INDEX idx_technician (technician_id)
)
`;

console.log("📋 Tạo bảng schedules...");
db.query(createSchedulesTable, (err, results) => {
  if (err) {
    console.error("❌ Lỗi:", err);
    process.exit(1);
  }
  console.log("✅ Bảng schedules đã được tạo thành công!");
  process.exit(0);
});
