declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_APP_URL?: string;
    LARAVEL_PROXY_TARGET?: string;
    /** Credit-line contact modal — Instagram profile URL; empty string disables */
    NEXT_PUBLIC_WORKATMO_INSTAGRAM_URL?: string;
    /** Digits only, country code (e.g. 919392599067); empty string disables WhatsApp */
    NEXT_PUBLIC_WORKATMO_WHATSAPP_PHONE?: string;
    /** Prefilled wa.me message */
    NEXT_PUBLIC_WORKATMO_WHATSAPP_MESSAGE?: string;
  }
}
