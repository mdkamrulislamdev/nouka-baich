import {
  BoxGeometry,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
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

const haft = new CylinderGeometry(0.028, 0.036, 0.42, 6);
const axePoll = new BoxGeometry(0.06, 0.07, 0.05);
const axeBlade = new ConeGeometry(0.11, 0.18, 3);
const octa = new OctahedronGeometry(0.16, 0);
const chevron = new ConeGeometry(0.12, 0.2, 3);
const ring = new TorusGeometry(0.2, 0.028, 6, 16);
const spike = new ConeGeometry(0.1, 0.22, 4);

function makeTextSprite(text: string, fill: string): Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new Sprite();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '800 72px "Noto Sans Bengali", "Nirmala UI", "Segoe UI", sans-serif';
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = 14;
  ctx.strokeStyle = "rgba(8, 6, 4, 0.92)";
  ctx.strokeText(text, 192, 68);
  ctx.fillStyle = fill;
  ctx.fillText(text, 192, 68);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  const sprite = new Sprite(
    new SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    }),
  );
  sprite.scale.set(1.05, 0.35, 1);
  sprite.position.y = 0.48;
  sprite.renderOrder = 6;
  return sprite;
}

function glowMat(color: string, opacity = 0.42): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

function solidMat(color: string): MeshBasicMaterial {
  return new MeshBasicMaterial({ color });
}

function addHalo(group: Group, color: string): void {
  const halo = new Mesh(ring, glowMat(color, 0.7));
  halo.rotation.x = Math.PI / 2;
  group.add(halo);
}

function makeBreaker(): Group {
  const group = new Group();
  const axe = new Group();
  const handle = new Mesh(haft, solidMat("#6b3a14"));
  handle.position.y = 0.02;
  handle.rotation.z = 0.22;
  const poll = new Mesh(axePoll, solidMat("#ffd36a"));
  poll.position.set(0.05, 0.18, 0);
  poll.rotation.z = 0.22;
  const blade = new Mesh(axeBlade, solidMat("#ff7a1a"));
  blade.position.set(0.14, 0.22, 0);
  blade.rotation.z = Math.PI * 0.5 + 0.22;
  axe.add(handle, poll, blade);
  axe.position.y = 0.02;
  addHalo(group, "#ff8a2a");
  const label = makeTextSprite("AXE", "#ffb347");
  group.add(axe, label);
  group.userData.kind = "breaker";
  return group;
}

function makeBonus(): Group {
  const group = new Group();
  const gem = new Mesh(octa, solidMat("#ffe566"));
  gem.scale.set(0.72, 1, 0.72);
  addHalo(group, "#ffe566");
  const label = makeTextSprite("100 PTS", "#ffe566");
  group.add(gem, label);
  group.userData.kind = "bonus";
  return group;
}

function makeHaste(): Group {
  const group = new Group();
  const a = new Mesh(chevron, solidMat("#3dffc0"));
  a.rotation.x = Math.PI;
  a.position.y = 0.1;
  const b = new Mesh(chevron, solidMat("#7affd8"));
  b.rotation.x = Math.PI;
  b.position.y = -0.06;
  b.scale.setScalar(0.78);
  addHalo(group, "#3dffc0");
  const label = makeTextSprite("SPEED+", "#7affd8");
  group.add(a, b, label);
  group.userData.kind = "haste";
  return group;
}

function makeDrag(): Group {
  const group = new Group();
  const a = new Mesh(chevron, solidMat("#b47aff"));
  a.position.y = 0.08;
  const b = new Mesh(chevron, solidMat("#d4a6ff"));
  b.position.y = -0.08;
  b.scale.setScalar(0.78);
  addHalo(group, "#b47aff");
  const label = makeTextSprite("SLOW", "#d4a6ff");
  group.add(a, b, label);
  group.userData.kind = "drag";
  return group;
}

function makeRam(): Group {
  const group = new Group();
  const core = new Mesh(octa, solidMat("#ff3d6e"));
  core.scale.setScalar(0.7);
  const hornL = new Mesh(spike, solidMat("#ff7a9a"));
  hornL.position.set(-0.12, 0.12, 0);
  hornL.rotation.z = 0.7;
  const hornR = new Mesh(spike, solidMat("#ff7a9a"));
  hornR.position.set(0.12, 0.12, 0);
  hornR.rotation.z = -0.7;
  addHalo(group, "#ff3d6e");
  const label = makeTextSprite("RAM", "#ff7a9a");
  group.add(core, hornL, hornR, label);
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
      return 3.2;
    case "ram":
      return 2.4;
    case "breaker":
      return 1.6;
    case "bonus":
      return 2.1;
    default:
      return 0.9;
  }
}
