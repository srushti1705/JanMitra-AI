"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { governmentServices, serviceCategories } from "@/data/governmentServices";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CalendarClock,
  FileText,
  Heart,
  History,
  Search,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import {
  addDoc,
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "@/lib/firebase";

interface BookmarkedService {
  id: string;
  serviceId: string;
  userId: string;
  createdAt: string;
}

export default function GovernmentServicesHub() {
  const { user, profile } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarks, setBookmarks] = useState<BookmarkedService[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationForm, setRecommendationForm] = useState({
    age: "25",
    state: profile?.state || "Delhi",
    occupation: "Working Professional",
    student: "No",
    income: "Middle Income",
  });

  const filteredServices = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return governmentServices.filter((service) => {
      const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
      const matchesQuery =
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [searchTerm, selectedCategory]);

  const featuredServices = governmentServices.filter((service) => service.featured);
  const popularServices = governmentServices.filter((service) => service.popular);
  const savedServices = governmentServices.filter((service) => bookmarks.some((entry) => entry.serviceId === service.id));
  const recentServices = governmentServices.filter((service) => service.recent);

  const loadBookmarks = async () => {
    if (!user) return;
    setLoadingBookmarks(true);
    try {
      const snapshot = await getDocs(collection(db, "bookmarks"));
      const allBookmarks = snapshot.docs
        .map((docItem: any) => ({ id: docItem.id, ...docItem.data() }))
        .filter((entry: any) => entry.userId === user.uid);
      setBookmarks(allBookmarks);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const toggleBookmark = async (serviceId: string) => {
    if (!user) return;
    const existing = bookmarks.find((entry) => entry.serviceId === serviceId);
    if (existing) {
      await deleteDoc(doc(db, "bookmarks", existing.id));
      setBookmarks((prev) => prev.filter((entry) => entry.id !== existing.id));
      return;
    }

    const newBookmark = { userId: user.uid, serviceId, createdAt: new Date().toISOString() };
    const created = await addDoc(collection(db, "bookmarks"), newBookmark);
    setBookmarks((prev) => [...prev, { id: created.id, ...newBookmark }]);
  };

  const getRecommendations = async () => {
    setRecommendationLoading(true);
    setRecommendation(null);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Recommend the most relevant government services for a citizen with age ${recommendationForm.age}, state ${recommendationForm.state}, occupation ${recommendationForm.occupation}, student status ${recommendationForm.student}, and income category ${recommendationForm.income}. Explain the recommendations in simple language and suggest 4 services.`,
          language: profile?.preferredLanguage || "English",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to generate recommendations");
      setRecommendation(result.text);
    } catch (error) {
      setRecommendation("The assistant could not generate personalized recommendations right now.");
    } finally {
      setRecommendationLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Government Services Hub</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">Discover verified civic services, forms, and next steps</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Search services, save your favourites, and get AI-guided recommendations tailored to your profile.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {profile?.fullName || "Citizen"} • {profile?.state || "Delhi"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[2fr,1fr]">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            <Search className="h-4 w-4" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search Aadhaar, passport, scholarships..."
              className="w-full bg-transparent outline-none"
              aria-label="Search government services"
            />
          </label>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={loadBookmarks}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:text-slate-300"
            >
              <Bookmark className="mr-2 inline h-4 w-4" />Saved Services
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {serviceCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-primary text-white dark:bg-primary-dark dark:text-slate-950"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary/40 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr,0.9fr]">
        <div className="space-y-6">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Featured Services</h3>
              <span className="text-sm text-slate-500">Premium picks</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {featuredServices.map((service) => {
                const saved = bookmarks.some((entry) => entry.serviceId === service.id);
                return (
                  <motion.article
                    key={service.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">{service.category}</p>
                        <h4 className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">{service.name}</h4>
                      </div>
                      <button
                        onClick={() => void toggleBookmark(service.id)}
                        className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={`Save ${service.name}`}
                      >
                        {saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">{service.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{service.processingTime}</span>
                      <Link href={`/services/${service.id}`} className="flex items-center gap-2 font-medium text-primary dark:text-primary-dark">
                        Explore <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">All Services</h3>
              <span className="text-sm text-slate-500">{filteredServices.length} matches</span>
            </div>
            <div className="space-y-3">
              {filteredServices.map((service) => {
                const saved = bookmarks.some((entry) => entry.serviceId === service.id);
                return (
                  <motion.div key={service.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-950">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100">{service.name}</h4>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{service.summary}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void toggleBookmark(service.id)}
                        className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
                      >
                        {saved ? <BookmarkCheck className="mr-1 inline h-4 w-4 text-primary" /> : <Bookmark className="mr-1 inline h-4 w-4" />}Save
                      </button>
                      <Link href={`/services/${service.id}`} className="rounded-full bg-primary px-3 py-2 text-sm font-medium text-white dark:bg-primary-dark dark:text-slate-950">
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Personalized Recommendations</h3>
            </div>
            <div className="mt-4 space-y-3">
              <input value={recommendationForm.age} onChange={(event) => setRecommendationForm((prev) => ({ ...prev, age: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder="Age" />
              <input value={recommendationForm.state} onChange={(event) => setRecommendationForm((prev) => ({ ...prev, state: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder="State" />
              <input value={recommendationForm.occupation} onChange={(event) => setRecommendationForm((prev) => ({ ...prev, occupation: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder="Occupation" />
              <input value={recommendationForm.student} onChange={(event) => setRecommendationForm((prev) => ({ ...prev, student: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder="Student status" />
              <input value={recommendationForm.income} onChange={(event) => setRecommendationForm((prev) => ({ ...prev, income: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder="Income category" />
              <button onClick={() => void getRecommendations()} className="w-full rounded-2xl bg-primary px-3 py-2 text-sm font-semibold text-white dark:bg-primary-dark dark:text-slate-950">
                {recommendationLoading ? "Generating…" : "Explain with AI"}
              </button>
            </div>
            <AnimatePresence>
              {recommendation && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {recommendation}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Saved Services</h3>
            </div>
            <div className="mt-4 space-y-2">
              {loadingBookmarks ? (
                <div className="text-sm text-slate-500">Loading saved services…</div>
              ) : savedServices.length === 0 ? (
                <div className="text-sm text-slate-500">No saved services yet.</div>
              ) : (
                savedServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                    <span>{service.name}</span>
                    <Link href={`/services/${service.id}`} className="text-primary dark:text-primary-dark">Open</Link>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recently Viewed</h3>
            </div>
            <div className="mt-4 space-y-2">
              {recentServices.map((service) => (
                <Link key={service.id} href={`/services/${service.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                  <span>{service.name}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
