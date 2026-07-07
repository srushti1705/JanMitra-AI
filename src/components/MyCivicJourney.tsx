"use client";

import { motion } from "framer-motion";
import { Award, Clock3, FileCheck2, MessageSquareMore, Sparkles, TrendingUp } from "lucide-react";

const badges = [
  { title: "First Report", detail: "Submitted your first civic issue", icon: Award },
  { title: "Document Helper", detail: "Uploaded and analyzed a document", icon: FileCheck2 },
  { title: "Civic Explorer", detail: "Used the services hub", icon: Sparkles },
];

export default function MyCivicJourney() {
  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">My Civic Journey</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">Your civic momentum at a glance</h2>
            <p className="mt-2 text-sm text-slate-500">Track progress, achievements, and your most valuable civic actions.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            Level 4 • Civic Champion
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Weekly momentum</p>
                <p className="mt-1 text-sm text-slate-500">You’ve saved roughly 14 hours of effort this month.</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Reports submitted", value: "7" },
                { label: "Resolved issues", value: "4" },
                { label: "Services used", value: "12" },
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] bg-slate-50 p-4 dark:bg-slate-900">
                  <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent activity</h3>
            <div className="mt-4 space-y-3">
              {[
                { title: "Applied for a birth certificate update", time: "2h ago" },
                { title: "Uploaded utility bill for address validation", time: "Yesterday" },
                { title: "Used AI guidance for a public complaint", time: "3 days ago" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.time}</p>
                  </div>
                  <Clock3 className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Achievements</h3>
          <div className="mt-4 space-y-3">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.title} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{badge.title}</p>
                    <p className="text-sm text-slate-500">{badge.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] bg-slate-50 p-4 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <MessageSquareMore className="h-4 w-4 text-primary" /> AI conversations this month
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-800 dark:text-slate-100">24</p>
            <p className="mt-1 text-sm text-slate-500">Your guidance requests continue to improve every week.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
