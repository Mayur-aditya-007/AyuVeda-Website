// src/pages/Settings.jsx
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useUser } from "../contexts/UserContext";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

/**
 * Settings page — Edit Profile DOB popover improved:
 * - Popover will show above the trigger when there's not enough space below.
 * - Year range limited to last 100 years for a compact year dropdown.
 * - Popover has a max-height and scroll if needed.
 */

const CATEGORIES = [
  { id: "account", label: "Account" },
  { id: "profile", label: "Edit Profile" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "integrations", label: "Integrations" },
  { id: "data", label: "Data & Privacy" },
  { id: "app", label: "App Management" },
];

function safeParse(json) {
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const { user, saveUser } = useUser();
  const [active, setActive] = useState("profile");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    initials: "",
    gender: "",
    dob: "",
    height: "",
    weight: "",
    phone: "",
    location: "",
    notes: "",
    avatarUrl: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    reminders: true,
    productUpdates: true,
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    compactMode: false,
  });

  const [connectedApps] = useState([
    { id: "google", title: "Google", connected: true },
    { id: "fitbit", title: "Fitbit", connected: false },
  ]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // DOB popover state & refs
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState("bottom"); // "bottom" | "top"
  const dobRef = useRef(null);
  const dobPickerRef = useRef(null);

  useEffect(() => {
    // initialize from user context or localStorage keys
    if (user) {
      setProfile((p) => ({ ...p, ...(user.raw || user) }));
    } else {
      const keys = ["ayu_profile", "signupData", "profile", "user_profile"];
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const parsed = safeParse(raw);
        if (parsed) {
          setProfile((p) => ({ ...p, ...parsed }));
          break;
        }
      }
    }

    const appPrefs = safeParse(localStorage.getItem("ayu_prefs"));
    if (appPrefs) setAppearance((a) => ({ ...a, ...appPrefs }));

    const notif = safeParse(localStorage.getItem("ayu_notifs"));
    if (notif) setNotifications((n) => ({ ...n, ...notif }));
  }, [user]);

  useEffect(() => {
    // close picker on Escape or outside click
    function onDocClick(e) {
      if (showDobPicker) {
        if (
          dobPickerRef.current &&
          !dobPickerRef.current.contains(e.target) &&
          dobRef.current &&
          !dobRef.current.contains(e.target)
        ) {
          setShowDobPicker(false);
        }
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setShowDobPicker(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [showDobPicker]);

  // When opening the popover, compute whether it fits below trigger — if not, show above
  useEffect(() => {
    if (!showDobPicker) return;
    // measure after render
    requestAnimationFrame(() => {
      try {
        const trigger = dobRef.current;
        const pop = dobPickerRef.current;
        if (!trigger || !pop) return setPopoverPosition("bottom");
        const trigRect = trigger.getBoundingClientRect();
        const popHeight = pop.offsetHeight || 360; // fallback estimate
        const spaceBelow = window.innerHeight - trigRect.bottom;
        const spaceAbove = trigRect.top;
        // prefer bottom if spaceBelow > popHeight + margin
        const margin = 12;
        if (spaceBelow < popHeight + margin && spaceAbove > popHeight + margin) {
          setPopoverPosition("top");
        } else {
          setPopoverPosition("bottom");
        }
      } catch {
        setPopoverPosition("bottom");
      }
    });
  }, [showDobPicker]);

  function flash(msg, timeout = 2200) {
    setMessage(msg);
    setTimeout(() => setMessage(""), timeout);
  }

  function setField(k, v) {
    setProfile((s) => ({ ...s, [k]: v }));
  }

  /* Avatar handlers for profile edits */
  const fileRef = React.useRef(null);
  function handleChooseFile() {
    fileRef.current?.click();
  }
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((s) => ({ ...s, avatarUrl: reader.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  function handleRemoveAvatar() {
    setProfile((s) => {
      const nxt = { ...s };
      delete nxt.avatarUrl;
      return nxt;
    });
  }

  /* Save profile */
  async function handleSaveProfile(e) {
    e?.preventDefault();
    setSaving(true);
    try {
      const initials =
        profile.initials ||
        (profile.name ? profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "");
      const saveObj = { ...profile, initials };

      // update via UserContext so TopBar/profile reflect changes
      await saveUser(saveObj, { remote: false });

      // keep compatibility localStorage keys
      localStorage.setItem("ayu_profile", JSON.stringify(saveObj));
      const gettingStarted = {
        dob: profile.dob,
        height: profile.height,
        weight: profile.weight,
        activity: safeParse(localStorage.getItem("gettingStartedData"))?.activity || undefined,
      };
      localStorage.setItem("gettingStartedData", JSON.stringify(gettingStarted));

      flash("Profile saved");
    } catch (err) {
      console.error(err);
      flash("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleResetProfile() {
    if (user) setProfile({ ...user });
    else
      setProfile({
        name: "",
        email: "",
        initials: "",
        gender: "",
        dob: "",
        height: "",
        weight: "",
        phone: "",
        location: "",
        notes: "",
        avatarUrl: "",
      });
    flash("Form reset");
  }

  function toggleNotif(k) {
    const next = { ...notifications, [k]: !notifications[k] };
    setNotifications(next);
    localStorage.setItem("ayu_notifs", JSON.stringify(next));
    flash("Notification preferences updated");
  }

  function toggleTheme() {
    const next = { ...appearance, theme: appearance.theme === "light" ? "dark" : "light" };
    setAppearance(next);
    localStorage.setItem("ayu_prefs", JSON.stringify(next));
    flash(`Switched to ${next.theme} theme`);
    if (next.theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  function toggleCompact() {
    const next = { ...appearance, compactMode: !appearance.compactMode };
    setAppearance(next);
    localStorage.setItem("ayu_prefs", JSON.stringify(next));
    flash("Display mode updated");
  }

  function handleExportData() {
    const payload = {
      profile: safeParse(localStorage.getItem("ayu_profile")) || profile,
      gettingStarted: safeParse(localStorage.getItem("gettingStartedData")) || {},
      prefs: safeParse(localStorage.getItem("ayu_prefs")) || appearance,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ayu-export.json";
    a.click();
    URL.revokeObjectURL(url);
    flash("Export started");
  }

  function handleDeleteAccount() {
    const ok = window.confirm("This will remove local profile data from this browser. Continue?");
    if (!ok) return;
    ["ayu_profile", "gettingStartedData", "ayu_prefs", "ayu_notifs"].forEach((k) => localStorage.removeItem(k));
    flash("Local profile removed");
  }

  /* small nav item component */
  function NavItem({ id, label }) {
    const activeCls = id === active ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50 text-gray-700";
    return (
      <button onClick={() => setActive(id)} className={`w-full text-left px-3 py-2 rounded-md transition ${activeCls}`}>
        {label}
      </button>
    );
  }

  /* ---------- Render content per tab ---------- */
  function renderContent() {
    switch (active) {
      case "profile":
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Edit Profile</h2>

            <form onSubmit={handleSaveProfile} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-4">
              {/* avatar row */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-2xl">
                      {(profile.initials ||
                        (profile.name
                          ? profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                          : "U"))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={handleChooseFile} className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm">
                    Upload
                  </button>
                  <button type="button" onClick={handleRemoveAvatar} className="px-3 py-2 rounded-md bg-gray-100 text-sm">
                    Remove
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500">Full name</label>
                  <input value={profile.name} onChange={(e) => setField("name", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">Initials</label>
                  <input value={profile.initials} onChange={(e) => setField("initials", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">Location</label>
                  <input value={profile.location} onChange={(e) => setField("location", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">Phone</label>
                  <input value={profile.phone} onChange={(e) => setField("phone", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">Height (cm)</label>
                  <input type="number" value={profile.height} onChange={(e) => setField("heightCm", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">Weight (kg)</label>
                  <input type="number" value={profile.weight} onChange={(e) => setField("weightKg", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">Gender</label>
                  <select value={profile.gender} onChange={(e) => setField("gender", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm">
                    <option value="">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* DOB with DayPicker popover (auto-position + limited year range) */}
                <div>
                  <label className="block text-xs text-gray-500">Date of birth</label>

                  <div className="relative">
                    <div
                      ref={dobRef}
                      className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm flex items-center justify-between cursor-pointer"
                      onClick={() => setShowDobPicker((s) => !s)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="text-sm text-gray-700">{profile.dob ? new Date(profile.dob).toLocaleDateString() : "Select date"}</div>
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>

                    {showDobPicker && (
                      <div
                        ref={dobPickerRef}
                        className={`absolute z-50 mt-2 ${popoverPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"} left-0 bg-white border border-gray-100 rounded-md shadow-lg p-3`}
                        style={{ minWidth: 260, maxWidth: 360 }}
                      >
                        {/* Constrain max-height and allow scroll inside popover */}
                        <div style={{ maxHeight: 360, overflow: "auto" }}>
                          <DayPicker
                            mode="single"
                            selected={profile.dob ? new Date(profile.dob) : undefined}
                            onSelect={(d) => {
                              if (!d) return;
                              const iso = d.toISOString().slice(0, 10);
                              setField("dob", iso);
                              setShowDobPicker(false);
                            }}
                            fromYear={new Date().getFullYear() - 100} // limit to last 100 years
                            toYear={new Date().getFullYear()}
                            captionLayout="dropdown"
                            // styles for selected dates (keeps visuals compact)
                            modifiersClassNames={{ selected: "ring-2 ring-emerald-300 bg-emerald-50" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500">Bio / Notes</label>
                  <textarea value={profile.notes} onChange={(e) => setField("notes", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm" rows={3} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded-md">
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button type="button" onClick={handleResetProfile} className="px-4 py-2 bg-gray-100 rounded-md">
                  Reset
                </button>
                {message && <div className="text-sm text-green-600 ml-3">{message}</div>}
              </div>
            </form>
          </div>
        );

      case "account":
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Account</h2>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-3">Manage account-level settings like email, phone and connected apps.</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500">Email</label>
                  <input value={profile.email} onChange={(e) => setField("email", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">Phone</label>
                  <input value={profile.phone} onChange={(e) => setField("phone", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-md p-2 text-sm" />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={handleSaveProfile} className="px-4 py-2 bg-emerald-600 text-white rounded-md">Save</button>
                <button onClick={handleResetProfile} className="px-4 py-2 bg-gray-100 rounded-md">Reset</button>
              </div>
            </div>
          </div>
        );

      case "security":
      case "notifications":
      case "appearance":
      case "integrations":
      case "data":
      case "app":
      default:
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">{(CATEGORIES.find((c) => c.id === active) || {}).label || "Settings"}</h2>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-sm text-gray-600">Content for &quot;{active}&quot; settings — keep or replace with your existing sections.</div>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f6faf5]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Settings" subtitle="Manage your account & app preferences" />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* left column: categories */}
            <aside className="md:col-span-1">
              <div className="bg-white rounded-xl border border-gray-100 p-3 sticky top-6">
                <div className="text-sm text-gray-600 mb-3">Settings</div>
                <div className="space-y-1">
                  {CATEGORIES.map((c) => (
                    <NavItem key={c.id} id={c.id} label={c.label} />
                  ))}
                </div>
              </div>
            </aside>

            {/* right / content */}
            <section className="md:col-span-3">{renderContent()}</section>
          </div>
        </main>
      </div>
    </div>
  );

  function NavItem({ id, label }) {
    const activeCls = id === active ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50 text-gray-700";
    return (
      <button onClick={() => setActive(id)} className={`w-full text-left px-3 py-2 rounded-md transition ${activeCls}`}>
        {label}
      </button>
    );
  }
}
