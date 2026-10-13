"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import LandingPage from "@/components/landing/landing-page";
import { AppShell } from "@/components/app/app-shell";

export default function Home() {
  const view = useAppStore((s) => s.view);
  const enterApp = useAppStore((s) => s.enterApp);
  const exitApp = useAppStore((s) => s.exitApp);

  return (
    <AnimatePresence mode="wait">
      {view === "landing" ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <LandingPage onLaunch={enterApp} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="h-screen"
        >
          <AppShell />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
