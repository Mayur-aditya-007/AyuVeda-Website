// src/pages/FoodDetail.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

/**
 * FoodDetail.jsx — cleaned layout using --pillnav-height (no duplicate top gaps)
 * Shows skeleton while loading, and then the detail content.
 */

function SkeletonImage() {
  return <div className="w-full h-64 md:h-80 bg-gray-200 rounded-lg" />;
}
function SkeletonLine({ w = "w-3/4", h = "h-4" }) {
  return <div className={`${w} ${h} bg-gray-200 rounded-md`} />;
}
function SkeletonSmall() {
  return <div className="h-8 w-20 bg-gray-200 rounded" />;
}
function SkeletonChip() {
  return <div className="h-8 w-28 bg-gray-200 rounded-full" />;
}

export default function FoodDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateMeal = location.state?.item || location.state?.meal;
  const [meal, setMeal] = useState(stateMeal || null);
  const [loading, setLoading] = useState(!stateMeal);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (meal || !id) return;
    let cancelled = false;

    async function fetchById() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`).then((r) => r.json());
        if (!cancelled) {
          const m = res?.meals?.[0] || null;
          setMeal(m);
          setNotFound(!m);
        }
      } catch (e) {
        if (!cancelled) {
          setMeal(null);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchById();
    return () => {
      cancelled = true;
    };
  }, [id, meal]);

  // Layout: Sidebar + main, and main uses paddingTop from CSS var (only once)
  return (
    <div className="min-h-screen flex bg-[#f6faf5]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title={meal?.strMeal || "Item"} />

        <main
          className="flex-1 p-6"
          // Use the single source-of-truth for nav spacing
          style={{ paddingTop: "var(--pillnav-height, 0px)" }}
        >
          <div className="max-w-4xl mx-auto relative">
            {/* simple small back button */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition shadow-sm"
              aria-label="Go back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {loading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <div className="overflow-hidden rounded-lg">
                      <SkeletonImage />
                    </div>
                  </div>

                  <div className="md:w-1/2 flex flex-col">
                    <div className="space-y-3">
                      <SkeletonLine w="w-3/4" h="h-6" />
                      <div className="flex items-center gap-3">
                        <SkeletonLine w="w-1/3" h="h-4" />
                        <SkeletonSmall />
                      </div>

                      <div className="mt-2">
                        <SkeletonLine w="w-full" h="h-3" />
                        <div className="mt-2 space-y-2">
                          <SkeletonLine w="w-5/6" h="h-3" />
                          <SkeletonLine w="w-4/6" h="h-3" />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <SkeletonSmall />
                        <SkeletonSmall />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <SkeletonLine w="w-2/5" h="h-5" />
                  <div className="space-y-2">
                    <SkeletonLine w="w-full" />
                    <SkeletonLine w="w-full" />
                    <SkeletonLine w="w-11/12" />
                    <SkeletonLine w="w-10/12" />
                  </div>
                </div>

                <div className="mt-6">
                  <SkeletonLine w="w-2/5" h="h-5" />
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="p-3 bg-gray-100 rounded-md">
                        <SkeletonChip />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-100 rounded-md">
                    <SkeletonLine w="w-3/4" />
                  </div>
                  <div className="p-3 bg-gray-100 rounded-md">
                    <SkeletonLine w="w-3/4" />
                  </div>
                  <div className="p-3 bg-gray-100 rounded-md">
                    <SkeletonLine w="w-3/4" />
                  </div>
                </div>
              </div>
            ) : notFound ? (
              <div className="p-8 bg-white rounded-xl shadow-sm text-gray-600">
                <div className="text-lg font-semibold mb-2">Item not found</div>
                <div className="text-sm text-gray-500 mb-4">We couldn't find the item you're looking for.</div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Go back</button>
                  <button onClick={() => (window.location.href = "/explore")} className="px-3 py-2 rounded-md bg-emerald-600 text-white">Explore ingredients</button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <img src={meal?.strMealThumb} alt={meal?.strMeal} className="w-full h-64 md:h-80 object-cover rounded-lg border border-gray-100 shadow" />
                  </div>

                  <div className="md:w-1/2 flex flex-col">
                    <h1 className="text-2xl font-semibold text-gray-800">{meal?.strMeal}</h1>
                    <div className="text-sm text-gray-500 mt-1">{meal?.strCategory} {meal?.strArea ? `• ${meal?.strArea}` : ""}</div>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700">Ayurvedic Notes</h3>
                      <div className="mt-2 text-sm text-gray-600">
                        <div><strong>Dosha:</strong> <span className="text-gray-800">Pitta — cooling</span></div>
                        <ul className="list-disc list-inside mt-2 text-gray-600">
                          <li>Cooling</li>
                          <li>Digestive support</li>
                        </ul>
                        <div className="mt-3 text-sm text-gray-700"><strong>Pair with:</strong> Coriander, ghee</div>
                        <div className="mt-1 text-sm text-rose-500"><strong>Avoid:</strong> Very spicy foods</div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-500 transition">Save</button>
                      <button className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition">Share</button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800">Recipe / Description</h3>
                  <p className="mt-2 text-gray-700 text-sm leading-relaxed">
                    {meal?.strInstructions?.slice(0, 1000) || "No description available."}
                    {meal?.strInstructions && meal?.strInstructions.length > 1000 ? "..." : ""}
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">Ingredients</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const ing = meal?.[`strIngredient${i + 1}`];
                      const measure = meal?.[`strMeasure${i + 1}`];
                      if (!ing) return null;
                      return (
                        <div key={i} className="p-3 bg-gray-50 rounded-md border border-gray-100">
                          <div className="font-medium text-gray-800 text-sm">{ing}</div>
                          <div className="text-xs text-gray-500 mt-1">{measure}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                    <div className="text-xs text-gray-500">Calories</div>
                    <div className="font-semibold text-gray-800">~250 kcal</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                    <div className="text-xs text-gray-500">Taste (Rasa)</div>
                    <div className="font-semibold text-gray-800">Sweet • Salty</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                    <div className="text-xs text-gray-500">Energy</div>
                    <div className="font-semibold text-gray-800">Heating</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
