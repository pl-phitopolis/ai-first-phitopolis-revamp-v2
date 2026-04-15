/**
 * ABOUT PAGE — SUPERSEDED (April 10, 2026)
 *
 * The /about route now renders the AI Day page content via AIDayPage (isAbout=true).
 * This file is kept for historical reference. See App.tsx for the current routing.
 *
 * Original code preserved below:
 */

/*
import React, { useState, useRef, useEffect } from 'react';
import { Target, Eye, Heart, Play, X, Rocket, ShieldCheck, Globe, Building2, Cpu, Zap } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import TextScramble from '../../components/TextScramble';

export default function AboutPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    document.title = 'About Us | Phitopolis';
  }, []);

  // Interactive spotlight logic for the Founder's Story section
  const founderSectionRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 150 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!founderSectionRef.current) return;
    const rect = founderSectionRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const PHILOSOPHY = [
    {
      icon: <Target size={26} />,
      title: "Mission",
      desc: "To build high-performance systems that make massive datasets actionable, empowering our clients to stay ahead in competitive markets."
    },
    {
      icon: <Eye size={26} />,
      title: "Vision",
      desc: "To be the global benchmark for elite R&D and data science services, recognized for our technical depth and proven outcomes."
    },
    {
      icon: <Heart size={26} />,
      title: "Values",
      desc: "Radical transparency, technical integrity, and a relentless pursuit of performance. We value depth over breadth."
    }
  ];

  const JOURNEY_DATA = [
    {
      year: '2021',
      title: 'Inception',
      desc: 'Phitopolis founded with a core team of quant engineers.',
      icon: <Rocket className="text-accent" />
    },
    {
      year: '2022',
      title: 'Growth',
      desc: 'Strategic partnerships with global investment banks.',
      icon: <ShieldCheck className="text-accent" />
    },
    {
      year: '2023',
      title: 'Delivery',
      desc: 'Scaling operations across multiple global time zones.',
      icon: <Globe className="text-accent" />
    },
    {
      year: '2024',
      title: 'Ready',
      desc: 'Pioneering next-gen AI infrastructures in NYC.',
      icon: <Building2 className="text-accent" />
    },
    {
      year: '2025',
      title: 'Evolved',
      desc: 'Modernized infrastructure and expanded R&D capabilities.',
      icon: <Cpu className="text-accent" />
    },
    {
      year: '2026',
      title: 'Frontier',
      desc: 'Leading the frontier in AI-first engineering solutions.',
      icon: <Zap className="text-accent" />,
      current: true
    }
  ];

  return (
    <div className="bg-white min-h-screen text-primary">
      {/* Hero *}
      <section className="min-h-screen flex items-center border-b border-slate-100">
        <div className="container mx-auto px-6 py-32">
          <div className="max-w-4xl">
            <span className="text-accent font-bold tracking-widest uppercase text-xs">Our Story</span>
            <h1 className="text-5xl md:text-8xl font-display font-bold mt-4 mb-12 tracking-tight text-primary">
              <TextScramble text="We bridge the gap between vision and reality." />
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light">
              Phitopolis was founded with a single mission: to provide elite-level technology services
              that empower organizations to solve their most complex data and computational challenges.
            </p>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values *}
      ...
    </div>
  );
}
*/

export default function AboutPage() {
  return null;
}
