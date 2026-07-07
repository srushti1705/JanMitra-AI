"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useApp } from "@/context/AppContext";
import {
  AlertCircle,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Copy,
  Image as ImageIcon,
  Loader2,
  Mic,
  MicOff,
  Paperclip,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Trash2,
  User,
  Volume2,
  X,
} from "lucide-react";
import {
  addDoc,
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "@/lib/firebase";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  imageUrl?: string;
}

interface ChatThread {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface PreviewImage {
  file: File;
  dataUrl: string;
  mimeType: string;
}

const PRESET_PROMPTS = [
  "Apply for Passport",
  "Report Garbage",
  "Lost Wallet",
  "Marriage Registration",
  "Find Scholarships",
  "Driving Licence Renewal",
  "Water Leakage",
  "Birth Certificate",
  "Aadhaar Update",
];

const LANGUAGE_CODES: Record<string, string> = {
  English: "en-IN",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN",
  Bengali: "bn-IN",
};

export default function AICivicCompanion() {
  const { user, profile, language } = useApp();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [threadMessages, setThreadMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const preferredLanguage = profile?.preferredLanguage || language || "English";
  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, threads]
  );
  const activeMessages = useMemo(
    () => (activeThreadId ? threadMessages[activeThreadId] ?? [] : []),
    [activeThreadId, threadMessages]
  );

  const filteredThreads = useMemo(() => {
    if (!searchTerm.trim()) return threads;
    const query = searchTerm.toLowerCase();
    return threads.filter((thread) => thread.title.toLowerCase().includes(query));
  }, [searchTerm, threads]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (!user) {
      setThreads([]);
      setThreadMessages({});
      setActiveThreadId(null);
      return;
    }

    const loadThreads = async () => {
      setIsLoadingThreads(true);
      try {
        const threadSnapshot = await getDocs(collection(db, "chat_threads"));
        const messageSnapshot = await getDocs(collection(db, "messages"));

        const threadDocs = threadSnapshot.docs
          .map((docItem: any) => ({ id: docItem.id, ...docItem.data() }))
          .filter((thread: any) => thread.userId === user.uid && !thread.deleted);

        const messageDocs = messageSnapshot.docs
          .map((docItem: any) => ({ id: docItem.id, ...docItem.data() }))
          .filter((message: any) => message.userId === user.uid);

        const messagesByThread: Record<string, ChatMessage[]> = {};
        for (const thread of threadDocs) {
          messagesByThread[thread.id] = messageDocs
            .filter((message: any) => message.threadId === thread.id)
            .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((message: any) => ({
              id: message.id,
              role: message.role,
              content: message.content,
              createdAt: message.createdAt,
              imageUrl: message.imageUrl,
            }));
        }

        const sortedThreads = [...threadDocs].sort(
          (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        setThreads(sortedThreads);
        setThreadMessages(messagesByThread);

        if (!activeThreadId && sortedThreads.length > 0) {
          setActiveThreadId(sortedThreads[0].id);
        }
      } catch (error) {
        console.error("Unable to load civic conversations", error);
        setErrorMessage("Unable to load your previous conversations right now.");
      } finally {
        setIsLoadingThreads(false);
      }
    };

    void loadThreads();
  }, [activeThreadId, user]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const createThread = useCallback(
    (title: string) => {
      if (!user) return null;
      const threadId = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const thread: ChatThread = {
        id: threadId,
        userId: user.uid,
        title: title.slice(0, 44) || "New civic conversation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      void setDoc(doc(db, "chat_threads", threadId), thread);
      setThreads((prev) => [thread, ...prev]);
      setThreadMessages((prev) => ({ ...prev, [threadId]: [] }));
      setActiveThreadId(threadId);
      return threadId;
    },
    [user]
  );

  const persistThreadTitle = useCallback(
    async (threadId: string, title: string) => {
      if (!user) return;
      await updateDoc(doc(db, "chat_threads", threadId), {
        title,
        updatedAt: new Date().toISOString(),
      });
    },
    [user]
  );

  const updateThreadMeta = useCallback(
    (threadId: string, title: string) => {
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId ? { ...thread, title, updatedAt: new Date().toISOString() } : thread
        )
      );
    },
    []
  );

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setErrorMessage(null);
  };

  const handleNewChat = () => {
    setActiveThreadId(null);
    setPreviewImage(null);
    setInputValue("");
    setErrorMessage(null);
  };

  const handleRenameThread = async (threadId: string) => {
    const currentThread = threads.find((thread) => thread.id === threadId);
    if (!currentThread) return;
    const nextTitle = window.prompt("Rename conversation", currentThread.title);
    if (!nextTitle?.trim()) return;
    const sanitized = nextTitle.trim();
    updateThreadMeta(threadId, sanitized);
    await persistThreadTitle(threadId, sanitized);
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!user) return;
    const confirmed = window.confirm("Delete this conversation?");
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "chat_threads", threadId));
      setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
      setThreadMessages((prev) => {
        const next = { ...prev };
        delete next[threadId];
        return next;
      });
      if (activeThreadId === threadId) {
        const nextThread = threads.find((thread) => thread.id !== threadId);
        setActiveThreadId(nextThread?.id ?? null);
      }
    } catch (error) {
      console.error("Unable to delete conversation", error);
      setErrorMessage("Unable to delete this conversation right now.");
    }
  };

  const handleImageSelection = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage({
        file,
        dataUrl: reader.result as string,
        mimeType: file.type || "image/jpeg",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile?.type.startsWith("image/")) {
      handleImageSelection(droppedFile);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const windowWithSpeech = window as typeof window & {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANGUAGE_CODES[preferredLanguage] || "en-IN";
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(" ");
      setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => {
      setIsListening(false);
      setErrorMessage("Voice input could not be started. Please try again.");
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const speakResponse = (text: string) => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE_CODES[preferredLanguage] || "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (prompt: string, regenerate = false) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || !user) return;

    let threadId = activeThreadId;
    if (!threadId) {
      threadId = createThread(trimmedPrompt);
    }

    if (!threadId) return;

    const now = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: `message-${Date.now()}`,
      role: "user",
      content: trimmedPrompt,
      createdAt: now,
      imageUrl: previewImage?.dataUrl,
    };

    setThreadMessages((prev) => ({
      ...prev,
      [threadId!]: [...(prev[threadId!] ?? []), userMessage],
    }));

    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? { ...thread, title: thread.title || trimmedPrompt.slice(0, 44), updatedAt: now }
          : thread
      )
    );

    setInputValue("");
    setPreviewImage(null);
    setErrorMessage(null);
    setIsTyping(true);

    if (regenerate) {
      setThreadMessages((prev) => ({
        ...prev,
        [threadId!]: (prev[threadId!] ?? []).filter((message) => message.role !== "assistant" || message.id !== `${threadId}-assistant-last`),
      }));
    }

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          language: preferredLanguage,
          imageBase64: previewImage?.dataUrl,
          mimeType: previewImage?.mimeType,
          threadTitle: threads.find((thread) => thread.id === threadId)?.title || trimmedPrompt,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "The assistant could not respond right now.");
      }

      const assistantText = result.text || "I could not verify a reliable answer for this request. Please try a more specific question.";
      const assistantMessage: ChatMessage = {
        id: `${threadId}-assistant-last`,
        role: "assistant",
        content: assistantText,
        createdAt: new Date().toISOString(),
      };

      const userMessagePayload = {
        threadId,
        userId: user.uid,
        role: "user",
        content: trimmedPrompt,
        createdAt: now,
        ...(previewImage?.dataUrl ? { imageUrl: previewImage.dataUrl } : {}),
      };

      await addDoc(collection(db, "messages"), userMessagePayload);

      await addDoc(collection(db, "messages"), {
        threadId,
        userId: user.uid,
        role: "assistant",
        content: assistantText,
        createdAt: assistantMessage.createdAt,
      });

      setThreadMessages((prev) => ({
        ...prev,
        [threadId!]: [...(prev[threadId!] ?? []), assistantMessage],
      }));
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, updatedAt: assistantMessage.createdAt, title: thread.title || trimmedPrompt.slice(0, 44) }
            : thread
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "The assistant could not respond right now.";
      setErrorMessage(message);
      setThreadMessages((prev) => ({
        ...prev,
        [threadId!]: [
          ...(prev[threadId!] ?? []),
          {
            id: `${threadId}-assistant-error`,
            role: "assistant",
            content: `The civic assistant could not verify that request. ${message}`,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    } finally {
      setIsTyping(false);
      setPreviewImage(null);
    }
  };

  const regenerateLastResponse = () => {
    const latestUserPrompt = [...(activeMessages ?? [])].reverse().find((message) => message.role === "user");
    if (latestUserPrompt) {
      void sendMessage(latestUserPrompt.content, true);
    }
  };

  const copyMessage = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 shadow-[0_20px_80px_-36px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:h-[calc(100vh-85px)]">
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="flex w-full flex-col border-b border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/70 lg:w-80 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Civic Companion</p>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Conversations</h3>
            </div>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              <Plus className="h-4 w-4" /> New Chat
            </button>
          </div>

          <label className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-950">
            <Search className="h-4 w-4" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search conversations"
              className="w-full bg-transparent outline-none"
              aria-label="Search conversations"
            />
          </label>

          <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
            {isLoadingThreads ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                Loading your civic chats…
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
                No conversations yet. Start one to receive verified civic guidance.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <div
                    key={thread.id}
                    className={`group rounded-2xl border p-3 transition ${
                      isActive
                        ? "border-primary/30 bg-primary/10 shadow-sm dark:border-primary-dark/30 dark:bg-primary-dark/10"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <button
                      onClick={() => handleSelectThread(thread.id)}
                      className="flex w-full items-start justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{thread.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{new Date(thread.updatedAt).toLocaleString()}</p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleRenameThread(thread.id)}
                        className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        aria-label="Rename conversation"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteThread(thread.id)}
                        className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <main className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200/70 px-4 py-4 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Sparkles className="h-5 w-5 text-primary dark:text-primary-dark" />
                JanMitra AI Civic Companion
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Verified guidance for government services, rights, and next steps.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {preferredLanguage}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                <AlertCircle className="h-4 w-4" />
                {errorMessage}
              </div>
            )}

            {activeMessages.length === 0 && !isTyping ? (
              <div className="flex h-full flex-col justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">
                  <Brain className="h-7 w-7" />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">How can JanMitra help today?</h4>
                <p className="mt-2 text-sm text-slate-500">
                  Ask about certificates, welfare schemes, public services, or upload a photo for visual help.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {PRESET_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-[92%] items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                          message.role === "user"
                            ? "bg-primary text-white dark:bg-primary-dark dark:text-slate-950"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                      </div>
                      <div
                        className={`rounded-[24px] border px-4 py-3 shadow-sm ${
                          message.role === "user"
                            ? "border-primary/10 bg-primary text-white dark:border-primary-dark/20 dark:bg-primary-dark dark:text-slate-950"
                            : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                        }`}
                      >
                        {message.imageUrl && (
                          <img src={message.imageUrl} alt="Uploaded civic reference" className="mb-3 max-h-64 rounded-2xl object-cover" />
                        )}
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                        {message.role === "assistant" && (
                          <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-2 text-xs text-slate-500 dark:border-slate-800">
                            <button
                              onClick={() => void copyMessage(message.content)}
                              className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                              aria-label="Copy response"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => speakResponse(message.content)}
                              className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                              aria-label="Speak response"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[92%] items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-slate-500">JanMitra is verifying the latest civic guidance…</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-200/70 p-4 dark:border-slate-800">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-[24px] border p-3 transition ${
                isDragging ? "border-primary/40 bg-primary/5" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
              }`}
            >
              {previewImage && (
                <div className="mb-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <span className="truncate">{previewImage.file.name}</span>
                  <button onClick={() => setPreviewImage(null)} className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-800">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2">
                <label className="flex cursor-pointer items-center justify-center rounded-full border border-slate-200 p-3 text-slate-500 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:text-slate-400">
                  <Paperclip className="h-4 w-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleImageSelection(event.target.files?.[0] ?? null)}
                  />
                </label>
                <button
                  onClick={toggleVoiceInput}
                  className={`rounded-full border p-3 ${
                    isListening ? "border-red-400 bg-red-50 text-red-500" : "border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary"
                  }`}
                  aria-label="Toggle voice input"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <textarea
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage(inputValue);
                    }
                  }}
                  rows={2}
                  placeholder="Ask about a service, upload an image, or describe a civic issue…"
                  className="min-h-[52px] flex-1 resize-none rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none ring-0 focus:border-primary dark:border-slate-700 dark:bg-slate-900"
                  aria-label="Ask JanMitra a civic question"
                />
                <button
                  onClick={() => void sendMessage(inputValue)}
                  disabled={!inputValue.trim() && !previewImage}
                  className="rounded-full bg-primary p-3 text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-dark dark:text-slate-950"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Upload an image for visual civic assistance
                </div>
                <div className="flex items-center gap-2">
                  {activeMessages.length > 0 && (
                    <button
                      onClick={regenerateLastResponse}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:text-slate-300"
                    >
                      <RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Regenerate
                    </button>
                  )}
                  <div className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified guidance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
