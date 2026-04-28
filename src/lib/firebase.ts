import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

// Configuração de PRODUÇÃO
const firebaseConfigProd = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Configuração de DESENVOLVIMENTO (localhost)
const firebaseConfigDev = {
  apiKey:            import.meta.env.VITE_FIREBASE_DEV_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_DEV_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_DEV_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_DEV_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_DEV_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_DEV_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_DEV_MEASUREMENT_ID || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Detecta se está em localhost
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Usa config de DEV no localhost, PROD em produção
const firebaseConfig = isLocalhost ? firebaseConfigDev : firebaseConfigProd;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);
export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
export const onAuthChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);

export async function checkPremium(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() && snap.data()?.premium === true;
  } catch {
    return false;
  }
}

export async function grantPremium(uid: string): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { premium: true, grantedAt: serverTimestamp() },
    { merge: true }
  );
}

// Adicionar em src/lib/firebase.ts

export async function getUserCredits(uid: string): Promise<number> {
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.data();
  if (data?.legacy_premium || data?.premium) return 9999;
  return data?.credits ?? 0;
}

export async function grantWelcomeCredits(uid: string): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    credits: 5,            // bônus de boas-vindas
    freeCreditsUsed: true,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function addCredits(uid: string, amount: number): Promise<void> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const current = snap.data()?.credits ?? 0;
  await setDoc(ref, {
    credits: current + amount,
    creditsTotal: (snap.data()?.creditsTotal ?? 0) + amount,
    lastPurchaseAt: serverTimestamp(),
  }, { merge: true });
}