// ============================================
// BACKEND - NODE.JS EXPRESS SERVER
// ============================================
// Đây là máy chủ backend chính xử lý tất cả API requests
// từ frontend React application

const express = require("express")
const cors = require("cors")
const path = require("path")

// Khởi tạo ứng dụng Express
const app = express()
const PORT = process.env.PORT || 5000

// ============ MIDDLEWARE ============
// Cho phép frontend React (chạy trên port 3000) gọi backend
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
)

// Parse JSON request bodies
app.use(express.json())

// ============ DỮ LIỆU TẠM THỜI ============
// Lưu trữ dữ liệu trong bộ nhớ (trong production dùng database)
let users = [
  {
    id: "USR001",
    name: "Alice Smith",
    email: "alice.smith@example.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    createdAt: "2023-01-15",
  },
  {
    id: "USR002",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone: "+1 (555) 987-6543",
    status: "Inactive",
    createdAt: "2022-11-20",
  },
  {
    id: "USR003",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    phone: "+1 (555) 111-2222",
    status: "Pending",
    createdAt: "2023-03-01",
  },
]

let devices = [
  {
    id: "DEV001",
    name: "Sensor Hub Alpha",
    model: "SH-2000",
    serialNumber: "SN-SH2000-A1B2C3D4",
    installDate: "2023-01-15",
    warrantyEnd: "2025-01-15",
    customer: "Tech Innovations Inc.",
  },
  {
    id: "DEV002",
    name: "Smart Gateway X",
    model: "SG-500",
    serialNumber: "SN-SG500-E5F6G7H8",
    installDate: "2023-03-20",
    warrantyEnd: "2025-03-20",
    customer: "Global Logistics Solutions",
  },
  {
    id: "DEV003",
    name: "IoT Node Beta",
    model: "IN-100",
    serialNumber: "SN-IN100-I9J0K1L2",
    installDate: "2023-05-10",
    warrantyEnd: "2025-05-10",
    customer: "City Wide Utilities",
  },
]

let tickets = [
  {
    id: "TKT001",
    title: "Server Down",
    deviceName: "Server-001",
    status: "Open",
    priority: "High",
    assignedTo: "John Doe",
    createdAt: "2024-01-10",
  },
  {
    id: "TKT002",
    title: "Database Error",
    deviceName: "Database-Main",
    status: "In Progress",
    priority: "Medium",
    assignedTo: "Jane Smith",
    createdAt: "2024-01-11",
  },
  {
    id: "TKT003",
    title: "Network Connectivity Issue",
    deviceName: "Router-B",
    status: "Open",
    priority: "High",
    assignedTo: "Alice Johnson",
    createdAt: "2024-01-12",
  },
]

// ============ API ROUTES - USERS ============
// Lấy danh sách tất cả users
app.get("/api/users", (req, res) => {
  res.json({ success: true, data: users })
})

// Thêm user mới
app.post("/api/users", (req, res) => {
  const { name, email, phone, status } = req.body
  const newUser = {
    id: `USR${String(users.length + 1).padStart(3, "0")}`,
    name,
    email,
    phone,
    status,
    createdAt: new Date().toISOString().split("T")[0],
  }
  users.push(newUser)
  res.json({ success: true, data: newUser })
})

// Cập nhật user
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params
  const { name, email, phone, status } = req.body
  const user = users.find((u) => u.id === id)
  if (user) {
    user.name = name || user.name
    user.email = email || user.email
    user.phone = phone || user.phone
    user.status = status || user.status
    res.json({ success: true, data: user })
  } else {
    res.status(404).json({ success: false, error: "User not found" })
  }
})

// Xóa user
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params
  users = users.filter((u) => u.id !== id)
  res.json({ success: true })
})

// ============ API ROUTES - DEVICES ============
// Lấy danh sách tất cả devices
app.get("/api/devices", (req, res) => {
  res.json({ success: true, data: devices })
})

// Thêm device mới
app.post("/api/devices", (req, res) => {
  const { name, model, serialNumber, installDate, warrantyEnd, customer } = req.body
  const newDevice = {
    id: `DEV${String(devices.length + 1).padStart(3, "0")}`,
    name,
    model,
    serialNumber,
    installDate,
    warrantyEnd,
    customer,
  }
  devices.push(newDevice)
  res.json({ success: true, data: newDevice })
})

// Cập nhật device
app.put("/api/devices/:id", (req, res) => {
  const { id } = req.params
  const device = devices.find((d) => d.id === id)
  if (device) {
    Object.assign(device, req.body)
    res.json({ success: true, data: device })
  } else {
    res.status(404).json({ success: false, error: "Device not found" })
  }
})

// Xóa device
app.delete("/api/devices/:id", (req, res) => {
  const { id } = req.params
  devices = devices.filter((d) => d.id !== id)
  res.json({ success: true })
})

// ============ API ROUTES - TICKETS ============
// Lấy danh sách tất cả tickets
app.get("/api/tickets", (req, res) => {
  res.json({ success: true, data: tickets })
})

// Thêm ticket mới
app.post("/api/tickets", (req, res) => {
  const { title, deviceName, status, priority, assignedTo } = req.body
  const newTicket = {
    id: `TKT${String(tickets.length + 1).padStart(3, "0")}`,
    title,
    deviceName,
    status,
    priority,
    assignedTo,
    createdAt: new Date().toISOString().split("T")[0],
  }
  tickets.push(newTicket)
  res.json({ success: true, data: newTicket })
})

// Cập nhật ticket
app.put("/api/tickets/:id", (req, res) => {
  const { id } = req.params
  const ticket = tickets.find((t) => t.id === id)
  if (ticket) {
    Object.assign(ticket, req.body)
    res.json({ success: true, data: ticket })
  } else {
    res.status(404).json({ success: false, error: "Ticket not found" })
  }
})

// Xóa ticket
app.delete("/api/tickets/:id", (req, res) => {
  const { id } = req.params
  tickets = tickets.filter((t) => t.id !== id)
  res.json({ success: true })
})

// ============ AUTHENTICATION ============
// Login endpoint - kiểm tra thông tin đăng nhập
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body
  // Demo: chấp nhận bất kỳ email/password nào
  if (email && password) {
    res.json({
      success: true,
      user: { id: 1, email, name: "Admin User" },
      token: "demo-token-123",
    })
  } else {
    res.status(400).json({ success: false, error: "Email and password are required" })
  }
})

// Register endpoint
app.post("/api/auth/register", (req, res) => {
  const { fullName, email, password } = req.body
  if (email && password && fullName) {
    res.json({
      success: true,
      user: { id: Date.now(), email, name: fullName },
      message: "Registration successful",
    })
  } else {
    res.status(400).json({ success: false, error: "All fields are required" })
  }
})

// Forgot password endpoint
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body
  if (email) {
    res.json({
      success: true,
      message: "Password reset link sent to your email",
    })
  } else {
    res.status(400).json({ success: false, error: "Email is required" })
  }
})

// ============ HEALTH CHECK ============
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running", timestamp: new Date().toISOString() })
})

// ============ SERVE STATIC FILES IN PRODUCTION ============
// Serve static files from React build folder
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")))

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"))
  })
}

// ============ KHỞI ĐỘNG SERVER ============
// Server lắng nghe trên port 5000
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║   🚀 MaintainPro Backend Server                            ║
  ║                                                            ║
  ║   Server đang chạy tại: http://localhost:${PORT}              ║
  ║                                                            ║
  ║   API Endpoints:                                           ║
  ║   - GET  /api/users      - Lấy danh sách users             ║
  ║   - GET  /api/devices    - Lấy danh sách devices           ║
  ║   - GET  /api/tickets    - Lấy danh sách tickets           ║
  ║   - POST /api/auth/login - Đăng nhập                       ║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝
  `)
})
