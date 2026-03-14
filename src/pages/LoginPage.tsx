// src/pages/LoginPage.tsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Shield, BookOpen, Building2 } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0B1B3D 0%, #1A3A6C 60%, #0B1B3D 100%)",
        padding: "16px",
        position: "relative",
      }}
    >
      {/* Gold top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background:
            "linear-gradient(90deg, transparent, #C9A84C, transparent)",
        }}
      />
      {/* Gold bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "3px",
          background:
            "linear-gradient(90deg, transparent, #C9A84C, transparent)",
        }}
      />

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          border: "1px solid rgba(201,168,76,0.3)",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "40px 40px 24px", textAlign: "center" }}>
          {/* Logo icon */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #C9A84C, #E8C96E)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 24px rgba(201,168,76,0.3)",
            }}
          >
            <Building2 size={34} color="#0B1B3D" />
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 6px",
              letterSpacing: "-0.5px",
              fontFamily: "Syne, system-ui, sans-serif",
            }}
          >
            NEU MOA
          </h1>
          <p style={{ color: "#C9A84C", fontSize: "13px", margin: 0 }}>
            Memorandum of Agreement Monitoring System
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            margin: "0 40px",
            height: "1px",
            background: "rgba(201,168,76,0.25)",
          }}
        />

        {/* Feature list */}
        <div
          style={{
            padding: "24px 40px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {[
            { Icon: Shield, text: "Secure institutional access only" },
            { Icon: BookOpen, text: "Real-time MOA status tracking" },
            { Icon: Building2, text: "Multi-college partnership management" },
          ].map(({ Icon, text }, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  flexShrink: 0,
                  background: "rgba(201,168,76,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={14} color="#C9A84C" />
              </div>
              <span
                style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px" }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Sign in button */}
        <div style={{ padding: "0 40px 40px" }}>
          <button
            onClick={signInWithGoogle}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, #C9A84C 0%, #E8C96E 100%)",
              color: "#0B1B3D",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(201,168,76,0.35)",
              transition: "all 0.2s",
              fontFamily: "Syne, system-ui, sans-serif",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.filter = "brightness(1.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.filter = "brightness(1)")
            }
          >
            <GoogleIcon />
            Sign in with Google
          </button>
          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              marginTop: "12px",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Only NEU institutional email accounts are permitted
          </p>
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          position: "absolute",
          bottom: "16px",
          color: "rgba(255,255,255,0.25)",
          fontSize: "11px",
          textAlign: "center",
          width: "100%",
        }}
      >
        New Era University · Office of the University President
      </p>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
    />
  </svg>
);
