"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconEye, IconEyeOff } from "@/components/icons";
import { useRegisterMutation } from "@/lib/services/authApi";
import { setCredentials } from "@/lib/slices/authSlice";
import { useAppDispatch } from "@/lib/hooks";

const STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River",
  "Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe","Imo","Jigawa","Kaduna","Kano",
  "Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo",
  "Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const colors = ["#EF4444", "#F59E0B", "#10B981", "#10B981"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: n <= score ? colors[score - 1] : "#E5E7EB" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: score > 0 ? colors[score - 1] : "#9CA3AF" }}>
        {labels[score - 1] ?? ""}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [showPass, setShowPass] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await register({ firstName, lastName, email, password, state: selectedState }).unwrap();
      dispatch(
        setCredentials({
          user: res.data.user,
          wallet: res.data.wallet,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        })
      );
      router.push("/onboarding");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Registration failed. Please try again.";
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFA" }}>
      {/* Left panel */}
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
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#641BC4" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </span>
            <span className="font-display font-bold text-xl text-white">SabiNote</span>
          </div>
          <div
            className="rounded-2xl p-8 mb-8"
            style={{ background: "#140D2B", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="font-display font-bold text-white text-2xl mb-3">
              Join 4,000+ Nigerian educators
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Generate NERDC-compliant lesson notes in seconds. Reclaim your weekends. Teach better.
            </p>
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

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#641BC4" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </span>
            <span className="font-display font-bold text-xl text-gray-900">SabiNote</span>
          </div>

          <h2 className="font-display font-bold text-3xl text-gray-900 mb-1" style={{ letterSpacing: "-0.02em" }}>
            Create your account.
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium" style={{ color: "#641BC4" }}>Log in →</Link>
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Amaka"
                  className="w-full px-3 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white"
                  onFocus={e => (e.target.style.borderColor = "#641BC4")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Okonkwo"
                  className="w-full px-3 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white"
                  onFocus={e => (e.target.style.borderColor = "#641BC4")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="amaka@school.edu.ng"
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white"
                onFocus={e => (e.target.style.borderColor = "#641BC4")}
                onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white pr-11"
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
              <PasswordStrength password={password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                State <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white appearance-none"
                  onFocus={e => (e.target.style.borderColor = "#641BC4")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                >
                  <option value="">Select your state...</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              {selectedState && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#0D9488" }}>
                  <span>✓</span> {selectedState} curriculum selected
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">⚠ Your state determines your curriculum. Choose carefully.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-70 mt-2"
              style={{ background: "#641BC4" }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing up you agree to our{" "}
            <a href="#" className="underline">Terms</a> and{" "}
            <a href="#" className="underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
