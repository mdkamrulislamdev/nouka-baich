import { FESTIVAL } from "@/components/canvas/sceneConfig";
import type { GameMode } from "@/components/canvas/sceneConfig";

export function skillBonus(
  base: number,
  feverCombo: number,
  gameMode: GameMode,
): number {
  const heat = gameMode === "festival" ? FESTIVAL.actionMul : 1;
  return Math.round(base * feverCombo * heat);
}

export function heatGrade(
  score: number,
  survived: boolean,
): { bn: string; en: string } {
  if (!survived) {
    return { bn: "সময়ের আগে ডুবেছে", en: "Sank before the bell" };
  }
  if (score >= 14000) {
    return { bn: "তাপস মাস্টার", en: "Heat master" };
  }
  if (score >= 9000) {
    return { bn: "অগ্রভাগ", en: "Front pack" };
  }
  if (score >= 5500) {
    return { bn: "মাঝনদী", en: "Mid river" };
  }
  return { bn: "শরীর গরম", en: "Warm-up heat" };
}
