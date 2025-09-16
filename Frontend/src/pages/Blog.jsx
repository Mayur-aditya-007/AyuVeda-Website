// src/pages/Blog.jsx
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import AyurvedaButton from "../components/AyurvedaButton";
import ExtraButton from "../components/ExtraButton";

/**
 * Blog.jsx — curated external Ayurveda posts with robust image handling
 *
 * Strategy:
 *  - Use post.image if provided.
 *  - Otherwise use the site's favicon via Google favicon service as a lightweight proxy.
 *  - If the chosen image fails to load, replace with a generated SVG data-URI placeholder
 *    (so every card always has a visual).
 *
 * Note: images are loaded directly by the browser (no proxy). Favicons via Google are
 * generally reliable; for richer thumbnails you can add OG images to the `externalPosts`
 * array later.
 */

/* ---------- Helpers ---------- */

function makePlaceholderDataUri(title = "", source = "") {
  // build initials from source
  const initials = (source || "")
    .split(/\s+/)
    .map((s) => (s && s[0]) || "")
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AV";

  // short title text
  const short = (title || "").replace(/&/g, "and").slice(0, 40);

  const bg = "#ECFDF5"; // subtle green
  const fg = "#065F46"; // dark green
  const accent = "#A7F3D0";

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='720'>
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="${bg}" />
        <stop offset="1" stop-color="${accent}" stop-opacity="0.35"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <g transform="translate(60,60)">
      <rect x="0" y="0" rx="20" ry="20" width="1120" height="600" fill="white" opacity="0.06"/>
      <circle cx="120" cy="120" r="68" fill="${fg}" />
      <text x="120" y="136" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" font-size="48" text-anchor="middle" fill="white" font-weight="700">${initials}</text>
      <text x="320" y="110" font-family="system-ui, -apple-system, 'Segoe UI', Roboto" font-size="36" fill="${fg}" font-weight="700">${escapeXml(short)}</text>
      <text x="320" y="160" font-family="system-ui, -apple-system, 'Segoe UI', Roboto" font-size="18" fill="#4B5563">${escapeXml(source)}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(str = "") {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function domainFromUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return "";
  }
}

/* ---------- Decorative Animated Background ---------- */

function AnimatedBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -left-24 -top-24 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-emerald-200/40 via-emerald-300/20 to-transparent blur-3xl animate-blob-slow" />
      <div className="absolute right-[-160px] top-36 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-amber-100/30 via-rose-50/10 to-transparent blur-2xl animate-blob-reverse" />
      <style>{`
        @keyframes blob-slow {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(20px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes blob-reverse {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-18px) scale(0.98); }
          100% { transform: translateY(0) scale(1); }
        }
        .animate-blob-slow { animation: blob-slow 8s ease-in-out infinite; }
        .animate-blob-reverse { animation: blob-reverse 9s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

/* ---------- PostCard with robust image loading ---------- */

function PostCard({ post }) {
  // local image state to swap to placeholder if original fails
  const [imgSrc, setImgSrc] = useState(() => getBestImageSrc(post));
  const [errored, setErrored] = useState(false);

  // if post changes, re-evaluate
  useEffect(() => {
    setImgSrc(getBestImageSrc(post));
    setErrored(false);
  }, [post.id]); // eslint-disable-line

  function handleError() {
    if (errored) return; // already using placeholder
    const placeholder = makePlaceholderDataUri(post.title || "", post.source || "");
    setImgSrc(placeholder);
    setErrored(true);
  }

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col h-full">
      <div className="h-44 md:h-48 bg-white flex items-center justify-center overflow-hidden">
        <img
          src={imgSrc}
          onError={handleError}
          alt={post.title}
          loading="lazy"
          className="object-cover w-full h-full"
          style={{ minHeight: 176 }}
        />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="text-xs text-gray-500">{post.date ? new Date(post.date).toLocaleDateString() : ""}</div>
        <h3 className="text-lg font-semibold text-gray-900 mt-1">{post.title}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3 flex-1">{post.excerpt}</p>

        <div className="mt-4 flex items-center justify-between">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 font-medium hover:underline"
          >
            Open article ↗
          </a>
          <div className="text-xs text-gray-500 px-2 py-1 rounded-md bg-gray-50">{post.source}</div>
        </div>
      </div>
    </article>
  );
}

function getBestImageSrc(post) {
  // priority:
  // 1) explicit post.image
  // 2) article og:image if provided in post.ogImage
  // 3) site's favicon via Google favicon service
  // (Note: we attempt to load the image directly; onError will swap to placeholder)
  if (post.image) return post.image;
  if (post.ogImage) return post.ogImage;
  // fallback to google favicon service (works for many domains)
  const domain = domainFromUrl(post.url);
  if (domain) {
    // size param: 256
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
  }
  // final attempt: blank placeholder (will be replaced by onError)
  return "";
}

/* ---------- Main Blog page component ---------- */

export default function Blog() {
  const heroRef = useRef(null);

  const [externalPosts, setExternalPosts] = useState([
    // a longer curated list — add image or ogImage fields where you have a preferred thumbnail
    { id: "banyan-1", title: "Honor the Fall Transition with 5 Food Practices", excerpt: "Seasonal food practices to balance digestion in autumn.", url: "https://www.banyanbotanicals.com/blogs/wellness/honor-the-fall-transition-with-5-food-practices", source: "Banyan Botanicals", date: "2024-09-11" },
    { id: "banyan-2", title: "Mischievous Doshas — How to Manage Complex Imbalances", excerpt: "Practical steps for unusual or stubborn doshic imbalances.", url: "https://www.banyanbotanicals.com/blogs/wellness/mischievous-doshas", source: "Banyan Botanicals", date: "2025-02-27" },
    { id: "herbal-1", title: "Ayurvedic Tips to Boost Immunity from the Inside Out", excerpt: "Herbal allies and lifestyle strategies to support year-round immunity.", url: "https://theherbalacademy.com/blog/ayurvedic-tips-to-boost-immunity/", source: "Herbal Academy", date: "2021-02-16" },
    { id: "herbal-2", title: "Introduction to Ayurveda: What's My Dosha?", excerpt: "A friendly primer on doshas and how to identify yours.", url: "https://theherbalacademy.com/blog/introduction-to-ayurveda/", source: "Herbal Academy", date: "2017-12-14" },
    { id: "ai-1", title: "What is Ayurveda? A Brief Introduction and Guide", excerpt: "A concise overview of Ayurvedic principles by The Ayurvedic Institute.", url: "https://ayurveda.com/ayurveda-a-brief-introduction-and-guide/", source: "The Ayurvedic Institute", date: "2021-08-24" },
    { id: "ai-2", title: "Panchakarma Protocols: A Practitioner's Perspective", excerpt: "How practitioners design bespoke Panchakarma detox protocols.", url: "https://ayurveda.com/blog/panchakarma-protocols-a-practitioners-perspective", source: "The Ayurvedic Institute", date: "2025-07-22" },
    { id: "kerala-1", title: "Why and how to fast Ayurvedically", excerpt: "Guidelines for safe and purposeful fasting within Ayurvedic practice.", url: "https://www.keralaayurveda.us/wellnesscenter/blog/why-and-how-to-fast-ayurvedically", source: "Kerala Ayurveda", date: "2024-01-26" },
    { id: "ayurvaid-1", title: "Top Ayurveda Treatments: What To Expect", excerpt: "Overview of common clinically-offered Ayurvedic treatments.", url: "https://ayurvaid.com/blog/", source: "AyurVAID", date: "2024-01-01" },
    { id: "saumya-1", title: "Nasya Oil — Benefits & How-To", excerpt: "Practical guide to nasya — indications, technique and safety.", url: "https://www.saumya-ayurveda.com/post/nasya-oil-benefits-how-to", source: "Saumya Ayurveda", date: "2025-06-01" },
    { id: "college-1", title: "Why learn Ayurveda? Courses & career paths", excerpt: "Insights into Ayurveda training, courses and career scope.", url: "https://www.ayurvedacollege.net/blogs", source: "Ayurveda College", date: "2021-06-15" },
    { id: "feedspot-1", title: "Best Ayurveda Blogs & Websites To Follow", excerpt: "Curated list of the most-followed Ayurveda blogs and resources.", url: "https://www.saumya-ayurveda.com/post/saumya-ayurveda-selected-best-ayurveda-blogs-and-websites-to-follow-in-2024", source: "Saumya Ayurveda (curation)", date: "2024-11-04" },
    { id: "hellomy-1", title: "Ayurveda: Guides & Recipes", excerpt: "A category page collecting Ayurveda articles and recipes.", url: "https://www.hellomyyoga.com/blog/category/ayurveda/", source: "HelloMyYoga", date: "2025-03-24" },
    { id: "banyan-3", title: "Turmeric Masala Spice Mix and 3 Golden Recipes", excerpt: "Practical recipes and spice blends inspired by Ayurvedic cooking.", url: "https://www.banyanbotanicals.com/blogs/wellness/turmeric-masala-spice-mix-and-3-golden-recipes", source: "Banyan Botanicals", date: "2025-02-27" },
    { id: "herbal-3", title: "How to Schedule Your Day Based on Energy Levels", excerpt: "A guide to aligning daily routine with energetic cycles.", url: "https://theherbalacademy.com/blog/how-to-schedule-your-day-based-on-energy-levels/", source: "Herbal Academy", date: "2023-09-01" },
    { id: "kerala-2", title: "Ayurvedic Fasting: Practices and Precautions", excerpt: "Do's and don'ts of fasting in Ayurvedic context.", url: "https://www.keralaayurveda.us/wellnesscenter/blog/ayurvedic-fasting", source: "Kerala Ayurveda", date: "2024-02-02" },
    { id: "ayurveda-hub", title: "Ayurveda Hub — Articles & Recipes", excerpt: "Collection of articles exploring doshas, herbs and practical tips.", url: "https://www.banyanbotanicals.com/blogs/wellness", source: "Banyan / Hub", date: "2025-02-27" },
  ]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, { y: 18, opacity: 0, duration: 0.6, ease: "power3.out" });
      gsap.from(".post-fade", { y: 18, opacity: 0, duration: 0.6, stagger: 0.06, delay: 0.12, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, []);

  // Demo "load more": append a few more curated links (keeps page plentiful)
  function loadMore() {
    const more = [
      { id: `more-${Date.now()}`, title: "Ayurvedic Cooking for Self-Healing", excerpt: "Recipes and practical food advice from Ayurvedic sources.", url: "https://ayurveda.com/", source: "The Ayurvedic Institute", date: "2022-01-01" },
      { id: `more2-${Date.now()}`, title: "Herbal allies for digestion", excerpt: "Herbal tips for supporting healthy digestion and gut comfort.", url: "https://theherbalacademy.com/blog/", source: "Herbal Academy", date: "2023-11-05" },
      { id: `more3-${Date.now()}`, title: "Seasonal dosha balancing", excerpt: "Practical seasonal adjustments to diet and routine.", url: "https://www.banyanbotanicals.com/blogs/wellness", source: "Banyan Botanicals", date: "2024-10-01" },
    ];
    setExternalPosts((s) => [...s, ...more]);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight - 420, behavior: "smooth" });
    }, 80);
  }

  return (
    <main
      className="min-h-screen relative bg-[#f9fef9] text-gray-900"
      style={{ paddingTop: "var(--pillnav-height, 88px)" }}
    >
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero */}
        <header ref={heroRef} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold">Ayurveda — curated reading</h1>
          <p className="text-lg text-gray-700 mt-2 max-w-2xl">Hand-picked articles and blog hubs about Ayurveda, herbs, recipes and therapies. Links open on the original sites.</p>
        </header>

        {/* Filters / CTA */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <input
              placeholder="Search posts (client-side)"
              onChange={(e) => {
                const q = e.target.value.toLowerCase().trim();
                if (!q) {
                  // reset to seed list - in a real app you would re-fetch from server
                  // For demo we keep the current list and don't restore seed automatically.
                  return;
                }
                setExternalPosts((current) => current.filter((p) => (p.title + " " + p.excerpt + " " + p.source).toLowerCase().includes(q)));
              }}
              className="px-3 py-2 rounded-lg border border-gray-200"
            />
            <select
              className="px-3 py-2 rounded-lg border border-gray-200"
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                setExternalPosts((cur) => cur.filter((p) => p.source.toLowerCase().includes(v.toLowerCase())));
              }}
            >
              <option value="">All sources</option>
              <option>Banyan Botanicals</option>
              <option>Herbal Academy</option>
              <option>The Ayurvedic Institute</option>
              <option>Kerala Ayurveda</option>
              <option>AyurVAID</option>
              <option>Saumya Ayurveda</option>
            </select>
          </div>

          <div className="ml-auto flex gap-2">
            <ExtraButton variant="outline" onClick={() => alert("Subscribe clicked")}>Subscribe</ExtraButton>
            <AyurvedaButton onClick={() => (window.location.href = "/getting-started")}>Get personalized plan</AyurvedaButton>
          </div>
        </div>

        {/* Posts grid */}
        <section className="grid grid-cols-1 py-4 md:grid-cols-3 gap-6">
          {externalPosts.map((p) => (
            <div key={p.id} className="post-fade">
              <PostCard post={p} />
            </div>
          ))}
        </section>

        {/* Pagination / load more */}
        <div className="mt-12 flex items-center justify-center">
          <button onClick={loadMore} className="px-5 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition">Load more articles</button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Note: these links point to third-party Ayurveda blogs (Banyan Botanicals, The Herbal Academy, The Ayurvedic Institute, Kerala Ayurveda, AyurVAID and others). Click any card to open the original article on its website.
        </div>
      </div>
    </main>
  );
}
