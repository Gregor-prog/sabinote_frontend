"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1800);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFA" }}>
      {/* Left panel — desktop only */}
      <div
        className="hidden lg:flex flex-col justify-between w-[55%] p-12 relative overflow-hidden"
        style={{ background: "#0A0512" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 60%, rgba(100,27,196,0.35) 0%, transparent 65%)" }}
        />
        <div className="relative">
          <Link href="/" className="flex items-center gap-2 mb-16">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#641BC4" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </span>
            <span className="font-display font-bold text-xl text-white">SabiNote</span>
          </Link>

          <div className="rounded-2xl p-8" style={{ background: "#140D2B", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="font-display font-bold text-white text-xl mb-3">
              Secure password reset
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              We'll send a one-time reset link to your registered email. The link expires in 15 minutes for your security.
            </p>
          </div>
        </div>

        <div className="relative flex flex-wrap gap-2">
          {["✦ Secure Reset", "✦ Link expires in 15 min", "✦ NERDC-Compliant"].map((pill, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs font-medium text-white/60" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#641BC4" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </span>
            <span className="font-display font-bold text-xl text-gray-900">SabiNote</span>
          </Link>

          {!sent ? (
            <>
              {/* Back link */}
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to login
              </Link>

              <h2
                className="font-display font-bold text-3xl text-gray-900 mb-2"
                style={{ letterSpacing: "-0.02em" }}
              >
                Reset your password.
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                Enter the email address you registered with and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="amaka@school.edu.ng"
                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none transition-all bg-white"
                    onFocus={e => (e.target.style.borderColor = "#641BC4")}
                    onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-70"
                  style={{ background: "#641BC4" }}
                >
                  {loading ? "Sending reset link..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                Remembered it?{" "}
                <Link href="/auth/login" className="font-medium" style={{ color: "#641BC4" }}>
                  Log in →
                </Link>
              </p>
            </>
          ) : (
            /* Success state */
            <div className="text-center animate-fade-up">
              {/* Animated checkmark */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "#ECFDF5" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 className="font-display font-bold text-2xl text-gray-900 mb-3" style={{ letterSpacing: "-0.02em" }}>
                Check your inbox.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-2">
                We sent a reset link to
              </p>
              <p className="font-semibold text-gray-900 text-sm mb-6">{email}</p>

              <div
                className="rounded-xl p-4 mb-8 text-left"
                style={{ background: "#FFFBEB", border: "1px solid #FEF3C7" }}
              >
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>⏱ Link expires in 15 minutes.</strong> Check your spam folder if you don't see it within 2 minutes.
                </p>
              </div>

              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="w-full py-3 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors mb-3"
                style={{ border: "1.5px solid #E5E7EB" }}
              >
                Try a different email
              </button>
              <Link
                href="/auth/login"
                className="block w-full py-3 rounded-xl font-semibold text-sm text-white text-center transition-opacity hover:opacity-90"
                style={{ background: "#641BC4" }}
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
