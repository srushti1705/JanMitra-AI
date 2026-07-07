"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import BottomNavBar from "@/components/BottomNavBar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    // If auth state is loaded and there is no user, redirect to login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent dark:border-primary-dark" />
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
            Loading JanMitra AI...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Prevents flashing content while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Persisted Dual Layout Navigation */}
      <BottomNavBar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 pb-24 md:pb-0">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
