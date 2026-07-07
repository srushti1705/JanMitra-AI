"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import {
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Filter,
  MapPin,
  Search,
  Trash2,
} from "lucide-react";

const statusOptions = ["All", "Submitted", "In Review", "Assigned", "In Progress", "Resolved"];
const categoryOptions = ["All", "Potholes & Road Damage", "Garbage & Sanitation", "Water Leakage / Supply Issue", "Broken Streetlights", "Sewage Overflow", "Illegal Encroachment", "Air / Noise Pollution", "Other Civic Issue"];

export default function CivicReportingTracker() {
  const { complaints, updateComplaintDescription, deleteComplaint, toggleComplaintBookmark } = useApp();
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDescription, setDraftDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch = search.trim() === "" || item.complaintId?.toLowerCase().includes(search.toLowerCase()) || item.title.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [complaints, search, selectedCategory, selectedStatus]);

  const startEdit = (complaint: any) => {
    setEditingId(complaint.id!);
    setDraftDescription(complaint.description);
    setError(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError(null);
    try {
      await updateComplaintDescription(editingId, draftDescription);
      setEditingId(null);
    } catch (error) {
      setError("Unable to update your complaint description right now.");
    }
  };

  const removeComplaint = async (complaintId: string) => {
    try {
      await deleteComplaint(complaintId);
    } catch (error) {
      setError("Only submitted complaints can be deleted.");
    }
  };

  const bookmarkComplaint = async (complaintId: string) => {
    await toggleComplaintBookmark(complaintId);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">My Complaints</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">Track civic reports and follow resolutions</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {filteredComplaints.length} visible reports
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1.3fr,0.7fr,0.7fr]">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            <Search className="h-4 w-4" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by ID or title" className="w-full bg-transparent outline-none" />
          </label>
          <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
            {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        {error && <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">{error}</div>}
      </div>

      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">No complaints match your current filters yet.</div>
        ) : filteredComplaints.map((item) => (
          <motion.article key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-3">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-20 w-24 rounded-[20px] object-cover" /> : <div className="flex h-20 w-24 items-center justify-center rounded-[20px] bg-slate-100 text-slate-400 dark:bg-slate-800"><AlertCircle className="h-6 w-6" /></div>}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-800 dark:text-slate-400">{item.complaintId || item.id}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${item.status === "Resolved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : item.status === "In Progress" || item.status === "Assigned" ? "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"}`}>{item.status}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.category} • {item.department || "Municipal Corporation"}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><CalendarClock className="h-4 w-4" />{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{item.locationLabel || `${item.district}, ${item.state}`}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => bookmarkComplaint(item.id!)} className="rounded-full border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  {item.bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                </button>
                {item.status === "Submitted" && <button onClick={() => void removeComplaint(item.id!)} className="rounded-full border border-rose-200 p-2 text-rose-600 dark:border-rose-900/50"><Trash2 className="h-4 w-4" /></button>}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Latest update</p>
                  <p className="mt-1 text-sm text-slate-500">{item.updateHistory[item.updateHistory.length - 1]?.note}</p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-950 dark:text-slate-300">{item.updateHistory[item.updateHistory.length - 1]?.status}</div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><Clock3 className="h-4 w-4" />Complaint timeline</div>
              <div className="flex flex-wrap gap-2">
                {(["Submitted", "In Review", "Assigned", "In Progress", "Resolved"] as const).map((step, index) => {
                  const currentIndex = (["Submitted", "In Review", "Assigned", "In Progress", "Resolved"] as const).indexOf(item.status);
                  const isActive = index <= currentIndex;
                  return <div key={step} className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-primary text-white dark:bg-primary-dark dark:text-slate-950" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>{step}</div>;
                })}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Description</p>
                {editingId !== item.id ? <button onClick={() => startEdit(item)} className="text-sm font-medium text-primary dark:text-primary-dark">Edit</button> : <button onClick={saveEdit} className="text-sm font-medium text-primary dark:text-primary-dark">Save</button>}
              </div>
              {editingId === item.id ? (
                <textarea value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} className="mt-3 min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
              ) : (
                <p className="mt-3 text-sm text-slate-500">{item.description}</p>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
