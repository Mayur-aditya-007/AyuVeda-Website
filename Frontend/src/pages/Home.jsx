// src/pages/Home.jsx
import React, { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { gsap } from "gsap";

import AyurvedaButton from "../components/AyurvedaButton";
import ExtraButton from "../components/ExtraButton";
import ThemeInput from "../components/ThemeInput";

/* --- small icons --- */
const IconLeaf = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M3 21s6-7 12-7c3 0 6 3 6 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3c-1.5 2-4 6-4 10 0 4 4 8 8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function FeatureCard({ title, desc, icon }) {
  return (
    <div className="p-6 rounded-xl bg-white/60 border border-gray-200 shadow-md hover:shadow-lg transition" data-reveal>
      <div className="flex items-center gap-4 mb-3 text-green-600">
        <div className="p-2 rounded-lg bg-green-50 text-green-700">{icon}</div>
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}

export default function Home() {
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const heroCardRef = useRef(null);

  useLenis((lenis) => {
    const y = lenis.scroll || 0;
    const titleY = Math.min(0, -y * 0.03);
    const subY = Math.min(0, -y * 0.02);
    const cardY = Math.min(0, -y * 0.015);

    if (titleRef.current) gsap.set(titleRef.current, { y: titleY, force3D: true });
    if (subRef.current) gsap.set(subRef.current, { y: subY, force3D: true });
    if (heroCardRef.current) gsap.set(heroCardRef.current, { y: cardY, force3D: true });
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(titleRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
        .fromTo(subRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.45")
        .fromTo(heroCardRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.5");
    });
    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root>
      <main className="relative min-h-screen text-gray-900 bg-[#f9fef9]">
        {/* HERO */}
        <section className="relative z-20 pt-28 md:pt-36 lg:pt-44 pb-10">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* left */}
            <div>
              <h1 ref={titleRef} className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
                Restore balance with <span className="text-green-600">AyuVeda</span>
              </h1>

              <p ref={subRef} className="text-lg text-gray-700 mb-6">
                Traditional Ayurvedic wisdom meets modern guidance — personalized consultations, diet plans, and rejuvenation therapies to help you thrive.
              </p>

              <div className="flex flex-wrap gap-4">
                <AyurvedaButton onClick={() => (window.location.href = "/signup")}>Get Started</AyurvedaButton>

                <ExtraButton variant="outline" href="#services">
                  Explore Services
                </ExtraButton>
              </div>
            </div>

            {/* right card */}
            <aside ref={heroCardRef} className="w-full max-w-md mx-auto">
              <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Start with a</div>
                    <div className="text-xl font-semibold text-gray-900">Free Health Assessment</div>
                  </div>
                  <div className="text-green-600">🌿</div>
                </div>

                <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); /* handle submit */ }}>
                  <ThemeInput label="Your Name" name="name" placeholder="Enter your full name" />
                  <ThemeInput label="Email" type="email" name="email" placeholder="you@example.com" />

                  <select className="p-3 rounded-lg border border-gray-300 text-gray-900" aria-label="Choose service">
                    <option>Choose service</option>
                    <option>Consultation</option>
                    <option>Diet Plan</option>
                    <option>Therapy</option>
                  </select>

                  <div className="flex gap-3">
                    <AyurvedaButton type="submit">Book Free</AyurvedaButton>
                    <ExtraButton variant="ghost" onClick={() => window.location.href = "tel:+911234567890"}>
                      Call
                    </ExtraButton>
                  </div>
                </form>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-green-50 text-center">
                  <div className="text-2xl font-bold text-green-700">4.9</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="p-4 rounded-lg bg-green-50 text-center">
                  <div className="text-2xl font-bold text-green-700">10k+</div>
                  <div className="text-sm text-gray-600">Happy Patients</div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="relative z-20 py-12 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6 text-gray-900">What we offer</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard icon={<IconLeaf />} title="Personalized Consultation" desc="Assessments based on pulse, diet and lifestyle for precise recommendations." />
              <FeatureCard icon={<IconLeaf />} title="Therapeutic Programs" desc="Rejuvenation and detox programs tailored to your dosha and goals." />
              <FeatureCard icon={<IconLeaf />} title="Herbal Support" desc="Clinically formulated herbal blends sourced ethically and transparently." />
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="relative z-20 py-12 px-6 bg-[#f9fef9]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Services & Treatments</h3>
              <a href="/services" className="text-green-600 font-medium">View all</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-green-50 border border-green-100 shadow-sm">Consultation</div>
              <div className="p-6 rounded-2xl bg-green-50 border border-green-100 shadow-sm">Diet Plans</div>
              <div className="p-6 rounded-2xl bg-green-50 border border-green-100 shadow-sm">Rejuvenation</div>
            </div>
          </div>
        </section>
      </main>
    </ReactLenis>
  );
}
