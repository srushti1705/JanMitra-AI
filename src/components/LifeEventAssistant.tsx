"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Sparkles, Save, ShieldCheck } from "lucide-react";

interface LifeEventCard {
  id: string;
  title: string;
  emoji: string;
  description: string;
}

interface LifeEventPlanState {
  eventId: string;
  plan: {
    requiredServices: string[];
    requiredDocuments: string[];
    recommendedSchemes: string[];
    actionPlan: string[];
    estimatedTimeline: string;
    importantTips: string[];
  };
  completedTasks: string[];
}

const LIFE_EVENTS: LifeEventCard[] = [
  { id: "marriage", title: "Got Married", emoji: "💍", description: "Register marriage, update identity records, and apply for name changes." },
  { id: "baby", title: "Had a Baby", emoji: "👶", description: "Secure birth certificates, health benefits, and family support services." },
  { id: "move", title: "Moved to a New City", emoji: "🏠", description: "Update address, residency, and local service access." },
  { id: "business", title: "Started a Business", emoji: "💼", description: "Register your enterprise, licensing, and tax support." },
  { id: "wallet", title: "Lost Wallet", emoji: "👜", description: "Block cards, replace documents, and report a loss." },
  { id: "graduate", title: "Graduated", emoji: "🎓", description: "Access certificates, jobs, scholarships, and credentials services." },
  { id: "retire", title: "Retired", emoji: "👴", description: "Access pension, healthcare, and benefits support." },
  { id: "name", title: "Changed Name", emoji: "🪪", description: "Update legal records and government documents." },
  { id: "documents", title: "Lost Important Documents", emoji: "📄", description: "Replace identity, address, and educational documents." },
];

const defaultPlan = {
  requiredServices: [],
  requiredDocuments: [],
  recommendedSchemes: [],
  actionPlan: [],
  estimatedTimeline: "2–4 weeks",
  importantTips: [],
};

export default function LifeEventAssistant() {
  const [selectedEvent, setSelectedEvent] = useState("marriage");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<LifeEventPlanState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("janmitra_life_event_progress");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as LifeEventPlanState;
        setPlan(parsed);
        setSelectedEvent(parsed.eventId);
      } catch {
        window.localStorage.removeItem("janmitra_life_event_progress");
      }
    }
  }, []);

  const currentEvent = useMemo(() => LIFE_EVENTS.find((item) => item.id === selectedEvent), [selectedEvent]);

  const saveProgress = (nextPlan: LifeEventPlanState) => {
    setPlan(nextPlan);
    window.localStorage.setItem("janmitra_life_event_progress", JSON.stringify(nextPlan));
  };

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a concise step-by-step civic support plan for a citizen who ${currentEvent?.title}. Include required government services, required documents, recommended government schemes, a step-by-step action plan, estimated timeline, and important tips. Format as sections with bullet points.`,
          language: "English",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to generate the life-event plan");
      const text = result.text || "";
      const sections = parseSections(text);
      const nextPlan: LifeEventPlanState = {
        eventId: selectedEvent,
        plan: {
          requiredServices: sections.requiredServices,
          requiredDocuments: sections.requiredDocuments,
          recommendedSchemes: sections.recommendedSchemes,
          actionPlan: sections.actionPlan,
          estimatedTimeline: sections.estimatedTimeline || "2–4 weeks",
          importantTips: sections.importantTips,
        },
        completedTasks: plan?.completedTasks || [],
      };
      saveProgress(nextPlan);
    } catch (error) {
      setError("JanMitra AI could not build the plan right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (task: string) => {
    if (!plan) return;
    const nextCompleted = plan.completedTasks.includes(task)
      ? plan.completedTasks.filter((item) => item !== task)
      : [...plan.completedTasks, task];
    const nextPlan = { ...plan, completedTasks: nextCompleted };
    saveProgress(nextPlan);
  };

  const progressPercent = plan && plan.plan.actionPlan.length > 0
    ? Math.round((plan.completedTasks.length / plan.plan.actionPlan.length) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Life Event Assistant</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">What happened?</h2>
            <p className="mt-2 text-sm text-slate-500">Pick a life event and JanMitra AI will outline the services, documents, and next steps.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {plan ? "Saved progress available" : "Start a new checklist"}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {LIFE_EVENTS.map((event) => (
            <button key={event.id} onClick={() => setSelectedEvent(event.id)} className={`rounded-[24px] border p-4 text-left transition ${selectedEvent === event.id ? "border-primary bg-primary/10 text-slate-900 dark:border-primary-dark dark:bg-primary-dark/10 dark:text-slate-100" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"}`}>
              <div className="text-2xl">{event.emoji}</div>
              <h3 className="mt-3 font-semibold">{event.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{event.description}</p>
            </button>
          ))}
        </div>

        {currentEvent && (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Selected event</p>
                <p className="mt-1 text-sm text-slate-500">{currentEvent.title} • {currentEvent.description}</p>
              </div>
              <button onClick={() => void generatePlan()} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white dark:bg-primary-dark dark:text-slate-950">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="mr-2 inline h-4 w-4" />Generate Plan</>}
              </button>
            </div>
            {error && <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">{error}</p>}
          </div>
        )}
      </div>

      {plan && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Progress</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">Your checklist is {progressPercent}% complete</h3>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">Saved locally for later</div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-primary transition-all dark:bg-primary-dark" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Action plan</h3>
                <div className="mt-4 space-y-3">
                  {plan.plan.actionPlan.map((task) => {
                    const done = plan.completedTasks.includes(task);
                    return (
                      <label key={task} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                        <input type="checkbox" checked={done} onChange={() => toggleTask(task)} className="mt-1 h-4 w-4 rounded border-slate-300" />
                        <span className={`text-sm ${done ? "text-slate-400 line-through" : "text-slate-600 dark:text-slate-300"}`}>{task}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recommended services</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-500">
                  {plan.plan.requiredServices.map((item) => <li key={item} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />{item}</li>)}
                </ul>
              </div>
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Documents & schemes</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-500">
                  <p><span className="font-semibold text-slate-700 dark:text-slate-200">Documents:</span> {plan.plan.requiredDocuments.join(", ")}</p>
                  <p><span className="font-semibold text-slate-700 dark:text-slate-200">Schemes:</span> {plan.plan.recommendedSchemes.join(", ")}</p>
                  <p><span className="font-semibold text-slate-700 dark:text-slate-200">Timeline:</span> {plan.plan.estimatedTimeline}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function parseSections(text: string) {
  const sections = {
    requiredServices: [] as string[],
    requiredDocuments: [] as string[],
    recommendedSchemes: [] as string[],
    actionPlan: [] as string[],
    estimatedTimeline: "2–4 weeks",
    importantTips: [] as string[],
  };

  const headerMap: Record<string, string[]> = {
    "Required Government Services:": sections.requiredServices,
    "Required Documents:": sections.requiredDocuments,
    "Recommended Government Schemes:": sections.recommendedSchemes,
    "Step-by-step Action Plan:": sections.actionPlan,
    "Estimated Timeline:": [sections.estimatedTimeline],
    "Important Tips:": sections.importantTips,
  };

  const lines = text.split(/\n/).map((line) => line.trim()).filter(Boolean);
  let currentSection: keyof typeof headerMap | null = null;
  lines.forEach((line) => {
    const matchedHeader = Object.keys(headerMap).find((header) => line.startsWith(header));
    if (matchedHeader) {
      currentSection = matchedHeader as keyof typeof headerMap;
      const value = line.replace(matchedHeader, "").trim();
      if (value) {
        if (currentSection === "Estimated Timeline:") {
          sections.estimatedTimeline = value;
        } else {
          (headerMap[matchedHeader] as string[]).push(value);
        }
      }
      return;
    }
    if (!currentSection) return;
    if (currentSection === "Estimated Timeline:") {
      return;
    }
    const list = headerMap[currentSection as keyof typeof headerMap] as string[];
    if (line.startsWith("-")) {
      list.push(line.replace(/^[-*]\s*/, ""));
    } else if (line.startsWith("•")) {
      list.push(line.replace(/^•\s*/, ""));
    } else if (list.length === 0) {
      list.push(line);
    }
  });

  return sections;
}
