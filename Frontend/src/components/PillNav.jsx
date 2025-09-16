// src/components/PillNav.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";

export default function PillNav({
  logo,
  logoAlt = "Logo",
  items = [],
  className = "",
  ease = "power3.out",
  baseColor = "#000000",
  hoveredPillTextColor = "#ffffff",
  pillTextColor = "#000000",
  onMobileMenuClick,
  initialLoadAnimation = true,
  cta = null
}) {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // GSAP refs
  const pillBgRefs = useRef([]);
  const labelRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navRef = useRef(null);

  // 🌿 Leaf green gradient for pill hover
  const LEAF_GRADIENT =
    "linear-gradient(120deg, rgba(76, 175, 80, 0.95) 0%, rgba(46, 125, 50, 0.95) 100%)";

  useEffect(() => {
    const layout = () => {
      pillBgRefs.current.forEach((bgEl, i) => {
        if (!bgEl) return;

        gsap.set(bgEl, { scaleY: 0, transformOrigin: "bottom center" });

        const labelEl = labelRefs.current[i];
        if (labelEl) gsap.set(labelEl, { color: resolvedPillTextColor });

        tlRefs.current[i]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(bgEl, { scaleY: 1, duration: 0.34, ease }, 0);
        if (labelEl)
          tl.to(labelEl, { color: hoveredPillTextColor, duration: 0.22, ease }, 0);

        tlRefs.current[i] = tl;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    if (document.fonts?.ready) document.fonts.ready.then(layout).catch(() => {});

    if (mobileMenuRef.current)
      gsap.set(mobileMenuRef.current, { visibility: "hidden", opacity: 0, y: 8 });

    if (initialLoadAnimation && navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -6, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease }
      );
    }

    return () => window.removeEventListener("resize", layout);
  }, [items, initialLoadAnimation, resolvedPillTextColor, hoveredPillTextColor]);

  const handleEnter = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.22,
      ease
    });
  };

  const handleLeave = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.18,
      ease
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, { rotate: 360, duration: 0.35, ease });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    const menu = mobileMenuRef.current;

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(menu, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.28, ease });
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 8,
          duration: 0.22,
          ease,
          onComplete: () => gsap.set(menu, { visibility: "hidden" })
        });
      }
    }

    onMobileMenuClick?.();
  };

  const isExternalLink = (href) =>
    typeof href === "string" &&
    (href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("//") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("#"));
  const isRouterLink = (href) => href && !isExternalLink(href);

  return (
    <div className="w-full">
      <nav
        ref={navRef}
        className={`fixed top-3 left-3 right-3 mx-auto max-w-7xl z-50 rounded-xl shadow-md bg-white border border-gray-200 px-4 py-3 flex items-center justify-between gap-4 ${className}`}
        aria-label="Primary"
      >
        {/* Logo */}
        {isRouterLink("/") ? (
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0"
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md bg-gradient-to-br from-green-500 to-green-700 overflow-hidden">
              {logo ? (
                <img src={logo} alt={logoAlt} ref={logoImgRef} className="h-8 w-auto" />
              ) : (
                <span className="text-xl">🌿</span>
              )}
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-gray-900">AyuVeda</div>
              <div className="text-xs text-gray-500 -mt-0.5">
                Herbal • Traditional • Personal
              </div>
            </div>
          </Link>
        ) : (
          <a
            href="/"
            className="flex items-center gap-3 shrink-0"
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md bg-gradient-to-br from-green-500 to-green-700 overflow-hidden">
              {logo ? (
                <img src={logo} alt={logoAlt} ref={logoImgRef} className="h-8 w-auto" />
              ) : (
                <span className="text-xl">🌿</span>
              )}
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-gray-900">AyuVeda</div>
              <div className="text-xs text-gray-500 -mt-0.5">
                Herbal • Traditional • Personal
              </div>
            </div>
          </a>
        )}

        {/* Desktop pills */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <ul className="flex gap-3 items-center">
            {items.map((item, i) => (
              <li key={item.href || i} className="list-none">
                {isRouterLink(item.href) ? (
                  <Link
                    to={item.href}
                    role="menuitem"
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                    className="relative inline-flex items-center px-4 py-2 rounded-full transition-all duration-200 overflow-hidden text-black"
                  >
                    <span
                      ref={(el) => (pillBgRefs.current[i] = el)}
                      aria-hidden="true"
                      className="absolute inset-0 transform origin-bottom rounded-full"
                      style={{ background: LEAF_GRADIENT, transform: "scaleY(0)" }}
                    />
                    <span
                      ref={(el) => (labelRefs.current[i] = el)}
                      className="relative z-10 font-semibold"
                    >
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    role="menuitem"
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                    className="relative inline-flex items-center px-4 py-2 rounded-full transition-all duration-200 overflow-hidden text-black"
                  >
                    <span
                      ref={(el) => (pillBgRefs.current[i] = el)}
                      aria-hidden="true"
                      className="absolute inset-0 transform origin-bottom rounded-full"
                      style={{ background: LEAF_GRADIENT, transform: "scaleY(0)" }}
                    />
                    <span
                      ref={(el) => (labelRefs.current[i] = el)}
                      className="relative z-10 font-semibold"
                    >
                      {item.label}
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {cta ? (
            <div className="hidden md:block">{cta}</div>
          ) : (
            <div className="hidden md:block">
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white">
                Sign Up
              </button>
            </div>
          )}
          <button
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-md border border-gray-200"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="block w-5 h-[2px] bg-gray-800 mb-1" />
            <span className="block w-5 h-[2px] bg-gray-800 mt-1" />
          </button>
        </div>
      </nav>

      {/* Mobile popover */}
      <div
        ref={mobileMenuRef}
        className="fixed left-4 right-4 top-20 z-50 rounded-lg p-3 md:hidden bg-white border border-gray-200 shadow-lg"
        style={{ visibility: "hidden", opacity: 0 }}
      >
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.href || item.label}>
              {isRouterLink(item.href) ? (
                <Link
                  to={item.href}
                  className="block px-3 py-2 rounded-md text-black hover:bg-green-100 hover:text-green-800 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-black hover:bg-green-100 hover:text-green-800 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
