
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ArrowRight, Github, Linkedin, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import Home from './app/page.tsx';
import Services from './app/services/page.tsx';
import About from './app/about/page.tsx';
import Careers from './app/careers/page.tsx';
import Blog from './app/blog/page.tsx';
import Contact from './app/contact/page.tsx';
import JobDetail from './app/careers/[slug]/page.tsx';
import BlogPostDetail from './app/blog/[slug]/page.tsx';
import NotFound from './app/not-found/page.tsx';
import MobileNavigation from './components/MobileNavigation.tsx';

// Updated to use the requested external logo image
const LOGO_PATH = 'https://phitopolis.com/img/phitopolis-logo.png';

const LoadingScreen = ({ isVisible }: { isVisible: boolean }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed inset-0 z-[200] bg-primary flex flex-col items-center justify-center gap-5"
      >
        <div className="relative flex items-center justify-center">
          {/* Rotating glow ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute w-24 h-24 border-t-2 border-r-2 border-accent/40 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute w-28 h-28 border-b-2 border-l-2 border-white/10 rounded-full"
          />

          <motion.img
            src="/phitopolis_logo_white.svg"
            alt="Phitopolis"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-10 w-auto relative z-10"
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/**
 * ScrollToTop Component: Resets scroll position on route change
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**
 * Image Shim: Mimics Next.js Image component API for the current React environment.
 */
const Image = ({ src, alt, width, height, className, priority, style }: {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
    style={style}
    loading={priority ? "eager" : "lazy"}
  />
);

const Header = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary-light group/header">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group/brand">
          <Image
            src="/phitopolis_logo_white.svg"
            alt="Phitopolis Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain"
            priority={true}
          />
          <span className="text-2xl font-display font-bold tracking-tight text-white transition-colors uppercase">
            PH<span className="transition-colors duration-500 group-hover/header:text-accent">IT</span>OPOLIS
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`relative text-sm font-medium transition-colors hover:text-accent pb-1 ${location.pathname === link.href ? 'text-accent' : 'text-slate-100'
                }`}
            >
              {link.name}
              {location.pathname === link.href && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-primary border-t border-primary-light py-16 text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image
                src={LOGO_PATH}
                alt="Phitopolis Official Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain block brightness-0 invert"
              />
              <span className="text-xl font-display font-bold tracking-tight">Phitopolis</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
              Making tomorrow's technology available today. Elite engineering for data-intensive challenges.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Phitopolis on GitHub" className="text-white hover:text-accent transition-colors">
                <Github size={20} />
              </a>
              <a href="#" aria-label="Phitopolis on LinkedIn" className="text-white hover:text-accent transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" aria-label="Phitopolis on Twitter" className="text-white hover:text-accent transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-accent font-bold mb-6">Services</h4>
            <ul className="space-y-3 text-slate-100 text-sm">
              <li><Link to="/services" className="hover:text-accent transition-colors">R&D Consulting</Link></li>
              <li><Link to="/services" className="hover:text-accent transition-colors">Data Science</Link></li>
              <li><Link to="/services" className="hover:text-accent transition-colors">Full-Stack Dev</Link></li>
              <li><Link to="/services" className="hover:text-accent transition-colors">FinTech Strategy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-accent font-bold mb-6">Company</h4>
            <ul className="space-y-3 text-slate-100 text-sm">
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-accent transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-accent font-bold mb-6">Contact</h4>
            <div className="text-slate-100 text-sm space-y-2">
              <p>info@phitopolis.com</p>
              <p className="leading-snug">27/F Ecotower Building, 32nd St. cor. 9th Avenue, Bonifacio Global City, Taguig, Philippines, 1634</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary-light flex flex-col md:flex-row justify-between items-center text-slate-300 text-xs gap-4">
          <p>© 2024 Phitopolis Private Limited. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
        <Route path="/careers/:slug" element={<PageTransition><JobDetail /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPostDetail /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isLoading ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isLoading]);

  return (
    <Router>
      <LoadingScreen isVisible={isLoading} />
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow pt-16">
          <AppRoutes />
        </main>
        <Footer />
        <MobileNavigation />
      </div>
    </Router>
  );
}
