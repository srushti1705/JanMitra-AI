"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  auth,
  db,
  storage,
  isMock,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithGoogleMock,
  signOut,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  uploadStringMock,
  ref,
  getDownloadURL,
  GoogleAuthProvider,
} from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  state: string;
  district: string;
  occupation: string;
  age: number;
  preferredLanguage: string;
  photoURL?: string;
  createdAt?: string;
}

export interface CivicComplaint {
  id?: string;
  title: string;
  description: string;
  category: string;
  status: "Submitted" | "In Review" | "Assigned" | "In Progress" | "Resolved";
  state: string;
  district: string;
  reporterName: string;
  imageUrl?: string;
  createdAt: string;
  updateHistory: { status: string; note: string; date: string }[];
}

interface AppContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  theme: "light" | "dark";
  language: string;
  complaints: CivicComplaint[];
  isMockMode: boolean;
  toggleTheme: () => void;
  setLanguage: (lang: string) => void;
  loginUser: (email: string, pass: string) => Promise<void>;
  registerUser: (email: string, pass: string, profileData: Omit<UserProfile, "uid" | "email">) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  updateProfileDetails: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (base64DataUrl: string) => Promise<string>;
  submitComplaint: (title: string, description: string, category: string, base64Image?: string) => Promise<void>;
  refreshComplaints: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguageState] = useState<string>("English");
  const [complaints, setComplaints] = useState<CivicComplaint[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Load theme and language from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("janmitra_theme") as "light" | "dark";
      const savedLanguage = localStorage.getItem("janmitra_lang") || "English";
      
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

      setTheme(initialTheme);
      setLanguageState(savedLanguage);

      if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Load additional Firestore user profile
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            setProfile(profileData);
            setLanguageState(profileData.preferredLanguage || "English");
          } else {
            // Profile doesn't exist yet (e.g. Google Sign In first time)
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              fullName: firebaseUser.displayName || "Citizen Mitra",
              email: firebaseUser.email || "",
              state: "Delhi",
              district: "Central Delhi",
              occupation: "Public",
              age: 25,
              preferredLanguage: "English",
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${firebaseUser.uid}`,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
          await fetchUserComplaints(firebaseUser.uid);
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      } else {
        setProfile(null);
        setComplaints([]);
      }
      setLoading(false);

      // Route protection check
      const publicRoutes = ["/login", "/signup", "/"];
      if (!firebaseUser && !publicRoutes.includes(pathname)) {
        router.push("/login");
      } else if (firebaseUser && publicRoutes.includes(pathname) && pathname !== "/") {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // Fetch Complaints
  const fetchUserComplaints = async (uid: string) => {
    try {
      const complaintsCol = collection(db, "complaints");
      const snapshot = await getDocs(complaintsCol);
      const allComplaints = snapshot.docs.map((doc: any) => ({
        ...doc.data(),
        id: doc.id,
      })) as CivicComplaint[];
      
      // Filter user complaints if in mock mode (simulated query), or filter by uid
      const userComplaints = allComplaints.filter((c) => c.reporterName === uid || c.reporterName === profile?.fullName);
      setComplaints(userComplaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      console.error("Error loading complaints:", e);
    }
  };

  const refreshComplaints = async () => {
    if (user) {
      await fetchUserComplaints(user.uid);
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("janmitra_theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Set Language
  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("janmitra_lang", lang);
    if (profile && user) {
      const updatedProfile = { ...profile, preferredLanguage: lang };
      setProfile(updatedProfile);
      try {
        await updateDoc(doc(db, "users", user.uid), { preferredLanguage: lang });
      } catch (e) {
        console.error("Error saving language settings:", e);
      }
    }
  };

  // Login
  const loginUser = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      router.push("/dashboard");
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  // Register
  const registerUser = async (
    email: string,
    pass: string,
    profileData: Omit<UserProfile, "uid" | "email">
  ) => {
    setLoading(true);
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: newUser.uid,
        email,
        photoURL: newUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${newUser.uid}`,
        ...profileData,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", newUser.uid), newProfile);
      setProfile(newProfile);
      router.push("/dashboard");
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isMock) {
        const { user: mockUser } = await signInWithGoogleMock();
        router.push("/dashboard");
      } else {
        const provider = new GoogleAuthProvider();
        // Since we are running in browser, we can import signInWithPopup from firebase/auth
        const { signInWithPopup } = await import("firebase/auth");
        await signInWithPopup(auth, provider);
        router.push("/dashboard");
      }
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  // Logout
  const logoutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setProfile(null);
      setUser(null);
      setComplaints([]);
      router.push("/login");
    } catch (e) {
      console.error("Signout error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Update Profile Details
  const updateProfileDetails = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    try {
      await updateDoc(doc(db, "users", user.uid), updates);
    } catch (e) {
      console.error("Error updating profile in DB:", e);
      throw e;
    }
  };

  // Upload Profile Avatar
  const uploadAvatar = async (base64DataUrl: string): Promise<string> => {
    if (!user || !profile) throw new Error("User not authenticated");
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadStringMock(storageRef, base64DataUrl);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfileDetails({ photoURL: downloadURL });
      return downloadURL;
    } catch (e) {
      console.error("Avatar upload failed:", e);
      throw e;
    }
  };

  // Submit Complaint
  const submitComplaint = async (
    title: string,
    description: string,
    category: string,
    base64Image?: string
  ) => {
    if (!user || !profile) throw new Error("User not authenticated");
    try {
      let imageUrl = "";
      if (base64Image) {
        const complaintImageId = Math.random().toString(36).substring(2, 9);
        const storageRef = ref(storage, `complaints/${user.uid}/${complaintImageId}`);
        await uploadStringMock(storageRef, base64Image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const newComplaint: CivicComplaint = {
        title,
        description,
        category,
        status: "Submitted",
        state: profile.state,
        district: profile.district,
        reporterName: profile.fullName,
        imageUrl,
        createdAt: new Date().toISOString(),
        updateHistory: [
          {
            status: "Submitted",
            note: "Complaint submitted successfully to JanMitra AI systems.",
            date: new Date().toISOString(),
          },
        ],
      };

      await addDoc(collection(db, "complaints"), newComplaint);
      await fetchUserComplaints(user.uid);
    } catch (e) {
      console.error("Error submitting complaint:", e);
      throw e;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        loading,
        theme,
        language,
        complaints,
        isMockMode: isMock,
        toggleTheme,
        setLanguage,
        loginUser,
        registerUser,
        loginWithGoogle,
        logoutUser,
        updateProfileDetails,
        uploadAvatar,
        submitComplaint,
        refreshComplaints,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
