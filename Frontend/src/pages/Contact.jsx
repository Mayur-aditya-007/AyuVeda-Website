// src/pages/Contact.jsx
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import AyurvedaButton from "../components/AyurvedaButton";
import ExtraButton from "../components/ExtraButton";
import ThemeInput from "../components/ThemeInput";

/**
 * Contact page — styled like About page
 * - Lively background + GSAP animations
 * - Contact form with local submit (placeholder)
 * - Clinic info, FAQ and CTA
 */

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

export default function Contact() {
  const heroRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, { y: 18, opacity: 0, duration: 0.6, ease: "power3.out" });
      gsap.from(".fade-item", { y: 16, opacity: 0, duration: 0.55, stagger: 0.06, delay: 0.1 });
    });
    return () => ctx.revert();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    // placeholder: replace with an API call
    setTimeout(() => {
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 900);
  }

  return (
    <main
      className="min-h-screen relative bg-[#f9fef9] text-gray-900"
      style={{ paddingTop: "var(--pillnav-height, 88px)" }}
    >
      <AnimatedBackground />

      <div className="max-w-6xl mx-auto px-6 py-20">
        <header ref={heroRef} className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold">Contact & Support</h1>
          <p className="text-lg text-gray-700 mt-2 max-w-2xl">Questions about services, partnerships, or clinical enquiries — we’re here to help.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* left: contact info */}
          <aside className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm fade-item">
            <h3 className="font-semibold text-gray-900 mb-2">Clinic & Support</h3>
            <p className="text-sm text-gray-600 mb-4">Call, email or use the form to reach our patient support and practitioner team.</p>

            <ul className="text-sm text-gray-700 space-y-2">
              <li><strong>Address:</strong> 123 Herbal Lane, Wellness City</li>
              <li><strong>Phone:</strong> +91 12345 67890</li>
              <li><strong>Email:</strong> hello@ayuveda.example</li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Office hours</h4>
              <div className="text-sm text-gray-600">Mon – Fri: 09:00 – 18:00</div>
              <div className="text-sm text-gray-600">Sat: 09:00 – 14:00</div>
              <div className="text-sm text-gray-600">Sun: Closed</div>
            </div>

            <div className="mt-6">
              <ExtraButton onClick={() => (window.location.href = "/services")} variant="outline">View Services</ExtraButton>
            </div>
          </aside>

          {/* right: contact form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm fade-item">
            <h3 className="font-semibold text-gray-900 mb-3">Send us a message</h3>

            <form onSubmit={handleSubmit} className="grid gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ThemeInput name="name" label="Name" value={form.name} onChange={handleChange} placeholder="Your name" />
                <ThemeInput name="email" label="Email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
              </div>

              <ThemeInput name="subject" label="Subject" value={form.subject} onChange={handleChange} placeholder="Short subject" />

              <label className="block">
                <div className="text-sm text-gray-700 mb-1">Message</div>
                <textarea
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg border border-gray-200 bg-white text-gray-900"
                  placeholder="Tell us how we can help"
                />
              </label>

              <div className="flex items-center gap-3">
                <AyurvedaButton type="submit">{status === "sending" ? "Sending..." : "Send Message"}</AyurvedaButton>
                <div className="text-sm text-gray-600">
                  {status === "sent" ? <span className="text-emerald-600">Message sent — we’ll reply soon.</span> : "We'll get back within 48 hours"}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* small FAQ/Help */}
        <section className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm fade-item">
            <h4 className="font-semibold text-gray-900">Help center</h4>
            <p className="text-sm text-gray-600 mt-2">Browse articles and guides to common questions.</p>
            <div className="mt-3">
              <a className="text-emerald-600 hover:underline" href="/help">Open Help center →</a>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm fade-item">
            <h4 className="font-semibold text-gray-900">Partnerships</h4>
            <p className="text-sm text-gray-600 mt-2">Interested in clinic integrations or research collaborations? Reach out.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm fade-item">
            <h4 className="font-semibold text-gray-900">Careers</h4>
            <p className="text-sm text-gray-600 mt-2">We're hiring practitioners and engineers — check open roles.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
