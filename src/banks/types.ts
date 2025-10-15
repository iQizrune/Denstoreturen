export type Difficulty = "enkel" | "medium" | "vanskelig" | "umulig";

export type QOption = {
  id: string;
  label: string;
};

export type Q = {
  id: string;
  text: string;
  image?: string;
  kind?: "text" | "flag" | "reveal" | "trick" | "bonus";
  options: QOption[];
  correctId: string;
  meta?: { difficulty?: Difficulty };
};
