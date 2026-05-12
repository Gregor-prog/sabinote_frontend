"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconEye, IconEyeOff } from "@/components/icons";
import { useLoginMutation } from "@/lib/services/authApi";
import { setCredentials } from "@/lib/slices/authSlice";
import { useAppDispatch } from "@/lib/hooks";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(
        setCredentials({
          user: res.data.user,
          wallet: res.data.wallet,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        })
      );
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Invalid email or password";
      setError(msg);
    }
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
          <div className="flex items-center gap-2 mb-16">
            <img
              src="https://res.cloudinary.com/drh4ma3hj/image/upload/v1778556077/WhatsApp_Image_2026-05-11_at_11.32.06_PM_iyv0vh.jpg"
              alt="SabiNote"
              className="h-9 w-auto object-contain"
            />
          </div>

          <div className="space-y-8">
            {[
              { quote: "SabiNote saved me 4 hours every week. My lesson notes are now better than anything I could produce manually.", name: "Mrs. Chioma Eze", role: "Biology Teacher · Anambra State" },
              { quote: "The curriculum matching is spot-on. Week 7 Term 2 JSS3 Chemistry — exactly what our scheme says.", name: "Mr. Emeka Okafor", role: "Chemistry · Rivers State" },
            ].map((t, i) => (
              <div key={i} className={`rounded-2xl p-6 transition-opacity ${i === 0 ? "opacity-100" : "opacity-50"}`} style={{ background: "#140D2B", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-white/80 text-sm leading-relaxed italic mb-4">"{t.quote}"</p>
                <div className="font-semibold text-white text-sm">{t.name}</div>
                <div className="text-white/40 text-xs">{t.role}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-wrap gap-2">
          {["✦ State Curriculum DB", "✦ RAG-Powered", "✦ NERDC-Compliant"].map((pill, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs font-medium text-white/60" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img
              src="https://res.cloudinary.com/drh4ma3hj/image/upload/v1778556077/WhatsApp_Image_2026-05-11_at_11.32.06_PM_iyv0vh.jpg"
              alt="SabiNote"
              className="h-8 w-auto object-contain"
            />
          </div>

          <h2 className="font-display font-bold text-3xl text-gray-900 mb-1" style={{ letterSpacing: "-0.02em" }}>
            Welcome back.
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-medium" style={{ color: "#641BC4" }}>Sign up →</Link>
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-100">
              {error}
            </div>
          )}

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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/auth/forgot-password" className="text-xs" style={{ color: "#641BC4" }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none transition-all bg-white pr-11"
                  onFocus={e => (e.target.style.borderColor = "#641BC4")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-70"
              style={{ background: "#641BC4" }}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in you agree to our{" "}
            <a href="#" className="underline">Terms</a> and{" "}
            <a href="#" className="underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
