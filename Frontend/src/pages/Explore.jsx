// src/pages/Explore.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import SearchBar from "../components/explore/SearchBar";
import IngredientGrid from "../components/explore/IngredientGrid";

/**
 * Explore page
 * - Shows Ayurvedic / medicinal ingredient cards (not a food-order UI)
 * - Shows YouTube-like skeletons while loading
 * - Uses TheMealDB only as a demo source (replace with your medicinal API later)
 */

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [imageSearchDataUrl, setImageSearchDataUrl] = useState(null);
  const [filters, setFilters] = useState({ type: "all", dosha: "all" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function doSearch() {
      setLoading(true);

      try {
        // If nothing searched, show "latest" - demo uses a few seeds and flattens results.
        if (!query && !imageSearchDataUrl) {
          const seeds = ["turmeric", "ginger", "rice", "lentil", "chicken"];
          const combined = [];
          for (let s of seeds) {
            if (cancelled) return;
            try {
              const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(s)}`);
              const json = await r.json();
              if (json?.meals) combined.push(...json.meals);
            } catch (e) {
              // ignore network errors for demo
            }
            if (combined.length > 18) break;
          }
          if (!cancelled) setResults(combined.slice(0, 24));
          return;
        }

        // Image-search demo path: map to a sample query
        if (imageSearchDataUrl) {
          // TODO: POST image to real image search backend and receive matches
          const demoQuery = "ginger";
          const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${demoQuery}`);
          const json = await r.json();
          if (!cancelled) setResults(json?.meals || []);
          return;
        }

        // Text search
        const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
        const json = await r.json();
        if (!cancelled) setResults(json?.meals || []);
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
  }, [query, imageSearchDataUrl]);

  function handleCardClick(item) {
    // navigate to detail page, pass the item and generated medical profile via state
    navigate(`/explore/item/${item.idMeal || item.id}`, { state: { item } });
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
              onImageSearch={(dataUrl) => setImageSearchDataUrl(dataUrl)}
              imagePreview={imageSearchDataUrl}
            />

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                {query
                  ? `Results for “${query}”`
                  : imageSearchDataUrl
                  ? "Image-based matches"
                  : "New & latest medicinal ingredients"}
              </h2>

              <IngredientGrid items={results} loading={loading} onCardClick={handleCardClick} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
