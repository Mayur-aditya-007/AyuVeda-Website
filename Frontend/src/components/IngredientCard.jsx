// src/components/explore/IngredientCard.jsx
import React from "react";

/**
 * IngredientCard (simplified)
 * - Clean layout: image, name, category, short excerpt
 * - Shows dosha badge but hides detailed medical info
 * - Full profile shown on detail page
 */

export default function IngredientCard({ item, onClick = () => {} }) {
  // Normalize fields from TheMealDB or generic item object
  const name = item.strMeal || item.strIngredient || item.name || item.title || "Unknown ingredient";
  const image = item.strMealThumb || item.image || item.thumbnail || "";
  const category = item.strCategory || item.category || "Ingredient";
  const area = item.strArea || item.area || "";
  const excerpt =
    (item.strInstructions && item.strInstructions.slice(0, 90)) ||
    (item.description && item.description.slice(0, 90)) ||
    "Traditional Ayurvedic ingredient.";

  // Very simple dosha badge (mock for demo)
  const dosha = name.toLowerCase().includes("ginger")
    ? "Kapha ↓"
    : name.toLowerCase().includes("turmeric")
    ? "Pitta ↓"
    : "Tridoshic";

  return (
    <article
      onClick={onClick}
      className="cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition"
      role="button"
      aria-label={`Open details for ${name}`}
    >
      <div className="relative w-full h-44 bg-gray-50">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 font-semibold">
            {name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase()}
          </div>
        )}

        <div className="absolute left-3 top-3 px-2 py-1 rounded-md bg-emerald-600/90 text-xs text-white">
          {category}
        </div>
        <div className="absolute right-3 top-3 px-2 py-1 rounded-md bg-white/80 text-xs text-gray-800">
          {dosha}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
        {area && <div className="text-xs text-gray-500 mt-0.5">{area}</div>}
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{excerpt}</p>
      </div>
    </article>
  );
}
