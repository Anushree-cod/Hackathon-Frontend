import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

// ── SIGNUP ──
export async function signUp(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  return cred.user;
}

// ── LOGIN ──
export async function logIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── LOGOUT ──
export async function logOut() {
  await signOut(auth);
}

// ── RESET PASSWORD ──
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// ── GET CURRENT USER ──
export function getCurrentUser() {
  return auth.currentUser;
}