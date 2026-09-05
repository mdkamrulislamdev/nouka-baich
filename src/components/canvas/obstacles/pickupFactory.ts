import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
} from "three";

export type PickupKind = "breaker" | "bonus";

const sphere = new SphereGeometry(0.38, 14, 12);
const ring = new TorusGeometry(0.52, 0.055, 8, 20);
const beacon = new CylinderGeometry(0.045, 0.07, 1.65, 8);
const haft = new CylinderGeometry(0.04, 0.048, 0.82, 6);
const blade = new BoxGeometry(0.14, 0.34, 0.05);

function makeBreaker(): Group {
  const group = new Group();
  const glow = new Mesh(
    sphere,
    new MeshBasicMaterial({
      color: "#ff8a2a",
      transparent: true,
      opacity: 0.42,
    }),
  );
  glow.scale.set(1.15, 1.35, 1.15);
  const halo = new Mesh(
    ring,
    new MeshStandardMaterial({
      color: "#ffd36a",
      emissive: new Color("#ffb347"),
      emissiveIntensity: 1.35,
      roughness: 0.32,
      metalness: 0.18,
    }),
  );
  halo.rotation.x = Math.PI / 2;
  const shaft = new Mesh(
    beacon,
    new MeshBasicMaterial({
      color: "#ffb15a",
      transparent: true,
      opacity: 0.38,
    }),
  );
  shaft.position.y = 0.55;
  const handle = new Mesh(
    haft,
    new MeshStandardMaterial({
      color: "#5c3a1e",
      roughness: 0.78,
      metalness: 0.05,
    }),
  );
  handle.rotation.z = 0.45;
  handle.position.y = 0.08;
  const head = new Mesh(
    blade,
    new MeshStandardMaterial({
      color: "#f0e0c0",
      roughness: 0.3,
      metalness: 0.5,
      emissive: new Color("#ffe08a"),
      emissiveIntensity: 0.55,
    }),
  );
  head.position.set(0.2, 0.34, 0);
  head.rotation.z = 0.45;
  group.add(glow, halo, shaft, handle, head);
  group.userData.kind = "breaker";
  return group;
}

function makeBonus(): Group {
  const group = new Group();
  const core = new Mesh(
    sphere,
    new MeshStandardMaterial({
      color: "#ffd24a",
      emissive: new Color("#ffe566"),
      emissiveIntensity: 1.85,
      roughness: 0.18,
      metalness: 0.35,
    }),
  );
  const inner = new Mesh(
    sphere,
    new MeshBasicMaterial({
      color: "#fff3a8",
      transparent: true,
      opacity: 0.55,
    }),
  );
  inner.scale.setScalar(0.62);
  const halo = new Mesh(
    ring,
    new MeshStandardMaterial({
      color: "#ffe08a",
      emissive: new Color("#ffcc33"),
      emissiveIntensity: 1.2,
      roughness: 0.28,
      metalness: 0.2,
    }),
  );
  halo.rotation.x = Math.PI / 2;
  const coin = new Mesh(
    ring,
    new MeshBasicMaterial({
      color: "#ffef8a",
    }),
  );
  coin.scale.setScalar(0.72);
  const shaft = new Mesh(
    beacon,
    new MeshBasicMaterial({
      color: "#ffe566",
      transparent: true,
      opacity: 0.5,
    }),
  );
  shaft.position.y = 0.62;
  group.add(core, inner, halo, coin, shaft);
  group.userData.kind = "bonus";
  return group;
}

export function createPickup(kind: PickupKind): Group {
  const group = kind === "breaker" ? makeBreaker() : makeBonus();
  group.visible = false;
  group.position.y = -8;
  return group;
}
