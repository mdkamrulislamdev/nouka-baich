import type { GameMode } from "@/components/canvas/sceneConfig";

export const LEADERBOARD_LIMIT = 10;
export const PLAYER_NAME_MAX = 16;
export const LOCAL_BOARD_KEY = "nouka-baich-3d:leaderboard";

export type LeaderboardEntry = {
  name: string;
  score: number;
  mode: GameMode;
  at: number;
};

const MODES: GameMode[] = ["endless", "sprint", "festival"];

export function isGameMode(value: unknown): value is GameMode {
  return value === "endless" || value === "sprint" || value === "festival";
}

export function draftPlayerName(raw: string): string {
  return raw.replace(/[^\p{L}\p{N} ._-]/gu, "").slice(0, PLAYER_NAME_MAX);
}

export function sanitizePlayerName(raw: string): string {
  const cleaned = draftPlayerName(raw).replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : "Rower";
}

export function sanitizeScore(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(99_999_999, Math.floor(value)));
}

export function modeLabel(mode: GameMode): string {
  if (mode === "festival") {
    return "Festival";
  }
  if (mode === "sprint") {
    return "Sprint";
  }
  return "Endless";
}

function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.name === "string" &&
    typeof record.score === "number" &&
    Number.isFinite(record.score) &&
    isGameMode(record.mode) &&
    typeof record.at === "number" &&
    Number.isFinite(record.at)
  );
}

export function parseLeaderboard(value: unknown): LeaderboardEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isLeaderboardEntry).map((entry) => ({
    name: sanitizePlayerName(entry.name),
    score: sanitizeScore(entry.score),
    mode: entry.mode,
    at: Math.max(0, Math.floor(entry.at)),
  }));
}

export function rankLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const sorted = [...entries].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return left.at - right.at;
  });

  const seen = new Set<string>();
  const ranked: LeaderboardEntry[] = [];
  for (const entry of sorted) {
    if (entry.score < 1) {
      continue;
    }
    const key = `${entry.name.toLowerCase()}|${entry.mode}|${entry.score}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    ranked.push(entry);
    if (ranked.length >= LEADERBOARD_LIMIT) {
      break;
    }
  }
  return ranked;
}

export function loadLocalLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_BOARD_KEY);
    if (!raw) {
      return [];
    }
    return rankLeaderboard(parseLeaderboard(JSON.parse(raw)));
  } catch {
    return [];
  }
}

export function saveLocalLeaderboard(entries: LeaderboardEntry[]): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      LOCAL_BOARD_KEY,
      JSON.stringify(rankLeaderboard(entries)),
    );
  } catch {
    // Private mode should not break the menu.
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const local = loadLocalLeaderboard();
  try {
    const response = await fetch("/api/leaderboard", { cache: "no-store" });
    if (!response.ok) {
      return rankLeaderboard(local);
    }
    const payload: unknown = await response.json();
    const remote =
      payload && typeof payload === "object" && "entries" in payload
        ? parseLeaderboard((payload as { entries: unknown }).entries)
        : [];
    const merged = rankLeaderboard([...remote, ...local]);
    saveLocalLeaderboard(merged);
    return merged;
  } catch {
    return rankLeaderboard(local);
  }
}

export async function submitLeaderboardScore(input: {
  name: string;
  score: number;
  mode: GameMode;
}): Promise<LeaderboardEntry[]> {
  const entry: LeaderboardEntry = {
    name: sanitizePlayerName(input.name),
    score: sanitizeScore(input.score),
    mode: MODES.includes(input.mode) ? input.mode : "endless",
    at: Date.now(),
  };
  const local = rankLeaderboard([entry, ...loadLocalLeaderboard()]);
  saveLocalLeaderboard(local);

  try {
    const response = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!response.ok) {
      return local;
    }
    const payload: unknown = await response.json();
    const remote =
      payload && typeof payload === "object" && "entries" in payload
        ? parseLeaderboard((payload as { entries: unknown }).entries)
        : [];
    const merged = rankLeaderboard([...remote, ...local]);
    saveLocalLeaderboard(merged);
    return merged;
  } catch {
    return local;
  }
}
