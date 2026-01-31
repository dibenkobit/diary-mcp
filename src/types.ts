export interface DiaryEntry {
  id: number;
  timestamp: string;
  content: string;
  mood: string | null;
  context: string | null;
}

export interface DiaryStats {
  totalEntries: number;
  moodDistribution: Record<string, number>;
  firstEntry: string | null;
  lastEntry: string | null;
}

export const MOODS = [
  "happy",
  "sad",
  "frustrated",
  "curious",
  "satisfied",
  "anxious",
  "excited",
  "tired",
  "confused",
  "hopeful",
  "proud",
  "neutral",
] as const;

export type Mood = (typeof MOODS)[number];
