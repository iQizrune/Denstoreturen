// Versjonert snapshot for persist
export type StatsSnapshotV1 = {
  version: 1;
  softRestarts: number;
  totalPlaySeconds: number; // effektiv spilletid
  totalAnswered: number;    // uten byquiz
  totalCorrect: number;     // uten byquiz
  totalWrong: number;       // uten byquiz
  updatedAt: number;        // ms since epoch
};
