import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
} from "three";

import { PICKUP_LABELS } from "@/lib/pickupLabels";

export type PickupKind = "breaker" | "crusher" | "bonus" | "haste" | "drag" | "ram";

export const PICKUP_KINDS: readonly PickupKind[] = [
  "breaker",
  "crusher",
  "bonus",
  "haste",
  "drag",
  "ram",
];

export type PickupBeacon = {
  shell: Mesh;
  core: Mesh;
  foam: Mesh;
  shellMat: MeshBasicMaterial;
  coreMat: MeshBasicMaterial;
  foamMat: MeshBasicMaterial;
};

const haft = new CylinderGeometry(0.032, 0.042, 0.52, 6);
const axePoll = new BoxGeometry(0.08, 0.09, 0.06);
const axeBlade = new ConeGeometry(0.14, 0.22, 3);
const octa = new OctahedronGeometry(0.22, 0);
const chevron = new ConeGeometry(0.16, 0.28, 3);
const ring = new TorusGeometry(0.32, 0.045, 6, 18);
const spike = new ConeGeometry(0.12, 0.28, 4);
const glowBall = new SphereGeometry(0.38, 12, 10);
const beaconShell = new CylinderGeometry(0.1, 0.34, 1, 20, 1, true);
const beaconCore = new CylinderGeometry(0.038, 0.07, 1, 12, 1, true);
const waterRing = new TorusGeometry(0.46, 0.04, 8, 28);

function makeTextSprite(text: string, fill: string, widthScale = 1): Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 176;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new Sprite();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font =
    '800 72px "Noto Sans Bengali", "Nirmala UI", "Segoe UI", sans-serif';
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = 16;
  ctx.strokeStyle = "rgba(8, 6, 4, 0.95)";
  ctx.strokeText(text, 320, 92);
  ctx.fillStyle = fill;
  ctx.fillText(text, 320, 92);

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
  sprite.scale.set(2.35 * widthScale, 0.68, 1);
  sprite.position.set(1.15 + (widthScale - 1) * 0.35, 0.42, 0);
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
    side: DoubleSide,
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

function addBeacon(root: Group, color: string): void {
  const shellMat = glowMat(color, 0.26);
  const coreMat = glowMat(color, 0.62);
  const foamMat = glowMat(color, 0.78);
  const shell = new Mesh(beaconShell, shellMat);
  const core = new Mesh(beaconCore, coreMat);
  const foam = new Mesh(waterRing, foamMat);
  foam.rotation.x = Math.PI / 2;
  const beacon = new Group();
  beacon.add(shell, core, foam);
  root.add(beacon);
  const data: PickupBeacon = {
    shell,
    core,
    foam,
    shellMat,
    coreMat,
    foamMat,
  };
  root.userData.beaconData = data;
}

function makeRoot(color: string, kind: PickupKind): { root: Group; icon: Group } {
  const root = new Group();
  addBeacon(root, color);
  const icon = new Group();
  addGlow(icon, color);
  root.add(icon);
  root.userData.icon = icon;
  root.userData.kind = kind;
  return { root, icon };
}

function makeCrusher(): Group {
  const { root, icon } = makeRoot("#9ec0ff", "crusher");
  const hammer = new Group();
  const handle = new Mesh(haft, solidMat("#4a3424"));
  handle.rotation.z = -0.35;
  const head = new Mesh(axePoll, solidMat("#c5d0dc"));
  head.scale.set(2.4, 1.6, 1.8);
  head.position.set(-0.08, 0.22, 0);
  head.rotation.z = -0.35;
  hammer.add(handle, head);
  hammer.scale.setScalar(1.25);
  icon.add(hammer, makeTextSprite(PICKUP_LABELS.crusher, "#c5d0dc", 1.15));
  return root;
}

function makeBreaker(): Group {
  const { root, icon } = makeRoot("#ff8a2a", "breaker");
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
  icon.add(axe, makeTextSprite(PICKUP_LABELS.breaker, "#ffb347", 1.05));
  return root;
}

function makeBonus(): Group {
  const { root, icon } = makeRoot("#ffe566", "bonus");
  const gem = new Mesh(octa, solidMat("#ffe566"));
  gem.scale.set(0.85, 1.15, 0.85);
  icon.add(gem, makeTextSprite(PICKUP_LABELS.bonus, "#ffe566"));
  return root;
}

function makeHaste(): Group {
  const { root, icon } = makeRoot("#3dffc0", "haste");
  const a = new Mesh(chevron, solidMat("#3dffc0"));
  a.rotation.x = Math.PI;
  a.position.y = 0.14;
  const b = new Mesh(chevron, solidMat("#7affd8"));
  b.rotation.x = Math.PI;
  b.position.y = -0.08;
  b.scale.setScalar(0.78);
  icon.add(a, b, makeTextSprite(PICKUP_LABELS.haste, "#7affd8"));
  return root;
}

function makeDrag(): Group {
  const { root, icon } = makeRoot("#b47aff", "drag");
  const a = new Mesh(chevron, solidMat("#b47aff"));
  a.position.y = 0.12;
  const b = new Mesh(chevron, solidMat("#d4a6ff"));
  b.position.y = -0.1;
  b.scale.setScalar(0.78);
  icon.add(a, b, makeTextSprite(PICKUP_LABELS.drag, "#d4a6ff"));
  return root;
}

function makeRam(): Group {
  const { root, icon } = makeRoot("#ff3d6e", "ram");
  const core = new Mesh(octa, solidMat("#ff3d6e"));
  core.scale.setScalar(0.95);
  const hornL = new Mesh(spike, solidMat("#ff7a9a"));
  hornL.position.set(-0.16, 0.16, 0);
  hornL.rotation.z = 0.7;
  const hornR = new Mesh(spike, solidMat("#ff7a9a"));
  hornR.position.set(0.16, 0.16, 0);
  hornR.rotation.z = -0.7;
  icon.add(core, hornL, hornR, makeTextSprite(PICKUP_LABELS.ram, "#ff7a9a", 1.35));
  return root;
}

export function createPickup(kind: PickupKind): Group {
  let group: Group;
  switch (kind) {
    case "breaker":
      group = makeBreaker();
      break;
    case "crusher":
      group = makeCrusher();
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

export function getPickupIcon(object: Group): Group {
  const icon = object.userData.icon;
  return icon instanceof Group ? icon : object;
}

export function getPickupBeacon(object: Group): PickupBeacon | null {
  const data = object.userData.beaconData as PickupBeacon | undefined;
  return data ?? null;
}

export function syncPickupBeacon(
  object: Group,
  worldY: number,
  near: number,
  beat: number,
): void {
  const beacon = getPickupBeacon(object);
  if (!beacon) {
    return;
  }
  const height = Math.max(0.7, worldY + 0.1);
  const flare = 1 + near * 0.45 + beat * 0.12;
  beacon.shell.scale.set(flare, height, flare);
  beacon.core.scale.set(flare * 0.85, height, flare * 0.85);
  const localY = 0.06 + height * 0.5 - worldY;
  beacon.shell.position.y = localY;
  beacon.core.position.y = localY;
  beacon.foam.position.y = 0.05 - worldY;
  const ring = 1.05 + near * 0.55 + beat * 0.22;
  beacon.foam.scale.set(ring, ring, 1);
  beacon.shellMat.opacity = 0.16 + near * 0.42 + beat * 0.08;
  beacon.coreMat.opacity = 0.38 + near * 0.4 + beat * 0.1;
  beacon.foamMat.opacity = 0.35 + near * 0.5 + beat * 0.12;
}

export function pickupSpinRate(kind: PickupKind): number {
  switch (kind) {
    case "haste":
      return 3.4;
    case "ram":
      return 3.1;
    case "breaker":
      return 2.4;
    case "crusher":
      return 2.6;
    case "bonus":
      return 2.2;
    default:
      return 1.6;
  }
}

export const PICKUP_BEACON_RANGE = 16;
