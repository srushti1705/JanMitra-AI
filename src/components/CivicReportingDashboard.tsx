"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import CivicReportingMap from "@/components/CivicReportingMap";
import { AlertCircle, BellRing, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";

export default function CivicReportingDashboard() {
  const { complaints, notifications } = useApp();
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number; label: string } | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Current location",
        });
      },
      () => undefined,
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  const stats = useMemo(() => ({
    total: complaints.length,
    resolved: complaints.filter((item) => item.status === "Resolved").length,
    inProgress: complaints.filter((item) => ["Assigned", "In Progress"].includes(item.status)).length,
  }), [complaints]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Civic reporting at a glance</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">Track submitted issues, watch progress, and stay updated with municipal responses.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
              <p className="text-xs uppercase text-slate-400">Reports</p>
              <p className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">{stats.total}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
              <p className="text-xs uppercase text-slate-400">In progress</p>
              <p className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">{stats.inProgress}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
              <p className="text-xs uppercase text-slate-400">Resolved</p>
              <p className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">{stats.resolved}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
          </div>
          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-3 text-sm text-slate-500 dark:border-slate-800">No updates yet.</div>
            ) : notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  {item.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                  {item.title}
                </div>
                <p className="mt-1 text-slate-500">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CivicReportingMap complaints={complaints} currentLocation={currentLocation} />
    </div>
  );
}
