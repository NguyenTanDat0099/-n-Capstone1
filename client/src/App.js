// ============================================
// REACT MAIN COMPONENT
// ============================================
// Đây là component chính quản lý state và routing
// của toàn bộ ứng dụng

import { useState } from "react"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import Layout from "./components/Layout"
import DashboardPage from "./pages/DashboardPage"
import UserManagementPage from "./pages/UserManagementPage"
import DeviceManagementPage from "./pages/DeviceManagementPage"
import TicketOverviewPage from "./pages/TicketOverviewPage"
import RolePermissionsPage from "./pages/RolePermissionsPage"
import ReportsSummaryPage from "./pages/ReportsSummaryPage"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"

function App() {
  // State quản lý trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // State quản lý trang hiện tại đang hiển thị
  const [currentPage, setCurrentPage] = useState("login")

  // Xử lý khi user đăng nhập thành công
  const handleLoginSuccess = () => {
    console.log("[v0] Login thành công")
    setIsLoggedIn(true)
    setCurrentPage("dashboard")
  }

  // Xử lý khi user đăng xuất
  const handleLogout = () => {
    console.log("[v0] Logout")
    setIsLoggedIn(false)
    setCurrentPage("login")
  }

  // Nếu chưa đăng nhập, hiển thị các trang authentication
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen">
        {currentPage === "login" && (
          <LoginPage onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />
        )}
        {currentPage === "register" && (
          <RegisterPage onNavigate={setCurrentPage} />
        )}
        {currentPage === "forgot-password" && (
          <ForgotPasswordPage onNavigate={setCurrentPage} />
        )}
      </main>
    )
  }

  // Nếu đã đăng nhập, hiển thị layout với sidebar
  // Render component tương ứng với currentPage
  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
      {currentPage === "dashboard" && <DashboardPage onNavigate={setCurrentPage} />}
      {currentPage === "user-management" && <UserManagementPage />}
      {currentPage === "device-management" && <DeviceManagementPage />}
      {currentPage === "ticket-overview" && <TicketOverviewPage />}
      {currentPage === "role-permissions" && <RolePermissionsPage />}
      {currentPage === "reports-summary" && <ReportsSummaryPage />}
      {currentPage === "settings" && <SettingsPage />}
      {currentPage === "profile" && <ProfilePage onNavigate={setCurrentPage} />}
    </Layout>
  )
}

export default App
