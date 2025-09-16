// src/components/explore/SearchBar.jsx
import React, { useRef, useState } from "react";
import CameraSearchButton from "../CameraSearchButton";

export default function SearchBar({
  query,
  setQuery,
  filters,
  setFilters,
  onImageSearch,
  imagePreview,
}) {
  const fileInputRef = useRef(null);
  const [localQuery, setLocalQuery] = useState(query || "");

  // Camera returns a Blob -> convert to data URL for preview
  async function handleCameraCapture(blob) {
    const dataUrl = await blobToDataURL(blob);
    onImageSearch?.(dataUrl);
  }

  function blobToDataURL(blob) {
    return new Promise((res) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  function submitSearch(e) {
    e?.preventDefault();
    setQuery(localQuery.trim());
  }

  function onUploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    blobToDataURL(file).then(onImageSearch);
    e.target.value = "";
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-emerald-100 shadow-sm p-3">
      <form onSubmit={submitSearch} className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          {imagePreview ? (
            <div className="flex items-center gap-3">
              <img
                src={imagePreview}
                alt="searched"
                className="w-20 h-20 object-cover rounded-lg border border-gray-100 shadow-sm"
              />
              <div className="flex-1">
                <div className="text-sm text-gray-800 font-medium">Image search</div>
                <div className="text-xs text-gray-500">Showing matches for the uploaded photo</div>
              </div>
              <button
                type="button"
                onClick={() => onImageSearch(null)}
                className="text-sm text-gray-500 hover:text-gray-800 transition ml-2"
              >
                Clear
              </button>
            </div>
          ) : (
            <input
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search ingredients, dishes, herbs..."
              className="w-full bg-transparent outline-none placeholder:text-gray-400 text-gray-800 px-3 py-2 rounded-lg"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* quick filters */}
          <select
            value={filters.dosha}
            onChange={(e) => setFilters((f) => ({ ...f, dosha: e.target.value }))}
            className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-md border border-emerald-100"
            aria-label="Dosha"
          >
            <option value="all">All Doshas</option>
            <option value="vata">Vata</option>
            <option value="pitta">Pitta</option>
            <option value="kapha">Kapha</option>
          </select>

          {/* camera button (reused) */}
          <CameraSearchButton
            size={44}
            onCapture={handleCameraCapture}
            className="shadow"
          />

          {/* upload fallback */}
          <button
            type="button"
            className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-500 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onUploadFile} />

          <button
            type="submit"
            className="px-3 py-2 rounded-md bg-gray-100 text-gray-800 text-sm hover:bg-gray-200 transition"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
