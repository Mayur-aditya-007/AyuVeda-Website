import React, { useState } from "react";

/**
 * AyurvedaButton
 * - Hover: gradient slides across the button
 * - Click: color ripple + small leaf-burst animation at pointer
 */
let rippleId = 0;

export default function AyurvedaButton({
  children,
  className = "",
  style = {},
  ...props
}) {
  const [bursts, setBursts] = useState([]);

  function handlePointerDown(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId;

    // pick color variant from theme
    const colors = [
      "rgba(58,125,68,0.95)",   // leaf green
      "rgba(212,160,23,0.92)",  // chandan gold
      "rgba(107,66,38,0.92)"    // wood brown
    ];
    const color = colors[id % colors.length];

    const newBurst = { id, x, y, color };
    setBursts((b) => [...b, newBurst]);

    // cleanup after animation
    setTimeout(() => {
      setBursts((b) => b.filter((p) => p.id !== id));
    }, 900);

    if (props.onPointerDown) props.onPointerDown(e);
  }

  return (
    <button
      {...props}
      onPointerDown={handlePointerDown}
      className={`ayur-btn group relative inline-block px-8 py-3 rounded-2xl font-bold text-white tracking-wider shadow-2xl overflow-visible ${className}`}
      style={{
        // fallback inline gradient (kept, but main animation controlled by CSS)
        background:
          "linear-gradient(90deg, #3A7D44 0%, #D4A017 50%, #6B4226 100%)",
        ...style,
      }}
    >
      {/* Sliding gradient overlay (animated via CSS on hover) */}
      <span
        aria-hidden
        className="ayur-gradient-layer absolute inset-0 rounded-2xl pointer-events-none"
      />

      {/* subtle blurred leak that grows on hover */}
      <span
        aria-hidden
        className="ayur-leak absolute inset-0 rounded-2xl pointer-events-none"
      />

      {/* bursts (ripples + leaf icons) */}
      <span className="ayur-burst-layer pointer-events-none absolute inset-0">
        {bursts.map((b) => (
          <span key={b.id}>
            {/* color ripple */}
            <span
              className="ayur-ripple"
              style={{
                left: b.x,
                top: b.y,
                background: b.color,
              }}
            />
            {/* three tiny leaves that fly out */}
            <svg
              className="ayur-leaf ayur-leaf-1"
              style={{ left: b.x, top: b.y }}
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path d="M12 2c0 0-6 3-6 9 0 5.523 6 11 6 11s6-5.477 6-11c0-6-6-9-6-9z" fill={b.color} />
            </svg>
            <svg
              className="ayur-leaf ayur-leaf-2"
              style={{ left: b.x, top: b.y }}
              viewBox="0 0 24 24"
              width="14"
              height="14"
            >
              <path d="M12 2c0 0-6 3-6 9 0 5.523 6 11 6 11s6-5.477 6-11c0-6-6-9-6-9z" fill={b.color} />
            </svg>
            <svg
              className="ayur-leaf ayur-leaf-3"
              style={{ left: b.x, top: b.y }}
              viewBox="0 0 24 24"
              width="12"
              height="12"
            >
              <path d="M12 2c0 0-6 3-6 9 0 5.523 6 11 6 11s6-5.477 6-11c0-6-6-9-6-9z" fill={b.color} />
            </svg>
          </span>
        ))}
      </span>

      {/* button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>

      {/* component-scoped CSS */}
      <style>{`
        /* base gradient layer uses a wide background-size so sliding feels smooth */
        .ayur-btn {
          position: relative;
          border: none;
          padding-left: 2.25rem;
          padding-right: 2.25rem;
        }

        .ayur-gradient-layer {
          background-image: linear-gradient(120deg, #3A7D44 0%, #D4A017 45%, #6B4226 100%);
          background-size: 220% 220%;
          background-position: 0% 50%;
          transition: background-position 700ms cubic-bezier(.2,.9,.2,1), transform 700ms cubic-bezier(.2,.9,.2,1), opacity 400ms;
          z-index: 0;
        }

        /* on hover the gradient slides — gives impression of rotating/moving color inside */
        .ayur-btn:hover > .ayur-gradient-layer {
          background-position: 100% 50%;
          transform: scale(1.02);
        }

        /* subtle blurred color leak that grows and shifts */
        .ayur-leak {
          background:
            radial-gradient(circle at 10% 20%, rgba(58,125,68,0.28), transparent 12%),
            radial-gradient(circle at 90% 80%, rgba(107,66,38,0.22), transparent 12%),
            radial-gradient(circle at 50% 50%, rgba(212,160,23,0.18), transparent 18%);
          filter: blur(14px);
          opacity: 0;
          transform: scale(0.98);
          transition: opacity 420ms ease, transform 480ms cubic-bezier(.2,.9,.2,1);
          z-index: 0;
        }

        .ayur-btn:hover > .ayur-leak {
          opacity: 1;
          transform: scale(1.06) translateY(-6px);
        }

        /* burst container */
        .ayur-burst-layer { z-index: 1; pointer-events: none; position: absolute; inset: 0; }

        /* ripple core: expands and fades */
        .ayur-ripple {
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          transform: translate(-50%,-50%) scale(0.08);
          opacity: 0.9;
          filter: blur(4px);
          animation: ayur-ripple 820ms forwards cubic-bezier(.2,.9,.2,1);
        }

        @keyframes ayur-ripple {
          0% {
            transform: translate(-50%,-50%) scale(0.08);
            opacity: 0.9;
            filter: blur(4px);
          }
          40% {
            transform: translate(-50%,-50%) scale(1.8);
            opacity: 0.7;
            filter: blur(6px);
          }
          100% {
            transform: translate(-50%,-50%) scale(6.6);
            opacity: 0;
            filter: blur(18px);
          }
        }

        /* leaf burst — each leaf has its own path/rotation and fades */
        .ayur-leaf {
          position: absolute;
          transform-origin: center;
          opacity: 0.98;
          pointer-events: none;
        }

        .ayur-leaf-1 {
          animation: ayur-leaf1 820ms forwards cubic-bezier(.2,.9,.2,1);
        }
        .ayur-leaf-2 {
          animation: ayur-leaf2 880ms forwards cubic-bezier(.2,.9,.2,1);
        }
        .ayur-leaf-3 {
          animation: ayur-leaf3 760ms forwards cubic-bezier(.2,.9,.2,1);
        }

        @keyframes ayur-leaf1 {
          0% { transform: translate(-50%,-50%) rotate(0deg) scale(0.6); opacity:1; }
          50% { transform: translate(-90%,-160%) rotate(-20deg) scale(0.9); opacity:0.9; }
          100% { transform: translate(-140%,-260%) rotate(-40deg) scale(1.15); opacity:0; }
        }

        @keyframes ayur-leaf2 {
          0% { transform: translate(-50%,-50%) rotate(0deg) scale(0.5); opacity:1; }
          50% { transform: translate(40%,-140%) rotate(10deg) scale(0.85); opacity:0.9; }
          100% { transform: translate(120%,-200%) rotate(30deg) scale(1); opacity:0; }
        }

        @keyframes ayur-leaf3 {
          0% { transform: translate(-50%,-50%) rotate(0deg) scale(0.45); opacity:1; }
          50% { transform: translate(-40%,60%) rotate(6deg) scale(0.75); opacity:0.9; }
          100% { transform: translate(-110%,180%) rotate(18deg) scale(0.95); opacity:0; }
        }

        /* press feedback: quick inward scale */
        .ayur-btn:active {
          transform: translateY(1px) scale(0.992);
        }
      `}</style>
    </button>
  );
}
