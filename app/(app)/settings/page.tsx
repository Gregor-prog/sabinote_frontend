"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconEdit, IconLogout, IconUpload, IconShield } from "@/components/icons";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/slices/authSlice";
import { useGetMeQuery } from "@/lib/services/authApi";
import { useUpdateProfileMutation, useUpdateSettingsMutation } from "@/lib/services/usersApi";
import { useLogoutMutation } from "@/lib/services/authApi";
import { clearCredentials } from "@/lib/slices/authSlice";
import { useAppDispatch } from "@/lib/hooks";
import { NIGERIAN_SUBJECTS, NIGERIAN_STATES, CLASS_LEVELS_UI } from "@/lib/constants";

const STATES = NIGERIAN_STATES;
const SUBJECTS = NIGERIAN_SUBJECTS;
const CLASSES = CLASS_LEVELS_UI;

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "preferences", label: "Preferences" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
      style={{ background: checked ? "#641BC4" : "#D1D5DB" }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? "translateX(24px)" : "translateX(4px)" }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: meData } = useGetMeQuery();
  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [updateSettings, { isLoading: savingPrefs }] = useUpdateSettingsMutation();
  const [logoutMutation] = useLogoutMutation();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'admin';

  const user = meData?.data;
  const settings = meData?.data?.settings;

  const [activeTab, setActiveTab] = useState("profile");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [state, setState] = useState("Lagos");
  const [stateChanged, setStateChanged] = useState(false);

  const [defaultSubject, setDefaultSubject] = useState("");
  const [defaultClass, setDefaultClass] = useState("");
  const [difficulty, setDifficulty] = useState<"basic" | "standard" | "advanced">("standard");
  const [alwaysConfirmState, setAlwaysConfirmState] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

  // Populate from API
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setPhoneNumber(user.phoneNumber ?? "");
      setState(user.state ?? "Lagos");
    }
    if (settings) {
      setDefaultSubject(settings.defaultSubject ?? "");
      setDefaultClass(settings.defaultClassLevel ?? "");
      setDifficulty(settings.noteDifficultyLevel ?? "standard");
      setAlwaysConfirmState(settings.alwaysConfirmState ?? true);
      setEmailNotifs(settings.emailNotifications ?? true);
    }
  }, [user, settings]);

  async function handleSaveProfile() {
    try {
      await updateProfile({ firstName, lastName, phoneNumber, state }).unwrap();
    } catch {
      // noop
    }
  }

  async function handleSavePrefs() {
    try {
      await updateSettings({
        defaultSubject,
        defaultClassLevel: defaultClass,
        noteDifficultyLevel: difficulty,
        alwaysConfirmState,
        emailNotifications: emailNotifs,
      }).unwrap();
    } catch {
      // noop
    }
  }

  async function handleLogout() {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(clearCredentials());
      router.replace("/auth/login");
    }
  }

  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}` : "?";

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#FAFAFA" }}>
      <div className="px-5 pt-5 pb-4">
        <h2 className="font-display font-bold text-gray-900" style={{ fontSize: "1.75rem", letterSpacing: "-0.02em" }}>You</h2>
      </div>

      {/* Profile card */}
      <div className="mx-5 mb-4 bg-white rounded-2xl p-4 flex items-center gap-3" style={{ border: "1px solid #E5E7EB" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0" style={{ background: "#F97316", color: "white" }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-gray-900 text-base">{user ? `${user.firstName} ${user.lastName}` : "Loading..."}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#F0FDFA", color: "#0D9488" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            {user?.state} curriculum
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center" onClick={() => setActiveTab("profile")}>
          <IconEdit />
        </button>
      </div>

      {/* Horizontal tabs */}
      <div className="px-5 overflow-x-auto scrollbar-hidden mb-4">
        <div className="flex gap-1 w-max border-b border-gray-100" style={{ paddingBottom: "1px" }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all relative"
              style={{ color: activeTab === tab.key ? "#641BC4" : "#9CA3AF" }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "#641BC4" }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8 flex-1">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            {[
              { label: "First name", value: firstName, onChange: setFirstName },
              { label: "Last name", value: lastName, onChange: setLastName },
              { label: "Phone number", value: phoneNumber, onChange: setPhoneNumber },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">{f.label}</label>
                <input
                  type="text"
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white"
                  onFocus={e => (e.target.style.borderColor = "#641BC4")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-400 border border-gray-200 outline-none bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">State</label>
              <div className="relative">
                <select
                  value={state}
                  onChange={e => { setState(e.target.value); setStateChanged(true); }}
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white appearance-none"
                  onFocus={e => (e.target.style.borderColor = "#641BC4")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                >
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              {stateChanged && (
                <p className="text-xs text-yellow-600 mt-1.5">
                  ⚠ Changing your state will switch your curriculum to {state}. Existing notes are unaffected.
                </p>
              )}
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "#641BC4" }}
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Default Subject</label>
              <div className="relative">
                <select
                  value={defaultSubject}
                  onChange={e => setDefaultSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white appearance-none"
                  onFocus={e => (e.target.style.borderColor = "#641BC4")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                >
                  <option value="">None</option>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Default Class Level</label>
              <div className="relative">
                <select
                  value={defaultClass}
                  onChange={e => setDefaultClass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-900 border border-gray-200 outline-none bg-white appearance-none"
                  onFocus={e => (e.target.style.borderColor = "#641BC4")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                >
                  <option value="">None</option>
                  {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Note Difficulty</label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
                {(["basic", "standard", "advanced"] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className="py-2.5 rounded-lg text-sm font-medium transition-all capitalize"
                    style={difficulty === d ? { background: "#641BC4", color: "white" } : { color: "#6B7280" }}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5" style={{ border: "1px solid #E5E7EB" }}>
              <div>
                <p className="text-sm font-medium text-gray-900">Always Confirm State</p>
                <p className="text-xs text-gray-400">Show state before each generation</p>
              </div>
              <Toggle checked={alwaysConfirmState} onChange={() => setAlwaysConfirmState(v => !v)} />
            </div>

            <button
              onClick={handleSavePrefs}
              disabled={savingPrefs}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm disabled:opacity-60"
              style={{ background: "#641BC4" }}
            >
              {savingPrefs ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5" style={{ border: "1px solid #E5E7EB" }}>
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive updates via email</p>
              </div>
              <Toggle checked={emailNotifs} onChange={() => setEmailNotifs(v => !v)} />
            </div>
            {[
              { label: "Generation Complete", desc: "When your note is ready", disabled: true },
              { label: "Wallet Top-Up Confirmed", desc: "Payment confirmation", disabled: true },
              { label: "Weekly Summary", desc: "Coming soon", disabled: true },
            ].map((n, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5 opacity-50"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{n.label}</p>
                  <p className="text-xs text-gray-400">{n.desc}</p>
                </div>
                <Toggle checked={false} onChange={() => {}} />
              </div>
            ))}
            <button
              onClick={handleSavePrefs}
              disabled={savingPrefs}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm disabled:opacity-60"
              style={{ background: "#641BC4" }}
            >
              {savingPrefs ? "Saving..." : "Save Notification Settings"}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-4">
            {[
              { label: "Current Password", placeholder: "••••••••" },
              { label: "New Password", placeholder: "••••••••" },
              { label: "Confirm New Password", placeholder: "••••••••" },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">{f.label}</label>
                <input
                  type="password"
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 outline-none bg-white"
                  onFocus={e => (e.target.style.borderColor = "#641BC4")}
                  onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
            ))}
            <button className="w-full py-3.5 rounded-xl font-semibold text-white text-sm" style={{ background: "#641BC4" }}>
              Update Password
            </button>

            <div className="mt-6 rounded-2xl p-4" style={{ border: "1px solid #FEE2E2" }}>
              <p className="text-sm font-semibold text-red-600 mb-1">Danger Zone</p>
              <p className="text-xs text-red-400 mb-3">This action is permanent and cannot be undone.</p>
              <button className="w-full py-3 rounded-xl font-semibold text-sm transition-colors" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA" }}>
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin panel link — mobile only, admin only */}
      {isAdmin && (
        <div className="px-5 pb-2 lg:hidden">
          <Link
            href="/admin"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#7C3AED,#641BC4)" }}
          >
            <IconShield className="w-4 h-4" />
            Admin Panel
          </Link>
        </div>
      )}

      {/* Resources link — mobile only (desktop has sidebar) */}
      <div className="px-5 pb-2 lg:hidden">
        <Link
          href="/resources"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 transition-colors"
        >
          <IconUpload className="w-4 h-4" />
          My Resources
        </Link>
      </div>

      {/* Log out */}
      <div className="px-5 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <IconLogout />
          Log out
        </button>
      </div>
    </div>
  );
}
