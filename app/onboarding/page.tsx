"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBack } from "@/components/icons";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/slices/authSlice";
import { useUpdateProfileMutation, useUpdateSettingsMutation } from "@/lib/services/usersApi";
import { useGetWalletQuery } from "@/lib/services/walletApi";
import { NIGERIAN_SUBJECTS, NIGERIAN_STATES, CLASS_LEVELS_UI } from "@/lib/constants";

const STATES = NIGERIAN_STATES;
const SUBJECTS = NIGERIAN_SUBJECTS;
const CLASSES = CLASS_LEVELS_UI;

export default function OnboardingPage() {
  const router = useRouter();
  const currentUser = useAppSelector(selectCurrentUser);
  const firstName = currentUser?.firstName ?? "Teacher";

  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [updateSettings, { isLoading: savingPrefs }] = useUpdateSettingsMutation();
  const { data: walletData } = useGetWalletQuery();

  const [step, setStep] = useState(1);
  const TOTAL = 4;

  // Step 2 fields
  const [phone, setPhone] = useState(currentUser?.phoneNumber ?? "");
  const [selectedState, setSelectedState] = useState(currentUser?.state ?? "");

  // Step 3 fields
  const [defaultSubject, setDefaultSubject] = useState("");
  const [defaultClass, setDefaultClass] = useState("");
  const [difficulty, setDifficulty] = useState<"basic" | "standard" | "advanced">("standard");

  const [error, setError] = useState("");

  function back() { if (step > 1) setStep((s) => s - 1); }

  async function handleNext() {
    setError("");
    if (step === 2) {
      if (!selectedState) { setError("Please select your state."); return; }
      try {
        await updateProfile({
          phoneNumber: phone || undefined,
          state: selectedState,
        }).unwrap();
      } catch {
        setError("Failed to save profile. Please try again.");
        return;
      }
    }

    if (step === 3) {
      try {
        await updateSettings({
          defaultSubject: defaultSubject || null,
          defaultClassLevel: defaultClass || null,
          noteDifficultyLevel: difficulty,
        }).unwrap();
      } catch {
        // non-blocking — preferences can be set later
      }
    }

    if (step < TOTAL) setStep((s) => s + 1);
  }

  const balance = walletData?.data?.balance ?? "0";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAFA" }}>
      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-200">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL) * 100}%`, background: "#641BC4" }}
        />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={back}
          className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400 ${step === 1 ? "opacity-0 pointer-events-none" : ""}`}
        >
          <IconBack />
        </button>
        <span className="text-sm text-gray-400 font-medium">Step {step} / {TOTAL}</span>
        {step < TOTAL ? (
          <button onClick={() => setStep(TOTAL)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Skip</button>
        ) : <div className="w-9" />}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center animate-fade-up">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl" style={{ background: "#F5F3FF" }}>
              🎓
            </div>
            <h1 className="font-display font-bold text-gray-900 mb-4" style={{ fontSize: "2rem", letterSpacing: "-0.02em" }}>
              Welcome to SabiNote,{" "}
              <span style={{ color: "#641BC4" }}>{firstName}.</span>
            </h1>
            <p className="text-gray-500 leading-relaxed mb-6">
              Before you start generating lesson notes, we need a few details
              to personalise your experience and connect you with the right
              curriculum for your state.
            </p>
            <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "white", border: "1px solid #E5E7EB" }}>
              <span className="text-lg mt-0.5">⏱</span>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Under 60 seconds</div>
                <div className="text-gray-500 text-sm">We use this once. You can update everything later in Settings.</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Profile */}
        {step === 2 && (
          <div className="flex-1 flex flex-col animate-fade-up">
            <h2 className="font-display font-bold text-gray-900 mb-1 mt-4" style={{ fontSize: "1.75rem", letterSpacing: "-0.02em" }}>
              Tell us about yourself.
            </h2>
            <p className="text-gray-500 text-sm mb-6">This helps us serve the right curriculum for your school.</p>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white focus:border-[#641BC4] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white appearance-none focus:border-[#641BC4] transition-colors"
                  >
                    <option value="">Select your state...</option>
                    {STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>
                {selectedState && (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#0D9488" }}>
                    <span>✓</span> {selectedState} State Curriculum selected
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">⚠ Your state determines your curriculum. Choose carefully.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Preferences */}
        {step === 3 && (
          <div className="flex-1 flex flex-col animate-fade-up">
            <h2 className="font-display font-bold text-gray-900 mb-1 mt-4" style={{ fontSize: "1.75rem", letterSpacing: "-0.02em" }}>
              Quick preferences.
            </h2>
            <p className="text-gray-500 text-sm mb-6">Saves you time every time you generate.</p>

            <div className="space-y-5 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Subject</label>
                <div className="relative">
                  <select
                    value={defaultSubject}
                    onChange={(e) => setDefaultSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white appearance-none focus:border-[#641BC4] transition-colors"
                  >
                    <option value="">Select subject...</option>
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Class Level</label>
                <div className="relative">
                  <select
                    value={defaultClass}
                    onChange={(e) => setDefaultClass(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white appearance-none focus:border-[#641BC4] transition-colors"
                  >
                    <option value="">Select class...</option>
                    {CLASSES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Difficulty</label>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
                  {(["basic", "standard", "advanced"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className="py-2.5 rounded-lg text-sm font-medium capitalize transition-all"
                      style={
                        difficulty === d
                          ? { background: "#641BC4", color: "white" }
                          : { color: "#6B7280" }
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Standard is recommended for most teachers.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Wallet */}
        {step === 4 && (
          <div className="flex-1 flex flex-col animate-fade-up">
            <div className="flex-1 flex flex-col justify-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl" style={{ background: "#F5F3FF" }}>
                💜
              </div>
              <h2 className="font-display font-bold text-gray-900 mb-2" style={{ fontSize: "1.75rem", letterSpacing: "-0.02em" }}>
                Your SabiNote Wallet.
              </h2>
              <p className="text-gray-500 text-sm mb-6">₽Parats power your generations.</p>

              <div
                className="rounded-2xl p-6 mb-6"
                style={{ background: "linear-gradient(135deg,#7C3AED 0%,#641BC4 60%,#3B0764 100%)" }}
              >
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">💜 Your Balance</p>
                <p className="font-display font-bold text-white mb-3" style={{ fontSize: "3rem" }}>
                  ₽ {Number(balance).toFixed(2)}
                </p>
                <Link
                  href="/wallet"
                  className="inline-block px-4 py-2 rounded-lg text-sm font-semibold text-white/90 transition-colors"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  Top Up Now →
                </Link>
              </div>

              <div className="rounded-xl p-4 mb-6" style={{ background: "white", border: "1px solid #E5E7EB" }}>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Each Lesson Plan costs <strong>8 ₽</strong>. A complete Lesson Note (Plan + Note) costs <strong>20 ₽</strong>. Top up now or explore the app first.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/wallet"
                className="block w-full text-center py-4 rounded-xl font-semibold text-white transition-all"
                style={{ background: "#641BC4" }}
              >
                Top Up Wallet →
              </Link>
              <Link
                href="/dashboard"
                className="block w-full text-center py-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                Explore first, I&apos;ll top up later
              </Link>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <p className="mt-3 text-xs text-red-600 font-medium bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
        )}

        {/* CTA buttons — steps 1-3 */}
        {step < 4 && (
          <div className="mt-6">
            <button
              onClick={handleNext}
              disabled={savingProfile || savingPrefs}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: "#641BC4" }}
            >
              {savingProfile || savingPrefs
                ? "Saving…"
                : step === 1
                ? "Let's Get Started →"
                : step === 2
                ? "Save & Continue →"
                : "Save Preferences →"}
            </button>
            {step === 3 && (
              <button
                onClick={() => setStep(4)}
                className="w-full py-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors mt-2"
              >
                Skip for now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
