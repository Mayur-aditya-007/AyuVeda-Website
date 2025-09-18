// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useUser } from "../contexts/UserContext";

/**
 * Read-only Profile page
 * - Shows basic details (avatar, name, email, location, stats)
 * - Shows Health Score and Ongoing Diet Plans
 * - Editing is only available in Settings (not here)
 */

export default function ProfilePage() {
  const { user, loading, refreshUser } = useUser();
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [healthScore, setHealthScore] = useState(null);

  // load plans (try localStorage fallback -> demo)
  useEffect(() => {
    let cancelled = false;
    async function loadPlans() {
      setLoadingPlans(true);
      try {
        // try app-specific key first
        const raw = localStorage.getItem("ayu_plans");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!cancelled) {
            setPlans(parsed || []);
            setHealthScore(computeHealthScore(parsed || []));
            setLoadingPlans(false);
            return;
          }
        }

        // try user-local fallback (some pages saved under /api mock)
        const maybe = localStorage.getItem("user_plans");
        if (maybe) {
          const parsed = JSON.parse(maybe);
          if (!cancelled) {
            setPlans(parsed || []);
            setHealthScore(computeHealthScore(parsed || []));
            setLoadingPlans(false);
            return;
          }
        }

        // fallback demo
        const demo = [
          {
            id: "plan-01",
            title: "Cooling Pitta Reset",
            startedAt: "2025-09-01",
            progressPct: 42,
            daysTotal: 21,
            daysCompleted: 9,
            notes: "Focus on cooling herbs, avoid spicy and sour foods.",
          },
          {
            id: "plan-02",
            title: "Vata Grounding Weeklies",
            startedAt: "2025-08-15",
            progressPct: 68,
            daysTotal: 28,
            daysCompleted: 19,
            notes: "Warm soups, ghee and root vegetables emphasized.",
          },
        ];
        if (!cancelled) {
          setPlans(demo);
          setHealthScore(computeHealthScore(demo));
        }
      } catch (e) {
        if (!cancelled) {
          setPlans([]);
          setHealthScore(72);
        }
      } finally {
        if (!cancelled) setLoadingPlans(false);
      }
    }
    loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  // simple health score: either from localStorage or computed
  useEffect(() => {
    const stored = localStorage.getItem("ayu_healthScore");
    if (stored) {
      try {
        setHealthScore(Number(stored));
        return;
      } catch {}
    }
    if (plans && plans.length > 0) setHealthScore(computeHealthScore(plans));
    else setHealthScore(72);
  }, [plans]);

  function computeHealthScore(plansArr) {
    if (!plansArr || plansArr.length === 0) return 72;
    const avg = Math.round(
      plansArr.reduce((s, p) => s + (Number(p.progressPct) || 0), 0) / plansArr.length
    );
    return Math.min(95, Math.max(40, avg + 20));
  }

  function formatDate(iso) {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return iso;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#f6faf5]">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar title="My Profile" />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="p-8 bg-white rounded-xl shadow-sm text-gray-600">Loading profile...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // display fallbacks
  const displayName = user?.name || "Your name";
  const displayEmail = user?.email || "you@example.com";
  const displayLocation = user?.location || "-";
  const displayInitials =
    user?.initials ||
    (user?.name ? user.name.split(" ").map((s) => s?.[0] || "").slice(0, 2).join("").toUpperCase() : "U");
  const avatarUrl = user?.avatarUrl || null;

  return (
    <div className="min-h-screen flex bg-[#f6faf5]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="My Profile" subtitle="Summary of your account" />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header row: profile card + health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* avatar left */}
                  <div className="flex-shrink-0 w-full md:w-44 flex flex-col items-start">
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-2xl">
                          {displayInitials}
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="text-2xl font-semibold text-gray-800">{displayName}</div>
                      <div className="text-sm text-gray-500 mt-1">{displayEmail}</div>
                      {displayLocation !== "-" && <div className="text-sm text-gray-500 mt-1">{displayLocation}</div>}
                    </div>
                  </div>

                  {/* details right */}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-700">Basic details</h3>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Age</div>
                        <div className="text-gray-800">
                          {user?.dob ? (() => {
                            try {
                              const b = new Date(user.dob);
                              const now = new Date();
                              let age = now.getFullYear() - b.getFullYear();
                              const m = now.getMonth() - b.getMonth();
                              if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
                              return age;
                            } catch { return "-"; }
                          })() : "-"}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Gender</div>
                        <div className="text-gray-800">{user?.gender || "-"}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Height</div>
                        <div className="text-gray-800">{user?.height? `${user.height} cm` : "-"}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Weight</div>
                        <div className="text-gray-800">{user?.weight? `${user.weight} kg` : "-"}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Activity</div>
                        <div className="text-gray-800">{user?.activity || "-"}</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="text-gray-800">{user?.phone || "-"}</div>
                      </div>

                      <div className="col-span-2">
                        <div className="text-xs text-gray-500">Notes</div>
                        <div className="text-gray-800 mt-1">{user?.notes || "No notes provided."}</div>
                      </div>
                    </div>

                    {/* small actions */}
                    <div className="mt-5 flex gap-3">
                      <button onClick={() => refreshUser()} className="px-3 py-2 rounded-md bg-gray-100 text-sm hover:bg-gray-200">Refresh</button>
                      <a href="/settings" className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-500">Edit in Settings</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* health score */}
              <aside className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Health Score</div>
                    <div className="text-2xl font-semibold text-gray-800 mt-1">{healthScore ?? "—"}</div>
                    <div className="text-sm text-gray-500 mt-1">Overall progress & wellbeing</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${healthScore ?? 0}%` }} />
                  </div>
                  <div className="mt-3 text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-500">Improve score</button>
                  <button className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">Insights</button>
                </div>
              </aside>
            </div>

            {/* Diet plans list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Ongoing Diet Plans</h3>
                <div className="text-sm text-gray-500">Manage plans in Settings</div>
              </div>

              {loadingPlans ? (
                <div className="p-6 bg-white rounded-xl border border-gray-100 text-gray-500">Loading plans...</div>
              ) : plans.length === 0 ? (
                <div className="p-6 bg-white rounded-xl border border-gray-100 text-gray-500">No active plans.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((p) => (
                    <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800">{p.title}</div>
                          <div className="text-xs text-gray-500 mt-1">Started: {formatDate(p.startedAt)}</div>
                          <div className="text-xs text-gray-500 mt-2">{p.notes}</div>

                          <div className="mt-3">
                            <div className="text-xs text-gray-500 mb-1">Progress</div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div className="h-2 bg-emerald-500" style={{ width: `${p.progressPct}%` }} />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{p.progressPct}% • {p.daysCompleted}/{p.daysTotal} days</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <a href="/settings#profile" className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100">Manage</a>
                          <button onClick={() => alert("Pause plan (implement)")} className="px-3 py-1 rounded-md bg-gray-50 text-gray-700 text-xs hover:bg-gray-100">Pause</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* footer actions */}
            <div className="pt-6 flex justify-end gap-3">
              <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(user || {})); alert("Copied profile JSON"); }} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">Export</button>
              <a href="/settings" className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-500">Go to Settings</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
