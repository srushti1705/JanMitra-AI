"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, AlertCircle, LayoutDashboard, User, Settings, Briefcase, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function BottomNavBar() {
  const pathname = usePathname();
  const { user } = useApp();

  // If user is not logged in, do not render navigation
  if (!user) return null;

  const navItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Services", href: "/services", icon: Briefcase },
    { label: "AI Assistant", href: "/ai-assistant", icon: MessageSquare },
    { label: "Report", href: "/report", icon: AlertCircle, isFab: true },
    { label: "Documents", href: "/documents", icon: FileText },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 pb-safe z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isFab) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-5 flex flex-col items-center justify-center bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover text-white dark:text-slate-950 w-14 h-14 rounded-2xl shadow-lg shadow-primary/25 dark:shadow-primary-dark/15 active:scale-95 transition-all duration-200"
              >
                <Icon className="w-6 h-6" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-16 h-full text-slate-500 dark:text-slate-400 select-none group"
            >
              {/* MD3 Active Indicator Pill */}
              <div className="relative flex items-center justify-center px-5 py-1 rounded-full overflow-hidden transition-all duration-200">
                {active && (
                  <div className="absolute inset-0 bg-primary/10 dark:bg-primary-dark/20 rounded-full scale-100 transition-transform duration-300" />
                )}
                <Icon
                  className={`w-6 h-6 transition-all duration-200 group-hover:scale-105 ${
                    active
                      ? "text-primary dark:text-primary-dark stroke-[2.5px]"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-1 font-medium transition-colors duration-200 ${
                  active
                    ? "text-slate-900 dark:text-slate-100 font-bold"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ================= DESKTOP SIDE NAVIGATION RAIL ================= */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 px-4 py-6 z-40 transition-colors duration-300">
        {/* Brand Emblem */}
        <div className="flex items-center space-x-3 px-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary dark:bg-primary-dark flex items-center justify-center text-white dark:text-slate-950 font-bold shadow-md shadow-primary/20">
            <svg viewBox="0 0 100 100" fill="none" className="w-6 h-6 stroke-current stroke-[8] stroke-linecap-round stroke-linejoin-round">
              <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display leading-tight">
              JanMitra AI
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
              Civic Companion
            </p>
          </div>
        </div>

        {/* Navigation Rail Links */}
        <div className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            if (item.isFab) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-4 w-full px-4 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover text-white dark:text-slate-950 font-semibold shadow-md shadow-primary/10 dark:shadow-none hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                >
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                  <span>Report Public Issue</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-4 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  active
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${active ? "text-primary dark:text-primary-dark stroke-[2.5]" : "text-slate-500 dark:text-slate-400"}`} />
                </div>
                <span className="text-sm">{item.label === "Home" ? "Home Dashboard" : item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer / Quick Settings Access */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/settings"
            className={`flex items-center space-x-4 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
              isActive("/settings")
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Settings className={`w-5 h-5 ${isActive("/settings") ? "text-primary dark:text-primary-dark" : "text-slate-500 dark:text-slate-400"}`} />
            <span className="text-sm">Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
