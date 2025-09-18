import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import IngredientCard from "./IngredientCard"; // make sure this exists

export default function CameraSearchButton({ size = 40, className = "" }) {
  const [open, setOpen] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [showCard, setShowCard] = useState(false);

  const [threshold, setThreshold] = useState(50); // default 50%
  const [minConf, setMinConf] = useState(40);     // default 40%

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const intervalRef = useRef(null);

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
          startLiveDetection();
        }
      } catch (err) {
        console.warn("Camera not available:", err);
        setStreamActive(false);
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stopStream();
      stopLiveDetection();
    };
  }, [open]);

  function stopStream() {
    const s = mediaStreamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      setStreamActive(false);
    }
  }

  function startLiveDetection() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      captureFrameAndPredict();
    }, 2000); // every 2 seconds
  }

  function stopLiveDetection() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function captureFrameAndPredict() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = canvasRef.current || document.createElement("canvas");
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    const blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    );
    if (!blob) return;

    const formData = new FormData();
    formData.append("file", blob);
    formData.append("threshold-range", threshold);
    formData.append("min-conf", minConf);

    try {
      const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Server error:", res.statusText);
        return;
      }

      const data = await res.json();

      if (data && data.accuracy >= 60) {
        setPrediction(data);
        setShowCard(true);
        stopLiveDetection(); // stop after first detection
      }
    } catch (err) {
      console.error("Prediction error:", err);
    }
  }

  function closeModal() {
    setOpen(false);
    stopStream();
    stopLiveDetection();
    setShowCard(false);
  }

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-4xl aspect-[4/3] sm:rounded-2xl overflow-hidden shadow-xl border border-emerald-500/20 bg-black p-2">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2"
        >
          ✕
        </button>

        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
          style={{ display: streamActive ? "block" : "none" }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Sliders for threshold and min-conf */}
        <div className="absolute bottom-2 left-2 text-white bg-black/50 p-2 rounded space-y-2">
          <div>
            <label>Threshold: {threshold}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
          <div>
            <label>Min Confidence: {minConf}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={minConf}
              onChange={(e) => setMinConf(e.target.value)}
            />
          </div>
        </div>

        {/* IngredientCard popup */}
        {showCard && prediction && (
          <IngredientCard
            prediction={prediction}
            onClose={() => setShowCard(false)}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center rounded-full bg-white/5 hover:bg-emerald-700/30 p-1 ${className}`}
        style={{ width: size, height: size }}
      >
        📷
      </button>
      {typeof document !== "undefined" && open
        ? createPortal(modal, document.body)
        : null}
    </>
  );
}
