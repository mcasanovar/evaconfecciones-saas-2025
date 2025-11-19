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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Evaconfecciones
            </h1>
            <p className="text-slate-300">Gestión de Pedidos</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
