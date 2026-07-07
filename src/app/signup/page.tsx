"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { User, Mail, Lock, Globe, AlertCircle, ArrowLeft, ArrowRight, UserPlus } from "lucide-react";

const STATES_AND_DISTRICTS: Record<string, string[]> = {
  "Delhi": ["Central Delhi", "New Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi"],
  "Maharashtra": ["Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik"],
  "Karnataka": ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Dharwad", "Mangaluru"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
  "Uttar Pradesh": ["Lucknow", "Gautam Buddha Nagar (Noida)", "Ghaziabad", "Varanasi", "Kanpur"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Kerala": ["Trivandrum", "Kochi", "Kozhikode", "Thrissur", "Wayanad"]
};

const OCCUPATIONS = [
  "Student",
  "Salaried Professional",
  "Business Owner",
  "Self-Employed",
  "Retired",
  "Public Servant",
  "Homemaker",
  "Unemployed",
  "Other"
];

const LANGUAGES = [
  "English",
  "Hindi (हिन्दी)",
  "Bengali (বাংলা)",
  "Telugu (తెలుగు)",
  "Marathi (मराठी)",
  "Tamil (தமிழ்)",
  "Gujarati (ગુજરાતી)",
  "Kannada (ಕನ್ನಡ)",
  "Malayalam (മലയാളം)"
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  
  // Step 1 Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Step 2 Fields
  const [state, setState] = useState("Delhi");
  const [district, setDistrict] = useState("Central Delhi");
  const [occupation, setOccupation] = useState("Student");
  const [age, setAge] = useState(18);
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { registerUser } = useApp();
  const router = useRouter();

  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    const districts = STATES_AND_DISTRICTS[selectedState];
    if (districts && districts.length > 0) {
      setDistrict(districts[0]);
    }
  };

  const handleNext = () => {
    if (!fullName || !email || !password) {
      setError("Please fill out all credentials.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleBack = () => {
    setError("");
    setStep(1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !state || !district || !occupation || !age || !preferredLanguage) {
      setError("All fields are required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await registerUser(email, password, {
        fullName,
        state,
        district,
        occupation,
        age: Number(age),
        preferredLanguage
      });
      
      // Celebrate signup success
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use" || err.message?.includes("email-already-in-use")) {
        setError("This email is already in use by another account.");
      } else {
        setError(err.message || "Registration failed. Please check details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    active: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" as any }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" as any }
    })
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-lg z-10">
        {/* App Branding */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-slate-100">
            JanMitra AI
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold tracking-wider">
            Create Your Account
          </p>

          {/* Progress Indicators */}
          <div className="flex items-center space-x-2 mt-6">
            <div className={`h-2.5 rounded-full transition-all duration-300 ${step === 1 ? "w-10 bg-primary dark:bg-primary-dark" : "w-2.5 bg-slate-300 dark:bg-slate-700"}`} />
            <div className={`h-2.5 rounded-full transition-all duration-300 ${step === 2 ? "w-10 bg-primary dark:bg-primary-dark" : "w-2.5 bg-slate-300 dark:bg-slate-700"}`} />
          </div>
        </div>

        {/* Form Card */}
        <div className="md-card p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
          <form onSubmit={handleRegister} className="flex-1 flex flex-col justify-between">
            
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 p-3.5 mb-4 rounded-2xl bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence initial={false} custom={step === 1 ? -1 : 1}>
                {step === 1 ? (
                  <motion.div
                    key="step-1"
                    custom={-1}
                    variants={stepVariants}
                    initial="initial"
                    animate="active"
                    exit="exit"
                    className="space-y-4 w-full"
                  >
                    <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
                      Step 1: Account Registration
                    </h3>

                    <div>
                      <label htmlFor="fullName" className="md-label">
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <User className="w-5 h-5" />
                        </span>
                        <input
                          type="text"
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Shri Rajesh Kumar"
                          className="md-input pl-11"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="signup-email" className="md-label">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Mail className="w-5 h-5" />
                        </span>
                        <input
                          type="email"
                          id="signup-email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rajesh@domain.in"
                          className="md-input pl-11"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="signup-password" className="md-label">
                        Password
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Lock className="w-5 h-5" />
                        </span>
                        <input
                          type="password"
                          id="signup-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="•••••••• (Min 6 chars)"
                          className="md-input pl-11"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-2"
                    custom={1}
                    variants={stepVariants}
                    initial="initial"
                    animate="active"
                    exit="exit"
                    className="space-y-3.5 w-full"
                  >
                    <h3 className="text-lg font-bold font-display text-slate-800 dark:text-slate-100">
                      Step 2: Civic Profile Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="state" className="md-label">
                          State
                        </label>
                        <select
                          id="state"
                          value={state}
                          onChange={(e) => handleStateChange(e.target.value)}
                          className="md-input bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 py-3"
                          required
                        >
                          {Object.keys(STATES_AND_DISTRICTS).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="district" className="md-label">
                          District
                        </label>
                        <select
                          id="district"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="md-input bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 py-3"
                          required
                        >
                          {STATES_AND_DISTRICTS[state]?.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="occupation" className="md-label">
                          Occupation
                        </label>
                        <select
                          id="occupation"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="md-input bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 py-3"
                          required
                        >
                          {OCCUPATIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="age" className="md-label">
                          Age (Years)
                        </label>
                        <input
                          type="number"
                          id="age"
                          min="1"
                          max="120"
                          value={age}
                          onChange={(e) => setAge(Number(e.target.value))}
                          placeholder="25"
                          className="md-input"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="language" className="md-label">
                        Preferred Language
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Globe className="w-5 h-5" />
                        </span>
                        <select
                          id="language"
                          value={preferredLanguage}
                          onChange={(e) => setPreferredLanguage(e.target.value)}
                          className="md-input pl-11 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 py-3"
                          required
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex space-x-3 mt-8">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 py-3.5 px-4 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover text-white dark:text-slate-950 font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 py-3.5 px-4 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover text-white dark:text-slate-950 font-semibold rounded-2xl shadow-md hover:shadow-lg focus:outline-hidden disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white dark:border-slate-950 border-t-transparent" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Register</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-bold text-primary dark:text-primary-dark hover:underline"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
