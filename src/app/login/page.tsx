"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { sendPasswordResetEmail, auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const { loginUser, loginWithGoogle } = useApp();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await loginUser(email, password);
      router.push("/dashboard");
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("invalid-credential") || e.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError(e.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError("Please enter your email address.");
      return;
    }
    setForgotError("");
    setForgotSuccess(false);
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotSuccess(true);
    } catch (e: any) {
      console.error(e);
      if (e.code === "auth/user-not-found") {
        setForgotError("No account found with this email.");
      } else {
        setForgotError("Failed to send reset link. Try again.");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* App Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary dark:bg-primary-dark flex items-center justify-center text-white dark:text-slate-950 mb-3 shadow-lg shadow-primary/20">
            <svg viewBox="0 0 100 100" fill="none" className="w-8 h-8 stroke-current stroke-[8] stroke-linecap-round stroke-linejoin-round">
              <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-slate-100">
            JanMitra AI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Your Intelligent Government Companion
          </p>
        </div>

        {/* Login Card */}
        <div className="md-card p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 font-display">
            Sign In
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 p-3.5 rounded-2xl bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="md-label">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="md-input pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 px-1">
                <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotSuccess(false);
                    setForgotError("");
                  }}
                  className="text-xs font-semibold text-primary dark:text-primary-dark hover:underline bg-transparent border-0 outline-hidden"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="md-input pl-11"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover text-white dark:text-slate-950 font-semibold rounded-2xl shadow-md hover:shadow-lg focus:outline-hidden disabled:opacity-50 active:scale-98 transition-all duration-200"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white dark:border-slate-950 border-t-transparent" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Or Connect With
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Social Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold active:scale-98 transition-all duration-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Register Link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            New to JanMitra?{" "}
            <Link
              href="/signup"
              className="font-bold text-primary dark:text-primary-dark hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl p-6 z-10"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 font-display mb-2">
                Reset Password
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotSuccess ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    Reset link sent! Please check your email inbox.
                  </div>
                ) : (
                  <>
                    {forgotError && (
                      <div className="flex items-center space-x-2 p-3.5 rounded-2xl bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{forgotError}</span>
                      </div>
                    )}

                    <div>
                      <label htmlFor="forgot-email" className="md-label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="forgot-email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="md-input"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-3 border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  {!forgotSuccess && (
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-3 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover text-white dark:text-slate-950 font-semibold rounded-2xl shadow-md disabled:opacity-50 transition-all duration-200"
                    >
                      {forgotLoading ? "Sending..." : "Send Link"}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
