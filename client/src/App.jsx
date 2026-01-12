import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Intro from './pages/Intro';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Intro />} />
                <Route path="/home" element={<Home />} />
                <Route path="/gallery/:category" element={<Gallery />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>
        </AnimatePresence>
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
