export type TyreTypeStatus = "active" | "inactive";

export type TyreType = {
  id: number;
  name: string;
  description: string | null;
  status: TyreTypeStatus;
};

export type TyreTypeDraft = {
  name: string;
  description: string;
  status: TyreTypeStatus;
};

