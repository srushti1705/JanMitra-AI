"use client";

import { useState, useRef } from "react";
import { useApp, UserProfile } from "@/context/AppContext";
import {
  User,
  Mail,
  Camera,
  MapPin,
  Briefcase,
  Calendar,
  Globe,
  LogOut,
  Edit,
  Save,
  CheckCircle,
  Bookmark,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

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
  "Marathi (മরাठी)",
  "Tamil (தமிழ்)",
  "Gujarati (ગુજરાતી)",
  "Kannada (ಕನ್ನಡ)",
  "Malayalam (മലയാളം)"
];

export default function ProfilePage() {
  const { profile, complaints, logoutUser, updateProfileDetails, uploadAvatar, setLanguage } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.fullName || "");
  const [age, setAge] = useState(profile?.age || 25);
  const [occupation, setOccupation] = useState(profile?.occupation || "Student");
  const [state, setState] = useState(profile?.state || "Delhi");
  const [district, setDistrict] = useState(profile?.district || "Central Delhi");
  
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    const districts = STATES_AND_DISTRICTS[selectedState];
    if (districts && districts.length > 0) {
      setDistrict(districts[0]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be left blank.");
      return;
    }
    setError("");
    setSaveSuccess(false);
    
    try {
      await updateProfileDetails({
        fullName: name,
        age: Number(age),
        occupation,
        state,
        district
      });
      setSaveSuccess(true);
      setIsEditing(false);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to update profile details. Try again.");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Avatar file size must be less than 2MB.");
        return;
      }
      setUploadingPic(true);
      setError("");

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          await uploadAvatar(base64);
        } catch (err: any) {
          setError(err.message || "Failed to upload avatar image.");
        } finally {
          setUploadingPic(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <User className="w-6 h-6 text-primary dark:text-primary-dark" />
            <span>My Citizen Account</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your personal data parameters, upload documents, and track history.
          </p>
        </div>

        <button
          onClick={logoutUser}
          className="flex items-center space-x-1.5 px-4 py-2 border border-red-500/30 hover:bg-red-500/5 text-red-650 dark:text-red-400 text-xs font-bold rounded-2xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Quick Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="md-card p-6 flex flex-col items-center text-center relative overflow-hidden bg-white dark:bg-slate-900">
            {/* Profile Avatar Frame */}
            <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-950 shadow-md mb-4 bg-slate-100 dark:bg-slate-850">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.uid || "janmitra"}`}
                alt="Citizen Avatar"
                className="w-full h-full object-cover"
              />
              
              {/* Hover overlay camera */}
              <button
                onClick={triggerUploadClick}
                disabled={uploadingPic}
                className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-all duration-200"
              >
                {uploadingPic ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 mb-1" />
                    <span>Upload</span>
                  </>
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <h3 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 leading-tight">
              {profile?.fullName}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5" />
              <span>{profile?.email}</span>
            </p>

            <div className="w-full border-t border-slate-100 dark:border-slate-850 my-4 pt-4 text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-450 font-medium">District Status:</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">{profile?.district}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-450 font-medium">State:</span>
                <span className="font-bold text-slate-700 dark:text-slate-350">{profile?.state}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-450 font-medium">Language Preference:</span>
                <span className="font-bold text-primary dark:text-primary-dark">{profile?.preferredLanguage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable details & bookmarks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information Form Card */}
          <div className="md-card p-6 md:p-8 bg-white dark:bg-slate-900 shadow-xs relative">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3 mb-6">
              <h3 className="font-bold text-base font-display text-slate-800 dark:text-slate-100">
                Personal Parameters
              </h3>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 text-xs font-bold text-primary dark:text-primary-dark hover:underline"
                >
                  <Edit className="w-4.5 h-4.5" />
                  <span>Edit details</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setError("");
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:underline"
                  >
                    <Save className="w-4.5 h-4.5" />
                    <span>Save changes</span>
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 text-red-650 dark:text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block ml-1 mb-1">Full Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="md-input py-2.5"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-250 text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" /> {profile?.fullName}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block ml-1 mb-1">Age (Years)</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="md-input py-2.5"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-250 text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" /> {profile?.age} Years
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block ml-1 mb-1">Occupation</span>
                  {isEditing ? (
                    <select
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="md-input py-2.5 bg-white dark:bg-slate-900 border border-slate-350"
                    >
                      {OCCUPATIONS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-250 text-sm font-semibold flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" /> {profile?.occupation}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block ml-1 mb-1">Preferred Language</span>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450">
                      <Globe className="w-4.5 h-4.5" />
                    </span>
                    <select
                      value={profile?.preferredLanguage || "English"}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="md-input pl-11 py-2.5 bg-white dark:bg-slate-900 border border-slate-350"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block ml-1 mb-1">State</span>
                  {isEditing ? (
                    <select
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="md-input py-2.5 bg-white dark:bg-slate-900 border border-slate-350"
                    >
                      {Object.keys(STATES_AND_DISTRICTS).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-250 text-sm font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> {profile?.state}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block ml-1 mb-1">District</span>
                  {isEditing ? (
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="md-input py-2.5 bg-white dark:bg-slate-900 border border-slate-350"
                    >
                      {STATES_AND_DISTRICTS[state]?.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-250 text-sm font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> {profile?.district}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Saved Items Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bookmarks */}
            <div className="md-card p-5 bg-white dark:bg-slate-900">
              <h3 className="font-bold text-sm font-display text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-3">
                <Bookmark className="w-4.5 h-4.5 text-primary" />
                <span>Saved Portals</span>
              </h3>
              <p className="text-[10px] text-slate-450 leading-relaxed mb-4">
                Quick bookmarks of government services stored on this device.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Digilocker Vault</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-primary/10 text-primary dark:text-primary-dark rounded-sm">Documentation</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sarathi License</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-primary/10 text-primary dark:text-primary-dark rounded-sm">Identity</span>
                </div>
              </div>
            </div>

            {/* Complaints statistics */}
            <div className="md-card p-5 bg-white dark:bg-slate-900">
              <h3 className="font-bold text-sm font-display text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-3">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                <span>Complaints Filed</span>
              </h3>
              <p className="text-[10px] text-slate-450 leading-relaxed mb-4">
                Summary count of civic reports submitted in your constituency.
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <span className="block text-xl font-black text-amber-600 dark:text-amber-400">
                    {complaints.filter(c => c.status !== "Resolved").length}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">Active</span>
                </div>
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {complaints.filter(c => c.status === "Resolved").length}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400">Resolved</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
