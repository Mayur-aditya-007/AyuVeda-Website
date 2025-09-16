// src/components/CameraSearchButton.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function CameraSearchButton({ onCapture = () => {}, size = 40, className = "" }) {
  const [open, setOpen] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setStreamActive(true);
        }
      } catch (err) {
        console.warn("Camera not available:", err);
        setStreamActive(false);
      }
    }

    startCamera();

    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "Enter" && open) capture();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      mounted = false;
      document.removeEventListener("keydown", onKey);
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function stopStream() {
    const s = mediaStreamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      setStreamActive(false);
    }
  }

  function openModal() {
    setOpen(true);
  }
  function closeModal() {
    setOpen(false);
    stopStream();
  }

  async function capture() {
    try {
      const video = videoRef.current;
      if (!video) return;

      const canvas = canvasRef.current || document.createElement("canvas");
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, w, h);

      const blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92);
      });

      if (blob) {
        onCapture(blob);
      }
      closeModal();
    } catch (err) {
      console.error("Capture failed:", err);
    }
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onCapture(file);
    e.target.value = "";
    closeModal();
  }

  function onBackdropClick(e) {
    if (e.target === e.currentTarget) closeModal();
  }

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onMouseDown={onBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />

      {/* modal panel */}
      <div className="relative z-10 w-full max-w-4xl aspect-[4/3] sm:rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.7)] border border-emerald-500/20 bg-[radial-gradient(circle_at_center,rgba(0,60,30,0.9),#021007)]">
        {/* close button (top-right) */}
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
          aria-label="Close camera"
        >
          ✕
        </button>

        {/* video container */}
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
            style={{ display: streamActive ? "block" : "none" }}
          />
          {!streamActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/90 text-sm">
              <p>No camera available or permission denied.</p>
              <p className="text-xs text-white/60">You can upload an image instead.</p>
            </div>
          )}
        </div>

        {/* upload bottom-left */}
        <div className="absolute bottom-5 left-5 flex items-center gap-2 z-20">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-emerald-600/80 text-white font-medium hover:bg-emerald-500 transition"
          >
            Upload
          </button>
        </div>

        {/* shutter bottom-center with glow ring */}
        <div className="absolute bottom-5 inset-x-0 flex justify-center z-20">
          <button
            type="button"
            onClick={capture}
            className="relative inline-flex items-center justify-center rounded-full w-20 h-20 bg-white text-black shadow-[0_0_25px_rgba(0,255,128,0.6)] hover:scale-105 transition-transform"
            aria-label="Capture photo"
          >
            {/* glowing ring */}
            <span className="absolute inset-0 rounded-full border-4 border-emerald-400/70 animate-pulse"></span>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="relative z-10"
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* trigger button */}
      <button
        onClick={openModal}
        className={`inline-flex items-center justify-center rounded-full bg-white/5 hover:bg-emerald-700/30 transition p-1 ${className}`}
        style={{ width: size, height: size }}
        aria-label="Open camera"
      >
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          className="text-emerald-400"
        >
          <path
            d="M4 7h3l2-2h6l2 2h3v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>

      {typeof document !== "undefined" && open ? createPortal(modal, document.body) : null}
    </>
  );
}
