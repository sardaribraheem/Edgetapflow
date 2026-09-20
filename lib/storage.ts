// Client-side upload helpers. Uploads go to Storage with rules-appropriate
// paths; failures surface honestly to the UI (never silently swallowed).
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadPublicAvatar(uid: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Avatar must be under 5 MB.");
  const path = `avatars/${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

// Profile-picture upload during guest checkout (no account yet). Goes to a
// public avatarInbox folder keyed by a random client token. The resulting URL
// becomes the public profile photo on /u/<name>, so read is public (but only
// the token owner can write).
export async function uploadInboxAvatar(clientToken: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Avatar must be under 5 MB.");
  const path = `avatarInbox/${clientToken}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

// Custom card design upload during guest checkout. clientToken is a random
// folder name (generated client-side) so the guest can write only their own
// artwork; read is admin-only per storage.rules.
export async function uploadCustomDesign(clientToken: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  if (file.size > 25 * 1024 * 1024) throw new Error("Design files must be under 25 MB.");
  const path = `orderInbox/${clientToken}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

// Reads a local image file into a data URL for instant client-side preview.
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}