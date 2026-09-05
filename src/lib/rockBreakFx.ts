const STONE_COUNT = 18;
const DUST_COUNT = 10;
const CHIP_COUNT = STONE_COUNT + DUST_COUNT;

type Chip = {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  spinX: number;
  spinY: number;
  life: number;
  size: number;
  dust: boolean;
};

const chips: Chip[] = Array.from({ length: CHIP_COUNT }, () => ({
  active: false,
  x: 0,
  y: 0,
  z: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  rx: 0,
  ry: 0,
  rz: 0,
  spinX: 0,
  spinY: 0,
  life: 0,
  size: 1,
  dust: false,
}));

export function triggerRockBreakFx(
  x: number,
  y: number,
  z: number,
  side: -1 | 1,
): void {
  for (let index = 0; index < CHIP_COUNT; index += 1) {
    const chip = chips[index];
    const dust = index >= STONE_COUNT;
    const yaw = (index / CHIP_COUNT) * Math.PI * 2 + side * 0.22;
    const pitch = dust ? 0.35 + (index % 4) * 0.12 : 0.15 + (index % 5) * 0.18;
    const speed = dust ? 1.6 + (index % 4) * 0.35 : 3.2 + (index % 6) * 0.7;
    chip.active = true;
    chip.dust = dust;
    chip.x = x + Math.cos(yaw) * (dust ? 0.08 : 0.22);
    chip.y = y + (dust ? 0.38 : 0.18);
    chip.z = z + Math.sin(yaw) * (dust ? 0.08 : 0.22);
    chip.vx = Math.cos(yaw) * Math.cos(pitch) * speed + side * (dust ? 0.6 : 2.2);
    chip.vy = Math.sin(pitch) * speed + (dust ? 1.4 : 4.1 + (index % 4) * 0.85);
    chip.vz = Math.sin(yaw) * Math.cos(pitch) * speed * 0.75;
    chip.rx = Math.random() * Math.PI;
    chip.ry = Math.random() * Math.PI;
    chip.rz = Math.random() * Math.PI;
    chip.spinX = dust ? 4 + (index % 5) : 10 + (index % 7);
    chip.spinY = dust ? 3 + (index % 4) : 8 + (index % 5);
    chip.life = dust ? 0.42 + (index % 3) * 0.06 : 0.58 + (index % 5) * 0.08;
    chip.size = dust ? 0.22 + (index % 4) * 0.06 : 0.78 + (index % 5) * 0.22;
  }
}

export function resetRockBreakFx(): void {
  for (let index = 0; index < CHIP_COUNT; index += 1) {
    chips[index].active = false;
    chips[index].life = 0;
  }
}

export function getRockBreakChips(): readonly Chip[] {
  return chips;
}

export function tickRockBreakFx(dt: number): void {
  for (let index = 0; index < CHIP_COUNT; index += 1) {
    const chip = chips[index];
    if (!chip.active) {
      continue;
    }
    chip.life -= dt;
    if (chip.life <= 0) {
      chip.active = false;
      continue;
    }
    chip.vy -= (chip.dust ? 9 : 16) * dt;
    chip.x += chip.vx * dt;
    chip.y += chip.vy * dt;
    chip.z += chip.vz * dt;
    chip.rx += chip.spinX * dt;
    chip.ry += chip.spinY * dt;
    if (chip.dust) {
      chip.size = Math.max(0.04, chip.size - dt * 0.55);
    }
  }
}

export const ROCK_CHIP_COUNT = CHIP_COUNT;
export const ROCK_STONE_COUNT = STONE_COUNT;
