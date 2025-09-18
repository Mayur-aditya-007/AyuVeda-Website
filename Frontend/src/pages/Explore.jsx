import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import SearchBar from "../components/explore/SearchBar";
import IngredientGrid from "../components/explore/IngredientGrid";
import { ayurvedicIngredients } from "../data/ayurvedicIngredients";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ type: "all", dosha: "all" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    function doSearch() {
      setLoading(true);

      try {
        let filtered = ayurvedicIngredients;

        // Search
        if (query) {
          filtered = filtered.filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase())
          );
        }

        // Filter by type
        if (filters.type !== "all") {
          filtered = filtered.filter((item) => item.type === filters.type);
        }

        // Filter by dosha
        if (filters.dosha !== "all") {
          filtered = filtered.filter((item) =>
            item.doshaEffect.toLowerCase().includes(filters.dosha.toLowerCase())
          );
        }

        if (!cancelled) setResults(filtered);
      } catch (err) {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    doSearch();
    return () => {
      cancelled = true;
    };
  }, [query, filters]);

  function handleCardClick(item) {
    navigate(`/explore/item/${item.id}`, { state: { item } });
  }

  return (
    <div className="min-h-screen flex bg-[#f6faf5]">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <TopBar
          title="Explore"
          subtitle="Clinical & Ayurvedic profiles for ingredients"
          pages={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Ask-Ai", to: "/ask-ai" },
            { label: "Explore", to: "/explore" },
          ]}
          user={{ name: "You", initials: "Y", meta: "Member" }}
        />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <SearchBar
              query={query}
              setQuery={setQuery}
              filters={filters}
              setFilters={setFilters}
            />

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                {query ? `Results for “${query}”` : "Ayurvedic Ingredients"}
              </h2>

              <IngredientGrid
                items={results}
                loading={loading}
                onCardClick={handleCardClick}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
