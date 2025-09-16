// src/pages/About.jsx
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import AyurvedaButton from "../components/AyurvedaButton";
import ExtraButton from "../components/ExtraButton";
import ThemeInput from "../components/ThemeInput";

/**
 * About.jsx
 * - Uses var(--pillnav-height, 88px) as top padding so content won't be hidden behind PillNav
 * - Uses gsap for subtle entrance animations
 * - Reuses project components: AyurvedaButton, ExtraButton, ThemeInput
 */

const IconLeaf = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M3 21s6-7 12-7c3 0 6 3 6 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3c-1.5 2-4 6-4 10 0 4 4 8 8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Stat({ value, label }) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
      <div className="text-3xl font-extrabold text-green-700">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}

function ServiceCard({ title, desc, icon }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-green-50 text-green-700">{icon}</div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ person }) {
  return (
    <div className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-2xl">👩🏽‍⚕️</div>
        <div>
          <div className="font-semibold text-gray-900">{person.name}</div>
          <div className="text-sm text-gray-600">{person.role}</div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-3">{person.bio}</p>
    </div>
  );
}

export default function About() {
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    // simple entrance animations
    const ctx = gsap.context(() => {
      gsap.from(heroTitleRef.current, { y: 22, opacity: 0, duration: 0.7, ease: "power3.out" });
      gsap.from(heroSubRef.current, { y: 18, opacity: 0, duration: 0.7, delay: 0.12, ease: "power3.out" });
      gsap.from(".fade-up", { y: 18, opacity: 0, duration: 0.6, stagger: 0.08, delay: 0.18, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, []);

  const team = [
    {
      name: "Dr. Meera Sharma",
      role: "Lead Practitioner",
      bio: "20+ years treating chronic conditions with personalized Ayurvedic plans.",
    },
    {
      name: "Dr. Anand Patel",
      role: "Panchakarma Specialist",
      bio: "Expert in detox therapies and clinical Panchakarma supervision.",
    },
    {
      name: "Dr. Leela Rao",
      role: "Diet & Lifestyle",
      bio: "Focuses on individualized diet, daily routines and lifestyle medicine.",
    },
  ];

  const services = [
    { title: "Personalized Consultation", desc: "Assessment of dosha, lifestyle review, and a step-by-step plan.", icon: <IconLeaf /> },
    { title: "Therapeutic Programs", desc: "Detox, rejuvenation and Panchakarma under supervision.", icon: <IconLeaf /> },
    { title: "Herbal Support", desc: "Clinically-formulated blends with traceable sourcing.", icon: <IconLeaf /> },
  ];

  const faqs = [
    { q: "What is Ayurveda?", a: "Ayurveda is a traditional system of medicine from India focusing on balance of body, mind and environment." },
    { q: "Do you offer online consultations?", a: "Yes — we provide remote assessments and follow-ups via secure video calls." },
    { q: "Are herbs safe with other medicines?", a: "We review interactions carefully and coordinate with your primary care physician when necessary." },
  ];

  return (
    <main
      className="min-h-screen bg-[#f9fef9] text-gray-900"
      style={{ paddingTop: "var(--pillnav-height, 88px)" }} // <--- ensures content doesn't sit behind fixed PillNav
    >
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* HERO */}
        <section className="grid md:grid-cols-2 gap-10 items-center mb-12">
          <div>
            <h1 ref={heroTitleRef} className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              Rooted in tradition, guided by evidence
            </h1>
            <p ref={heroSubRef} className="text-lg text-gray-700 max-w-2xl mb-6">
              At AyuVeda we combine classical Ayurvedic wisdom with modern clinical practice to create personalised health plans that work for your lifestyle and goals.
            </p>

            <div className="flex flex-wrap gap-4">
              <AyurvedaButton onClick={() => (window.location.href = "/signup")}>Book a Consultation</AyurvedaButton>
              <ExtraButton variant="outline" href="#services">Explore Services</ExtraButton>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm fade-up">
              <h4 className="font-semibold text-gray-900">Quick Assessment</h4>
              <p className="text-sm text-gray-600 mt-2">Answer 5 quick questions to get a free suggestion for next steps.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <input className="p-3 rounded-lg border border-gray-300 placeholder-gray-400 text-gray-900" placeholder="Your name" />
                <input className="p-3 rounded-lg border border-gray-300 placeholder-gray-400 text-gray-900" placeholder="Phone or email" />
              </div>
              <div className="mt-4">
                <ExtraButton onClick={() => alert("Assessment started")} variant="solid">Start Assessment</ExtraButton>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 fade-up">
              <Stat value="4.9" label="Average Rating" />
              <Stat value="10k+" label="Happy Patients" />
              <Stat value="15 yrs" label="Clinical Experience" />
            </div>
          </div>
        </section>

        {/* VALUES / WHY US */}
        <section className="mb-14">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm fade-up">
              <h3 className="font-semibold text-gray-900 mb-2">Personalized Care</h3>
              <p className="text-gray-600 text-sm">Each plan is tailored to your constitution, medical history and preferences.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm fade-up">
              <h3 className="font-semibold text-gray-900 mb-2">Evidence-Informed</h3>
              <p className="text-gray-600 text-sm">We blend classical diagnostics with contemporary safety and efficacy standards.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm fade-up">
              <h3 className="font-semibold text-gray-900 mb-2">Sustainable Sourcing</h3>
              <p className="text-gray-600 text-sm">Herbal blends are ethically sourced and quality tested.</p>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Services & Programs</h2>
            <a href="/services" className="text-green-600 font-medium">View all</a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((s) => (
              <ServiceCard key={s.title} title={s.title} desc={s.desc} icon={s.icon} />
            ))}
          </div>
        </section>

        {/* TEAM */}
        <section id="team" className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Meet the team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((p) => (
              <TeamCard key={p.name} person={p} />
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">What our patients say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "I feel more energetic and balanced after the program.", by: "Asha, 34" },
              { quote: "Thoughtful practitioners who listened to my whole story.", by: "Rahul, 42" },
              { quote: "Practical diet advice that actually fits my life.", by: "Maya, 29" },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="italic text-gray-700">“{t.quote}”</div>
                <div className="mt-4 text-sm font-semibold text-gray-900">{t.by}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Frequently asked questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {faqs.map((f, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full text-left flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-medium text-gray-900">{f.q}</div>
                    <div className={`text-sm mt-2 text-gray-600 ${faqOpen === i ? "block" : "hidden"}`}>{f.a}</div>
                  </div>
                  <div className="text-green-600 font-bold">{faqOpen === i ? "–" : "+"}</div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA + Contact mini form */}
        <section className="mb-20 grid md:grid-cols-2 gap-8 items-start">
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Ready to start?</h3>
            <p className="text-gray-700 mb-4">Book a consultation and start your personalised plan. We’ll guide you at every step.</p>
            <div className="flex gap-3">
              <AyurvedaButton onClick={() => (window.location.href = "/signup")}>Book Consultation</AyurvedaButton>
              <ExtraButton variant="outline" href="/services">See Programs</ExtraButton>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">Quick contact</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // placeholder submit - wire to API as needed
                alert("Thanks — we'll get back to you.");
              }}
              className="grid gap-3"
            >
              <ThemeInput name="name" label="Name" placeholder="Your name" />
              <ThemeInput name="email" label="Email" type="email" placeholder="you@example.com" />
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Message</label>
                <textarea className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900" rows={4} placeholder="How can we help?" />
              </div>
              <div className="flex items-center gap-3">
                <AyurvedaButton type="submit">Send</AyurvedaButton>
                <div className="text-sm text-gray-600">Or call <a href="tel:+911234567890" className="text-green-700">+91 12345 67890</a></div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
