# MaintainPro Admin Dashboard

Ứng dụng quản lý bảo trì thiết bị với React frontend và Node.js backend.

## Cấu trúc Project

```
ADMIN_DASHBOARD/
├── client/                 # React Frontend (Port 3000)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── ForgotPasswordPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── UserManagementPage.js
│   │   │   ├── DeviceManagementPage.js
│   │   │   ├── TicketOverviewPage.js
│   │   │   ├── RolePermissionsPage.js
│   │   │   ├── ReportsSummaryPage.js
│   │   │   ├── SettingsPage.js
│   │   │   └── ProfilePage.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── server/                 # Node.js Backend (Port 5000)
    ├── server.js
    └── package.json
```

## Hướng dẫn chạy

### 1. Khởi động Backend (Terminal 1)

```bash
cd server
npm install
npm start
```

Server sẽ chạy tại: http://localhost:5000

### 2. Khởi động Frontend (Terminal 2)

```bash
cd client
npm install
npm start
```

React app sẽ chạy tại: http://localhost:3000

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /api/auth/login | Đăng nhập |
| POST | /api/auth/register | Đăng ký |
| GET | /api/users | Lấy danh sách users |
| POST | /api/users | Thêm user mới |
| PUT | /api/users/:id | Cập nhật user |
| DELETE | /api/users/:id | Xóa user |
| GET | /api/devices | Lấy danh sách devices |
| POST | /api/devices | Thêm device mới |
| PUT | /api/devices/:id | Cập nhật device |
| DELETE | /api/devices/:id | Xóa device |
| GET | /api/tickets | Lấy danh sách tickets |
| POST | /api/tickets | Thêm ticket mới |
| PUT | /api/tickets/:id | Cập nhật ticket |
| DELETE | /api/tickets/:id | Xóa ticket |

## Tính năng

- ✅ Đăng nhập / Đăng ký / Quên mật khẩu
- ✅ Dashboard với thống kê
- ✅ Quản lý Users (CRUD)
- ✅ Quản lý Devices (CRUD)
- ✅ Quản lý Tickets (CRUD)
- ✅ Quản lý quyền (Role Permissions)
- ✅ Báo cáo tổng hợp
- ✅ Cài đặt hệ thống
- ✅ Trang cá nhân
