import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase-config";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

const createUserDocument = async (user) => {
  if (!user) return;
  
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { email, displayName, photoURL } = user;
    try {
      await setDoc(userRef, {
        email,
        displayName: displayName || email.split('@')[0],
        photoURL,
        createdAt: new Date().toISOString()
      });
      console.log("User document created in Firestore");
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDocument(result.user);
    return result.user;
  } catch (error) {
    console.error("Error logging in with Google", error);
    throw error;
  }
};

export const loginWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    await createUserDocument(result.user);
    return result.user;
  } catch (error) {
    console.error("Error logging in with GitHub", error);
    throw error;
  }
};

export const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error registering with email", error);
    throw error;
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Also check/create doc on login just in case
    await createUserDocument(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in with email", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out", error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
