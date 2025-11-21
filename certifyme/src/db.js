import { db } from "./firebase-config";
import { doc, setDoc, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

/**
 * Save an exam result to the user's history.
 * Structure: users/{userId}/history/{autoId}
 */
export const saveExamResult = async (userId, examSlug, score, totalQuestions) => {
  try {
    const userRef = doc(db, "users", userId);
    const historyRef = collection(userRef, "history");
    
    const result = {
      slug: examSlug,
      score,
      totalQuestions,
      date: new Date().toISOString(),
      percentage: Math.round((score / totalQuestions) * 100)
    };

    // Add a new document to the history subcollection
    await addDoc(historyRef, result);

    // Update summary (optional, keeps the LATEST attempt easy to find)
    await setDoc(userRef, {
      lastExam: result
    }, { merge: true });

    console.log("Exam result saved!");
    return true;
  } catch (error) {
    console.error("Error saving exam result:", error);
    return false;
  }
};

export const getUserHistory = async (userId) => {
  try {
    const historyRef = collection(db, "users", userId, "history");
    const q = query(historyRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};
