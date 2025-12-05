import React from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Home from "../pages/Home";
import About from "../pages/About";
import UserDashboard from "../pages/user/UserDashboard";
import MyTickets from "../pages/user/MyTickets";
import SubmitTicket from "../pages/user/SubmitTicket";
import MyDevices from "../pages/user/MyDevices";
import Settings from "../pages/user/Settings";
import TicketDetail from "../pages/user/TicketDetail";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />

      {/* Dashboard Pages */}
      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <UserDashboard />
          </DashboardLayout>
        }
      />
      <Route
        path="/tickets"
        element={
          <DashboardLayout>
            <MyTickets />
          </DashboardLayout>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <DashboardLayout>
            <TicketDetail />
          </DashboardLayout>
        }
      />
      <Route
        path="/submit-ticket"
        element={
          <DashboardLayout>
            <SubmitTicket />
          </DashboardLayout>
        }
      />
      <Route
        path="/devices"
        element={
          <DashboardLayout>
            <MyDevices />
          </DashboardLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}
