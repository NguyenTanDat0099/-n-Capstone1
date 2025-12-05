const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "emms",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function createDemoAccount() {
  let connection;
  try {
    connection = await pool.getConnection();

    // Demo account credentials
    const demoUser = {
      fullname: "Kỹ Thuật Viên Demo",
      email: "demo@emms.com",
      password: "demo123",
      role: "technician",
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(demoUser.password, 10);

    // Check if demo account exists
    const [existing] = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [demoUser.email]
    );

    if (existing.length > 0) {
      console.log("✅ Tài khoản demo đã tồn tại");
      console.log("📧 Email: " + demoUser.email);
      console.log("🔐 Mật khẩu: " + demoUser.password);
      return;
    }

    // Create demo account
    await connection.query(
      "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)",
      [demoUser.fullname, demoUser.email, hashedPassword, demoUser.role]
    );

    console.log("✅ Tạo tài khoản demo thành công!");
    console.log("📧 Email: " + demoUser.email);
    console.log("🔐 Mật khẩu: " + demoUser.password);
    console.log("\n🎯 Đăng nhập tại: http://localhost:5173/login");
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

createDemoAccount();
