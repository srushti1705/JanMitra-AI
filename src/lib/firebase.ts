import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword as realCreateUser,
  signInWithEmailAndPassword as realSignIn,
  signOut as realSignOut,
  onAuthStateChanged as realOnAuthStateChanged,
  updateProfile as realUpdateProfile,
  sendPasswordResetEmail as realSendPasswordReset,
  GoogleAuthProvider,
  signInWithCredential,
  Auth as RealAuth,
  User as RealUser
} from "firebase/auth";
import {
  getFirestore,
  collection as realCollection,
  doc as realDoc,
  setDoc as realSetDoc,
  getDoc as realGetDoc,
  getDocs as realGetDocs,
  addDoc as realAddDoc,
  updateDoc as realUpdateDoc,
  deleteDoc as realDeleteDoc,
  Firestore as RealFirestore
} from "firebase/firestore";
import {
  getStorage,
  ref as realRef,
  uploadBytes as realUploadBytes,
  getDownloadURL as realGetDownloadURL,
  FirebaseStorage as RealStorage
} from "firebase/storage";

// Determine if real Firebase config is provided
const isFirebaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) &&
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) &&
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) &&
  Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

let app: any;
let realAuthInstance: RealAuth | null = null;
let realDbInstance: RealFirestore | null = null;
let realStorageInstance: RealStorage | null = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  realAuthInstance = getAuth(app);
  realDbInstance = getFirestore(app);
  realStorageInstance = getStorage(app);
}

export let isMock = !isFirebaseConfigured;
export { GoogleAuthProvider };

const shouldFallbackToMock = (error: any) => {
  const message = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
  return (
    error?.code === "auth/network-request-failed" ||
    message.includes("network-request-failed") ||
    message.includes("failed to fetch") ||
    message.includes("err_network") ||
    message.includes("auth/invalid-api-key") ||
    message.includes("permission-denied") ||
    message.includes("unavailable")
  );
};

const forceMockBackend = (reason?: string) => {
  if (!isMock) {
    console.warn(`[Firebase] Falling back to mock backend: ${reason || "runtime Firebase issue"}`);
    isMock = true;
  }
};

// -------------------------------------------------------------
// MOCK STATE UTILITIES (localStorage backed)
// -------------------------------------------------------------

const getLocalStorageItem = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setLocalStorageItem = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// -------------------------------------------------------------
// MOCK INTERFACES
// -------------------------------------------------------------

export interface MockUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

class MockAuth {
  private listeners: ((user: MockUser | null) => void)[] = [];
  private currentUserObj: MockUser | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.currentUserObj = getLocalStorageItem("janmitra_mock_current_user", null);
    }
  }

  get currentUser(): MockUser | null {
    return this.currentUserObj;
  }

  updateCurrentUser(user: MockUser | null) {
    this.currentUserObj = user;
    setLocalStorageItem("janmitra_mock_current_user", user);
    this.listeners.forEach((listener) => listener(user));
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void) {
    this.listeners.push(callback);
    // Trigger immediately with current value
    callback(this.currentUserObj);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }
}

const mockAuthInstance = new MockAuth();

// Export auth references
export const auth: any = isMock ? mockAuthInstance : realAuthInstance;
export const db: any = isMock ? { type: "mock-db" } : realDbInstance;
export const storage: any = isMock ? { type: "mock-storage" } : realStorageInstance;

// -------------------------------------------------------------
// AUTH COMPATIBILITY API
// -------------------------------------------------------------

export async function createUserWithEmailAndPassword(
  _auth: any,
  email: string,
  pass: string
): Promise<{ user: MockUser | RealUser }> {
  if (!isMock) {
    try {
      return await realCreateUser(realAuthInstance!, email, pass);
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "auth signup failed");
      } else {
        throw error;
      }
    }
  }

  const users = getLocalStorageItem("janmitra_mock_users", {});
  if (users[email]) {
    throw new Error("auth/email-already-in-use");
  }

  const uid = "mock-uid-" + Math.random().toString(36).substring(2, 11);
  const newUser: MockUser = {
    uid,
    email,
    displayName: email.split("@")[0],
    photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
  };

  users[email] = { ...newUser, passwordHash: pass };
  setLocalStorageItem("janmitra_mock_users", users);
  mockAuthInstance.updateCurrentUser(newUser);

  return { user: newUser };
}

export async function signInWithEmailAndPassword(
  _auth: any,
  email: string,
  pass: string
): Promise<{ user: MockUser | RealUser }> {
  if (!isMock) {
    try {
      return await realSignIn(realAuthInstance!, email, pass);
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "auth signin failed");
      } else {
        throw error;
      }
    }
  }

  const users = getLocalStorageItem("janmitra_mock_users", {});
  const userRecord = users[email];

  if (!userRecord || userRecord.passwordHash !== pass) {
    throw new Error("auth/invalid-credential");
  }

  const { passwordHash, ...userWithoutPassword } = userRecord;
  userWithoutPassword.metadata = {
    ...userWithoutPassword.metadata,
    lastSignInTime: new Date().toISOString(),
  };

  // Update in users registry
  users[email] = { ...userRecord, metadata: userWithoutPassword.metadata };
  setLocalStorageItem("janmitra_mock_users", users);

  mockAuthInstance.updateCurrentUser(userWithoutPassword);
  return { user: userWithoutPassword };
}

export async function signInWithGoogleMock(): Promise<{ user: MockUser }> {
  if (!isMock) {
    throw new Error("Google Mock Auth is only for mock mode");
  }

  const uid = "mock-google-uid-" + Math.random().toString(36).substring(2, 11);
  const userEmail = `citizen.${Math.random().toString(36).substring(2, 6)}@gmail.com`;
  const mockGoogleUser: MockUser = {
    uid,
    email: userEmail,
    displayName: "Citizen Mitra",
    photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${uid}`,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
  };

  const users = getLocalStorageItem("janmitra_mock_users", {});
  users[userEmail] = { ...mockGoogleUser, passwordHash: "google-auth-token" };
  setLocalStorageItem("janmitra_mock_users", users);

  mockAuthInstance.updateCurrentUser(mockGoogleUser);
  return { user: mockGoogleUser };
}

export async function signOut(_auth: any): Promise<void> {
  if (!isMock) {
    try {
      await realSignOut(realAuthInstance!);
      return;
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "auth signout failed");
      } else {
        throw error;
      }
    }
  }
  mockAuthInstance.updateCurrentUser(null);
}

export function onAuthStateChanged(_auth: any, callback: (user: any | null) => void) {
  if (!isMock) {
    try {
      return realOnAuthStateChanged(realAuthInstance!, callback);
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "auth state listener failed");
      } else {
        throw error;
      }
    }
  }
  return mockAuthInstance.onAuthStateChanged(callback);
}

export async function updateProfile(
  user: any,
  profileData: { displayName?: string; photoURL?: string }
): Promise<void> {
  if (!isMock) {
    try {
      await realUpdateProfile(user, profileData);
      return;
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "profile update failed");
      } else {
        throw error;
      }
    }
  }

  const currentUser = mockAuthInstance.currentUser;
  if (!currentUser) throw new Error("No authenticated user to update profile");

  const updatedUser = { ...currentUser, ...profileData };
  mockAuthInstance.updateCurrentUser(updatedUser);

  // Sync back to users registry
  const users = getLocalStorageItem("janmitra_mock_users", {});
  if (users[currentUser.email]) {
    users[currentUser.email] = { ...users[currentUser.email], ...profileData };
    setLocalStorageItem("janmitra_mock_users", users);
  }
}

export async function sendPasswordResetEmail(_auth: any, email: string): Promise<void> {
  if (!isMock) {
    try {
      await realSendPasswordReset(realAuthInstance!, email);
      return;
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "password reset failed");
      } else {
        throw error;
      }
    }
  }
  const users = getLocalStorageItem("janmitra_mock_users", {});
  if (!users[email]) {
    throw new Error("auth/user-not-found");
  }
  // Mock sending email - simply return success
  console.log(`[Mock Auth] Reset email link sent to ${email}`);
}

// -------------------------------------------------------------
// FIRESTORE COMPATIBILITY API
// -------------------------------------------------------------

function sanitizeForFirestore(value: any, key?: string): any {
  if (value === undefined) {
    if (key === "imageUrl") {
      return undefined;
    }
    return null;
  }

  if (value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item)).filter((item) => item !== undefined);
  }

  if (typeof value === "object") {
    const cleaned: Record<string, any> = {};
    for (const [entryKey, entryValue] of Object.entries(value)) {
      const sanitized = sanitizeForFirestore(entryValue, entryKey);
      if (sanitized !== undefined) {
        cleaned[entryKey] = sanitized;
      }
    }
    return cleaned;
  }

  return value;
}

function sanitizePayload(data: any) {
  return sanitizeForFirestore(data);
}

export function collection(_db: any, path: string) {
  if (!isMock) {
    return realCollection(realDbInstance!, path);
  }
  return { type: "mock-collection", path };
}

export function doc(_db: any, collectionPath: string, docId?: string) {
  if (!isMock) {
    return realDoc(realDbInstance!, collectionPath, docId || "");
  }
  return {
    type: "mock-document",
    collectionPath,
    id: docId || "mock-doc-" + Math.random().toString(36).substring(2, 11),
  };
}

export async function setDoc(docRef: any, data: any, options?: any): Promise<void> {
  if (!isMock) {
    try {
      await realSetDoc(docRef, data, options);
      return;
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "firestore setDoc failed");
      } else {
        throw error;
      }
    }
  }

  const colPath = docRef.collectionPath;
  const docId = docRef.id;
  const collections = getLocalStorageItem(`janmitra_firestore_${colPath}`, {});

  const sanitizedData = sanitizePayload(data);

  if (options && options.merge) {
    collections[docId] = { ...collections[docId], ...sanitizedData, id: docId, updatedAt: new Date().toISOString() };
  } else {
    collections[docId] = { ...sanitizedData, id: docId, updatedAt: new Date().toISOString() };
  }

  setLocalStorageItem(`janmitra_firestore_${colPath}`, collections);
}

export async function addDoc(colRef: any, data: any): Promise<any> {
  const sanitizedData = sanitizePayload(data);

  if (!isMock) {
    try {
      return await realAddDoc(colRef, sanitizedData);
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "firestore addDoc failed");
      } else {
        throw error;
      }
    }
  }

  const colPath = colRef.path;
  const docId = "mock-doc-" + Math.random().toString(36).substring(2, 11);
  const collections = getLocalStorageItem(`janmitra_firestore_${colPath}`, {});

  const newDoc = {
    ...sanitizedData,
    id: docId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  collections[docId] = newDoc;
  setLocalStorageItem(`janmitra_firestore_${colPath}`, collections);

  return { id: docId, get: async () => ({ exists: () => true, data: () => newDoc }) };
}

export async function getDoc(docRef: any): Promise<any> {
  if (!isMock) {
    try {
      return await realGetDoc(docRef);
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "firestore getDoc failed");
      } else {
        throw error;
      }
    }
  }

  const colPath = docRef.collectionPath;
  const docId = docRef.id;
  const collections = getLocalStorageItem(`janmitra_firestore_${colPath}`, {});
  const data = collections[docId];

  return {
    exists: () => !!data,
    id: docId,
    data: () => data || null,
  };
}

export async function updateDoc(docRef: any, data: any): Promise<void> {
  const sanitizedData = sanitizePayload(data);

  if (!isMock) {
    try {
      await realUpdateDoc(docRef, sanitizedData);
      return;
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "firestore updateDoc failed");
      } else {
        throw error;
      }
    }
  }

  const colPath = docRef.collectionPath;
  const docId = docRef.id;
  const collections = getLocalStorageItem(`janmitra_firestore_${colPath}`, {});

  if (!collections[docId]) {
    throw new Error("document-not-found");
  }

  collections[docId] = { ...collections[docId], ...sanitizedData, updatedAt: new Date().toISOString() };
  setLocalStorageItem(`janmitra_firestore_${colPath}`, collections);
}

export async function deleteDoc(docRef: any): Promise<void> {
  if (!isMock) {
    try {
      await realDeleteDoc(docRef);
      return;
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "firestore deleteDoc failed");
      } else {
        throw error;
      }
    }
  }

  const colPath = docRef.collectionPath;
  const docId = docRef.id;
  const collections = getLocalStorageItem(`janmitra_firestore_${colPath}`, {});
  if (collections[docId]) {
    delete collections[docId];
    setLocalStorageItem(`janmitra_firestore_${colPath}`, collections);
  }
}

export async function getDocs(colRef: any): Promise<any> {
  if (!isMock) {
    try {
      return await realGetDocs(colRef);
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "firestore getDocs failed");
      } else {
        throw error;
      }
    }
  }

  const colPath = colRef.path;
  const collections = getLocalStorageItem(`janmitra_firestore_${colPath}`, {});
  const list = Object.values(collections);

  return {
    empty: list.length === 0,
    docs: list.map((item: any) => ({
      id: item.id,
      data: () => item,
    })),
  };
}

// -------------------------------------------------------------
// STORAGE COMPATIBILITY API
// -------------------------------------------------------------

export function ref(_storage: any, path: string) {
  if (!isMock) {
    return realRef(realStorageInstance!, path);
  }
  return { type: "mock-storage-ref", path };
}

export async function uploadBytes(storageRef: any, bytes: Blob | Uint8Array | ArrayBuffer): Promise<any> {
  if (!isMock) {
    return realUploadBytes(storageRef, bytes as any);
  }

  // Convert Blob or bytes to Base64 to save locally as mock upload
  return new Promise((resolve, reject) => {
    if (bytes instanceof Blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const mockStorage = getLocalStorageItem("janmitra_mock_storage", {});
        mockStorage[storageRef.path] = base64data;
        setLocalStorageItem("janmitra_mock_storage", mockStorage);
        resolve({ ref: storageRef });
      };
      reader.onerror = reject;
      reader.readAsDataURL(bytes);
    } else {
      // Direct string representation / placeholder
      const mockStorage = getLocalStorageItem("janmitra_mock_storage", {});
      mockStorage[storageRef.path] = "data:image/png;base64,mockImageBytes...";
      setLocalStorageItem("janmitra_mock_storage", mockStorage);
      resolve({ ref: storageRef });
    }
  });
}

// Custom mock helper for base64 uploads directly
export async function uploadStringMock(storageRef: any, dataUrl: string): Promise<any> {
  if (isMock) {
    const mockStorage = getLocalStorageItem("janmitra_mock_storage", {});
    mockStorage[storageRef.path] = dataUrl;
    setLocalStorageItem("janmitra_mock_storage", mockStorage);
    return { ref: storageRef };
  } else {
    try {
      const { uploadString } = await import("firebase/storage");
      return await uploadString(realRef(realStorageInstance!, storageRef.path), dataUrl, "data_url");
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "storage upload failed");
        const mockStorage = getLocalStorageItem("janmitra_mock_storage", {});
        mockStorage[storageRef.path] = dataUrl;
        setLocalStorageItem("janmitra_mock_storage", mockStorage);
        return { ref: storageRef };
      }
      throw error;
    }
  }
}

export async function getDownloadURL(storageRef: any): Promise<string> {
  if (!isMock) {
    try {
      return await realGetDownloadURL(storageRef);
    } catch (error: any) {
      if (shouldFallbackToMock(error)) {
        forceMockBackend(error.message || "storage getDownloadURL failed");
      } else {
        throw error;
      }
    }
  }

  const mockStorage = getLocalStorageItem("janmitra_mock_storage", {});
  const data = mockStorage[storageRef.path];

  // Return the base64 string directly, or a default dicebear avatar if missing
  if (data) return data;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${storageRef.path.split("/").pop()}`;
}

console.log("Firebase Config:", {
  apiKey: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  appId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
});
console.log("Configured:", isFirebaseConfigured);