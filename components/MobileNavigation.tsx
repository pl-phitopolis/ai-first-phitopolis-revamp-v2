import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, Users, Mail, Menu, X } from 'lucide-react';
import { useScrollDirection } from '../lib/hooks/useScrollDirection';
import { hapticTick } from '../lib/haptics';

const primaryLinks = [
  { icon: Home, to: '/', label: 'Home' },
  { icon: Briefcase, to: '/services', label: 'Services' },
  { icon: Users, to: '/about', label: 'About' },
  { icon: Mail, to: '/contact', label: 'Contact' },
];

const allLinks = [
  { name: 'Home', to: '/' },
  { name: 'Services', to: '/services' },
  { name: 'About', to: '/about' },
  { name: 'Careers', to: '/careers' },
  { name: 'Blog', to: '/blog' },
  { name: 'Contact', to: '/contact' },
];

export default function MobileNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const scrollDirection = useScrollDirection();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavTap = () => {
    hapticTick();
  };

  return (
    <>
      {/* Floating Bottom Bar */}
      <motion.nav
        className="fixed bottom-6 left-1/2 z-50 md:hidden"
        style={{ translateX: '-50%' }}
        animate={{ y: scrollDirection === 'down' && !menuOpen ? 100 : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="flex items-center space-x-5 px-6 py-3 rounded-full border border-white/10 shadow-2xl"
          style={{
            backgroundColor: 'rgba(10, 42, 102, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {primaryLinks.map(({ icon: Icon, to, label }) => (
            <Link
              key={to}
              to={to}
              aria-label={label}
              onClick={() => { handleNavTap(); setMenuOpen(false); }}
              className="relative p-2"
            >
              <Icon
                size={20}
                className={`transition-colors duration-200 ${
                  isActive(to) ? 'text-accent' : 'text-white/70'
                }`}
              />
              {isActive(to) && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -bottom-1 left-1/2 w-1 h-1 rounded-full bg-accent"
                  style={{ translateX: '-50%' }}
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                />
              )}
            </Link>
          ))}

          {/* Separator */}
          <div className="w-px h-6 bg-white/20" />

          {/* Menu trigger */}
          <button
            onClick={() => { handleNavTap(); setMenuOpen(true); }}
            aria-label="Open full menu"
            className="p-2"
          >
            <Menu size={20} className="text-white/70" />
          </button>
        </div>
      </motion.nav>

      {/* Full-screen menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] md:hidden flex flex-col items-center justify-center"
            style={{
              backgroundColor: 'rgba(10, 42, 102, 0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => { hapticTick(); setMenuOpen(false); }}
              aria-label="Close menu"
              className="absolute top-6 right-6 p-3 text-white/70 hover:text-white"
            >
              <X size={28} />
            </button>

            {/* Links */}
            <nav className="flex flex-col items-center space-y-6">
              {allLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => { hapticTick(); setMenuOpen(false); }}
                    className={`text-3xl font-display font-bold transition-colors ${
                      isActive(link.to) ? 'text-accent' : 'text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
