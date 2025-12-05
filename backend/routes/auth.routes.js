const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// REGISTER TECHNICIAN
router.post("/register", async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)",
      [fullname, email, hashed],
      (err, result) => {
        if (err) {
          // duplicate entry handling
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already exists" });
          }
          return res
            .status(400)
            .json({ message: "Error registering user", error: err });
        }
        res.json({ message: "Register success ✅" });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// LOGIN TECHNICIAN
router.post("/login", (req, res) => {
  // trim and normalize inputs
  const email = (req.body?.email || "").toString().trim().toLowerCase();
  const password = (req.body?.password || "").toString();

  console.log(`[auth] Login attempt for email="${email}"`);

  if (!email || !password) {
    console.log("[auth] Missing email or password in request");
    return res.status(400).json({ success: false, message: "email and password are required" });
  }

  // find user by email only
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("[auth] DB error during login:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server error", error: err });
    }

    if (!result || result.length === 0) {
      console.log("[auth] No user found for email:", email);
      return res
        .status(401)
        .json({ success: false, message: "Email or password incorrect" });
    }

    const user = result[0];
    console.log(`[auth] User found id=${user.id} email=${user.email}`);

    try {
      const match = await bcrypt.compare(password, user.password);
      console.log(`[auth] Password match for ${email}:`, !!match);

      if (!match) {
        return res
          .status(401)
          .json({ success: false, message: "Email or password incorrect" });
      }

      // sign JWT
      const payload = {
        id: user.id,
        fullname: user.fullname,
        role: user.role,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET || "change_this_secret", {
        expiresIn: "8h",
      });

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          fullname: user.fullname,
          role: user.role,
          email: user.email,
        },
      });
    } catch (compareErr) {
      console.error("[auth] bcrypt.compare error:", compareErr);
      return res
        .status(500)
        .json({ success: false, message: "Authentication error", error: compareErr });
    }
  });
});

// CHANGE PASSWORD
router.post("/change-password", async (req, res) => {
  const { user_id, old_password, new_password } = req.body;
  console.log("[auth] Change password for user:", user_id);

  if (!user_id || !old_password || !new_password) {
    return res.status(400).json({ message: "user_id, old_password, new_password là bắt buộc" });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ message: "Mật khẩu mới phải ít nhất 6 ký tự" });
  }

  try {
    // Get user by ID
    db.query("SELECT * FROM users WHERE id = ?", [user_id], async (err, results) => {
      if (err) {
        console.error("[auth] DB error:", err);
        return res.status(500).json({ message: "Lỗi cơ sở dữ liệu", error: err });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      const user = results[0];

      // Verify old password
      const isMatch = await bcrypt.compare(old_password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
      }

      // Hash new password
      const hashed = await bcrypt.hash(new_password, 10);

      // Update password
      db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, user_id], (updateErr) => {
        if (updateErr) {
          console.error("[auth] Update error:", updateErr);
          return res.status(500).json({ message: "Lỗi cập nhật mật khẩu", error: updateErr });
        }
        res.json({ message: "✅ Đổi mật khẩu thành công" });
      });
    });
  } catch (err) {
    console.error("[auth] Error:", err);
    res.status(500).json({ message: "Lỗi đổi mật khẩu", error: err });
  }
});

// GET USER INFO
router.get("/user/:id", (req, res) => {
  const user_id = req.params.id;
  console.log("[auth] GET user info:", user_id);

  db.query("SELECT id, fullname, email, role, avatar FROM users WHERE id = ?", [user_id], (err, results) => {
    if (err) {
      console.error("[auth] DB error:", err);
      return res.status(500).json({ message: "Lỗi cơ sở dữ liệu", error: err });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.json(results[0]);
  });
});

// UPDATE AVATAR
router.put("/update-avatar", (req, res) => {
  const { user_id, avatar } = req.body;
  console.log("[auth] Update avatar for user:", user_id);

  if (!user_id || !avatar) {
    return res.status(400).json({ message: "user_id và avatar là bắt buộc" });
  }

  db.query("UPDATE users SET avatar = ? WHERE id = ?", [avatar, user_id], (err) => {
    if (err) {
      console.error("[auth] Update error:", err);
      return res.status(500).json({ message: "Lỗi cập nhật avatar", error: err });
    }
    res.json({ message: "✅ Cập nhật avatar thành công" });
  });
});

// Keep as-is for future use; currently disabled from frontend

module.exports = router;
