
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
        <motion.img
          src="/phitopolis_logo_white.svg"
          alt="Phitopolis"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-14 w-auto"
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-white font-display font-bold text-2xl tracking-tight"
        >
          PH<span className="text-accent">IT</span>OPOLIS
        </motion.p>
        <div className="w-40 h-[2px] bg-white/15 rounded-full overflow-hidden mt-1">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
            className="h-full w-full bg-accent rounded-full"
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
              className={`relative text-sm font-medium transition-colors hover:text-accent pb-1 ${
                location.pathname === link.href ? 'text-accent' : 'text-slate-100'
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
              <Github size={20} className="text-white hover:text-accent cursor-pointer transition-colors" />
              <Linkedin size={20} className="text-white hover:text-accent cursor-pointer transition-colors" />
              <Twitter size={20} className="text-white hover:text-accent cursor-pointer transition-colors" />
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
            <ul className="space-y-3 text-slate-100 text-sm">
              <li>info@phitopolis.com</li>
              <li>27/F Ecotower Building</li>
              <li>32nd St. cor. 9th Avenue</li>
              <li>Bonifacio Global City, Taguig</li>
              <li>Philippines, 1634</li>
            </ul>
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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:slug" element={<JobDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPostDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <MobileNavigation />
      </div>
    </Router>
  );
}
