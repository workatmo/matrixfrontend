export type SpeedRatingStatus = "active" | "inactive";

export type SpeedRating = {
  id: number;
  rating: string;
  maxSpeed: number;
  description: string | null;
  status: SpeedRatingStatus;
};

export type SpeedRatingDraft = {
  rating: string;
  maxSpeed: string;
  description: string;
  status: SpeedRatingStatus;
};

