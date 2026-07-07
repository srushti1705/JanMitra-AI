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
  deleteDoc,
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
  complaintId?: string;
  title: string;
  description: string;
  category: string;
  status: "Submitted" | "In Review" | "Assigned" | "In Progress" | "Resolved";
  state: string;
  district: string;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  department?: string;
  reporterName: string;
  reporterId?: string;
  userId?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  bookmarked?: boolean;
  updateHistory: { status: string; note: string; date: string }[];
}

export interface CivicNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning";
  createdAt: string;
  read: boolean;
}

interface AppContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  theme: "light" | "dark";
  language: string;
  complaints: CivicComplaint[];
  notifications: CivicNotification[];
  isMockMode: boolean;
  toggleTheme: () => void;
  setLanguage: (lang: string) => void;
  loginUser: (email: string, pass: string) => Promise<void>;
  registerUser: (email: string, pass: string, profileData: Omit<UserProfile, "uid" | "email">) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  updateProfileDetails: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (base64DataUrl: string) => Promise<string>;
  submitComplaint: (
    title: string,
    description: string,
    category: string,
    base64Image?: string,
    location?: { label?: string; latitude?: number; longitude?: number; state?: string; district?: string }
  ) => Promise<CivicComplaint>;
  refreshComplaints: () => Promise<void>;
  updateComplaintDescription: (complaintId: string, description: string) => Promise<void>;
  deleteComplaint: (complaintId: string) => Promise<void>;
  toggleComplaintBookmark: (complaintId: string) => Promise<void>;
  addNotification: (notification: Omit<CivicNotification, "id" | "createdAt" | "read">) => void;
  dismissNotification: (notificationId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguageState] = useState<string>("English");
  const [complaints, setComplaints] = useState<CivicComplaint[]>([]);
  const [notifications, setNotifications] = useState<CivicNotification[]>([]);
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
            const sanitizedProfile = Object.fromEntries(
              Object.entries(newProfile).filter(([, value]) => value !== undefined)
            );
            await setDoc(userDocRef, sanitizedProfile);
            setProfile(newProfile);
          }
          await fetchUserComplaints(firebaseUser.uid);
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      } else {
        setProfile(null);
        setComplaints([]);
        setNotifications([]);
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

      const userComplaints = allComplaints.filter(
        (c) => c.userId === uid || c.reporterId === uid || c.reporterName === profile?.fullName
      );
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
      const sanitizedProfileData = Object.fromEntries(
        Object.entries(newProfile).filter(([, value]) => value !== undefined)
      );
      await setDoc(doc(db, "users", newUser.uid), sanitizedProfileData);
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

  const addNotification = (notification: Omit<CivicNotification, "id" | "createdAt" | "read">) => {
    const item: CivicNotification = {
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notification,
    };
    setNotifications((prev) => [item, ...prev].slice(0, 6));
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
  };

  // Submit Complaint
  const submitComplaint = async (
    title: string,
    description: string,
    category: string,
    base64Image?: string,
    location?: { label?: string; latitude?: number; longitude?: number; state?: string; district?: string }
  ): Promise<CivicComplaint> => {
    if (!user || !profile) throw new Error("User not authenticated");
    try {
      let imageUrl = "";
      if (base64Image) {
        const complaintImageId = Math.random().toString(36).substring(2, 9);
        const storageRef = ref(storage, `complaints/${user.uid}/${complaintImageId}`);
        await uploadStringMock(storageRef, base64Image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const createdAt = new Date().toISOString();
      const complaintId = `CMP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const newComplaint: CivicComplaint = {
        title,
        description,
        category,
        status: "Submitted",
        state: location?.state || profile.state,
        district: location?.district || profile.district,
        locationLabel: location?.label || `${profile.district}, ${profile.state}`,
        latitude: location?.latitude,
        longitude: location?.longitude,
        department: "Municipal Corporation",
        reporterName: profile.fullName,
        reporterId: user.uid,
        userId: user.uid,
        complaintId,
        createdAt,
        updatedAt: createdAt,
        bookmarked: false,
        updateHistory: [
          {
            status: "Submitted",
            note: "Complaint submitted successfully to JanMitra AI systems.",
            date: createdAt,
          },
        ],
      };

      const firestoreComplaint = Object.fromEntries(
        Object.entries(newComplaint).filter(([, value]) => value !== undefined)
      );
      if (imageUrl) {
        firestoreComplaint.imageUrl = imageUrl;
      }
      await addDoc(collection(db, "complaints"), firestoreComplaint);
      setComplaints((prev) => [newComplaint, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      addNotification({
        title: "Complaint submitted",
        message: `${complaintId} has been logged for civic review.`,
        type: "success",
      });
      return newComplaint;
    } catch (e) {
      console.error("Error submitting complaint:", e);
      throw e;
    }
  };

  const updateComplaintDescription = async (complaintId: string, nextDescription: string) => {
    if (!user) throw new Error("User not authenticated");
    const target = complaints.find((item) => item.id === complaintId);
    if (!target) throw new Error("Complaint not found");

    const updatedAt = new Date().toISOString();
    const updatedHistory = [
      ...target.updateHistory,
      {
        status: target.status,
        note: "Description updated before review by citizen.",
        date: updatedAt,
      },
    ];

    await updateDoc(doc(db, "complaints", complaintId), {
      description: nextDescription,
      updatedAt,
      updateHistory: updatedHistory,
    });

    setComplaints((prev) => prev.map((item) => (item.id === complaintId ? { ...item, description: nextDescription, updatedAt, updateHistory: updatedHistory } : item)));
    addNotification({
      title: "Complaint updated",
      message: "Your description change has been saved.",
      type: "info",
    });
  };

  const deleteComplaint = async (complaintId: string) => {
    const target = complaints.find((item) => item.id === complaintId);
    if (!target || target.status !== "Submitted") {
      throw new Error("Only submitted complaints can be removed.");
    }
    await deleteDoc(doc(db, "complaints", complaintId));
    setComplaints((prev) => prev.filter((item) => item.id !== complaintId));
    addNotification({
      title: "Complaint removed",
      message: "The draft complaint has been deleted.",
      type: "warning",
    });
  };

  const toggleComplaintBookmark = async (complaintId: string) => {
    const target = complaints.find((item) => item.id === complaintId);
    if (!target) return;
    const nextValue = !target.bookmarked;
    await updateDoc(doc(db, "complaints", complaintId), { bookmarked: nextValue });
    setComplaints((prev) => prev.map((item) => (item.id === complaintId ? { ...item, bookmarked: nextValue } : item)));
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
        notifications,
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
        updateComplaintDescription,
        deleteComplaint,
        toggleComplaintBookmark,
        addNotification,
        dismissNotification,
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
