require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth.routes");
const ticketRoutes = require("./routes/ticket.routes");
const assistantRoutes = require("./routes/assistant.routes"); // NEW
const schedulesRoutes = require("./routes/schedules.routes"); // NEW
const notificationsRoutes = require("./routes/notifications.routes"); // NEW

const app = express();

// allow frontend dev origins (Vite 5173, CRA 3000) or FRONTEND_URL from .env
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (e.g. curl, mobile)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      // allow all in dev if env says so
      if (process.env.ALLOW_ALL_ORIGINS === "true") return callback(null, true);
      return callback(new Error("CORS policy: This origin is not allowed: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json());

// serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// simple request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// health endpoint to test server+DB quickly
app.get("/health", (req, res) => {
  db.query("SELECT 1 AS ok", (err, results) => {
    if (err) {
      console.error("[health] DB error:", err);
      return res.status(500).json({ ok: false, db: false, error: err.message });
    }
    res.json({ ok: true, db: true });
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/assistant", assistantRoutes); // NEW
app.use("/api/schedules", schedulesRoutes); // NEW
app.use("/api/notifications", notificationsRoutes); // NEW

app.get("/", (req, res) => {
  res.send("✅ e-MMS backend is running...");
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      if (process.env.ALLOW_ALL_ORIGINS === "true") return callback(null, true);
      return callback(new Error("CORS policy: This origin is not allowed: " + origin));
    },
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("[socket] client connected:", socket.id);

  socket.on("join-ticket", (ticketId) => {
    if (!ticketId) return;
    const room = `ticket:${ticketId}`;
    socket.join(room);
    console.log(`[socket] ${socket.id} joined ${room}`);
  });

  socket.on("leave-ticket", (ticketId) => {
    if (!ticketId) return;
    const room = `ticket:${ticketId}`;
    socket.leave(room);
    console.log(`[socket] ${socket.id} left ${room}`);
  });

  socket.on("comment:add", (payload) => {
    const { ticketId, userName, message } = payload || {};
    if (!ticketId || !message || typeof message !== "string") {
      return;
    }
    const safeName = (userName || "Anonymous").toString().slice(0, 100);
    const sql = "INSERT INTO comments (ticket_id, user_name, message) VALUES (?, ?, ?)";
    db.query(sql, [ticketId, safeName, message], (err, result) => {
      if (err) {
        console.error("[socket] comment insert error:", err);
        if (err.code === "ER_NO_SUCH_TABLE") {
          socket.emit("comment:error", {
            message: "Thiếu bảng comments trong database.",
            hint: "CREATE TABLE comments (id INT AUTO_INCREMENT PRIMARY KEY, ticket_id INT, user_name VARCHAR(100), message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);",
          });
        } else {
          socket.emit("comment:error", { message: "Lỗi khi lưu bình luận" });
        }
        return;
      }
      const comment = {
        id: result.insertId,
        ticket_id: ticketId,
        user_name: safeName,
        message,
        created_at: new Date().toISOString(),
      };
      const room = `ticket:${ticketId}`;
      io.to(room).emit("comment:new", comment);
    });
  });

  socket.on("disconnect", () => {
    console.log("[socket] client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const server = httpServer.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);

  // seed technician account (idempotent)
  const seedEmail = "tech@gmail.com";
  const seedPassword = "123456";
  const seedFullname = "Tech User";
  const seedRole = "technician";

  db.query("SELECT id FROM users WHERE email = ?", [seedEmail], async (err, results) => {
    if (err) {
      console.error("Seed user: DB check error:", err);
      return;
    }
    if (results && results.length > 0) {
      console.log("Seed user already exists:", seedEmail);
      return;
    }
    try {
      const hashed = await bcrypt.hash(seedPassword, 10);
      db.query(
        "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)",
        [seedFullname, seedEmail, hashed, seedRole],
        (insertErr) => {
          if (insertErr) {
            console.error("Seed user: insert error:", insertErr);
            return;
          }
          console.log("✅ Seed user created:", seedEmail);
        }
      );
    } catch (hashErr) {
      console.error("Seed user: hash error:", hashErr);
    }
  });
});

// global error handlers
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
