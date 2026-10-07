import { uploadCustomDesign } from './upload-service';

// Staff supplies the finished file. This validates proportions without cropping,
// stretching, replacing the customer's original, or claiming printer calibration.
export async function uploadPreparedArtwork(uid: string, file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Use a JPEG, PNG or WebP prepared artwork image.');
  }
  if (file.size <= 0 || file.size > 25 * 1024 * 1024) {
    throw new Error('Prepared artwork must be within 25 MB.');
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const ratio = image.naturalWidth / image.naturalHeight;
    if (!Number.isFinite(ratio) || Math.abs(ratio / (85.60 / 53.98) - 1) > 0.005) {
      throw new Error('Prepare a landscape canvas matching 85.60 × 53.98 mm. This file has different proportions.');
    }
  } finally {
    URL.revokeObjectURL(url);
  }
  return uploadCustomDesign(uid, file);
}
