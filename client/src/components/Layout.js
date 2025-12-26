import { useState } from "react"

function Layout({ children, currentPage, onNavigate, onLogout }) {
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-blue-500">MaintainPro</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => onNavigate("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${currentPage === "dashboard" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Admin Dashboard
          </button>

          <button
            onClick={() => onNavigate("user-management")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${currentPage === "user-management" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            User Management
          </button>

          <button
            onClick={() => onNavigate("role-permissions")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${currentPage === "role-permissions" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Role Permissions
          </button>

          <button
            onClick={() => onNavigate("device-management")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${currentPage === "device-management" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            Device Inventory
          </button>

          <button
            onClick={() => onNavigate("ticket-overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${currentPage === "ticket-overview" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Ticket Overview
          </button>

          <button
            onClick={() => onNavigate("reports-summary")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${currentPage === "reports-summary" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Reports Summary
          </button>

          <button
            onClick={() => onNavigate("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${currentPage === "settings" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold">
            {currentPage === "dashboard" && "Admin Dashboard"}
            {currentPage === "user-management" && "User Management"}
            {currentPage === "role-permissions" && "Role Permissions"}
            {currentPage === "device-management" && "Device Management"}
            {currentPage === "ticket-overview" && "Ticket Management"}
            {currentPage === "reports-summary" && "Reports Summary"}
            {currentPage === "settings" && "Settings"}
            {currentPage === "profile" && "Edit User Profile"}
          </h2>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center hover:bg-gray-400 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">AU</span>
              </button>

              {showAvatarMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAvatarMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                    <button
                      onClick={() => {
                        setShowAvatarMenu(false)
                        onNavigate("profile")
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowAvatarMenu(false)
                        onLogout()
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}

export default Layout
