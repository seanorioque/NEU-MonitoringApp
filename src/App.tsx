// src/App.tsx
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { MOAListPage } from "./pages/MoaListPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { AuditPage } from "./pages/AuditPage";
import { getMOAs } from "./services/moaService";
import type { MOA } from "./types/MOA";
import { RefreshCw, Bell } from "lucide-react";

const LoadingScreen = () => (
  <div
    style={{
      height: "100vh",
      width: "100vw",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0B1B3D 0%, #1A3A6C 100%)",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          margin: "0 auto 16px",
          background: "linear-gradient(135deg, #C9A84C, #E8C96E)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <RefreshCw
          size={20}
          color="#0B1B3D"
          style={{ animation: "spin 1s linear infinite" }}
        />
      </div>
      <p
        style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: "16px",
          fontFamily: "Syne, sans-serif",
        }}
      >
        NEU MOA System
      </p>
      <p
        style={{
          color: "rgba(201,168,76,0.7)",
          fontSize: "12px",
          marginTop: "4px",
        }}
      >
        Loading…
      </p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  moas: "MOA Records",
  manage: "Manage MOAs",
  users: "User Management",
  audit: "Audit Trail",
};

const AppShell: React.FC = () => {
  const { currentUser } = useAuth();
  const [view, setView] = useState("dashboard");
  const [moas, setMoas] = useState<MOA[]>([]);
  const [moasLoading, setMoasLoading] = useState(true);

  const fetchMOAs = useCallback(async () => {
    if (!currentUser) return;
    setMoasLoading(true);
    try {
      const data = await getMOAs(currentUser.role);
      setMoas(data);
    } catch (err) {
      console.error("Failed to load MOAs:", err);
    } finally {
      setMoasLoading(false);
    }
    // eslint-disable-next-line
  }, [currentUser?.uid, currentUser?.role]);

  useEffect(() => {
    fetchMOAs();
  }, [fetchMOAs]);

  useEffect(() => {
    if (!currentUser) return;
    const role = currentUser.role;
    if (role === "student" && ["users", "audit", "manage"].includes(view))
      setView("dashboard");
    if (role === "faculty" && ["users", "audit"].includes(view))
      setView("dashboard");
    if (role === "faculty" && view === "manage" && !currentUser.canMaintainMOA)
      setView("dashboard");
  }, [view, currentUser]);

  const expiringSoon = moas.filter(
    (m) =>
      !m.isDeleted && m.status === "EXPIRING: Two months before expiration",
  ).length;

  const renderPage = () => {
    if (moasLoading)
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "60%",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "3px solid #EDE5D8",
              borderTopColor: "#C9A84C",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ color: "#8B7355", fontSize: "13px" }}>
            Loading MOA data…
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    switch (view) {
      case "dashboard":
        return <DashboardPage moas={moas} userRole={currentUser!.role} />;
      case "moas":
        return (
          <MOAListPage
            moas={moas}
            currentUser={currentUser!}
            onRefresh={fetchMOAs}
          />
        );
      case "manage":
        if (currentUser?.role === "admin" || currentUser?.canMaintainMOA)
          return (
            <MOAListPage
              moas={moas}
              currentUser={currentUser!}
              onRefresh={fetchMOAs}
            />
          );
        return null;
      case "users":
        return currentUser?.role === "admin" ? <UserManagementPage /> : null;
      case "audit":
        return currentUser?.role === "admin" ? <AuditPage moas={moas} /> : null;
      default:
        return <DashboardPage moas={moas} userRole={currentUser!.role} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentView={view} setCurrentView={setView} />
      <div className="app-main">
        {/* Top bar */}
        <div className="app-topbar">
          <div>
            <p
              style={{
                fontSize: "11px",
                color: "#8B7355",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              New Era University
            </p>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#0B1B3D",
                fontFamily: "Syne, sans-serif",
                lineHeight: 1.2,
              }}
            >
              {PAGE_TITLES[view] || "MOA System"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {expiringSoon > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#FFF3E0",
                  border: "1px solid #FFB74D",
                  borderRadius: "8px",
                  padding: "5px 10px",
                }}
              >
                <Bell size={13} color="#E65100" />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#E65100",
                    fontWeight: 600,
                  }}
                >
                  {expiringSoon} expiring soon
                </span>
              </div>
            )}
            <button
              onClick={fetchMOAs}
              className="btn-ghost"
              style={{ gap: "6px" }}
            >
              <RefreshCw
                size={13}
                style={{
                  animation: moasLoading ? "spin 0.8s linear infinite" : "none",
                }}
              />
              Refresh
            </button>
            {/* User avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 10px 4px 4px",
                borderRadius: "99px",
                border: "1px solid #EDE5D8",
                background: "white",
              }}
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                  alt=""
                />
              ) : (
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#C9A84C",
                    color: "#0B1B3D",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {currentUser?.displayName?.[0] || "U"}
                </div>
              )}
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#0B1B3D",
                    lineHeight: 1,
                  }}
                >
                  {currentUser?.displayName?.split(" ")[0]}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#8B7355",
                    lineHeight: 1,
                    marginTop: "2px",
                    textTransform: "capitalize",
                  }}
                >
                  {currentUser?.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="app-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{ height: "100%" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <LoginPage />;
  return <AppShell />;
};
