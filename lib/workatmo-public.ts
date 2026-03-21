const DEFAULT_INSTAGRAM =
  "https://www.instagram.com/workatmo_technologies_pvt_ltd/";
const DEFAULT_WHATSAPP_PHONE = "919392599067";
const DEFAULT_WHATSAPP_MESSAGE = "Hi from Matrix Backend API";

/** Instagram URL for the credit-line contact modal; `NEXT_PUBLIC_WORKATMO_INSTAGRAM_URL=""` disables. */
export function getWorkatmoInstagramUrl(): string | null {
  const v = process.env.NEXT_PUBLIC_WORKATMO_INSTAGRAM_URL;
  if (v === "") return null;
  const t = v?.trim();
  return t || DEFAULT_INSTAGRAM;
}

/** wa.me URL; `NEXT_PUBLIC_WORKATMO_WHATSAPP_PHONE=""` disables. */
export function buildWorkatmoWhatsAppUrl(): string | null {
  const v = process.env.NEXT_PUBLIC_WORKATMO_WHATSAPP_PHONE;
  const raw = v === "" ? "" : (v ?? DEFAULT_WHATSAPP_PHONE);
  const phone = raw.replace(/\D/g, "");
  if (!phone) return null;
  const msg = (
    process.env.NEXT_PUBLIC_WORKATMO_WHATSAPP_MESSAGE ?? DEFAULT_WHATSAPP_MESSAGE
  ).trim();
  const q = msg ? `?text=${encodeURIComponent(msg)}` : "";
  return `https://wa.me/${phone}${q}`;
}
