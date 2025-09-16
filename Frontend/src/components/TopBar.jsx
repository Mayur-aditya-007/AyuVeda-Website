// src/components/TopBar.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraSearchButton from "./CameraSearchButton";
import { useUser } from "../contexts/UserContext";

/**
 * TopBar with combined avatar + greeting trigger that opens a full dropdown panel.
 *
 * Trigger: [ avatar | "Hey, Mayur" ] — clicking opens dropdown.
 * Dropdown contains:
 *  - user header (avatar, name, email)
 *  - primary actions: Profile, Settings, Saved
 *  - secondary: Help, Logout
 */
export default function TopBar({
  title = "Page Title",
  subtitle = "",
  onCameraCapture = async ({ blob, dataUrl }) => { /* noop */ },
}) {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const firstName = (user?.nickname) || (user?.name ? user.name.split(" ")[0] : "there");
  const initials = user?.initials || (user?.name ? user.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase() : "U");
  const avatarUrl = user?.avatarUrl || null;

  function openProfile() {
    setOpen(false);
    navigate("/profile");
  }
  function openSettings() {
    setOpen(false);
    navigate("/settings");
  }
  function openSaved() {
    setOpen(false);
    navigate("/saved");
  }
  function doLogout() {
    setOpen(false);
    logout();
    navigate("/");
  }

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-4">
        {/* camera button */}
        <div title="Search food by camera" className="relative rounded-full overflow-hidden" style={{ width: 40, height: 40 }}>
          <CameraSearchButton onCapture={onCameraCapture} size={40} className="w-full h-full" />
        </div>

        {/* combined trigger + dropdown */}
        <div className="relative" ref={rootRef}>
          <button
            onClick={() => setOpen(o => !o)}
            aria-haspopup="true"
            aria-expanded={open}
            className="inline-flex items-center gap-3 px-3 py-2 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md focus:outline-none"
            title={user?.name || "Account"}
          >
            {/* avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                  {initials}
                </div>
              )}
            </div>

            {/* greeting */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-medium text-gray-900">Hey, {firstName}</span>
            </div>

            {/* chevron */}
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.66a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Dropdown panel */}
          {open && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-50">
              {/* user header */}
              <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{user?.name || firstName}</div>
                  {user?.email && <div className="text-xs text-gray-500 truncate">{user.email}</div>}
                </div>
              </div>

              {/* primary actions */}
              <div className="py-2">
                <button onClick={openProfile} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</button>
                <button onClick={openSettings} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</button>
                <button onClick={openSaved} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Saved</button>
              </div>

              <div className="border-t border-gray-100" />

              {/* secondary actions */}
              <div className="py-2">
                <button onClick={() => { setOpen(false); navigate("/help"); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Help</button>
                <button onClick={doLogout} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-gray-50">Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
