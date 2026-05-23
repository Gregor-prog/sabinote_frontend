"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBack, IconBolt } from "@/components/icons";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/slices/authSlice";
import { useUpdateProfileMutation, useUpdateSettingsMutation } from "@/lib/services/usersApi";
import { useGetWalletQuery } from "@/lib/services/walletApi";
import { NIGERIAN_SUBJECTS, NIGERIAN_STATES, CLASS_LEVELS_UI } from "@/lib/constants";

const STATES   = NIGERIAN_STATES;
const SUBJECTS = NIGERIAN_SUBJECTS;
const CLASSES  = CLASS_LEVELS_UI;

const inputCls = "w-full px-4 py-3 rounded-xl text-sm text-gray-900 border outline-none bg-white transition-shadow";
const selectCls = "w-full px-4 py-3 rounded-xl text-sm text-gray-900 border outline-none bg-white appearance-none transition-shadow";
const baseStyle = { borderColor: "var(--color-border)" };
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = "oklch(40% 0.22 290)";
  e.target.style.boxShadow   = "0 0 0 3px oklch(40% 0.22 290 / 0.1)";
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = "var(--color-border)";
  e.target.style.boxShadow   = "none";
};

export default function OnboardingPage() {
  const router = useRouter();
  const currentUser = useAppSelector(selectCurrentUser);
  const firstName = currentUser?.firstName ?? "Teacher";

  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [updateSettings, { isLoading: savingPrefs }]  = useUpdateSettingsMutation();
  const { data: walletData } = useGetWalletQuery();

  const [step, setStep] = useState(1);
  const TOTAL = 4;

  const [phone,          setPhone]          = useState(currentUser?.phoneNumber ?? "");
  const [selectedState,  setSelectedState]  = useState(currentUser?.state ?? "");
  const [defaultSubject, setDefaultSubject] = useState("");
  const [defaultClass,   setDefaultClass]   = useState("");
  const [difficulty,     setDifficulty]     = useState<"basic" | "standard" | "advanced">("standard");
  const [error,          setError]          = useState("");

  function back() { if (step > 1) setStep(s => s - 1); }

  async function handleNext() {
    setError("");
    if (step === 2) {
      if (!selectedState) { setError("Please select your state."); return; }
      try {
        await updateProfile({ phoneNumber: phone || undefined, state: selectedState }).unwrap();
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
        // non-blocking
      }
    }
    if (step < TOTAL) setStep(s => s + 1);
  }

  const balance = walletData?.data?.balance ?? "0";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)" }}>

      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: "var(--color-border)" }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${(step / TOTAL) * 100}%`, background: "oklch(40% 0.22 290)", transitionTimingFunction: "var(--ease-out)" }}
        />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={back}
          aria-label="Go back"
          className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors ${step === 1 ? "opacity-0 pointer-events-none" : ""}`}
          style={{ color: "var(--color-text-muted)" }}
        >
          <IconBack />
        </button>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
          {step} / {TOTAL}
        </span>
        {step < TOTAL ? (
          <button
            onClick={() => setStep(TOTAL)}
            className="text-sm font-medium hover:text-gray-600 transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            Skip
          </button>
        ) : <div className="w-9" />}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">

        {/* ── Step 1: Welcome ── */}
        {step === 1 && (
          <div className="flex-1 flex flex-col justify-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "var(--color-primary-dim)" }}
            >
              <IconBolt className="w-6 h-6" style={{ color: "oklch(40% 0.22 290)" }} />
            </div>
            <h1 className="font-display font-bold text-gray-900 mb-3" style={{ fontSize: "2rem", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Welcome to SabiNote,{" "}
              <span style={{ color: "oklch(40% 0.22 290)" }}>{firstName}.</span>
            </h1>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-text-muted)" }}>
              Before you start generating lesson notes, we need a few details
              to personalise your experience and connect you with the right
              curriculum for your state.
            </p>
            <div
              className="rounded-xl px-4 py-3.5 flex items-start gap-3"
              style={{ background: "white", border: "1px solid var(--color-border)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5" style={{ color: "oklch(40% 0.22 290)" }}>
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-900">Under 60 seconds</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  We use this once. You can update everything later in Settings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Profile ── */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h2 className="font-display font-bold text-gray-900 mb-1 mt-4" style={{ fontSize: "1.8rem", letterSpacing: "-0.03em" }}>
              Tell us about yourself.
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              This helps us serve the right curriculum for your school.
            </p>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone number <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>(optional)</span>
                </label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+234 801 234 5678"
                  className={inputCls} style={baseStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select required value={selectedState} onChange={e => setSelectedState(e.target.value)}
                    className={selectCls} style={baseStyle} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Select your state...</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>
                {selectedState && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: "#059669" }}>
                    {selectedState} curriculum selected
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  Your state determines your curriculum. Choose carefully.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Preferences ── */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h2 className="font-display font-bold text-gray-900 mb-1 mt-4" style={{ fontSize: "1.8rem", letterSpacing: "-0.03em" }}>
              Quick preferences.
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              Saves you time every time you generate.
            </p>

            <div className="space-y-4 flex-1">
              {[
                { label: "Default subject", value: defaultSubject, set: setDefaultSubject, placeholder: "Select subject...", options: SUBJECTS },
                { label: "Default class level", value: defaultClass, set: setDefaultClass, placeholder: "Select class...", options: CLASSES },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <select value={f.value} onChange={e => f.set(e.target.value)}
                      className={selectCls} style={baseStyle} onFocus={onFocus} onBlur={onBlur}>
                      <option value="">{f.placeholder}</option>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-muted)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note difficulty</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl" style={{ background: "var(--color-border)" }}>
                  {(["basic", "standard", "advanced"] as const).map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className="py-2.5 rounded-lg text-xs font-semibold capitalize transition-all"
                      style={difficulty === d
                        ? { background: "oklch(40% 0.22 290)", color: "white" }
                        : { background: "transparent", color: "var(--color-text-muted)" }
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
                  Standard is recommended for most teachers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Wallet ── */}
        {step === 4 && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "var(--color-primary-dim)" }}
              >
                <IconBolt className="w-6 h-6" style={{ color: "oklch(40% 0.22 290)" }} />
              </div>
              <h2 className="font-display font-bold text-gray-900 mb-1" style={{ fontSize: "1.8rem", letterSpacing: "-0.03em" }}>
                Your SabiNote wallet.
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                ₽Parats power your generations.
              </p>

              {/* Balance card — no gradient */}
              <div
                className="rounded-2xl px-5 py-5 mb-4"
                style={{ background: "white", border: "1px solid var(--color-border)" }}
              >
                <p className="text-xs font-medium mb-1.5" style={{ color: "var(--color-text-muted)" }}>Available</p>
                <p
                  className="font-display font-bold leading-none mb-4"
                  style={{ fontSize: "3rem", letterSpacing: "-0.04em", color: "oklch(40% 0.22 290)" }}
                >
                  ₽{balance}
                </p>
                <Link
                  href="/wallet"
                  className="inline-block px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "oklch(40% 0.22 290)" }}
                >
                  Top up now
                </Link>
              </div>

              <div
                className="rounded-xl px-4 py-3.5"
                style={{ background: "white", border: "1px solid var(--color-border)" }}
              >
                <p className="text-sm text-gray-600 leading-relaxed">
                  Each lesson plan costs <strong>8 ₽</strong>. A complete lesson note (plan + note) costs <strong>20 ₽</strong>.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/wallet"
                className="block w-full text-center py-4 rounded-xl font-semibold text-white"
                style={{ background: "oklch(40% 0.22 290)" }}
              >
                Top up wallet
              </Link>
              <Link
                href="/dashboard"
                className="block w-full text-center py-3 text-sm font-medium transition-colors hover:text-gray-600"
                style={{ color: "var(--color-text-muted)" }}
              >
                Explore first, I&apos;ll top up later
              </Link>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        {/* CTA — steps 1–3 */}
        {step < 4 && (
          <div className="mt-6">
            <button
              onClick={handleNext}
              disabled={savingProfile || savingPrefs}
              className="w-full py-4 rounded-xl font-semibold text-white disabled:opacity-60"
              style={{ background: "oklch(40% 0.22 290)" }}
            >
              {savingProfile || savingPrefs
                ? "Saving..."
                : step === 1 ? "Get started"
                : step === 2 ? "Save and continue"
                : "Save preferences"}
            </button>
            {step === 3 && (
              <button
                onClick={() => setStep(4)}
                className="w-full py-3 text-sm font-medium transition-colors hover:text-gray-600 mt-2"
                style={{ color: "var(--color-text-muted)" }}
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
