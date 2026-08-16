import type { GraphicsQuality } from "@/store/useGameStore";

export const STORAGE_KEY = "nouka-baich-3d:v1";

export type PersistedSettings = {
  highScore: number;
  musicMuted: boolean;
  sfxMuted: boolean;
  graphicsQuality: GraphicsQuality;
};

function isGraphicsQuality(value: unknown): value is GraphicsQuality {
  return value === "high" || value === "low";
}

function isPersistedSettings(value: unknown): value is PersistedSettings {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.highScore === "number" &&
    Number.isFinite(record.highScore) &&
    typeof record.musicMuted === "boolean" &&
    typeof record.sfxMuted === "boolean" &&
    isGraphicsQuality(record.graphicsQuality)
  );
}

export function loadPersistedSettings(): PersistedSettings | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedSettings(parsed)) {
      return null;
    }

    return {
      highScore: Math.max(0, Math.floor(parsed.highScore)),
      musicMuted: parsed.musicMuted,
      sfxMuted: parsed.sfxMuted,
      graphicsQuality: parsed.graphicsQuality,
    };
  } catch {
    return null;
  }
}

export function savePersistedSettings(settings: PersistedSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Private mode and quota errors should not break gameplay.
  }
}

export function persistedKey(settings: PersistedSettings): string {
  return `${settings.highScore}|${settings.musicMuted}|${settings.sfxMuted}|${settings.graphicsQuality}`;
}
