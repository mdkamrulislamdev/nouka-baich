import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";

import {
  isGameMode,
  parseLeaderboard,
  rankLeaderboard,
  sanitizePlayerName,
  sanitizeScore,
  type LeaderboardEntry,
} from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

const FILE_PATH = path.join(process.cwd(), "data", "leaderboard.json");
const TMP_PATH = path.join(os.tmpdir(), "nouka-baich-leaderboard.json");

let memoryBoard: LeaderboardEntry[] = [];

async function readBoardFile(filePath: string): Promise<LeaderboardEntry[]> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return parseLeaderboard(JSON.parse(raw));
  } catch {
    return [];
  }
}

async function writeBoardFile(
  filePath: string,
  entries: LeaderboardEntry[],
): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function loadBoard(): Promise<LeaderboardEntry[]> {
  const [fileBoard, tmpBoard] = await Promise.all([
    readBoardFile(FILE_PATH),
    readBoardFile(TMP_PATH),
  ]);
  const merged = rankLeaderboard([...fileBoard, ...tmpBoard, ...memoryBoard]);
  memoryBoard = merged;
  return merged;
}

async function persistBoard(entries: LeaderboardEntry[]): Promise<LeaderboardEntry[]> {
  const ranked = rankLeaderboard(entries);
  memoryBoard = ranked;
  await writeBoardFile(TMP_PATH, ranked);
  return ranked;
}

export async function GET() {
  const entries = await loadBoard();
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const score = sanitizeScore(record.score);
  if (score < 1) {
    const entries = await loadBoard();
    return NextResponse.json({ entries });
  }

  const entry: LeaderboardEntry = {
    name: sanitizePlayerName(typeof record.name === "string" ? record.name : "Rower"),
    score,
    mode: isGameMode(record.mode) ? record.mode : "endless",
    at:
      typeof record.at === "number" && Number.isFinite(record.at)
        ? Math.max(0, Math.floor(record.at))
        : Date.now(),
  };

  const current = await loadBoard();
  const entries = await persistBoard([entry, ...current]);
  return NextResponse.json({ entries });
}
