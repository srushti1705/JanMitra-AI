"use client";

import { motion } from "framer-motion";
import { BrainCircuit, ArrowRight, Sparkles } from "lucide-react";

export default function AIInsightsCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">AI Insights</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">Personalized civic guidance</h2>
        </div>
        <div className="rounded-full bg-primary/10 p-3 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
          <BrainCircuit className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 rounded-[24px] bg-slate-50 p-4 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">You are 2 steps away from faster service access.</p>
            <p className="mt-1 text-sm text-slate-500">Upload one more document and JanMitra AI will recommend the shortest route for your next request.</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
        <span className="text-slate-600 dark:text-slate-300">Suggested next action</span>
        <button className="flex items-center gap-2 font-semibold text-primary dark:text-primary-dark">
          Open assistant <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
