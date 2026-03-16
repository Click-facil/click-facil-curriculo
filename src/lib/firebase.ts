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

const firebaseConfig = {
  apiKey: "AIzaSyDVieCOxuL_0V1ku0QUc5qe8nnhG8S05cU",
  authDomain: "click-facil-curriculo.firebaseapp.com",
  projectId: "click-facil-curriculo",
  storageBucket: "click-facil-curriculo.firebasestorage.app",
  messagingSenderId: "249560393165",
  appId: "1:249560393165:web:6eb78fd51d96124b19d084",
  measurementId: "G-HM197C397N",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ── Auth helpers ──────────────────────────────────────────────────────────────

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const onAuthChange = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);

// ── Premium helpers ───────────────────────────────────────────────────────────

/** Retorna true se o usuário já pagou e tem acesso premium. */
export async function checkPremium(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() && snap.data()?.premium === true;
  } catch {
    return false;
  }
}

/**
 * Marca usuário como premium no Firestore.
 * Chamado pela Vercel Function após confirmação do pagamento,
 * mas também pode ser chamado localmente após retorno do MP (fallback).
 */
export async function grantPremium(uid: string): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { premium: true, grantedAt: serverTimestamp() },
    { merge: true }
  );
}
