export type FuelEfficiencyRating = "A" | "B" | "C" | "D" | "E";
export type FuelEfficiencyStatus = "active" | "inactive";

export type FuelEfficiency = {
  id: number;
  rating: FuelEfficiencyRating;
  description: string | null;
  status: FuelEfficiencyStatus;
};

export type FuelEfficiencyDraft = {
  rating: FuelEfficiencyRating | "";
  description: string;
  status: FuelEfficiencyStatus;
};

