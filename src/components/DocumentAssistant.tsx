"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  addDoc,
  collection,
  db,
  getDocs,
  ref,
  storage,
  uploadStringMock,
} from "@/lib/firebase";

interface DocumentRecord {
  id: string;
  userId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: string;
  summary: string;
  missingDocuments: string[];
  readinessScore: number;
  uploadedAt: string;
}

const SUPPORTED_DOCUMENTS = ["Passport", "Aadhaar", "PAN", "Driving Licence", "Birth Certificate", "Income Certificate"];

export default function DocumentAssistant() {
  const { user, profile } = useApp();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedType, setSelectedType] = useState(SUPPORTED_DOCUMENTS[0]);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      if (!user) return;
      const snapshot = await getDocs(collection(db, "documents"));
      const items = snapshot.docs
        .map((docItem: any) => ({ id: docItem.id, ...docItem.data() }))
        .filter((entry: any) => entry.userId === user.uid)
        .sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      setDocuments(items);
    };
    void loadDocuments();
  }, [user]);

  const handleFileSelection = (input: File | null) => {
    if (!input) return;
    setFileName(input.name);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(input);
  };

  const uploadDocument = async () => {
    if (!user || !previewUrl) return;
    setUploading(true);
    setError(null);
    try {
      const documentId = `doc-${Date.now()}`;
      const storageRef = ref(storage, `documents/${user.uid}/${documentId}`);
      await uploadStringMock(storageRef, previewUrl);
      const fileUrl = previewUrl;

      const newRecord = {
        userId: user.uid,
        documentType: selectedType,
        fileName: fileName || selectedType,
        fileUrl,
        status: "Pending Review",
        summary: "Uploaded successfully. AI review is in progress.",
        missingDocuments: ["Proof of identity", "Address proof"],
        readinessScore: 68,
        uploadedAt: new Date().toISOString(),
      };

      const firestoreRecord = {
        ...newRecord,
        missingDocuments: newRecord.missingDocuments ?? [],
        summary: newRecord.summary ?? "",
      };
      await addDoc(collection(db, "documents"), firestoreRecord);
      setDocuments((prev) => [{ id: documentId, ...newRecord }, ...prev]);
      setAnalysis("Document uploaded successfully. AI review is being generated.");
    } catch (error) {
      console.error(error);
      setError("The document could not be uploaded right now.");
    } finally {
      setUploading(false);
    }
  };

  const analyzeDocument = async () => {
    if (!documents[0]) return;
    setAnalysisLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Analyze the uploaded ${documents[0].documentType} document. Check clarity, blur, readability, orientation, and missing information. Provide a short evaluation with document status, missing documents, suggestions, and an application readiness score out of 100.`,
          language: profile?.preferredLanguage || "English",
          imageBase64: documents[0].fileUrl,
          mimeType: "image/jpeg",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to analyze document");
      setAnalysis(result.text);
    } catch (error) {
      setAnalysis("The assistant could not analyze this document right now.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const counts = useMemo(() => ({
    uploaded: documents.length,
    pending: documents.filter((doc) => doc.status === "Pending Review").length,
    verified: documents.filter((doc) => doc.status === "Verified").length,
    missing: documents.filter((doc) => doc.missingDocuments.length > 0).length,
  }), [documents]);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">AI Document Assistant</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">Upload identity and civic documents for AI-assisted review</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Securely upload documents, inspect missing information, and receive AI guidance before applying.</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white dark:bg-primary-dark dark:text-slate-950">
            <Plus className="mr-2 inline h-4 w-4" />Upload Document
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)} />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Document Type</label>
            <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
              {SUPPORTED_DOCUMENTS.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <label className="mt-4 block text-sm font-medium text-slate-600 dark:text-slate-300">File</label>
            <div className="mt-2 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
              {previewUrl ? (
                <div className="space-y-3">
                  <img src={previewUrl} alt="Preview" className="max-h-48 rounded-2xl object-cover" />
                  <div className="flex items-center justify-between gap-2">
                    <span>{fileName || selectedType}</span>
                    <button onClick={() => { setPreviewUrl(null); setFileName(""); }} className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2"><Upload className="h-4 w-4" />Select a clear image of your document</div>
              )}
            </div>
            <button onClick={() => void uploadDocument()} disabled={!previewUrl || uploading} className="mt-4 w-full rounded-2xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-dark dark:text-slate-950">
              {uploading ? "Uploading…" : "Securely Upload"}
            </button>
          </div>

          <div className="space-y-3">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><h3 className="font-semibold text-slate-800 dark:text-slate-100">Document Dashboard</h3></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900"><p className="text-xs uppercase text-slate-400">Uploaded</p><p className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">{counts.uploaded}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900"><p className="text-xs uppercase text-slate-400">Pending</p><p className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">{counts.pending}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900"><p className="text-xs uppercase text-slate-400">Verified</p><p className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">{counts.verified}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900"><p className="text-xs uppercase text-slate-400">Missing</p><p className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">{counts.missing}</p></div>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><h3 className="font-semibold text-slate-800 dark:text-slate-100">AI Analysis</h3></div>
              <button onClick={() => void analyzeDocument()} className="mt-4 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                {analysisLoading ? "Analyzing…" : "Analyze Latest Document"}
              </button>
              <AnimatePresence>
                {analysis && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {analysis}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Uploaded Documents</h3>
          <span className="text-sm text-slate-500">Secure storage + AI insights</span>
        </div>
        <div className="mt-4 space-y-3">
          {documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700">No documents uploaded yet.</div>
          ) : documents.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-[22px] border border-slate-200 p-4 md:flex-row md:items-center md:justify-between dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-slate-100 p-2 dark:bg-slate-800"><ImageIcon className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{item.fileName}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.documentType} • {item.status}</p>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                <p>Readiness Score: <span className="font-semibold text-slate-800 dark:text-slate-100">{item.readinessScore}/100</span></p>
                <p>Missing: {item.missingDocuments.join(", ")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
