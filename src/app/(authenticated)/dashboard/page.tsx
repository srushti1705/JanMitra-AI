"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import {
  Search,
  Bell,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  FolderLock,
  Route,
  UserCheck,
  ArrowRight,
  Bookmark,
  Activity,
  CheckCircle,
  Clock,
  ExternalLink,
  Info,
  Accessibility
} from "lucide-react";
import AIInsightsCard from "@/components/AIInsightsCard";
import NotificationCenter from "@/components/NotificationCenter";

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  department: string;
  description: string;
  url: string;
}

const RECOMMENDED_SERVICES: ServiceItem[] = [
  {
    id: "uidai",
    title: "Aadhaar Card Updates",
    category: "Identity",
    department: "UIDAI",
    description: "Update demographic info, link mobile numbers, or verify identity docs online.",
    url: "https://uidai.gov.in"
  },
  {
    id: "abha",
    title: "ABHA Health Card Portal",
    category: "Healthcare",
    department: "National Health Authority",
    description: "Register for Ayushman Bharat Digital Health Card for centralized medical histories.",
    url: "https://abdm.gov.in"
  },
  {
    id: "digilocker",
    title: "Digilocker Document Vault",
    category: "Documentation",
    department: "MeitY",
    description: "Access and share authentic digital copies of state and central documents.",
    url: "https://digilocker.gov.in"
  },
  {
    id: "nsp",
    title: "National Scholarship Portal",
    category: "Education",
    department: "Ministry of Education",
    description: "Apply for Central, State, and UGC scholarship schemes instantly.",
    url: "https://scholarships.gov.in"
  }
];

export default function DashboardPage() {
  const { profile, complaints, refreshComplaints } = useApp();
  const [greeting, setGreeting] = useState("Hello");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [savedServices, setSavedServices] = useState<string[]>(["digilocker", "uidai"]);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const storedContrast = window.localStorage.getItem("janmitra_high_contrast") === "true";
    const storedLargeFont = window.localStorage.getItem("janmitra_large_font") === "true";
    setIsHighContrast(storedContrast);
    setIsLargeFont(storedLargeFont);
    document.documentElement.classList.toggle("high-contrast", storedContrast);
    document.body.classList.toggle("large-font", storedLargeFont);

    refreshComplaints();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", isHighContrast);
    document.body.classList.toggle("large-font", isLargeFont);
    window.localStorage.setItem("janmitra_high_contrast", String(isHighContrast));
    window.localStorage.setItem("janmitra_large_font", String(isLargeFont));
  }, [isHighContrast, isLargeFont]);

  const toggleSaveService = (serviceId: string) => {
    if (savedServices.includes(serviceId)) {
      setSavedServices(savedServices.filter((id) => id !== serviceId));
    } else {
      setSavedServices([...savedServices, serviceId]);
    }
  };

  const notifications = [
    { id: 1, title: "Complaint #JM-849 Assigned", desc: "Your report about potholes has been assigned to local MCD unit.", time: "10m ago", read: false },
    { id: 2, title: "New AI Recommendation Available", desc: "Check scholarship eligibility in your feed.", time: "2h ago", read: true },
    { id: 3, title: "System Maintenance Scheduled", desc: "JanMitra services will undergo maintenance on Sunday 2:00 AM.", time: "1d ago", read: true },
  ];

  const quickActions = [
    { label: "AI Assistant", desc: "Chat with Mitra AI", href: "/ai-assistant", icon: Sparkles, color: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20" },
    { label: "Government Services", desc: "Explore civic portals", href: "#services-section", icon: FolderLock, color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20" },
    { label: "Report Public Issue", desc: "File civic complaints", href: "/report", icon: AlertTriangle, color: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20" },
    { label: "Complaint Tracker", desc: "Check status of reports", href: "/tracker", icon: ShieldCheck, color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20" },
    { label: "Life Event Assistant", desc: "Checklist helpers", href: "/life-event", icon: UserCheck, color: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border-violet-500/20" },
    { label: "My Civic Journey", desc: "Points, milestones, badge logs", href: "/journey", icon: Route, color: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/20" },
  ];

  const filterServices = RECOMMENDED_SERVICES.filter((service) =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      
      {/* ================= HEADER SECTON ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {greeting}, <span className="text-primary dark:text-primary-dark">{profile?.fullName || "Citizen"}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">
            Welcome to JanMitra AI. You are registered in <span className="font-semibold text-slate-700 dark:text-slate-300">{profile?.district}, {profile?.state}</span>.
          </p>
        </div>

        {/* Notifications & Date info */}
        <div className="flex items-center space-x-3 self-end md:self-center relative">
          <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-800">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-pressed={isHighContrast}
              onClick={() => setIsHighContrast((value) => !value)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <Accessibility className="h-4 w-4" /> High contrast
            </button>
            <button
              type="button"
              aria-pressed={isLargeFont}
              onClick={() => setIsLargeFont((value) => !value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              A+ / A-
            </button>
          </div>

          {/* Notification Button */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 relative transition-all duration-200"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {/* Notification Dropdown Menu */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl p-4 z-50 overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Notifications</h3>
                    <button className="text-[10px] font-bold text-primary dark:text-primary-dark hover:underline">Mark all read</button>
                  </div>
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-2.5 rounded-xl transition-all ${notif.read ? "bg-transparent" : "bg-primary/5 dark:bg-primary-dark/5"}`}>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{notif.title}</h4>
                          <span className="text-[9px] text-slate-400 font-semibold">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= SEARCH BAR ================= */}
      <div className="relative w-full max-w-2xl">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
          <Search className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for government services, schemes, documents..."
          className="w-full pl-12 pr-4 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold font-display text-slate-800 dark:text-slate-200">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                className="md-card-interactive p-4 border border-slate-200 dark:border-slate-850 flex flex-col justify-between items-start min-h-[140px]"
              >
                <div className={`p-3 rounded-2xl border ${action.color} mb-3`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {action.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    {action.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ================= COMPACT PANELS: AI & COMPLAINTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Recommendations & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          <AIInsightsCard />

          {/* Recent Activity Feed */}
          <div className="md-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base font-display text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-slate-500" />
                <span>Recent Activity</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Auto-sync active</span>
            </div>
            
            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-5 py-2">
              <div className="relative">
                <span className="absolute -left-[30px] top-0.5 p-1 bg-emerald-500 text-white rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Profile Initialized</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Demographic parameters synchronized with digital companion.</p>
                <span className="text-[9px] text-slate-400 font-semibold block mt-1">Today, 11:15 AM</span>
              </div>

              <div className="relative">
                <span className="absolute -left-[30px] top-0.5 p-1 bg-blue-500 text-white rounded-full">
                  <Activity className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Session Verified</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Signed in via secure credentials.</p>
                <span className="text-[9px] text-slate-400 font-semibold block mt-1">Today, 11:14 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Complaint Updates */}
        <div className="space-y-6">
          <div className="md-card p-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base font-display text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Tracked Complaints</span>
              </h3>
              
              {complaints.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-400 font-medium">No complaints filed yet.</p>
                  <Link
                    href="/report"
                    className="mt-3 inline-block text-xs font-bold text-primary dark:text-primary-dark hover:underline"
                  >
                    File First Civic Report
                  </Link>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {complaints.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{item.title}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === "Resolved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Category: {item.category}</p>
                      <Link
                        href="/tracker"
                        className="text-[10px] font-semibold text-primary dark:text-primary-dark hover:underline block mt-2 text-right"
                      >
                        View Timeline &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/tracker"
              className="mt-6 flex items-center justify-center space-x-1.5 w-full py-3 bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl text-xs transition-all"
            >
              <span>Manage Complaints ({complaints.length})</span>
            </Link>
          </div>

          <NotificationCenter />
        </div>
      </div>

      {/* ================= GOVERNMENT SERVICES REGISTRY ================= */}
      <div id="services-section" className="space-y-4 pt-4">
        <h3 className="text-xl font-bold font-display text-slate-800 dark:text-slate-200">
          Recommended Government Portals
        </h3>
        
        {filterServices.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium">No portals match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterServices.map((service) => {
              const isSaved = savedServices.includes(service.id);
              return (
                <div key={service.id} className="md-card p-5 flex flex-col justify-between items-start gap-4">
                  <div className="w-full flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold tracking-wider uppercase bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark px-2.5 py-1 rounded-md">
                        {service.category}
                      </span>
                      <h4 className="text-base font-bold text-slate-850 dark:text-slate-100 font-display mt-2">
                        {service.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        Issuer: {service.department}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => toggleSaveService(service.id)}
                      className={`p-2 rounded-xl transition-all ${
                        isSaved
                          ? "bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {service.description}
                  </p>

                  <a
                    href={service.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 text-xs font-bold text-primary dark:text-primary-dark hover:underline self-end mt-2"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
