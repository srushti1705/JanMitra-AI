"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Sparkles, Send, Bot, User, HelpCircle, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  suggestedSteps?: string[];
}

const PRESETS = [
  "How do I renew my driving license?",
  "Am I eligible for PM Housing Scheme?",
  "How to apply for an Aadhar Card?",
  "What is the procedure for registering a business?"
];

const LIFE_EVENTS = {
  "business": {
    title: "Starting a Business",
    desc: "Complete checklist of permits, registrations, and schemes for new business entities in India.",
    steps: [
      { name: "Obtain PAN & TAN", desc: "Permanent Account Number and Tax Deduction Account Number for business tax filing.", done: false },
      { name: "Register on Udyam Portal", desc: "MSME registration to receive credit guarantees and tax incentives.", done: false },
      { name: "Apply for GSTIN", desc: "Goods and Services Tax Identification Number (mandatory if turnover > ₹20-40 Lakhs).", done: false },
      { name: "Open Current Bank Account", desc: "Corporate bank account mapped to business registration documents.", done: false },
      { name: "Acquire Shop & Establishment License", desc: "Municipal approval for commercial premises.", done: false }
    ]
  },
  "child": {
    title: "Having a Child",
    desc: "Ensure civil registry updates, healthcare benefits, and birth certificates are secured.",
    steps: [
      { name: "Register Birth in Municipal Council", desc: "Must be filed within 21 days at local registrar.", done: false },
      { name: "Apply for Birth Certificate", desc: "Obtain digital copies via national registry / DigiLocker.", done: false },
      { name: "Enroll in Immunization Schemes", desc: "Access free vaccines under Mission Indradhanush.", done: false },
      { name: "Create Aadhaar Card for Child (Baal Aadhaar)", desc: "Biometric-free Aadhaar card linked to parent UID.", done: false }
    ]
  },
  "retirement": {
    title: "Retiring from Work",
    desc: "Manage pension accounts, senior citizen health cards, and saving funds.",
    steps: [
      { name: "Verify EPFO Pension Account Status", desc: "Validate Employee Pension Scheme (EPS) records online.", done: false },
      { name: "Register for Senior Citizen Card", desc: "Provides concessions for transit, taxes, and government events.", done: false },
      { name: "Enroll in PM Vaya Vandana Yojana", desc: "Senior citizen pension scheme providing assured returns.", done: false },
      { name: "Configure Health Insurance (CGHS/Ayushman)", desc: "Central or state senior healthcare policies.", done: false }
    ]
  }
};

export default function AIAssistantPage() {
  const { profile } = useApp();
  const searchParams = useSearchParams();
  const assistantMode = searchParams.get("assistant");

  const [activeTab, setActiveTab] = useState<"chat" | "life-event">(
    assistantMode === "life-event" ? "life-event" : "chat"
  );

  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `Hello ${profile?.fullName || "Citizen"}. I am JanMitra AI, your digital government assistant. How can I help you navigate civic services, documentation, or public welfare schemes today?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Life Event States
  const [activeEvent, setActiveEvent] = useState<keyof typeof LIFE_EVENTS>("business");
  const [userSteps, setUserSteps] = useState(LIFE_EVENTS);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (assistantMode === "life-event") {
      setActiveTab("life-event");
    }
  }, [assistantMode]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: "user",
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
      let botResponseText = "";
      let steps: string[] = [];

      const query = text.toLowerCase();
      if (query.includes("license") || query.includes("driving")) {
        botResponseText = "To renew your Driving License (DL) in India, you must file a request via the Sarathi Parivahan portal. Here are the core steps:";
        steps = [
          "Visit parivahan.gov.in and select Driving License services.",
          "Upload Form 9 (Renewal Application) and Form 1A (Medical Certificate, if aged > 40).",
          "Submit copy of existing DL, Address Proof, and Age Proof.",
          "Pay the renewal fee (~₹200 - ₹400 depending on state).",
          "The renewed DL will be dispatched by Speed Post."
        ];
      } else if (query.includes("housing") || query.includes("pmy") || query.includes("pmas")) {
        botResponseText = `Under the Pradhan Mantri Awas Yojana (PMAY), families in ${profile?.state || "your state"} with incomes below ₹3 Lakh (LIG) to ₹18 Lakh (MIG) are eligible for interest subsidies on housing loans. You can apply directly on pmaymis.gov.in.`;
        steps = [
          "Register using your Aadhaar card on the official PMAY portal.",
          "Fill out demographic data, household income details, and bank account information.",
          "Verify the details using OTP sent to Aadhaar-linked mobile.",
          "Submit application and track status using the generated Assessment ID."
        ];
      } else if (query.includes("aadhar") || query.includes("aadhaar")) {
        botResponseText = "Applying for a new Aadhaar Card is free and must be done in person at an authorized Aadhaar Seva Kendra. To expedite the process:";
        steps = [
          "Book an online appointment on uidai.gov.in.",
          "Carry Proof of Identity (PAN, Passport) and Proof of Address (Rent agreement, Utility bill).",
          "Provide biometric scans (fingerprints, iris scan) and photo at the center.",
          "Collect your enrolment slip. You can download e-Aadhaar online within 15 to 30 days."
        ];
      } else if (query.includes("business") || query.includes("udyam")) {
        botResponseText = "To register a business in India, you can utilize the simplified MSME Udyam Registration portal. This grants credit guarantees and subsidy benefits.";
        steps = [
          "Ensure you have PAN and GSTIN (if applicable).",
          "Go to udyamregistration.gov.in and fill in Aadhaar details.",
          "Provide investment and turnover metrics for the business.",
          "Submit to receive your Udyam Registration Certificate instantly."
        ];
      } else {
        botResponseText = `I have logged your question regarding "${text}". Our civic assistant suggests checking the official state service handbook for ${profile?.state || "India"}. I can also help compile a checklist for your life events.`;
        steps = [
          "Search for government departments in the services portal.",
          "Ask me about driving licenses, housing schemes, or Aadhaar cards.",
          "Switch to 'Life Event Assistant' tab to manage business or registry checklists."
        ];
      }

      const botMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "bot",
        text: botResponseText,
        suggestedSteps: steps,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const toggleStep = (eventKey: keyof typeof LIFE_EVENTS, stepIdx: number) => {
    setUserSteps((prev) => {
      const copy = { ...prev };
      const updatedSteps = [...copy[eventKey].steps];
      updatedSteps[stepIdx] = {
        ...updatedSteps[stepIdx],
        done: !updatedSteps[stepIdx].done
      };
      copy[eventKey] = {
        ...copy[eventKey],
        steps: updatedSteps
      };
      return copy;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)]">
      
      {/* ================= HEADER TABS ================= */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary dark:text-primary-dark fill-current" />
            <span>JanMitra AI Assistant</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your conversational gateway to all Indian governance portals
          </p>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center border border-slate-200/50 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "chat"
                ? "bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-150 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Conversational Chat
          </button>
          <button
            onClick={() => setActiveTab("life-event")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "life-event"
                ? "bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-150 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Life Events
          </button>
        </div>
      </div>

      {/* ================= TAB 1: CONVERSATIONAL CHAT ================= */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scroll-smooth">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 max-w-[85%] ${
                    isBot ? "self-start" : "self-end flex-row-reverse space-x-reverse ml-auto"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                      isBot
                        ? "bg-primary text-white dark:bg-primary-dark dark:text-slate-950"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-3xl ${
                      isBot
                        ? "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs"
                        : "bg-primary text-white dark:bg-primary-dark dark:text-slate-950 font-medium"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Suggested Steps List */}
                    {isBot && msg.suggestedSteps && (
                      <div className="mt-4 space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Steps:</span>
                        {msg.suggestedSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-xs">
                            <span className="font-bold text-primary dark:text-primary-dark mt-0.5">{idx + 1}.</span>
                            <span className="text-slate-650 dark:text-slate-350">{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-white dark:bg-primary-dark dark:text-slate-950 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/85 rounded-3xl flex items-center space-x-1 shadow-xs">
                  <div className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Prompt Preset chips */}
          {messages.length === 1 && (
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2.5 ml-1">
                <HelpCircle className="w-3.5 h-3.5" /> Suggestions
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(preset)}
                    className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 dark:hover:border-primary-dark/40 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-all active:scale-97 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex items-center gap-3 border-t border-slate-200 dark:border-slate-800 pt-4"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about passport applications, tax schemes, land records..."
              className="flex-1 md-input rounded-3xl border border-slate-200 dark:border-slate-800 py-3.5 px-5 bg-white dark:bg-slate-900"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-3.5 bg-primary dark:bg-primary-dark text-white dark:text-slate-950 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* ================= TAB 2: LIFE EVENTS ASSISTANT ================= */}
      {activeTab === "life-event" && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Left Column: Event Selection Menu */}
          <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-1">
            {Object.entries(userSteps).map(([key, value]) => {
              const active = activeEvent === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveEvent(key as any)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    active
                      ? "bg-primary/5 border-primary/20 dark:bg-primary-dark/5 dark:border-primary-dark/20 text-slate-900 dark:text-slate-50"
                      : "bg-white border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <h4 className="text-sm font-bold font-display flex items-center justify-between">
                    <span>{value.title}</span>
                    <ChevronRight className="w-4 h-4" />
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    {value.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Step Checklist */}
          <div className="lg:col-span-2 md-card p-6 bg-white dark:bg-slate-900 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
                  {userSteps[activeEvent].title} Steps
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage required actions to complete this civic transition.
                </p>
              </div>

              <div className="space-y-4">
                {userSteps[activeEvent].steps.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleStep(activeEvent, idx)}
                    className="flex items-start space-x-3.5 p-3.5 border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl cursor-pointer select-none transition-all"
                  >
                    <div className="mt-0.5">
                      <CheckCircle2
                        className={`w-5 h-5 transition-colors ${
                          step.done ? "text-emerald-500 fill-emerald-500/10" : "text-slate-350 dark:text-slate-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold leading-snug ${step.done ? "line-through text-slate-400" : "text-slate-850 dark:text-slate-200"}`}>
                        {step.name}
                      </h4>
                      <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Status */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed Status:</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  {userSteps[activeEvent].steps.filter((s) => s.done).length} of {userSteps[activeEvent].steps.length} actions complete
                </p>
              </div>
              
              <button
                onClick={() => handleSendMessage(`How do I complete registration for "${userSteps[activeEvent].steps.find(s => !s.done)?.name || userSteps[activeEvent].title}"?`)}
                className="flex items-center space-x-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                <span>Ask AI to Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
