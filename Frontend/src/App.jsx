// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import PillNav from "./components/PillNav";
import AyurvedaButton from "./components/AyurvedaButton";
import Footer from "./components/Footer";
import logo from "./assets/logo.png";
import { UserProvider } from "./contexts/UserContext";

/* Lazy page imports */
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Treatments = lazy(() => import("./pages/Treatments"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Threed = lazy(() => import("./pages/Threed"));

/* Auth + App pages */
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AskAi = lazy(() => import("./pages/AskAi"));
const Explore = lazy(() => import("./pages/Explore"));
const GettingStarted = lazy(() => import("./pages/GettingStarted"));
const Profile = lazy(() => import("./pages/Profile"));
const FoodDetail = lazy(() => import("./pages/FoodDetail"));
const Settings = lazy(() => import("./pages/settings"));

/* -------- Layout for public site (nav + footer) -------- */
function Layout({ children }) {
  const location = useLocation();
  const activeHref = location.pathname;

  // hide nav/footer on auth-like pages
  const noNavRoutes = new Set(["/get-in", "/forgot", "/auth", "/dashboard", "/ask-ai", "/explore", "/profile", "/getting-started"]);
  const hideNav = Array.from(noNavRoutes).some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/")
  );

  const navItems = [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" }
  ];

  return (
    <>
      {!hideNav && (
        <PillNav
          logo={logo}
          logoAlt="AyuVeda"
          items={navItems}
          activeHref={activeHref}
          ease="power3.out"
          baseColor="#000000"
          pillColor="linear-gradient(90deg,#166534,#78350f)"
          hoveredPillTextColor="#FFFFFF"
          pillTextColor="#000000"
          cta={
            <AyurvedaButton onClick={() => (window.location.href = "/get-in")}>
              Log-in
            </AyurvedaButton>
          }
        />
      )}

      <div>{children}</div>

      {!hideNav && <Footer />}
    </>
  );
}

/* -------- Simple auth guard -------- */
function ProtectedRoute() {
  const token = localStorage.getItem("ayu_token");
  if (!token) {
    return <Navigate to="/get-in" replace />;
  }
  return <Outlet />;
}

/* -------- Main App (wrapped with UserProvider) -------- */
export default function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-[#f9fef9] text-black flex flex-col">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-gray-600">Loading…</div>
            </div>
          }
        >
          <Routes>
            {/* Public site */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/services" element={<Layout><Services /></Layout>} />
            <Route path="/treatments" element={<Layout><Treatments /></Layout>} />
            <Route path="/blog" element={<Layout><Blog /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />

            {/* Auth */}
            <Route path="/get-in" element={<Auth />} />

            {/* Protected app pages */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ask-ai" element={<AskAi />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/getting-started" element={<GettingStarted />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/explore/item/:id" element={<FoodDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Other pages */}
            <Route path="/threed" element={<Layout><Threed /></Layout>} />
            <Route path="/terms" element={<Layout><Terms /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />

            {/* 404 */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </Suspense>
      </div>
    </UserProvider>
  );
}
