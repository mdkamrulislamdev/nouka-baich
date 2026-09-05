const CHIP_COUNT = 14;

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
}));

export function triggerLogBreakFx(
  x: number,
  y: number,
  z: number,
  side: -1 | 1,
): void {
  for (let index = 0; index < CHIP_COUNT; index += 1) {
    const chip = chips[index];
    const yaw = (index / CHIP_COUNT) * Math.PI * 2 + side * 0.4;
    chip.active = true;
    chip.x = x;
    chip.y = y + 0.12;
    chip.z = z;
    chip.vx = Math.cos(yaw) * (2.4 + (index % 3) * 0.8) + side * 1.1;
    chip.vy = 2.8 + (index % 4) * 0.55;
    chip.vz = Math.sin(yaw) * (1.6 + (index % 2) * 0.7);
    chip.rx = Math.random() * Math.PI;
    chip.ry = Math.random() * Math.PI;
    chip.rz = Math.random() * Math.PI;
    chip.spinX = 6 + (index % 5);
    chip.spinY = 4 + (index % 3);
    chip.life = 0.7 + (index % 4) * 0.08;
  }
}

export function resetLogBreakFx(): void {
  for (let index = 0; index < CHIP_COUNT; index += 1) {
    chips[index].active = false;
    chips[index].life = 0;
  }
}

export function getLogBreakChips(): readonly Chip[] {
  return chips;
}

export function tickLogBreakFx(dt: number): void {
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
    chip.vy -= 9.4 * dt;
    chip.x += chip.vx * dt;
    chip.y += chip.vy * dt;
    chip.z += chip.vz * dt;
    chip.rx += chip.spinX * dt;
    chip.ry += chip.spinY * dt;
  }
}
