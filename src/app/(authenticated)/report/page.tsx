"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { AlertTriangle, Upload, X, MapPin, Camera, Sparkles, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  "Potholes & Road Damage",
  "Garbage & Sanitation",
  "Water Leakage / Supply Issue",
  "Broken Streetlights",
  "Sewage Overflow",
  "Illegal Encroachment",
  "Air / Noise Pollution",
  "Other Civic Issue"
];

export default function ReportPage() {
  const { profile, submitComplaint } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Potholes & Road Damage");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError("Image size exceeds 4MB limit.");
        return;
      }
      setError("");
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError("Image size exceeds 4MB limit.");
        return;
      }
      setError("");
      setFileName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageBase64(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please write a title and detailed description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await submitComplaint(title, description, category, imageBase64 || undefined);
      
      setSuccess(true);
      
      // Celebrate
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Redirect after 2s
      setTimeout(() => {
        router.push("/tracker");
      }, 2000);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to submit public issue. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </motion.div>
        <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100">
          Issue Filed Successfully!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
          Your complaint has been submitted to JanMitra AI systems. Navigating to the tracker timeline...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-rose-500" />
          <span>Report Public Issue</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Submit local issues (road conditions, garbage, sanitation, streetlights) directly to municipal offices.
        </p>
      </div>

      <div className="md-card p-6 md:p-8 bg-white dark:bg-slate-900 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="issue-title" className="md-label">
              Short Title
            </label>
            <input
              type="text"
              id="issue-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deep potholes on Sector 15 main crossing"
              className="md-input"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="issue-category" className="md-label">
              Issue Category
            </label>
            <select
              id="issue-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="md-input bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 py-3"
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="issue-desc" className="md-label">
              Detailed Description
            </label>
            <textarea
              id="issue-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact landmarks, hours active, or scope of damage. This helps municipal workers locate and assess the situation quickly."
              className="md-input resize-none"
              required
            />
          </div>

          {/* Drag & Drop File Selector */}
          <div>
            <label className="md-label">Photo Attachment (Optional)</label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-350 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary-dark/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all select-none"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {imageBase64 ? (
                <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                  {/* Preview Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageBase64}
                    alt="Issue Preview"
                    className="max-h-48 rounded-xl object-contain mx-auto shadow-xs border border-slate-200/50 dark:border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2.5 -right-2.5 p-1 bg-red-500 text-white rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 truncate max-w-xs mx-auto">
                    {fileName}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Click to upload or drag image here
                  </p>
                  <p className="text-[10px] text-slate-450 mt-1">
                    PNG, JPG or JPEG up to 4MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Geographic Auto-Tagging Notice */}
          <div className="flex items-start space-x-2.5 p-3.5 bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-650 dark:text-slate-450 text-xs leading-relaxed">
            <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Auto-Location Tagging:</span> This issue will be pinned to <span className="font-semibold">{profile?.district}, {profile?.state}</span>. Ensure description states specific street names.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover text-white dark:text-slate-950 font-semibold rounded-2xl shadow-md hover:shadow-lg disabled:opacity-50 active:scale-98 transition-all"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white dark:border-slate-950 border-t-transparent" />
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span>Submit Issue Report</span>
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
