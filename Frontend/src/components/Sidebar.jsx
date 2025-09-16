// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Sidebar for AyuVeda
 * - white vertical bar with green active pill
 * - accepts `items` but defaults to AyuVeda sections
 */

const defaultItems = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: "home" },
  { key: "ask-ai", label: "Ask-Ai", to: "/ask-ai", icon: "spark" },
  { key: "explore", label: "Explore", to: "/explore", icon: "compass" },
  { key: "ai-diet", label: "AI Diet Plans", to: "/ai-diet", icon: "diet" },
  { key: "remedies", label: "Health Remedies", to: "/remedies", icon: "leaf" },
  { key: "doctor", label: "Doctor Connect", to: "/doctor", icon: "phone" },
  { key: "profile", label: "My Profile", to: "/profile", icon: "user" },
];

export default function Sidebar({ items = defaultItems, className = "" }) {
  return (
    <aside
      className={`w-72 min-h-screen bg-white rounded-tr-2xl rounded-br-2xl shadow-lg border-r border-gray-100 p-4 ${className}`}
      aria-label="Primary"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-1 py-2 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-green-600 text-white font-bold text-lg">
          A
        </div>
        <div>
          <div className="text-sm font-extrabold text-gray-900">AYUVEDA</div>
          <div className="text-xs text-green-600/90">Where Ayurveda meets AI</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2" role="navigation" aria-label="Main">
        {items.map((it) => (
          <NavLink
            key={it.key}
            to={it.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
               ${isActive ? "bg-green-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-50"}`
            }
          >
            <Icon name={it.icon} className="w-5 h-5 flex-none" />
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Settings link at bottom */}
      <div className="mt-auto pt-6">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition
             ${isActive ? "bg-green-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-50"}`
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Settings
        </NavLink>
      </div>
    </aside>
  );
}

/* Icon helper */
function Icon({ name, className = "" }) {
  const base = `text-green-600 ${className}`;
  switch (name) {
    case "home":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 21V12h14v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "spark":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2v4M12 18v4M4 12h4M16 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "compass":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 10l4-2 2 4-4 2-2-4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "diet":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 7c.5 4 1.5 6 6 6s5.5-2 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "leaf":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M20 4c-4 4-8 6-12 8-3 1-6 3-6 8 5-1 7-4 8-6 2-4 4-8 10-10z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "phone":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M22 16.92v3a1 1 0 0 1-1.11 1 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3.08 3.11 1 1 0 0 1 4 2h3a1 1 0 0 1 1 .75c.2.88.56 2.07 1.08 3.48a1 1 0 0 1-.24 1l-1.27 1.27a16 16 0 0 0 6 6l1.27-1.27a1 1 0 0 1 1-.24c1.41.52 2.6.88 3.48 1.08A1 1 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "user":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      );
  }
}
