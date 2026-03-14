// src/pages/LoginPage.tsx
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Shield, BookOpen, Building2 } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0B1B3D 0%, #1A3A6C 60%, #0B1B3D 100%)",
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-yellow-400"
            style={{
              width: `${(i + 1) * 60}px`,
              height: `${(i + 1) * 60}px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Gold accent lines */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, #C9A84C, transparent)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, transparent, #C9A84C, transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(201,168,76,0.3)",
          }}
        >
          {/* Header */}
          <div className="px-10 pt-10 pb-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #E8C96E)",
              }}
            >
              <Building2
                size={36}
                className="text-neu-navy"
                style={{ color: "#0B1B3D" }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-syne font-bold text-white mb-1"
            >
              NEU MOA
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-sm font-dm"
              style={{ color: "#C9A84C" }}
            >
              Memorandum of Agreement Monitoring System
            </motion.p>
          </div>

          {/* Divider */}
          <div
            className="mx-10 h-px"
            style={{ background: "rgba(201,168,76,0.3)" }}
          />

          {/* Features */}
          <div className="px-10 py-6 space-y-3">
            {[
              { icon: Shield, text: "Secure institutional access only" },
              { icon: BookOpen, text: "Real-time MOA status tracking" },
              { icon: Building2, text: "Multi-college partnership management" },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(201,168,76,0.15)" }}
                >
                  <Icon size={14} style={{ color: "#C9A84C" }} />
                </div>
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  {text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Sign in */}
          <div className="px-10 pb-10">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-medium text-sm transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #C9A84C 0%, #E8C96E 100%)",
                color: "#0B1B3D",
                fontFamily: "Syne, sans-serif",
                fontWeight: 600,
              }}
            >
              <GoogleIcon />
              Sign in with Google
            </motion.button>
            <p
              className="text-center text-xs mt-4"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Only NEU institutional email accounts are permitted
            </p>
          </div>
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          New Era University · Office of the University President
        </p>
      </motion.div>
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
