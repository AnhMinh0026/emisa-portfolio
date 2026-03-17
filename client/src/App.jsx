import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Intro from "./pages/Intro";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import ScrollToTop from "./components/ScrollToTop";

import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminImages from "./pages/AdminImages";
import AdminPricing from "./pages/AdminPricing";
import AdminCategories from "./pages/AdminCategories";

function AnimatedRoutes() {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Intro />} />
          <Route path="/home" element={<Home />} />
          <Route path="/gallery/:category" element={<Gallery />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin Dashboard - nested routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="images" element={<AdminImages />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="pricing" element={<AdminPricing />} />
            {/* Redirect /admin/upload cũ -> /admin/images */}
            <Route path="upload" element={<Navigate to="/admin/images" replace />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <ScrollToTop />
    </>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
