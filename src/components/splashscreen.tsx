"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Splashscreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has seen splash before
    const hasSeenSplash = localStorage.getItem("hasSeenSplash");

    if (!hasSeenSplash) {
      setShow(true);
      // Hide splash after 2 seconds
      const timer = setTimeout(() => {
        setShow(false);
        localStorage.setItem("hasSeenSplash", "true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold text-white tracking-tight">
              Evaconfecciones
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
