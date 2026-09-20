// QR generation helper. Wraps the `qrcode` package (npm, MIT) so the rest of
// the app only deals with a data URL. Runs fully client-side (static export).
import QRCode from "qrcode";

export async function qrDataUrl(text: string, size = 256): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#100B4A", light: "#FAF8F0" },
  });
}