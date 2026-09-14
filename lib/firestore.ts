import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Profile, ibraheemProfile } from "./data/profile";

export async function getProfile(username: string = "ibraheem"): Promise<Profile> {
  try {
    const docRef = doc(db, "profiles", username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Profile;
    }
  } catch (error) {
    console.warn("Firestore fetch failed, falling back to static profile:", error);
  }
  return ibraheemProfile;
}

export async function saveProfile(username: string = "ibraheem", profile: Profile): Promise<void> {
  // Ensure max 10 links constraint
  if (profile.links && profile.links.length > 10) {
    profile.links = profile.links.slice(0, 10);
  }
  const docRef = doc(db, "profiles", username);
  await setDoc(docRef, profile, { merge: true });
}
