import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[12rem] md:text-[20rem] font-display font-bold text-white/[0.03] leading-none">
          404
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center px-6"
      >
        {/* Terminal-style error label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-mono text-sm text-accent/70 mb-6 tracking-widest uppercase"
        >
          <span className="animate-pulse mr-2">▋</span>
          SYSTEM ERROR: PAGE_NOT_FOUND
        </motion.p>

        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-4">
          Page not found.
        </h1>
        <p className="text-lg text-slate-300 mb-10 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-8 py-4 bg-accent hover:bg-accent-hover text-primary rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/30"
        >
          <ArrowLeft className="mr-2" size={18} />
          Return to Base
        </Link>
      </motion.div>
    </div>
  );
}
