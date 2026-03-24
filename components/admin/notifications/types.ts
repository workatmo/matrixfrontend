export interface AdminNotification {
  id: number;
  title: string;
  color: string;
  link: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface NotificationDraft {
  title: string;
  color: string;
  link: string;
}

export const DEFAULT_DRAFT: NotificationDraft = {
  title: "",
  color: "#3b82f6",
  link: "",
};
