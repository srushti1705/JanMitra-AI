"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCheck, CircleAlert, FileText, MessageSquare, Sparkles } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: "service" | "report" | "document" | "assistant";
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  { id: "1", title: "New status update", description: "Your water complaint is now under review.", category: "report", read: false },
  { id: "2", title: "Document reminder", description: "Upload your latest address proof before Friday.", category: "document", read: false },
  { id: "3", title: "AI recommendation", description: "A faster pathway is available for your pension request.", category: "assistant", read: true },
  { id: "4", title: "Service deadline", description: "You have two days left to complete your license renewal.", category: "service", read: true },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const markAllRead = () => setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  const markAsRead = (id: string) => setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));

  return (
    <div className="space-y-4">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Notification Center</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">Stay on top of civic updates</h2>
          </div>
          <div className="rounded-full bg-primary/10 p-3 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
            <Bell className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <span>{unreadCount} unread update{unreadCount === 1 ? "" : "s"}</span>
          <button onClick={markAllRead} className="flex items-center gap-2 font-semibold text-primary dark:text-primary-dark">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => {
          const icon = item.category === "document" ? FileText : item.category === "assistant" ? Sparkles : item.category === "report" ? CircleAlert : MessageSquare;
          const Icon = icon;
          return (
            <div key={item.id} className={`rounded-[24px] border p-4 shadow-sm transition ${item.read ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" : "border-primary/30 bg-primary/5 dark:border-primary-dark/30 dark:bg-primary-dark/10"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
                {!item.read && <button onClick={() => markAsRead(item.id)} className="text-sm font-semibold text-primary dark:text-primary-dark">Mark read</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
