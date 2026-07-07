"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useApp, CivicComplaint } from "@/context/AppContext";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Award,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronUp,
  Calendar,
  Sparkles,
  Zap,
  Info
} from "lucide-react";

export default function TrackerPage() {
  const { complaints, refreshComplaints } = useApp();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"complaints" | "journey">(
    defaultTab === "journey" ? "journey" : "complaints"
  );

  const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null);

  useEffect(() => {
    refreshComplaints();
  }, []);

  useEffect(() => {
    if (defaultTab === "journey") {
      setActiveTab("journey");
    }
  }, [defaultTab]);

  const toggleExpand = (id: string) => {
    if (expandedComplaint === id) {
      setExpandedComplaint(null);
    } else {
      setExpandedComplaint(id);
    }
  };

  // Gamified metrics
  const totalXP = (complaints.length * 100) + (complaints.filter(c => c.status === "Resolved").length * 200) + 50;
  const rank = totalXP < 200 ? "Civic Novice" : totalXP < 500 ? "Civic Sentinel" : "Civic Champion";

  const badges = [
    { id: "sentinel", title: "Civic Sentinel", desc: "For submitting your first public issue report.", earned: complaints.length >= 1 },
    { id: "community", title: "Community Guardian", desc: "For reporting issues across 3 different categories.", earned: new Set(complaints.map(c => c.category)).size >= 3 },
    { id: "resolution", title: "Resolution Ally", desc: "For having at least one filed complaint fully resolved.", earned: complaints.some(c => c.status === "Resolved") },
    { id: "helper", title: "JanMitra Scholar", desc: "For completing a Life Event Assistant checklist.", earned: true }
  ];

  const milestones = [
    { title: "Mitra Profile Initialized", desc: "Created account and configured location filters.", date: "Today", reached: true },
    { title: "First Issue Reported", desc: "Filed a public report detailing local concerns.", date: complaints.length >= 1 ? "Recent" : "Locked", reached: complaints.length >= 1 },
    { title: "Earn 500 XP Points", desc: "Accumulate points from reports and scheme views.", date: totalXP >= 500 ? "Done" : "In Progress", reached: totalXP >= 500 },
    { title: "Civic Champion Title", desc: "Achieve the ultimate tier of community engagement.", date: totalXP >= 1000 ? "Locked" : "Locked", reached: totalXP >= 1000 },
  ];

  const getStatusStep = (status: string) => {
    switch (status) {
      case "Submitted": return 1;
      case "In Review": return 2;
      case "Assigned": return 3;
      case "In Progress": return 4;
      case "Resolved": return 5;
      default: return 1;
    }
  };

  const timelineSteps = ["Submitted", "In Review", "Assigned", "In Progress", "Resolved"];

  return (
    <div className="space-y-6 pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary dark:text-primary-dark" />
            <span>Complaint Tracker & Civic Journey</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor public issue statuses or check your citizen contribution leaderboard points
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center mt-3 md:mt-0 border border-slate-200/50 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("complaints")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "complaints"
                ? "bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-150 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            My Complaints ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab("journey")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "journey"
                ? "bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-150 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Civic Journey (XP)
          </button>
        </div>
      </div>

      {/* ================= TAB 1: COMPLAINTS LIST & TIMELINES ================= */}
      {activeTab === "complaints" && (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center py-16 md-card bg-white dark:bg-slate-900">
              <div className="p-4 bg-slate-150 dark:bg-slate-800 rounded-full w-fit mx-auto text-slate-400 dark:text-slate-650 mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-350 font-display">No Public Reports Filed</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Have you spotted any damaged roads, broken streetlights, or waste pile-ups? Submit an issue to start tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((item) => {
                const currentStepIdx = getStatusStep(item.status);
                const isExpanded = expandedComplaint === item.id;
                
                return (
                  <div
                    key={item.id}
                    className={`md-card bg-white dark:bg-slate-900 border transition-all ${
                      isExpanded ? "border-primary/20 dark:border-primary-dark/20 ring-1 ring-primary/5" : "border-slate-200/80 dark:border-slate-850"
                    }`}
                  >
                    {/* Header Summary */}
                    <div
                      onClick={() => toggleExpand(item.id || "")}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 select-none"
                    >
                      <div className="space-y-1 pr-4">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-sm">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display mt-1">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-350" /> {item.district}, {item.state}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          item.status === "Resolved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : item.status === "In Progress"
                            ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                            : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                        }`}>
                          {item.status}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-5 pb-6 border-t border-slate-100 dark:border-slate-850 pt-5 space-y-6">
                        
                        {/* Description & Image Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="md:col-span-2 space-y-3">
                            <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wide">Detailed Report</h5>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {item.description}
                            </p>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold mt-2.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Filed on {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                          </div>

                          {/* Image preview */}
                          {item.imageUrl && (
                            <div className="md:col-span-1">
                              <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wide mb-2">Attached Image</h5>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.imageUrl}
                                alt="Report attachment"
                                className="max-h-36 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                              />
                            </div>
                          )}
                        </div>

                        {/* Interactive Status Timeline Progress Bar */}
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wide">Tracking Timeline</h5>
                          
                          {/* Timeline Bar */}
                          <div className="relative flex items-center justify-between w-full mt-6 px-2">
                            {/* Connector Line */}
                            <div className="absolute left-6 right-6 top-[13px] h-[3px] bg-slate-200 dark:bg-slate-800 -z-10 rounded-full" />
                            <div
                              className="absolute left-6 top-[13px] h-[3px] bg-primary dark:bg-primary-dark -z-10 rounded-full transition-all duration-500"
                              style={{ width: `${((currentStepIdx - 1) / (timelineSteps.length - 1)) * 95}%` }}
                            />

                            {timelineSteps.map((step, idx) => {
                              const stepNum = idx + 1;
                              const reached = currentStepIdx >= stepNum;
                              const active = currentStepIdx === stepNum;
                              
                              return (
                                <div key={step} className="flex flex-col items-center select-none">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                                    reached
                                      ? "bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark text-white dark:text-slate-950 shadow-md shadow-primary/20"
                                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-755 text-slate-400"
                                  } ${active ? "ring-4 ring-primary/20 dark:ring-primary-dark/25 scale-105" : ""}`}>
                                    {reached ? "✓" : stepNum}
                                  </div>
                                  <span className={`text-[10px] mt-1.5 font-bold transition-colors ${reached ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}`}>
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Audit Log / History Notes */}
                        <div className="space-y-3 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-205 dark:border-slate-800/80 p-4 rounded-2xl">
                          <h5 className="text-[11px] font-bold text-slate-450 uppercase tracking-wide flex items-center gap-1.5">
                            <Info className="w-4 h-4 text-slate-400" /> Resolution Notes History
                          </h5>
                          <div className="space-y-3">
                            {item.updateHistory?.map((hist, idx) => (
                              <div key={idx} className="text-xs leading-normal border-l-2 border-primary/45 dark:border-primary-dark/45 pl-3 space-y-0.5">
                                <div className="flex justify-between items-center font-bold text-slate-750 dark:text-slate-350">
                                  <span>{hist.status}</span>
                                  <span className="text-[9px] text-slate-400 font-semibold">{new Date(hist.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400">{hist.note}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: CIVIC JOURNEY GAMIFICATION ================= */}
      {activeTab === "journey" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: XP Dashboard & Badges */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* XP Summary card */}
            <div className="md-card p-6 bg-gradient-to-br from-primary/10 via-white to-emerald-500/10 dark:from-primary-dark/5 dark:via-slate-900 dark:to-slate-900 border-primary/20 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
              <div className="p-3 bg-primary dark:bg-primary-dark text-white dark:text-slate-950 rounded-2xl mb-4 shadow-md shadow-primary/20">
                <Award className="w-8 h-8" />
              </div>
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Citizen Level Profile</span>
              <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100 mt-1">
                {rank}
              </h3>
              
              {/* XP Circle progress bar */}
              <div className="relative w-36 h-36 flex items-center justify-center my-5">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="40" stroke="rgba(200, 200, 200, 0.15)" strokeWidth="6" fill="transparent" />
                  {/* Fill Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1a73e8"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (totalXP % 500)) / 500}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-50">{totalXP}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total XP</span>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Next Tier Target:</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">{(totalXP % 500) === 0 ? 500 : (500 - (totalXP % 500))} XP Left</span>
              </div>
            </div>

            {/* Earned Badges Panel */}
            <div className="md-card p-6 space-y-4">
              <h3 className="font-bold text-sm font-display text-slate-850 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-yellow-500 fill-current" /> Civic Badges
              </h3>
              
              <div className="space-y-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex items-center space-x-3 p-3 border rounded-2xl transition-all ${
                      badge.earned
                        ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        : "bg-slate-100/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-900/50 opacity-40 select-none"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border ${
                      badge.earned
                        ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                        : "bg-slate-200 border-transparent text-slate-400"
                    }`}>
                      <Zap className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 leading-none">{badge.title}</h4>
                      <p className="text-[10px] text-slate-450 mt-1 leading-normal">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Progressive Milestone Map */}
          <div className="lg:col-span-2 md-card p-6 bg-white dark:bg-slate-900">
            <h3 className="font-bold text-base font-display text-slate-800 dark:text-slate-250 mb-5 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>Civic Roadmap Milestones</span>
            </h3>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-850 ml-4 pl-8 py-3 space-y-8">
              {milestones.map((m, idx) => (
                <div key={idx} className="relative">
                  {/* Indicator Dot */}
                  <span className={`absolute -left-[42px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    m.reached
                      ? "bg-emerald-500 border-emerald-500 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-md shadow-emerald-500/10"
                      : "bg-slate-200 border-slate-350 dark:bg-slate-900 dark:border-slate-800 text-slate-400"
                  }`}>
                    {idx + 1}
                  </span>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-xs font-bold ${m.reached ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-600"}`}>
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-1 leading-normal max-w-md">
                        {m.desc}
                      </p>
                    </div>
                    
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${
                      m.reached ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}>
                      {m.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
