"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    // Hold splash screen for 3 seconds then fade out
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as any,
      },
    },
  };

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeInOut" as any,
      },
    },
  };

  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 1.0,
        staggerChildren: 0.2,
      },
    },
  };

  const textItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as any,
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Animated Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-72 h-72 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl" />

      <div className="flex flex-col items-center z-10">
        {/* Animated SVG Emblem */}
        <motion.div
          variants={logoVariants}
          initial="hidden"
          animate="visible"
          className="relative w-28 h-28 mb-6 flex items-center justify-center"
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            className="w-full h-full text-primary dark:text-primary-dark"
          >
            {/* Outer Diamond */}
            <motion.path
              d="M 50 10 L 90 50 L 50 90 L 10 50 Z"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={lineVariants}
            />
            {/* Inner Shield / Digital Mitra Crest */}
            <motion.path
              d="M 50 25 L 75 40 L 75 60 C 75 75, 50 82, 50 82 C 50 82, 25 75, 25 60 L 25 40 Z"
              stroke="#0f9d58"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={lineVariants}
            />
            {/* Core Glowing Eye of AI */}
            <motion.circle
              cx="50"
              cy="50"
              r="8"
              fill="#1a73e8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" as any }}
            />
            {/* Pulsing AI waves */}
            <motion.circle
              cx="50"
              cy="50"
              r="18"
              stroke="#1a73e8"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.5, 1.8], opacity: [0, 0.4, 0] }}
              transition={{
                delay: 1.5,
                duration: 2,
                repeat: Infinity,
                ease: "easeOut" as any,
              }}
            />
          </svg>
        </motion.div>

        {/* Text Logo and Slogan */}
        <motion.div
          variants={textContainerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.h1
            variants={textItemVariants}
            className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-emerald-600 to-indigo-600 dark:from-blue-400 dark:via-emerald-400 dark:to-indigo-400 font-display"
          >
            JanMitra AI
          </motion.h1>
          <motion.p
            variants={textItemVariants}
            className="mt-3 text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase max-w-xs md:max-w-md"
          >
            Your Intelligent Government Companion
          </motion.p>
        </motion.div>

        {/* Minimalist Google-style Loading Line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 160, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.5 }}
          className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-10 overflow-hidden relative"
        >
          <motion.div
            animate={{ x: [-160, 160] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut" as any,
            }}
            className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-blue-500 via-emerald-500 to-yellow-500 rounded-full"
          />
        </motion.div>
      </div>
    </div>
  );
}
