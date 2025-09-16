// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import AyurvedaButton from "../components/AyurvedaButton";

/**
 * Dashboard page (AyuVeda)
 * - Left: Sidebar
 * - Top: TopBar
 * - Main: KPI cards, Meal Timing Guide, Today's Meals
 * - Right: Six Tastes balance
 *
 * Presentational: plug your API/data where indicated.
 */

const kpis = [
  { id: "cal", value: "1,240", label: "Calories Today", sub: "Goal: 1,800", color: "text-green-600", bg: "bg-green-50" },
  { id: "tastes", value: "6/6", label: "Tastes Balanced", sub: "All six covered", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "score", value: "8.5", label: "Wellness Score", sub: "Excellent", color: "text-amber-600", bg: "bg-amber-50" },
];

const mealTimings = [
  { id: 1, label: "Breakfast", time: "7:00 - 9:00 AM", state: "on" },
  { id: 2, label: "Lunch", time: "12:00 - 2:00 PM", state: "on" },
  { id: 3, label: "Dinner", time: "6:00 - 8:00 PM", state: "maybe" },
];

const todaysMeals = [
  { id: 1, title: "Warm Oatmeal with Almonds", time: "8:00 AM • Breakfast", cal: 320, tags: ["Warm", "Heavy", "Sweet", "Astringent"], dosha: "Vata ↑" },
  { id: 2, title: "Lentil Soup & Greens", time: "1:00 PM • Lunch", cal: 420, tags: ["Light", "Pungent", "Bitter"], dosha: "Pitta ↔" },
];

const tastes = [
  { id: "sweet", label: "Sweet", pct: 85 },
  { id: "sour", label: "Sour", pct: 60 },
  { id: "salty", label: "Salty", pct: 40 },
  { id: "pungent", label: "Pungent", pct: 70 },
  { id: "bitter", label: "Bitter", pct: 90 },
  { id: "astringent", label: "Astringent", pct: 55 },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-[#f6faf5]">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <TopBar
          title="Dashboard"
          subtitle="Your personalized Ayurvedic wellness dashboard"
          pages={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Ask-Ai", to: "/ask-ai" },
            { label: "Explore", to: "/explore" }
          ]}
          user={{ name: "John Smith", initials: "JS", meta: "Premium Member" }}
          onLogout={() => {
            // Example logout flow; replace with your auth cleanup
            localStorage.removeItem("token");
            navigate("/get-in");
          }}
        />

        <div className="flex-1 p-8 overflow-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Left / main column */}
            <div className="col-span-12 lg:col-span-8">
              {/* KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {kpis.map((k) => (
                  <div key={k.id} className={`p-5 rounded-xl ${k.bg} border border-transparent shadow-sm`}>
                    <div className={`text-3xl font-extrabold tracking-tight ${k.color}`}>{k.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{k.label}</div>
                    <div className="text-xs text-gray-400 mt-3">{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Meal Timing Guide */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Meal Timing Guide</h3>
                  <span className="text-sm text-gray-500">Recommended windows</span>
                </div>

                <div className="mt-4 space-y-3">
                  {mealTimings.map((m) => (
                    <div key={m.id} className="flex items-center justify-between bg-gradient-to-r from-white to-gray-50 p-3 rounded-lg border border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-semibold">
                          {m.label[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{m.label}</div>
                          <div className="text-xs text-gray-500">{m.state === "on" ? "Recommended" : "Optional"}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">{m.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Meals */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Today's Meals</h3>
                  <AyurvedaButton className="px-4 py-2">+ Add Meal</AyurvedaButton>
                </div>

                <div className="space-y-4">
                  {todaysMeals.map((meal) => (
                    <div key={meal.id} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-start shadow-sm">
                      <div>
                        <div className="font-semibold text-gray-900">{meal.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{meal.time}</div>

                        <div className="mt-3 flex flex-wrap gap-2 items-center">
                          {meal.tags.map((t) => (
                            <span key={t} className="text-xs px-2 py-1 rounded-full bg-gray-50 border text-gray-600">{t}</span>
                          ))}
                          <span className="text-xs px-2 py-1 rounded-full bg-amber-50 border text-amber-700 ml-2">{meal.dosha}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-gray-900">{meal.cal} cal</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <aside className="col-span-12 lg:col-span-4">
              <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Six Tastes Balance</h4>
                <div className="space-y-4">
                  {tastes.map((t) => (
                    <div key={t.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium text-purple-700">{t.label}</div>
                        <div className="text-sm text-gray-500">{t.pct}%</div>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div className="h-3 rounded-full bg-black" style={{ width: `${t.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Today's Balance</h5>
                <p className="text-xs text-gray-600">You're doing great! Consider adding more salty foods if needed.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
