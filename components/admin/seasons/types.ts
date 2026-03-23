export type SeasonStatus = "active" | "inactive";

export type Season = {
  id: number;
  name: string;
  description: string | null;
  status: SeasonStatus;
};

export type SeasonDraft = {
  name: string;
  description: string;
  status: SeasonStatus;
};

