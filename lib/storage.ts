// Client-side upload helpers. Uploads go to Storage with rules-appropriate
// paths; failures surface honestly to the UI (never silently swallowed).
import { ref, uploadBytes, getDownloadURL, getBlob } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadPublicAvatar(uid: string, file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Only image files are allowed.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Avatar must be under 5 MB.");
  const path = `avatars/${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

// Private uploads store authenticated Storage paths, never shareable download URLs.
export async function uploadCustomDesign(uid: string, file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Only image files are allowed.");
  if (file.size > 25 * 1024 * 1024) throw new Error("Design files must be under 25 MB.");
  const path = `orderInbox/${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return path;
}

export async function uploadPaymentReceipt(uid: string, file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Payment receipt must be an image.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Payment receipt must be under 8 MB.");
  const path = `paymentReceipts/${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return path;
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
export async function downloadPrivateUpload(path: string): Promise<void> {
  if (!/^(paymentReceipts|orderInbox)\/[^/]+\/[^/]+$/.test(path)) throw new Error("Invalid private upload path.");
  const blob = await getBlob(ref(storage, path), 25 * 1024 * 1024);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = path.split("/").at(-1) || "upload";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
