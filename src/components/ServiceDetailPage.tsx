"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { governmentServices } from "@/data/governmentServices";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CalendarClock,
  CheckCircle2,
  FileText,
  Heart,
  MessageSquareText,
  Share2,
  Sparkles,
} from "lucide-react";
import { addDoc, collection, db, deleteDoc, doc, getDocs } from "@/lib/firebase";

interface ServiceDetailPageProps {
  serviceId: string;
}

export default function ServiceDetailPage({ serviceId }: ServiceDetailPageProps) {
  const { user, profile } = useApp();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const service = useMemo(() => governmentServices.find((item) => item.id === serviceId), [serviceId]);

  useEffect(() => {
    const checkBookmark = async () => {
      if (!user) return;
      const snapshot = await getDocs(collection(db, "bookmarks"));
      const matches = snapshot.docs
        .map((docItem: any) => ({ id: docItem.id, ...docItem.data() }))
        .filter((entry: any) => entry.userId === user.uid && entry.serviceId === serviceId);
      setBookmarked(matches.length > 0);
    };
    void checkBookmark();
  }, [serviceId, user]);

  const toggleBookmark = async () => {
    if (!user || !service) return;
    setLoading(true);
    try {
      if (bookmarked) {
        const snapshot = await getDocs(collection(db, "bookmarks"));
        const match = snapshot.docs
          .map((docItem: any) => ({ id: docItem.id, ...docItem.data() }))
          .find((entry: any) => entry.userId === user.uid && entry.serviceId === service.id);
        if (match) await deleteDoc(doc(db, "bookmarks", match.id));
      } else {
        await addDoc(collection(db, "bookmarks"), {
          userId: user.uid,
          serviceId: service.id,
          createdAt: new Date().toISOString(),
        });
      }
      setBookmarked((prev) => !prev);
    } finally {
      setLoading(false);
    }
  };

  const explainWithAI = async () => {
    if (!service) return;
    setAiLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Explain the government service ${service.name} in simple language, including who is eligible and what documents are typically needed.`,
          language: profile?.preferredLanguage || "English",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to explain this service");
      setAiExplanation(result.text);
    } catch (error) {
      setAiExplanation("The assistant could not explain this service right now.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!service) {
    return <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">Service not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Back to Services
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">{service.category}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">{service.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{service.summary}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => void toggleBookmark()} className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {bookmarked ? <BookmarkCheck className="mr-2 inline h-4 w-4 text-primary" /> : <Bookmark className="mr-2 inline h-4 w-4" />}Save
            </button>
            <button onClick={() => void explainWithAI()} className="rounded-full bg-primary px-3 py-2 text-sm font-semibold text-white dark:bg-primary-dark dark:text-slate-950">
              {aiLoading ? "Explaining…" : "Explain with AI"}
            </button>
            <button className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <Share2 className="mr-2 inline h-4 w-4" />Share
            </button>
          </div>
        </div>
      </div>

      {aiExplanation && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold">AI Summary</span>
          </div>
          <p className="mt-2 leading-7">{aiExplanation}</p>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Overview</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">{service.description}</p>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Eligibility</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {service.eligibility.map((item) => (
                <li key={item} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Required Documents</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {service.requiredDocuments.map((item) => (
                <li key={item} className="flex items-start gap-2"><FileText className="mt-0.5 h-4 w-4 text-primary" />{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Step-by-step Guide</h3>
            <ol className="mt-3 space-y-3 text-sm text-slate-500">
              {service.steps.map((step, index) => (
                <li key={step} className="flex gap-2"><span className="font-semibold text-primary">{index + 1}.</span><span>{step}</span></li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Need to Know</h3>
            <div className="mt-3 space-y-3 text-sm text-slate-500">
              <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"><span className="font-semibold text-slate-700 dark:text-slate-200">Fees:</span> {service.fees}</div>
              <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"><span className="font-semibold text-slate-700 dark:text-slate-200">Processing time:</span> {service.processingTime}</div>
              <a href={service.officialWebsite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-primary dark:border-slate-800 dark:text-primary-dark">Official Website <ArrowRight className="h-4 w-4" /></a>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">FAQs</h3>
            <div className="mt-3 space-y-3">
              {service.faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{faq.question}</p>
                  <p className="mt-1 text-sm text-slate-500">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
