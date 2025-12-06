const db = require("./db");

const addAvatarColumn = `
  ALTER TABLE users ADD COLUMN avatar LONGTEXT DEFAULT NULL
`;

db.query(addAvatarColumn, (err, result) => {
  if (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("⏭️  Cột avatar đã tồn tại");
    } else {
      console.error("❌ Lỗi:", err.message);
    }
  } else {
    console.log("✅ Thêm cột avatar thành công");
  }
  db.end();
});
