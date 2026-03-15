// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import GoogleIcon from "../assets/GoogleIcon";
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: "#060E20",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Left decorative panel ── */}
      <div
        style={{
          display: "none",
          width: "52%",
          background:
            "linear-gradient(145deg, #0B1B3D 0%, #0d2855 50%, #091628 100%)",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px",
        }}
        className="left-panel"
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "40%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }}
        />

        {/* Diagonal lines pattern */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.04,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="diag"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="40"
                stroke="#C9A84C"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)" />
        </svg>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: "380px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: "100px",
              padding: "6px 16px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#C9A84C",
              }}
            />
            <span
              style={{
                color: "#C9A84C",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              New Era University
            </span>
          </div>

          <h2
            style={{
              fontSize: "42px",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.15,
              margin: "0 0 20px",
              letterSpacing: "-1px",
            }}
          >
            MOA Monitoring
            <br />
            <span style={{ color: "#C9A84C" }}>Made Simple.</span>
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "15px",
              lineHeight: 1.7,
              margin: "0 0 48px",
            }}
          >
            Track, manage, and monitor all Memoranda of Agreement across
            colleges and industry partners in one unified platform.
          </p>

          {/* Stats */}
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
          background: "#060E20",
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(26,58,108,0.4) 0%, transparent 65%)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo mark */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                overflow: "hidden",
                padding: "8px",
              }}
            >
              <img
                src="/src/assets/newEraLogo.png"
                alt="New Era University"
                style={{ width: "130%", height: "130%", objectFit: "contain" }}
              />
            </div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 6px",
                letterSpacing: "-0.5px",
              }}
            >
              NEU MOA System
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "13px",
                margin: 0,
              }}
            >
              Memorandum of Agreement Monitoring
            </p>
          </div>

          {/* Card */}
          <div>
            

            {/* Google button */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                padding: "14px 20px",
                borderRadius: "12px",
                border: hovering
                  ? "1px solid rgba(201,168,76,0.6)"
                  : "1px solid rgba(255,255,255,0.12)",
                background: hovering
                  ? "rgba(201,168,76,0.08)"
                  : "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.2)",
                      borderTopColor: "#C9A84C",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Signing in…
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Sign in with your institutional account
                </>
              )}
            </button>

      
          </div>

          {/* Footer note */}
          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "rgba(255,255,255,0.2)",
              marginTop: "24px",
              lineHeight: 1.6,
            }}
          >
            Restricted to{" "}
            <span style={{ color: "rgba(201,168,76,0.6)" }}>@neu.edu.ph</span>{" "}
            accounts only
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

