import { useState } from "react"
import LoginPage from "./pages/LoginPage.jsx"
import RegisterPage from "./pages/RegisterPage.jsx"
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx"
import Layout from "./components/Layout.jsx"
import DashboardPage from "./pages/DashboardPage.jsx"
import UserManagementPage from "./pages/UserManagementPage.jsx"
import DeviceManagementPage from "./pages/DeviceManagementPage.jsx"
import TicketOverviewPage from "./pages/TicketOverviewPage.jsx"
import RolePermissionsPage from "./pages/RolePermissionsPage.jsx"
import ReportsSummaryPage from "./pages/ReportsSummaryPage.jsx"
import SettingsPage from "./pages/SettingsPage.jsx"
import ProfilePage from "./pages/ProfilePage.jsx"

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [currentPage, setCurrentPage] = useState("login")

    const handleLoginSuccess = () => {
        setIsLoggedIn(true)
        setCurrentPage("dashboard")
    }

    const handleLogout = () => {
        setIsLoggedIn(false)
        setCurrentPage("login")
    }

    if (!isLoggedIn) {
        return (
            <main className="min-h-screen">
                {currentPage === "login" && <LoginPage onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />}
                {currentPage === "register" && <RegisterPage onNavigate={setCurrentPage} />}
                {currentPage === "forgot-password" && <ForgotPasswordPage onNavigate={setCurrentPage} />}
            </main>
        )
    }

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
