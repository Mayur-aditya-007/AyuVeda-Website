// src/components/ChatInput.jsx
import React, { useRef, useState } from "react";
import AyurvedaButton from "./AyurvedaButton";
import CameraSearchButton from "./CameraSearchButton";

/**
 * ChatInput (camera debug & robust)
 *
 * - Passes onCapture to CameraSearchButton and logs events
 * - If CameraSearchButton is missing or fails, falls back to file input
 * - Shows small UI feedback for camera / permission issues
 *
 * Props (same as before):
 * - value, onChange, onSend, onCapture, placeholder
 */

export default function ChatInput({
  value = "",
  onChange = () => {},
  onSend = () => {},
  onCapture = () => {},
  placeholder = "Ask me about herbs, remedies..."
}) {
  const fileRef = useRef(null);
  const [micActive, setMicActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [uploading, setUploading] = useState(false);

  function handleFileOpen() {
    fileRef.current?.click();
  }

  function onFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        onCapture({ dataUrl: reader.result, blob: f });
      };
      reader.readAsDataURL(f);
    } else {
      // for audio or other types, call onCapture with blob
      onCapture({ blob: f });
    }
    e.target.value = null;
  }

  function handleMicClick() {
    // placeholder only
    setMicActive((s) => !s);
  }

  // Called when CameraSearchButton provides a capture result.
  // We wrap it to provide console logging + fallback messaging.
  async function handleCameraCapture(payload) {
    // payload expected: { blob, dataUrl } per the CameraSearchButton contract
    console.debug("[ChatInput] camera onCapture payload:", payload);
    if (!payload) {
      setCameraError("No image returned from camera.");
      setTimeout(() => setCameraError(""), 3000);
      return;
    }

    // if we have a dataUrl, pass it up to parent handler
    try {
      setUploading(true);
      // call parent callback
      await onCapture(payload);
    } catch (err) {
      console.error("onCapture handler threw:", err);
      setCameraError("Failed to process capture.");
      setTimeout(() => setCameraError(""), 3000);
    } finally {
      setUploading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const text = (typeof value === "string" ? value : "").trim();
    if (!text) return;
    onSend(text);
  }

  // For browsers that block camera access we give helpful instructions
  function handleCameraFailure(err) {
    console.warn("Camera failure:", err);
    setCameraError("Camera unavailable or permission denied.");
    setTimeout(() => setCameraError(""), 4000);
  }

  // small styles
  const controlStyle = {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "white",
    border: "1px solid #eef6ec",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(16,24,40,0.04)",
    transition: "transform 140ms ease"
  };

  return (
    <div className="p-4 bg-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          {/* left: camera + upload - CameraSearchButton used directly */}
          <div className="flex items-center gap-2">
            {/* CameraSearchButton should handle its own overlay/modal and call onCapture */}
            <div style={controlStyle} className="transform-gpu hover:scale-[1.03]">
               <CameraSearchButton
                          onCapture={handleCameraCapture}
                          className="w-full h-full" // ensure inner scales to wrapper
                          size={40}
                        />
            </div>

            <button
              type="button"
              onClick={handleFileOpen}
              className="inline-flex items-center justify-center"
              style={controlStyle}
              title="Upload image or audio"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3v12" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 7l4-4 4 4" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* main input */}
          <div className="flex-1">
            <div
              className="rounded-full px-4 py-3 flex items-center border"
              style={{
                borderColor: "#c9f0d6",
                background: "white",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)"
              }}
            >
              <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-sm"
                aria-label="Message"
              />

              <div className="text-xs text-gray-400 ml-3 hidden sm:block" style={{ minWidth: 120 }}>
                {uploading ? "Processing…" : cameraError ? cameraError : ""}
              </div>

              {/* mic (visual only) */}
              <button
                type="button"
                onClick={handleMicClick}
                className="ml-3 inline-flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: micActive ? "#ffece8" : "transparent",
                  border: "none"
                }}
                aria-pressed={micActive}
                title="Mic (placeholder)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 1v11" stroke={micActive ? "#c53030" : "#374151"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 11a7 7 0 01-14 0" stroke={micActive ? "#c53030" : "#374151"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 21v-4" stroke={micActive ? "#c53030" : "#374151"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* send */}
          <div>
            <AyurvedaButton
              type="button"
              onClick={submit}
              className="px-6 py-2 transform-gpu hover:scale-[1.03]"
              style={{ borderRadius: 14 }}
            >
              Send
            </AyurvedaButton>
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*,audio/*" style={{ display: "none" }} onChange={onFileChange} />
      </div>
    </div>
  );
}
