import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
} from "three";

export type PickupKind = "breaker" | "bonus" | "haste" | "drag" | "ram";

export const PICKUP_KINDS: readonly PickupKind[] = [
  "breaker",
  "bonus",
  "haste",
  "drag",
  "ram",
];

const haft = new CylinderGeometry(0.032, 0.042, 0.52, 6);
const axePoll = new BoxGeometry(0.08, 0.09, 0.06);
const axeBlade = new ConeGeometry(0.14, 0.22, 3);
const octa = new OctahedronGeometry(0.22, 0);
const chevron = new ConeGeometry(0.16, 0.28, 3);
const ring = new TorusGeometry(0.32, 0.045, 6, 18);
const spike = new ConeGeometry(0.12, 0.28, 4);
const glowBall = new SphereGeometry(0.38, 12, 10);

function makeTextSprite(text: string, fill: string): Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new Sprite();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '800 84px "Noto Sans Bengali", "Nirmala UI", "Segoe UI", sans-serif';
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = 18;
  ctx.strokeStyle = "rgba(8, 6, 4, 0.95)";
  ctx.strokeText(text, 256, 84);
  ctx.fillStyle = fill;
  ctx.fillText(text, 256, 84);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  const sprite = new Sprite(
    new SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      fog: false,
    }),
  );
  sprite.scale.set(3.1, 0.96, 1);
  sprite.position.y = 1.05;
  sprite.renderOrder = 8;
  return sprite;
}

function glowMat(color: string, opacity: number): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    fog: false,
    blending: AdditiveBlending,
  });
}

function solidMat(color: string): MeshBasicMaterial {
  return new MeshBasicMaterial({ color, fog: false });
}

function addGlow(group: Group, color: string): void {
  const core = new Mesh(glowBall, glowMat(color, 0.55));
  const halo = new Mesh(ring, glowMat(color, 0.9));
  halo.rotation.x = Math.PI / 2;
  group.add(core, halo);
}

function makeBreaker(): Group {
  const group = new Group();
  addGlow(group, "#ff8a2a");
  const axe = new Group();
  const handle = new Mesh(haft, solidMat("#6b3a14"));
  handle.rotation.z = 0.22;
  const poll = new Mesh(axePoll, solidMat("#ffd36a"));
  poll.position.set(0.06, 0.2, 0);
  poll.rotation.z = 0.22;
  const blade = new Mesh(axeBlade, solidMat("#ff7a1a"));
  blade.position.set(0.18, 0.26, 0);
  blade.rotation.z = Math.PI * 0.5 + 0.22;
  axe.add(handle, poll, blade);
  axe.scale.setScalar(1.35);
  group.add(axe, makeTextSprite("AXE", "#ffb347"));
  group.userData.kind = "breaker";
  return group;
}

function makeBonus(): Group {
  const group = new Group();
  addGlow(group, "#ffe566");
  const gem = new Mesh(octa, solidMat("#ffe566"));
  gem.scale.set(0.85, 1.15, 0.85);
  group.add(gem, makeTextSprite("100 PTS", "#ffe566"));
  group.userData.kind = "bonus";
  return group;
}

function makeHaste(): Group {
  const group = new Group();
  addGlow(group, "#3dffc0");
  const a = new Mesh(chevron, solidMat("#3dffc0"));
  a.rotation.x = Math.PI;
  a.position.y = 0.14;
  const b = new Mesh(chevron, solidMat("#7affd8"));
  b.rotation.x = Math.PI;
  b.position.y = -0.08;
  b.scale.setScalar(0.78);
  group.add(a, b, makeTextSprite("SPEED+", "#7affd8"));
  group.userData.kind = "haste";
  return group;
}

function makeDrag(): Group {
  const group = new Group();
  addGlow(group, "#b47aff");
  const a = new Mesh(chevron, solidMat("#b47aff"));
  a.position.y = 0.12;
  const b = new Mesh(chevron, solidMat("#d4a6ff"));
  b.position.y = -0.1;
  b.scale.setScalar(0.78);
  group.add(a, b, makeTextSprite("SLOW", "#d4a6ff"));
  group.userData.kind = "drag";
  return group;
}

function makeRam(): Group {
  const group = new Group();
  addGlow(group, "#ff3d6e");
  const core = new Mesh(octa, solidMat("#ff3d6e"));
  core.scale.setScalar(0.95);
  const hornL = new Mesh(spike, solidMat("#ff7a9a"));
  hornL.position.set(-0.16, 0.16, 0);
  hornL.rotation.z = 0.7;
  const hornR = new Mesh(spike, solidMat("#ff7a9a"));
  hornR.position.set(0.16, 0.16, 0);
  hornR.rotation.z = -0.7;
  group.add(core, hornL, hornR, makeTextSprite("RAM", "#ff7a9a"));
  group.userData.kind = "ram";
  return group;
}

export function createPickup(kind: PickupKind): Group {
  let group: Group;
  switch (kind) {
    case "breaker":
      group = makeBreaker();
      break;
    case "haste":
      group = makeHaste();
      break;
    case "drag":
      group = makeDrag();
      break;
    case "ram":
      group = makeRam();
      break;
    default:
      group = makeBonus();
      break;
  }
  group.visible = false;
  group.position.y = -8;
  return group;
}

export function pickupSpinRate(kind: PickupKind): number {
  switch (kind) {
    case "haste":
      return 3.4;
    case "ram":
      return 3.1;
    case "breaker":
      return 2.4;
    case "bonus":
      return 2.2;
    default:
      return 1.6;
  }
}
