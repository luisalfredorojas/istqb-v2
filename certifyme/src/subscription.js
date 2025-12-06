import { db } from "./firebase-config";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

/**
 * Check if the user has a valid premium subscription.
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
export const checkSubscriptionStatus = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.subscription && data.subscription.type === 'premium';
    }
    return false;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
};

/**
 * ⚠️ DEPRECATED & DANGEROUS - DO NOT USE ⚠️
 * 
 * This function allows client-side Premium activation which is a CRITICAL SECURITY VULNERABILITY.
 * 
 * Firestore Security Rules now PREVENT this function from working (client cannot modify subscription field).
 * Premium activation is now done ONLY through Netlify Function: /.netlify/functions/activate-premium
 * 
 * The Netlify Function:
 * 1. Verifies PayPhone transaction server-side
 * 2. Prevents duplicate transaction usage
 * 3. Uses Firebase Admin SDK (bypasses security rules)
 * 
 * @deprecated Since security-audit branch (2025-12-06)
 * @see netlify/functions/activate-premium.js for secure implementation
 */
/*
export const activateSubscription = async (userId) => {
  // ❌ SECURITY RISK: This allowed any user to activate Premium from browser console
  // ✅ NOW BLOCKED: Firestore Security Rules prevent modifying subscription field from client
  
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      subscription: {
        type: 'premium',
        activatedAt: new Date().toISOString()
      }
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error activating subscription:", error);
    return false;
  }
};
*/

/**
 * Check if the user is allowed to take the exam.
 * Rules:
 * 1. Premium users: Unlimited.
 * 2. Free users: Once per exam per day.
 * 
 * @param {string} userId 
 * @param {string} examSlug 
 * @returns {Promise<{allowed: boolean, reason: string}>}
 */
export const checkDailyExamLimit = async (userId, examSlug) => {
  try {
    // 1. Check if premium
    const isPremium = await checkSubscriptionStatus(userId);
    if (isPremium) return { allowed: true, reason: 'premium' };

    // 2. Check today's history for this exam
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayISO = startOfDay.toISOString();

    const historyRef = collection(db, "users", userId, "history");
    
    // Query all exams taken today
    const q = query(
      historyRef, 
      where("date", ">=", startOfDayISO)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Check if the specific exam slug exists in today's attempts
    const hasTakenToday = querySnapshot.docs.some(doc => doc.data().slug === examSlug);

    if (hasTakenToday) {
      return { allowed: false, reason: 'daily_limit' };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking daily limit:", error);
    // In case of error, we might default to blocking or allowing. 
    // Blocking is safer for monetization, but annoying for users if DB issues.
    // Let's return false to be safe.
    return { allowed: false, reason: 'error' };
  }
};

/**
 * Get list of exam slugs taken today.
 * @param {string} userId 
 * @returns {Promise<string[]>}
 */
export const getTodaysAttempts = async (userId) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayISO = startOfDay.toISOString();

    const historyRef = collection(db, "users", userId, "history");
    const q = query(
      historyRef, 
      where("date", ">=", startOfDayISO)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().slug);
  } catch (error) {
    console.error("Error fetching today's attempts:", error);
    return [];
  }
};
