const db = require("./db");

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

db.query(createTableSQL, (err, result) => {
  if (err) {
    console.error("❌ Lỗi tạo bảng notifications:", err);
  } else {
    console.log("✅ Bảng notifications đã được tạo thành công!");
    console.log("📊 Cấu trúc: id, user_id, message, is_read, created_at");
  }
  db.end();
});
