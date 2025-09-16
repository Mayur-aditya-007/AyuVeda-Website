// src/components/explore/IngredientGrid.jsx
import React from "react";
import IngredientCard from "../IngredientCard";

/**
 * IngredientGrid
 * - Shows YouTube-style skeleton placeholders when loading
 * - Otherwise renders a responsive masonry-like grid
 */

function SkeletonCard() {
  // skeleton resembling a card with image + 3 lines of text + tags
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="w-full h-44 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="flex gap-2 mt-2">
          <div className="h-6 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-12 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function IngredientGrid({ items = [], loading = false, onCardClick = () => {} }) {
  if (loading) {
    // Render a grid of skeletons (YouTube-like placeholders)
    const skeletons = Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />);
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{skeletons}</div>;
  }

  if (!items || items.length === 0) {
    return <div className="py-16 text-center text-gray-600">No results found.</div>;
  }

  return (
    // simple responsive grid (masonry-like effect optional via CSS columns; here use grid for layout stability)
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((it) => (
        <IngredientCard key={it.idMeal || it.id || it.idIngredient || it.name} item={it} onClick={() => onCardClick(it)} />
      ))}
    </div>
  );
}
