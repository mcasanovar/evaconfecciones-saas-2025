"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Shirt } from "lucide-react";

export function Splashscreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen splash before
    const hasSeenSplash = localStorage.getItem("hasSeenSplash");

    if (!hasSeenSplash) {
      setShow(true);
      // Hide splash after 2.5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        localStorage.setItem("hasSeenSplash", "true");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  // Sewing machine icon SVG
  const SewingMachine = () => (
    <svg viewBox="0 0 100 100" className="w-24 h-24" fill="currentColor">
      <rect x="20" y="30" width="50" height="40" rx="5" />
      <rect x="25" y="35" width="15" height="15" rx="2" />
      <circle cx="33" cy="42" r="3" />
      <rect x="30" y="20" width="8" height="15" rx="2" />
      <rect x="32" y="15" width="4" height="8" rx="1" />
      <rect x="25" y="65" width="8" height="5" />
      <rect x="57" y="65" width="8" height="5" />
    </svg>
  );

  // Yarn ball icon SVG
  const YarnBall = () => (
    <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="50" cy="50" r="25" />
      <path d="M 30 35 Q 50 45 70 35" />
      <path d="M 30 50 Q 50 60 70 50" />
      <path d="M 30 65 Q 50 75 70 65" />
      <path d="M 70 35 L 85 25" strokeWidth="2" />
    </svg>
  );

  // Button icon SVG
  const Button = () => (
    <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="50" cy="50" r="25" />
      <circle cx="42" cy="42" r="3" fill="currentColor" />
      <circle cx="58" cy="42" r="3" fill="currentColor" />
      <circle cx="42" cy="58" r="3" fill="currentColor" />
      <circle cx="58" cy="58" r="3" fill="currentColor" />
    </svg>
  );

  // Fabric icon SVG
  const Fabric = () => (
    <svg viewBox="0 0 100 100" className="w-20 h-20" fill="currentColor">
      <path d="M 20 30 L 50 30 L 50 70 L 20 70 Z" opacity="0.7" />
      <circle cx="65" cy="50" r="20" opacity="0.7" />
      <circle cx="62" cy="47" r="3" />
      <circle cx="68" cy="47" r="3" />
      <circle cx="62" cy="53" r="3" />
      <circle cx="68" cy="53" r="3" />
    </svg>
  );

  // Needles crossed icon SVG
  const NeedlesCrossed = () => (
    <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="3">
      <line x1="20" y1="80" x2="80" y2="20" />
      <line x1="80" y1="80" x2="20" y2="20" />
      <rect x="48" y="15" width="4" height="8" fill="currentColor" />
    </svg>
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "#1e3a5f" }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Decorative icons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute top-20 left-32 text-blue-300"
            >
              <SewingMachine />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 text-blue-300"
            >
              <YarnBall />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="absolute top-20 right-32 text-blue-300"
            >
              <Scissors className="w-20 h-20" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="absolute bottom-32 left-40 text-blue-300"
            >
              <NeedlesCrossed />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 text-blue-300"
            >
              <Fabric />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute bottom-32 right-40 text-blue-300"
            >
              <Button />
            </motion.div>

            {/* Main content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center z-10"
            >
              <h1 className="text-7xl font-bold text-white tracking-tight mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                Evaconfecciones
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xl text-blue-200"
              >
                Cargando el sistema...
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
