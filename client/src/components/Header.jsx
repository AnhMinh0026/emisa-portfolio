import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobileWorkOpen, setIsMobileWorkOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-transparent hover:border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/home"
          className="text-2xl font-serif tracking-widest uppercase text-black"
        >
          EMISA
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-12">
          <NavLink to="/home" label="Home" currentPath={location.pathname} />
          {/* Work Dropdown */}
          <div
            className="relative group flex items-center cursor-pointer"
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            <span className="text-sm tracking-widest uppercase text-gray-500 transition-all duration-300 group-hover:text-luxury-black group-hover:opacity-70 group-hover:scale-105">
              Layout Makeup
            </span>

            {/* Dropdown */}
            <div
              className={`
                absolute top-full left-1/2 -translate-x-1/2 pt-6
                transition-all duration-300
                ${
                  isMenuOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                }
              `}
            >
              <div className="bg-white border border-gray-100 shadow-xl p-6 min-w-[400px] flex flex-col space-y-4 text-center">
                <DropdownLink to="/gallery/beauty" label="Trang điểm cá nhân" />
                <DropdownLink to="/gallery/bridal" label="Trang điểm Cô dâu" />
                <DropdownLink
                  to="/gallery/event"
                  label="Trang điểm Sự kiện – Dạ tiệc"
                />
                <DropdownLink
                  to="/gallery/commercial"
                  label="Trang điểm Thương mại – Truyền thông"
                />
                <DropdownLink
                  to="/gallery/lookbook"
                  label="Trang điểm Lookbook – Concept"
                />
                <DropdownLink
                  to="/gallery/graduation"
                  label="Trang điểm Tốt nghiệp – Kỷ yếu"
                />
              </div>
            </div>
          </div>

          {/* Normal Links */}
          <NavLink
            to="/pricing"
            label="Bảng giá"
            currentPath={location.pathname}
          />
          <NavLink
            to="/contact"
            label="Liên hệ"
            currentPath={location.pathname}
          />
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col space-y-1.5 w-6 h-6 justify-center items-center"
          aria-label="Toggle menu"
        >
          <span
            className={`w-full h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`w-full h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`w-full h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-t border-gray-100 transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col space-y-4 px-6 py-6">
          <MobileNavLink
            to="/home"
            label="Home"
            currentPath={location.pathname}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Work Section - Accordion */}
          <div className="flex flex-col">
            <button
              onClick={() => setIsMobileWorkOpen(!isMobileWorkOpen)}
              className="flex items-center justify-between text-sm tracking-widest uppercase text-gray-500 transition-colors duration-300"
            >
              <span>Layout Makeup</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  isMobileWorkOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Submenu */}
            <div
              className={`flex flex-col space-y-3 pl-4 mt-3 overflow-hidden transition-all duration-300 ${
                isMobileWorkOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <MobileNavLink
                to="/gallery/beauty"
                label="Trang điểm cá nhân"
                currentPath={location.pathname}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                to="/gallery/bridal"
                label="Trang điểm Cô dâu"
                currentPath={location.pathname}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                to="/gallery/event"
                label="Trang điểm Sự kiện – Dạ tiệc"
                currentPath={location.pathname}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                to="/gallery/commercial"
                label="Trang điểm Thương mại – Truyền thông"
                currentPath={location.pathname}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                to="/gallery/lookbook"
                label="Trang điểm Lookbook – Concept"
                currentPath={location.pathname}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <MobileNavLink
                to="/gallery/graduation"
                label="Trang điểm Tốt nghiệp – Kỷ yếu"
                currentPath={location.pathname}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>

          <MobileNavLink
            to="/pricing"
            label="Pricing"
            currentPath={location.pathname}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <MobileNavLink
            to="/contact"
            label="Contact"
            currentPath={location.pathname}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </nav>
      </div>
    </header>
  );
};

/* ======================
   COMPONENTS
====================== */

const NavLink = ({ to, label, currentPath }) => {
  const isActive = currentPath === to;

  return (
    <Link to={to} className="group">
      <span
        className={`inline-block text-sm tracking-widest uppercase transition-all duration-300 ${
          isActive
            ? "text-luxury-black font-medium"
            : "text-gray-500 group-hover:text-luxury-black group-hover:opacity-70 group-hover:scale-110"
        }`}
      >
        {label}
      </span>
    </Link>
  );
};

const DropdownLink = ({ to, label }) => (
  <Link
    to={to}
    className="text-sm tracking-wide uppercase text-gray-500 hover:text-luxury-black transition-all duration-300 block w-fit mx-auto hover:opacity-70 hover:scale-105"
  >
    {label}
  </Link>
);

const MobileNavLink = ({ to, label, currentPath, onClick }) => {
  const isActive = currentPath === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-sm tracking-wide uppercase transition-colors duration-300 ${
        isActive ? "text-luxury-black font-medium" : "text-gray-500"
      }`}
    >
      {label}
    </Link>
  );
};

export default Header;
