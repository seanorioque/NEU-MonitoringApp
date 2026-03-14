// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export const LoginPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [hovering, setHovering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#060E20",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* ── Left decorative panel ── */}
      <div style={{
        display: "none",
        width: "52%",
        background: "linear-gradient(145deg, #0B1B3D 0%, #0d2855 50%, #091628 100%)",
        position: "relative",
        overflow: "hidden",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px",
      }} className="left-panel">

        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "30%", left: "40%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }}/>

        {/* Diagonal lines pattern */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="#C9A84C" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)"/>
        </svg>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: "380px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: "100px", padding: "6px 16px", marginBottom: "32px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C9A84C" }}/>
            <span style={{ color: "#C9A84C", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              New Era University
            </span>
          </div>

          <h2 style={{
            fontSize: "42px", fontWeight: 800, color: "#fff",
            lineHeight: 1.15, margin: "0 0 20px",
            letterSpacing: "-1px",
          }}>
            MOA Monitoring<br/>
            <span style={{ color: "#C9A84C" }}>Made Simple.</span>
          </h2>

          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", lineHeight: 1.7, margin: "0 0 48px" }}>
            Track, manage, and monitor all Memoranda of Agreement across colleges and industry partners in one unified platform.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: "32px" }}>
            {[
              { num: "3", label: "User Roles" },
              { num: "8", label: "MOA Statuses" },
              { num: "11", label: "Colleges" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#C9A84C", lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        background: "#060E20",
      }}>

        {/* Subtle background glow */}
        <div style={{
          position: "absolute", top: "20%", left: "50%",
          width: "600px", height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,58,108,0.4) 0%, transparent 65%)",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}/>

        <div style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}>

          {/* Logo mark */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "16px",
              background: "linear-gradient(135deg, #C9A84C 0%, #E8C96E 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 0 8px rgba(201,168,76,0.08), 0 12px 32px rgba(201,168,76,0.25)",
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#0B1B3D"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#0B1B3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{
              fontSize: "26px", fontWeight: 800, color: "#fff",
              margin: "0 0 6px", letterSpacing: "-0.5px",
            }}>
              NEU MOA System
            </h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", margin: 0 }}>
              Memorandum of Agreement Monitoring
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "32px",
            backdropFilter: "blur(12px)",
          }}>
            <p style={{
              fontSize: "13px", color: "rgba(255,255,255,0.45)",
              textAlign: "center", marginBottom: "24px", lineHeight: 1.6,
            }}>
              Sign in with your <strong style={{ color: "rgba(255,255,255,0.7)" }}>NEU institutional</strong> Google account to continue
            </p>

            {/* Google button */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                padding: "14px 20px",
                borderRadius: "12px",
                border: hovering ? "1px solid rgba(201,168,76,0.6)" : "1px solid rgba(255,255,255,0.12)",
                background: hovering ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: "14px", fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.2)",
                    borderTopColor: "#C9A84C",
                    animation: "spin 0.8s linear infinite",
                  }}/>
                  Signing in…
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }}/>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>
                ROLE ACCESS
              </span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }}/>
            </div>

            {/* Role pills */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              {[
                { role: "Student", color: "#10B981", desc: "View approved" },
                { role: "Faculty", color: "#3B82F6", desc: "Manage MOAs" },
                { role: "Admin", color: "#C9A84C", desc: "Full access" },
              ].map(({ role, color, desc }) => (
                <div key={role} style={{
                  flex: 1, textAlign: "center", padding: "10px 8px",
                  borderRadius: "10px",
                  background: `${color}10`,
                  border: `1px solid ${color}25`,
                }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: color, margin: "0 auto 6px",
                  }}/>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{role}</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p style={{
            textAlign: "center", fontSize: "11px",
            color: "rgba(255,255,255,0.2)", marginTop: "24px", lineHeight: 1.6,
          }}>
            Restricted to <span style={{ color: "rgba(201,168,76,0.6)" }}>@neu.edu.ph</span> accounts only
            <br/>New Era University · Office of the University President
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 900px) {
          .left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);