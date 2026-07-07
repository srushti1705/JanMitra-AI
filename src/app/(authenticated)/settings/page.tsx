"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Globe,
  Accessibility,
  Lock,
  Info,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme, language, setLanguage, isMockMode } = useApp();
  
  // Settings States
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Accessibility States
  const [fontSize, setFontSize] = useState("normal");
  const [highContrast, setHighContrast] = useState(false);
  
  // Action notifications
  const [privacyMsg, setPrivacyMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  const handleExportData = () => {
    try {
      const data: Record<string, any> = {};
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("janmitra_")) {
            data[key] = localStorage.getItem(key);
          }
        }
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "janmitra_citizen_data.json";
      a.click();
      
      setMsgType("success");
      setPrivacyMsg("Citizen data package compiled and downloaded successfully.");
      setTimeout(() => setPrivacyMsg(""), 4000);
    } catch (e) {
      setMsgType("error");
      setPrivacyMsg("Failed to compile citizen data packages.");
      setTimeout(() => setPrivacyMsg(""), 4000);
    }
  };

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear all locally cached mock data? This resets all simulated users and complaint timelines.")) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        setMsgType("success");
        setPrivacyMsg("Cache wiped. Reloading application...");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary dark:text-primary-dark" />
          <span>System Settings</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure visual parameters, notifications, accessibility, and account privacy.
        </p>
      </div>

      {privacyMsg && (
        <div className={`p-4 rounded-2xl flex items-center space-x-2 border text-xs font-semibold ${
          msgType === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
        }`}>
          {msgType === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{privacyMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        
        {/* SECTION 1: VISUAL THEME */}
        <div className="md-card p-6 bg-white dark:bg-slate-900">
          <h3 className="font-bold text-sm font-display text-slate-855 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2 mb-4">
            <Sun className="w-4.5 h-4.5 text-primary" /> Visual Appearance
          </h3>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">Dark Mode</h4>
              <p className="text-xs text-slate-400 mt-0.5">Toggle dark theme aesthetics to save battery and eye strain.</p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-3 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-650 dark:text-slate-300 transition-all select-none"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            </button>
          </div>
        </div>

        {/* SECTION 2: NOTIFICATIONS */}
        <div className="md-card p-6 bg-white dark:bg-slate-900">
          <h3 className="font-bold text-sm font-display text-slate-855 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2 mb-4">
            <Bell className="w-4.5 h-4.5 text-amber-500" /> Notifications Permissions
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-1">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">Push Alerts</h4>
                <p className="text-xs text-slate-400 mt-0.5">Receive immediate browser alerts on complaint status updates.</p>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="w-10 h-5 bg-slate-200 checked:bg-primary rounded-full appearance-none relative before:absolute before:h-5 before:w-5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-5 cursor-pointer border border-slate-350 dark:border-slate-800"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">Email Digests</h4>
                <p className="text-xs text-slate-400 mt-0.5">Receive weekly digests summarizing resolved issues in your ward.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-10 h-5 bg-slate-200 checked:bg-primary rounded-full appearance-none relative before:absolute before:h-5 before:w-5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-5 cursor-pointer border border-slate-350 dark:border-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: ACCESSIBILITY */}
        <div className="md-card p-6 bg-white dark:bg-slate-900">
          <h3 className="font-bold text-sm font-display text-slate-855 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2 mb-4">
            <Accessibility className="w-4.5 h-4.5 text-violet-500" /> Accessibility Tools
          </h3>
          
          <div className="space-y-4">
            {/* Font size */}
            <div className="flex items-center justify-between py-1">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">Text Scale size</h4>
                <p className="text-xs text-slate-400 mt-0.5">Configure app text rendering scales for visual comfort.</p>
              </div>
              
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-205 dark:border-slate-800">
                {["small", "normal", "large"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      fontSize === sz
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs"
                        : "text-slate-400 hover:text-slate-650"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between py-1">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">High Contrast Mode</h4>
                <p className="text-xs text-slate-400 mt-0.5">Increases text-to-background contrast constraints for readability.</p>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-10 h-5 bg-slate-200 checked:bg-primary rounded-full appearance-none relative before:absolute before:h-5 before:w-5 before:bg-white before:rounded-full before:transition-all checked:before:translate-x-5 cursor-pointer border border-slate-350 dark:border-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PRIVACY CONTROL */}
        <div className="md-card p-6 bg-white dark:bg-slate-900">
          <h3 className="font-bold text-sm font-display text-slate-855 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2 mb-4">
            <Lock className="w-4.5 h-4.5 text-emerald-500" /> Data Privacy & Cache Control
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-1">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">Export Data Audit Log</h4>
                <p className="text-xs text-slate-400 mt-0.5">Download a copy of all local files, profile data, and complaints.</p>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center space-x-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </button>
            </div>

            {isMockMode && (
              <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-850 pt-4">
                <div>
                  <h4 className="text-sm font-bold text-red-650 dark:text-red-400">Clear Local Database Cache</h4>
                  <p className="text-xs text-slate-455 mt-0.5">Reset all mock accounts and timelines. Wipes localStorage collections.</p>
                </div>
                <button
                  onClick={handleClearCache}
                  className="flex items-center space-x-1 py-2 px-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Cache</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: APP INFO */}
        <div className="md-card p-6 bg-white dark:bg-slate-900">
          <h3 className="font-bold text-sm font-display text-slate-855 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2 mb-4">
            <Info className="w-4.5 h-4.5 text-blue-500" /> About Platform
          </h3>
          
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-850">
              <span className="font-semibold">App Version</span>
              <span>v1.0.0 (Stable Release)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-850">
              <span className="font-semibold">Database Mode</span>
              <span>{isMockMode ? "Mock Sandbox Mode (localStorage)" : "Live Production Firestore"}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-semibold">Licensing</span>
              <span>Open-Source (Apache 2.0 Compliance)</span>
            </div>
            <p className="text-[10px] text-slate-450 mt-4">
              JanMitra AI platform is built as an intelligent citizen-facing digital companion. Designed using Google Material Design 3 guidelines. All copyrights and branding belong to the respective civic authority.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
