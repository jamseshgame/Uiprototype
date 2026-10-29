// Jamsesh guitar HUD — reconstruction of the in-song guitar view from jamseshquest
// (GuitarSystem.prefab, GuitarLaneManager, StreakView, PowerBarView, InstrumentScoreHud,
// LaneQuad.shader, GemLibrary) plus three mock-up directions.
// Variants: 'before' | 'polish' | 'chunky' | 'tiles'

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import GASOEK from './gasoek-typeface.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const C = (hex) => new THREE.Color(hex);

// ---------------------------------------------------------------- palette
const BRAND = {
  ink: '#100C1F', surf: '#1B1638', surf2: '#261F49', acid: '#E8FF3A', magenta: '#FF2E92',
  teal: '#00E5C7', lav: '#B0A6DF', gold: '#FFD24A', white: '#F8F8FC',
};
// Current default gem theme = MainSignaturePalette (index 0) — G R Y B O
const PALETTE_BEFORE = ['#3DFF7A', '#FF3D8A', '#FFE63D', '#3DC8FF', '#9C3DFF'];
// Mock-ups keep the original note colours (MainSignaturePalette)
const PALETTE_AFTER = PALETTE_BEFORE;
const UNITY_YELLOW = '#FFD90D'; // TMP fontColor (1, .85, .05)
const STREAK_FILL = '#FFD933';  // StreakView idleFillColor (1, .85, .2)
const POWER_FILL = '#4DB3FF';   // PowerBarView idleFillColor (.3, .7, 1)

// ---------------------------------------------------------------- rig geometry (metres)
// NOTE: Unity is left-handed; three.js is right-handed. Unity (x,y,z) is mapped to (-x,y,z) here so the
// layout appears the same way round as in the headset (neck to the player's left).
const HEAD = V(0, 1.62, 0);
const P0 = V(-0.10, 0.98, 0.26);                 // guitar pivot at the hip (Guitar.cs hip anchor)
const NECK = V(0.62, 0.12, 0.30).normalize();   // pivot -> left hand
const UPW = V(0, 1, 0);
const v0 = UPW.clone().projectOnPlane(NECK).normalize();
const face0 = new THREE.Vector3().crossVectors(NECK, v0).normalize();
if (face0.z < 0) face0.negate();
const TILT = THREE.MathUtils.degToRad(20);       // Guitar child rotation x = -20deg
const FACE = face0.clone().multiplyScalar(Math.cos(TILT)).addScaledVector(v0, Math.sin(TILT)).normalize();
const GUP = v0.clone().multiplyScalar(Math.cos(TILT)).addScaledVector(face0, -Math.sin(TILT)).normalize();
const FRET_RIGHT = NECK.clone().negate();        // guitar local +X

// Frets (Guitar.prefab): Frets at x=-0.604, children G..O at +0.16..-0.16, StarLane +0.24, PowerLane -0.24
const FRET_D = [0.444, 0.524, 0.604, 0.684, 0.764];
const STAR_D = 0.364, POWER_D = 0.844;
const onNeck = (d) => P0.clone().addScaledVector(NECK, d).addScaledVector(FACE, 0.035);
const HIT = FRET_D.map(onNeck);
// GuitarSystem.prefab SpawnPoints: (x, 2, 6)
const SPAWN = [0.2, 0.1, 0, -0.1, -0.2].map((x) => V(-x, 2, 6));
const STAR_START = V(-0.3, 2, 6), STAR_END = onNeck(STAR_D);
const POWER_START = V(0.3, 2, 6), POWER_END = onNeck(POWER_D);

const LANE_W = 0.07;          // laneQuadWidth
const CROSS_T = 0.10;         // crossLinePercent 0.9 => 10% of the lane before the neck
const GEM_LIFT = 0.05;        // hitPointLocalY / spawnPointLocalY
const GHOST_RAISE = 0.04;     // ghostGemDepressDistance

function laneFrame(S, H, fretRight = FRET_RIGHT) {
  const along = S.clone().sub(H);                // hit -> spawn
  const len = along.length();
  const d = along.clone().divideScalar(len);
  const right = fretRight.clone().projectOnPlane(d).normalize();
  const normal = new THREE.Vector3().crossVectors(d, right).normalize();
  if (normal.y < 0) normal.negate();
  return {
    S, H, len, d, right, normal,
    at(t, u = 0, h = 0) {
      return H.clone().addScaledVector(along, t).addScaledVector(right, u).addScaledVector(normal, h);
    },
  };
}
const LANES = HIT.map((H, i) => laneFrame(SPAWN[i], H));
// screen order left -> right is O B Y R G (neck runs to the player's left)
const SCREEN = [4, 3, 2, 1, 0];

// ---------------------------------------------------------------- helpers
function orient(obj, center, xAxis, yAxis) {
  const x = xAxis.clone().normalize();
  const z = new THREE.Vector3().crossVectors(x, yAxis).normalize();
  const y = new THREE.Vector3().crossVectors(z, x).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  obj.quaternion.setFromRotationMatrix(m);
  obj.position.copy(center);
  return obj;
}
function facing(obj, center, target, tiltBackDeg = 0) {
  // y = world up projected, z = toward target
  const z = target.clone().sub(center).normalize();
  const x = new THREE.Vector3().crossVectors(UPW, z).normalize();
  let y = new THREE.Vector3().crossVectors(z, x).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  obj.quaternion.setFromRotationMatrix(m);
  if (tiltBackDeg) obj.rotateX(-THREE.MathUtils.degToRad(tiltBackDeg));
  obj.position.copy(center);
  return obj;
}
function canvasTex(wPx, hPx, draw) {
  const c = document.createElement('canvas');
  c.width = wPx; c.height = hPx;
  const ctx = c.getContext('2d');
  draw(ctx, wPx, hPx);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function textPlane(wM, hM, ppm, draw, opts = {}) {
  const tex = canvasTex(Math.round(wM * ppm), Math.round(hM * ppm), draw);
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
    ...opts,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wM, hM), mat);
  mesh.renderOrder = opts.renderOrder ?? 5;
  return mesh;
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function starPath(ctx, cx, cy, R, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? R : r;
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  ctx.closePath();
}
function shade(hex, k) { return C(hex).multiplyScalar(k); }
function mixHex(a, b, t) { return C(a).lerp(C(b), t); }

// quad strip on a lane frame, from t0..t1 and u0..u1, lifted h, subdivided along t
function laneStrip(fr, t0, t1, u0, u1, h, segs = 24) {
  const pos = [], uv = [], idx = [];
  for (let s = 0; s <= segs; s++) {
    const t = t0 + (t1 - t0) * (s / segs);
    const a = fr.at(t, u0, h), b = fr.at(t, u1, h);
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    uv.push(0, s / segs, 1, s / segs);
    if (s < segs) {
      const k = s * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// bilinear patch spanning all five lanes (used for the track slab in the 3D options)
function trackPatch(margin, h, tSegs = 40, uSegs = 1) {
  // left edge = O lane left side; right edge = G lane right side
  const L = LANES[4], R = LANES[0];
  const corner = (t, side) => side < 0 ? L.at(t, -LANE_W / 2 - margin, h) : R.at(t, LANE_W / 2 + margin, h);
  return {
    at(t, s, dh = 0) { // s 0..1 left->right
      const a = corner(t, -1), b = corner(t, 1);
      const p = a.lerp(b, s);
      const n = L.normal.clone().lerp(R.normal, s).normalize();
      return p.addScaledVector(n, dh);
    },
    normalAt(s) { return L.normal.clone().lerp(R.normal, s).normalize(); },
    geometry(t0, t1, s0 = 0, s1 = 1, dh = 0) {
      const pos = [], uv = [], idx = [];
      for (let i = 0; i <= tSegs; i++) {
        const t = t0 + (t1 - t0) * (i / tSegs);
        for (let j = 0; j <= uSegs; j++) {
          const s = s0 + (s1 - s0) * (j / uSegs);
          const p = this.at(t, s, dh);
          pos.push(p.x, p.y, p.z);
          uv.push(j / uSegs, i / tSegs);
        }
      }
      const row = uSegs + 1;
      for (let i = 0; i < tSegs; i++) for (let j = 0; j < uSegs; j++) {
        const a = i * row + j, b = a + 1, c = a + row, d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    },
  };
}

// ribbon between two edge polylines (for track side lips)
function ribbon(ptsA, ptsB) {
  const pos = [], idx = [];
  for (let i = 0; i < ptsA.length; i++) {
    pos.push(ptsA[i].x, ptsA[i].y, ptsA[i].z, ptsB[i].x, ptsB[i].y, ptsB[i].z);
    if (i < ptsA.length - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------- shared world
function buildEnvironment(scene) {
  const bg = canvasTex(16, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#05040c');
    g.addColorStop(0.45, '#120c26');
    g.addColorStop(0.62, '#2a1846');
    g.addColorStop(1, '#0b0816');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  scene.background = bg;
  scene.fog = new THREE.Fog('#160f2c', 9, 38);

  // stage floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: '#09070f', roughness: 0.7, metalness: 0.1, envMapIntensity: 0.05 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  // stage edge strip + floor markings
  const grid = new THREE.GridHelper(40, 40, '#3a2a6a', '#221a40');
  grid.position.y = 0.002; grid.material.transparent = true; grid.material.opacity = 0.35;
  scene.add(grid);

  // light beams (additive cones) in the distance
  const beamTex = canvasTex(64, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0.0)');
    g.addColorStop(0.15, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const g2 = ctx.createLinearGradient(0, 0, w, 0);
    g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(0.5, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);
  });
  const beams = [
    [-6, 11, 18, '#ff2e92', 0.18, -0.25], [-2.5, 11, 20, '#7a5cff', 0.16, -0.08], [2.5, 11, 20, '#00e5c7', 0.14, 0.1],
    [6.5, 11, 18, '#ff2e92', 0.16, 0.3], [0, 11, 24, '#b0a6df', 0.12, 0],
  ];
  for (const [x, y, z, col, op, lean] of beams) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.4, 12, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: col, map: beamTex, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    cone.position.set(x, y - 6, z);
    cone.rotation.z = lean;
    scene.add(cone);
  }
  // distant stage + speaker stacks silhouettes
  const stage = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 6),
    new THREE.MeshStandardMaterial({ color: '#0e0a1d', roughness: 0.9, envMapIntensity: 0.1 }));
  stage.position.set(0, 0.6, 26); scene.add(stage);
  for (const x of [-9, 9]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(2.2, 6, 2), new THREE.MeshStandardMaterial({ color: '#0b0817', roughness: 0.8, envMapIntensity: 0.1 }));
    s.position.set(x, 3, 25); scene.add(s);
  }
  // bokeh dots (crowd lights)
  const pts = [];
  const rnd = mulberry(7);
  for (let i = 0; i < 260; i++) pts.push((rnd() - 0.5) * 34, 0.6 + rnd() * 3.5, 14 + rnd() * 18);
  const bok = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)),
    new THREE.PointsMaterial({ size: 0.09, color: '#c8b8ff', transparent: true, opacity: 0.5, fog: true }));
  scene.add(bok);
}
function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function buildGuitar(scene) {
  const g = new THREE.Group();
  // local frame: X = toward body (-NECK), Y = GUP, Z = FACE
  const gz = new THREE.Vector3().crossVectors(FRET_RIGHT, GUP).normalize();
  const m = new THREE.Matrix4().makeBasis(FRET_RIGHT, GUP, gz);
  const outer = new THREE.Group();
  outer.quaternion.setFromRotationMatrix(m);
  outer.position.copy(P0);
  scene.add(outer);
  outer.add(g);
  if (gz.dot(FACE) < 0) g.scale.z = -1; // model's +z (strings side) must face forward

  const bodyMat = new THREE.MeshStandardMaterial({ color: '#7a1424', roughness: 0.35, metalness: 0.05 });
  const sideMat = new THREE.MeshStandardMaterial({ color: '#2a0a10', roughness: 0.6 });
  const neckMat = new THREE.MeshStandardMaterial({ color: '#5a3a22', roughness: 0.55 });
  const boardMat = new THREE.MeshStandardMaterial({ color: '#1d130e', roughness: 0.7 });
  const metal = new THREE.MeshStandardMaterial({ color: '#d8d8e0', roughness: 0.25, metalness: 0.9 });

  // body outline (double cut-away-ish)
  const sh = new THREE.Shape();
  const pts = [
    [-0.06, 0.07], [-0.02, 0.15], [0.08, 0.17], [0.16, 0.13], [0.24, 0.15], [0.33, 0.12], [0.38, 0.0],
    [0.33, -0.13], [0.22, -0.17], [0.12, -0.13], [0.02, -0.15], [-0.05, -0.11], [-0.08, -0.04], [-0.12, -0.03], [-0.12, 0.03], [-0.08, 0.04],
  ];
  sh.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    sh.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.045, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 3, curveSegments: 24 }), [bodyMat, sideMat]);
  body.position.set(-0.02, -0.01, -0.03);
  g.add(body);
  // pickguard
  const pg = new THREE.Mesh(new THREE.CircleGeometry(0.075, 32), new THREE.MeshStandardMaterial({ color: '#f1ece2', roughness: 0.4 }));
  pg.scale.set(1.5, 0.9, 1); pg.position.set(0.12, -0.06, 0.024); g.add(pg);
  // neck
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.052, 0.026), neckMat);
  neck.position.set(-0.47, 0, 0.012); g.add(neck);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.054, 0.006), boardMat);
  board.position.set(-0.47, 0, 0.027); g.add(board);
  for (let k = 0; k < 18; k++) {
    const x = -0.11 - 0.72 * (1 - Math.pow(0.944, k + 1)) * 1.9;
    if (x < -0.84) break;
    const fw = new THREE.Mesh(new THREE.BoxGeometry(0.0025, 0.054, 0.003), metal);
    fw.position.set(x, 0, 0.031); g.add(fw);
  }
  // headstock
  const hs = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.085, 0.018), neckMat);
  hs.position.set(-0.92, 0.01, 0.006); hs.rotation.z = 0.08; g.add(hs);
  // strings
  for (let s = 0; s < 6; s++) {
    const y = -0.02 + s * 0.008;
    const str = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.0008, 0.0008), metal);
    str.position.set(-0.36, y, 0.034); g.add(str);
  }
  // pickups + bridge
  for (const x of [0.06, 0.16]) {
    const pu = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.01), new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.4 }));
    pu.position.set(x, 0, 0.03); g.add(pu);
  }
  return outer;
}

// ---------------------------------------------------------------- gems
let _toonRamp;
function toonRamp() {
  if (_toonRamp) return _toonRamp;
  const data = new Uint8Array([60, 150, 255]);
  _toonRamp = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
  _toonRamp.minFilter = _toonRamp.magFilter = THREE.NearestFilter;
  _toonRamp.needsUpdate = true;
  return _toonRamp;
}
function toonGem(hex, r = 0.026) {
  // Gem.RepresentNote: cel shading with shadow .15x, rim/spec lifted to white, dark outline .08x
  const grp = new THREE.Group();
  const geo = new THREE.IcosahedronGeometry(r, 0);
  const body = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color: hex, gradientMap: toonRamp(), emissive: shade(hex, 0.18) }));
  const outline = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: shade(hex, 0.08), side: THREE.BackSide }));
  outline.scale.setScalar(1.13);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: mixHex(hex, '#ffffff', 0.25) }));
  grp.add(outline, body, edges);
  grp.rotation.set(0.4, 0.7, 0.2);
  return grp;
}
function wireGem(hex, r, res) {
  const geo = new THREE.IcosahedronGeometry(r, 0);
  const eg = new THREE.EdgesGeometry(geo);
  const lg = new LineSegmentsGeometry().fromEdgesGeometry(eg);
  const mat = new LineMaterial({ color: hex, linewidth: 2.2, transparent: true, opacity: 0.95 });
  mat.resolution.set(res.x, res.y);
  const l = new LineSegments2(lg, mat);
  l.rotation.set(0.4, 0.7, 0.2);
  return l;
}
function puckGem(hex, r = 0.028) {
  // chunky candy puck: glossy top in lane colour + darker "lip" side, echoing the menu tiles
  const grp = new THREE.Group();
  const prof = [];
  const h = 0.018, lip = 0.007, bev = 0.006;
  prof.push(new THREE.Vector2(0, -h / 2 - lip));
  prof.push(new THREE.Vector2(r * 0.96, -h / 2 - lip));
  prof.push(new THREE.Vector2(r, -h / 2 - lip + 0.002));
  prof.push(new THREE.Vector2(r, h / 2 - bev));
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * Math.PI / 2;
    prof.push(new THREE.Vector2(r - bev + Math.cos(a) * bev, h / 2 - bev + Math.sin(a) * bev));
  }
  prof.push(new THREE.Vector2(0, h / 2));
  const geo = new THREE.LatheGeometry(prof, 40);
  const mat = new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08, emissive: shade(hex, 0.3), envMapIntensity: 0.45 });
  const puck = new THREE.Mesh(geo, mat);
  // darker lip band
  const lipBand = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.005, r * 0.97, lip + 0.004, 40, 1, true),
    new THREE.MeshStandardMaterial({ color: shade(hex, 0.45), roughness: 0.5 }));
  lipBand.position.y = -h / 2 - lip / 2 + 0.001;
  // top gloss sticker
  const gl = new THREE.Mesh(new THREE.CircleGeometry(r * 0.62, 32), new THREE.MeshBasicMaterial({ map: glossTex(), transparent: true, depthWrite: false, toneMapped: false }));
  gl.rotation.x = -Math.PI / 2; gl.position.y = h / 2 + 0.0008;
  grp.add(puck, lipBand, gl);
  return grp;
}
let _gloss;
function glossTex() {
  if (_gloss) return _gloss;
  _gloss = canvasTex(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w * 0.38, h * 0.32, 2, w * 0.45, h * 0.45, w * 0.55);
    g.addColorStop(0, 'rgba(255,255,255,0.75)'); g.addColorStop(0.35, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  return _gloss;
}
function placeOnLane(obj, fr, t, h) {
  // orient so obj local Y = lane normal, local Z = toward player
  const z = fr.d.clone().negate();
  const y = fr.normal.clone();
  const x = new THREE.Vector3().crossVectors(y, z).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, new THREE.Vector3().crossVectors(x, y));
  obj.quaternion.setFromRotationMatrix(m);
  obj.position.copy(fr.at(t, 0, h));
  return obj;
}

// chart snapshot shared by all variants: [fret, t along lane (0 = neck, 1 = spawn), sustain length]
const NOTES = [
  [2, 0.135, 0], [1, 0.27, 0], [3, 0.27, 0], [0, 0.41, 0.09], [4, 0.55, 0], [2, 0.66, 0], [1, 0.79, 0], [3, 0.88, 0],
];
const PRESSED = 2; // the Y fret is held in the snapshot
// ---- animation (VR preview): builders register what moves; updateHud() drives it
let ANIMATED = false;
let CUR = null; // registry for the scene being built
const ANIM_NOTES = [2, 1, 3, 0, 4, 2, 2, 1, 3, 4, 0, 2, 3, 1, 2].map((f, i) => [f, 0.2 + i * 0.11, 0]);
const notesList = () => (ANIMATED ? ANIM_NOTES : NOTES);
const isHeld = (f) => (ANIMATED ? false : f === PRESSED);
let PLAQUE_YAW = 0.18;
export function _setPlaqueYaw(v) { PLAQUE_YAW = v; }

// ---------------------------------------------------------------- BEFORE (faithful)
const laneVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const laneFS = `
uniform sampler2D tex; uniform vec2 uvScale; uniform vec2 uvOffset; uniform vec4 baseColor;
uniform float fadeStart; uniform float fadeStartSpawn; uniform float highlight; uniform vec3 tint; uniform float tintAmt;
uniform float fadeHitOn;
varying vec2 vUv;
void main(){
  // vUv.y: 0 at hit (neck) -> 1 at spawn, like the guitar border meshes
  vec2 t = vec2(vUv.x * uvScale.x + uvOffset.x, vUv.y * uvScale.y + uvOffset.y);
  vec4 texCol = texture2D(tex, t);
  float a = baseColor.a;
  float uvSpawn = 1.0 - vUv.y;
  float fadeHit = 1.0 - smoothstep(fadeStart, 1.0, vUv.y);
  float fadeSpawn = 1.0 - smoothstep(fadeStartSpawn, 1.0, uvSpawn);
  fadeSpawn = mix(1.0, fadeSpawn, fadeHitOn);
  a *= clamp(fadeHit * fadeSpawn, 0.0, 1.0);
  vec3 col = baseColor.rgb * texCol.rgb;
  col = mix(col, tint, tintAmt);
  col = mix(col, vec3(1.0), highlight);
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;
function laneMaterial(tex, slice, opts = {}) {
  const t = tex.clone(); t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return new THREE.ShaderMaterial({
    uniforms: {
      tex: { value: t }, uvScale: { value: new THREE.Vector2(1 / 5, 9) }, uvOffset: { value: new THREE.Vector2(slice / 5, 0.37) },
      baseColor: { value: new THREE.Vector4(1, 1, 1, 1) }, fadeStart: { value: 0.8 }, fadeStartSpawn: { value: 0.8 },
      highlight: { value: opts.highlight ?? 0 }, tint: { value: C(opts.tint || '#000000') }, tintAmt: { value: opts.tintAmt ?? 0 },
      fadeHitOn: { value: opts.fadeHitOn ?? 1 },
    },
    vertexShader: laneVS, fragmentShader: laneFS, transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
}

function buildBefore(scene, assets, res) {
  // 5 lane quads, spawn -> neck, 7cm wide, both ends fading over 20% (LaneQuadGuitar.mat)
  SCREEN.forEach((f, slice) => {
    const fr = LANES[f];
    const m = new THREE.Mesh(laneStrip(fr, 0, 1, -LANE_W / 2, LANE_W / 2, 0, 60),
      laneMaterial(assets.highway, slice, { highlight: isHeld(f) ? 0.1 : 0 }));
    m.renderOrder = 1;
    scene.add(m);
    CUR && CUR.lanes.push({ mat: m.material, f, highlight: 0.1 });
  });
  // ghost gems — wireframe icosahedrons at the cross point (90% along), raised 4cm unless pressed
  LANES.forEach((fr, f) => {
    const g = wireGem(PALETTE_BEFORE[f], 0.026 * 1.25, res);
    placeOnLane(g, fr, CROSS_T, GEM_LIFT + (isHeld(f) ? 0 : GHOST_RAISE));
    g.rotation.set(0.4, 0.7, 0.2);
    scene.add(g);
    CUR && CUR.ghosts.push({ obj: g, f });
  });
  // gems
  for (const [f, t, sus] of notesList()) {
    const fr = LANES[f];
    const g = toonGem(PALETTE_BEFORE[f]);
    g.position.copy(fr.at(t, 0, GEM_LIFT));
    scene.add(g);
    CUR && CUR.notes.push({ obj: g, f, t });
    if (sus) addSustain(scene, fr, t, t + sus, PALETTE_BEFORE[f], 0.016);
  }
  // hand indicator — white sphere 0.45m up the focused lane
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.0125, 20, 14), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  hand.position.copy(LANES[PRESSED].at(0.45 / LANES[PRESSED].len, 0, -0.03 + 0.03));
  scene.add(hand);

  buildBeforeMeters(scene);
  buildBeforeScoreHud(scene);
}
function addSustain(scene, fr, t0, t1, hex, w) {
  const m = new THREE.Mesh(laneStrip(fr, t0, t1, -w / 2, w / 2, GEM_LIFT - 0.012, 8),
    new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  m.renderOrder = 3;
  scene.add(m);
}

function sideLane(start, end, frac = 0.3333) {
  const s = end.clone().lerp(start, frac);
  const delta = s.clone().sub(end);
  const dist = delta.length();
  const up = delta.clone().divideScalar(dist);
  const right = FRET_RIGHT.clone().projectOnPlane(up).normalize();
  const fwd = new THREE.Vector3().crossVectors(right, up).normalize();
  const mid = s.clone().add(end).multiplyScalar(0.5);
  let normal = fwd.clone(); if (normal.y < 0) normal.negate();
  return { start: s, end, dist, up, right, normal, mid, at(f, lat = 0, h = 0) { return end.clone().lerp(s, f).addScaledVector(right, lat).addScaledVector(normal, h); } };
}
function flatPlane(mesh, center, right, up, normal, lift = 0.001) {
  orient(mesh, center.clone().addScaledVector(normal, lift), right, up);
  return mesh;
}

function buildBeforeMeters(scene) {
  // Streak lane (StarMeterLane w/ StreakView): yellow fill bar 70px wide, fill = streak / totalNotes
  const st = sideLane(STAR_START, STAR_END);
  const streakFill = 48 / 620;
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(0.07, st.dist * streakFill),
    new THREE.MeshBasicMaterial({ color: STREAK_FILL, side: THREE.DoubleSide, toneMapped: false }));
  flatPlane(fill, st.at(streakFill / 2), st.right, st.up, st.normal);
  scene.add(fill);
  const num = textPlane(0.26, 0.11, 2000, (ctx, w, h) => {
    ctx.fillStyle = UNITY_YELLOW; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'italic bold 120px "Gasoek One"'; ctx.fillText('48', w / 2, h / 2 + 6);
  });
  flatPlane(num, st.mid.clone().addScaledVector(st.up, -0.14), st.right, st.up, st.normal, 0.003);
  scene.add(num);
  const pct = textPlane(0.22, 0.07, 2000, (ctx, w, h) => {
    ctx.fillStyle = UNITY_YELLOW; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'italic bold 68px "Gasoek One"'; ctx.fillText('37%', w / 2, h / 2 + 4);
  });
  flatPlane(pct, st.mid.clone().addScaledVector(st.up, -0.25), st.right, st.up, st.normal, 0.003);
  scene.add(pct);

  // Power lane (PowerBarView): blue fill, 5 x 80px squares at 25% white, labels x2..x10
  const pw = sideLane(POWER_START, POWER_END);
  const pFill = 0.46;
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.07, pw.dist * pFill),
    new THREE.MeshBasicMaterial({ color: POWER_FILL, side: THREE.DoubleSide, toneMapped: false }));
  flatPlane(pf, pw.at(pFill / 2), pw.right, pw.up, pw.normal);
  scene.add(pf);
  ['x2', 'x4', 'x6', 'x8', 'x10'].forEach((label, i) => {
    const f = 0.2 * (i + 1);
    const reached = pFill >= f;
    const sq = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.08),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: reached ? 1 : 0.25, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    flatPlane(sq, pw.at(f), pw.right, pw.up, pw.normal, 0.002);
    sq.renderOrder = 4;
    scene.add(sq);
    const tx = textPlane(label === 'x10' ? 0.092 : 0.064, 0.05, 2000, (ctx, w, h) => {
      ctx.fillStyle = UNITY_YELLOW; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'italic 84px "Gasoek One"'; ctx.fillText(label, w / 2, h / 2 + 4);
    });
    flatPlane(tx, pw.at(f), pw.right, pw.up, pw.normal, 0.004);
    scene.add(tx);
  });
}

function buildBeforeScoreHud(scene) {
  // InstrumentScoreHud: 400x300 canvas @0.001, lying in the lane plane, 0.3m up the highway from the neck
  const nearL = POWER_END, nearR = STAR_END;
  const nearMid = nearL.clone().add(nearR).multiplyScalar(0.5);
  const farMid = POWER_START.clone().add(STAR_START).multiplyScalar(0.5);
  const along = farMid.clone().sub(nearMid).normalize();
  const width = nearR.clone().sub(nearL).normalize();
  let normal = new THREE.Vector3().crossVectors(width, along).normalize();
  if (normal.y < 0) normal.negate();
  const pos = nearMid.clone().addScaledVector(along, 0.3).addScaledVector(normal, 0.02);
  const hud = textPlane(0.4, 0.3, 2000, (ctx, w, h) => {
    const s = 2; // px per canvas unit
    ctx.fillStyle = UNITY_YELLOW; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `italic bold ${44 * s}px "Gasoek One"`; ctx.fillText('Perfect', w / 2, h / 2 - 95 * s);
    for (let i = 0; i < 5; i++) {
      const earned = i < 2;
      ctx.save();
      ctx.strokeStyle = earned ? '#FFD933' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = 6 * s; ctx.lineJoin = 'round';
      starPath(ctx, w / 2 + (-140 + i * 70) * s, h / 2 - 5 * s, 25 * s, 11 * s); ctx.stroke();
      ctx.restore();
    }
    ctx.font = `italic bold ${40 * s}px "Gasoek One"`; ctx.fillText('48,250', w / 2, h / 2 + 95 * s);
  });
  orient(hud, pos, width, along);
  scene.add(hud);
}

// ---------------------------------------------------------------- AFTER: shared pieces
function strikeBar(scene, hex, glow = true) {
  // a bar across all lanes at the cross point (the code has CreateCrossLine() commented out today)
  const L = LANES[4], R = LANES[0];
  const a = L.at(CROSS_T, -LANE_W / 2 - 0.012, 0.004), b = R.at(CROSS_T, LANE_W / 2 + 0.012, 0.004);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const xAxis = b.clone().sub(a); const len = xAxis.length();
  const up = LANES[2].d.clone();
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.012), new THREE.MeshBasicMaterial({ color: hex, side: THREE.DoubleSide, toneMapped: false }));
  orient(bar, mid, xAxis, up);
  bar.renderOrder = 6;
  scene.add(bar);
  if (glow) {
    const gt = canvasTex(256, 64, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(len * 1.05, 0.09), new THREE.MeshBasicMaterial({ color: hex, map: gt, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    orient(gl, mid.clone().addScaledVector(LANES[2].normal, 0.001), xAxis, up);
    gl.renderOrder = 6;
    scene.add(gl);
  }
}

// menu-tile face, drawn the way the redesigned home buttons are built:
// colour fill + top-left radial highlight + ink wash + inset white rim + top highlight + gloss streak
function drawTileFace(ctx, w, h, rgb, r, opts = {}) {
  const [R, G, B] = rgb;
  rr(ctx, 0, 0, w, h, r); ctx.save(); ctx.clip();
  ctx.fillStyle = `rgb(${R},${G},${B})`; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = `rgba(16,12,31,${opts.ink ?? 0.66})`; ctx.fillRect(0, 0, w, h);
  const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h) * 1.15);
  rg.addColorStop(0, `rgba(${R},${G},${B},0.92)`); rg.addColorStop(0.35, `rgba(${R},${G},${B},0.38)`); rg.addColorStop(0.65, `rgba(${R},${G},${B},0)`);
  ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
  // gloss: top sheen + diagonal streak
  const top = ctx.createLinearGradient(0, 0, 0, h);
  top.addColorStop(0, 'rgba(255,255,255,0.30)'); top.addColorStop(0.46, 'rgba(255,255,255,0.10)'); top.addColorStop(0.52, 'rgba(255,255,255,0)');
  ctx.fillStyle = top; ctx.fillRect(0, 0, w, h);
  const diag = ctx.createLinearGradient(0, 0, w, h * 0.55);
  diag.addColorStop(0.28, 'rgba(255,255,255,0)'); diag.addColorStop(0.36, 'rgba(255,255,255,0.16)'); diag.addColorStop(0.44, 'rgba(255,255,255,0)');
  ctx.fillStyle = diag; ctx.fillRect(0, 0, w, h);
  // bottom inner shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, h - h * 0.06, w, h * 0.06);
  ctx.restore();
  // rims
  rr(ctx, 2, 2, w - 4, h - 4, r - 2); ctx.lineWidth = Math.max(3, w * 0.008); ctx.strokeStyle = 'rgba(255,255,255,0.40)'; ctx.stroke();
  ctx.save(); rr(ctx, 0, 0, w, h, r); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, w, Math.max(3, h * 0.012));
  ctx.restore();
}
const hexRgb = (hex) => { const c = C(hex); return [Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255)]; };

// a chunky 3D tile: canvas face + darker lip block behind it (like the 10px lip on the menu tiles)
function chunkyTile(wM, hM, hex, drawContent, opts = {}) {
  const grp = new THREE.Group();
  const ppm = opts.ppm ?? 2400;
  const W = Math.round(wM * ppm), H = Math.round(hM * ppm), r = Math.round((opts.radius ?? 0.03) * ppm);
  const face = textPlane(wM, hM, ppm, (ctx, w, h) => { drawTileFace(ctx, w, h, hexRgb(hex), r, opts); drawContent && drawContent(ctx, w, h); }, { side: THREE.FrontSide, depthWrite: true, transparent: true, alphaTest: 0.02 });
  face.position.z = 0.0005;
  const depth = opts.depth ?? 0.016;
  const lipGeo = new RoundedBoxGeometry(wM, hM, depth, 4, Math.min(opts.radius ?? 0.03, depth / 2));
  const lip = new THREE.Mesh(lipGeo, new THREE.MeshPhysicalMaterial({ color: shade(hex, 0.42), roughness: 0.4, clearcoat: 0.6 }));
  lip.position.set(0, -(opts.lipDrop ?? 0.012), -depth / 2);
  const back = new THREE.Mesh(lipGeo, new THREE.MeshStandardMaterial({ color: shade(hex, 0.18), roughness: 0.6 }));
  back.position.set(0, 0, -depth / 2 - 0.0008);
  back.scale.set(0.995, 0.995, 1);
  grp.add(lip, back, face);
  return grp;
}

function chunkyPad(hex, pressed) {
  const grp = new THREE.Group();
  const w = 0.068, d = 0.054, top = 0.02, lip = 0.014;
  const capMat = new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.06, emissive: shade(hex, pressed ? 0.85 : 0.3), envMapIntensity: 0.45 });
  const cap = new THREE.Mesh(new RoundedBoxGeometry(w, top, d, 4, 0.007), capMat);
  const lipM = new THREE.Mesh(new RoundedBoxGeometry(w, lip, d, 4, 0.005), new THREE.MeshStandardMaterial({ color: shade(hex, 0.42), roughness: 0.45 }));
  const sink = pressed ? -0.009 : 0;
  cap.position.y = top / 2 + sink; lipM.position.y = -lip / 2 + 0.001;
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, d * 0.75), new THREE.MeshBasicMaterial({ map: glossTex(), transparent: true, depthWrite: false, toneMapped: false }));
  gl.rotation.x = -Math.PI / 2; gl.position.y = top + sink + 0.0008;
  grp.add(lipM, cap, gl);
  if (pressed) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.052, 48), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; ring.renderOrder = 7;
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.085, 48), new THREE.MeshBasicMaterial({ color: hex, map: haloTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    halo.rotation.x = -Math.PI / 2; halo.position.y = 0.001; halo.renderOrder = 6;
    grp.add(halo, ring);
  }
  return grp;
}
let _halo;
function haloTex() {
  if (_halo) return _halo;
  _halo = canvasTex(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.45, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  return _halo;
}


// Original note language kept in every option: wireframe ghost gems at the cross point
// (raised 4cm unless held) and cel-shaded icosahedron gems riding 5cm above the lane.
function originalNotes(scene, palette, res, opts = {}) {
  LANES.forEach((fr, f) => {
    const held = isHeld(f);
    const g = wireGem(palette[f], 0.026 * 1.25, res);
    placeOnLane(g, fr, CROSS_T, GEM_LIFT + (held ? 0 : GHOST_RAISE));
    g.rotation.set(0.4, 0.7, 0.2);
    scene.add(g);
    CUR && CUR.ghosts.push({ obj: g, f });
    if ((held || ANIMATED) && opts.glow) {
      const grp = new THREE.Group();
      const halo = new THREE.Mesh(new THREE.CircleGeometry(0.08, 48), new THREE.MeshBasicMaterial({ color: palette[f], map: haloTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.036, 0.044, 48), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
      halo.rotation.x = ring.rotation.x = -Math.PI / 2;
      grp.add(halo, ring);
      placeOnLane(grp, fr, CROSS_T, 0.005);
      grp.children.forEach((c) => (c.renderOrder = 7));
      scene.add(grp);
      if (CUR) { CUR.halos.push({ obj: grp, f }); grp.visible = held; }
    }
  });
  for (const [f, t, sus] of notesList()) {
    const g = toonGem(palette[f]);
    g.position.copy(LANES[f].at(t, 0, GEM_LIFT));
    scene.add(g);
    CUR && CUR.notes.push({ obj: g, f, t });
    if (sus) addSustain(scene, LANES[f], t, t + sus, palette[f], 0.016);
  }
}

// ---------------------------------------------------------------- AFTER A: polish pass
function buildPolish(scene, assets, res) {
  // lanes: same highway art but dimmed + lane-tinted, no fade at the neck end so lanes reach the target
  SCREEN.forEach((f, slice) => {
    const fr = LANES[f];
    const m = new THREE.Mesh(laneStrip(fr, 0, 1, -LANE_W / 2 - 0.004, LANE_W / 2 + 0.004, 0, 60),
      laneMaterial(assets.highway, slice, { tint: PALETTE_AFTER[f], tintAmt: isHeld(f) ? 0.32 : 0.14, highlight: 0, fadeHitOn: 0 }));
    CUR && CUR.lanes.push({ mat: m.material, f, tint: [0.14, 0.32] });
    m.material.uniforms.baseColor.value.set(0.9, 0.88, 1.0, 0.95);
    m.material.uniforms.fadeStart.value = 2; // disable hit-end fade
    m.renderOrder = 1;
    scene.add(m);
    // dividers / rails
  });
  {
    const patch = trackPatch(0.012, -0.001, 40, 1);
    const bk = new THREE.Mesh(patch.geometry(0, 1), new THREE.MeshBasicMaterial({ color: BRAND.ink, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    bk.renderOrder = 0; scene.add(bk);
  }
  const railMat = (op) => new THREE.MeshBasicMaterial({ color: BRAND.lav, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  for (let k = 0; k <= 5; k++) {
    const outer = k === 0 || k === 5;
    // boundary between screen lanes k-1 and k
    let fr, u;
    if (k === 0) { fr = LANES[SCREEN[0]]; u = -LANE_W / 2 - 0.006; }
    else if (k === 5) { fr = LANES[SCREEN[4]]; u = LANE_W / 2 + 0.006; }
    else { fr = LANES[SCREEN[k]]; u = -LANE_W / 2 - 0.006; }
    const w = outer ? 0.008 : 0.003;
    const m = new THREE.Mesh(laneStrip(fr, 0.02, 0.98, u - w / 2, u + w / 2, 0.002, 40), railMat(outer ? 0.9 : 0.35));
    m.renderOrder = 2; scene.add(m);
  }
  strikeBar(scene, BRAND.acid);
  originalNotes(scene, PALETTE_AFTER, res, { glow: true });
  // meters with a visible track, rounded, brand colours, single multiplier chip
  const st = sideLane(STAR_START, STAR_END), pw = sideLane(POWER_START, POWER_END);
  meterFlat(scene, st, BRAND.acid, 0.42, null, 'STREAK', '48');
  meterFlat(scene, pw, BRAND.magenta, 0.46, [0.2, 0.4, 0.6, 0.8, 1], 'POWER', '×4');
  // score card: tilted up toward the player, moved off the gem path to the right of the streak meter
  const pos = st.at(0.36, 0.2, 0.09);
  const card = textPlane(0.30, 0.17, 2600, (ctx, w, h) => {
    rr(ctx, 4, 4, w - 8, h - 8, 46); ctx.fillStyle = 'rgba(16,12,31,0.82)'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(176,166,223,0.55)'; ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(248,248,252,0.6)'; ctx.font = '600 50px Monda'; ctx.fillText('SCORE', 46, 92);
    ctx.fillStyle = '#F8F8FC'; ctx.font = '210px "Bebas Neue"'; ctx.fillText('48,250', 40, 280);
    for (let i = 0; i < 5; i++) { starPath(ctx, 70 + i * 74, 368, 30, 13); ctx.fillStyle = i < 2 ? BRAND.acid : 'rgba(255,255,255,0.18)'; ctx.fill(); }
    rr(ctx, w - 300, 330, 252, 76, 38); ctx.fillStyle = BRAND.acid; ctx.fill();
    ctx.fillStyle = BRAND.ink; ctx.font = '62px "Bebas Neue"'; ctx.textAlign = 'center'; ctx.fillText('PERFECT', w - 174, 390);
  }, { depthWrite: false });
  facing(card, pos, HEAD, 0);
  scene.add(card);
}
function meterFlat(scene, ln, hex, fill, ticks, label, value) {
  const track = textPlane(0.05, ln.dist, 1200, (ctx, w, h) => {
    rr(ctx, 2, 2, w - 4, h - 4, w / 2 - 2); ctx.fillStyle = 'rgba(16,12,31,0.78)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(176,166,223,0.45)'; ctx.stroke();
    const fh = (h - 12) * fill;
    rr(ctx, 7, h - 6 - fh, w - 14, fh, (w - 14) / 2); ctx.fillStyle = hex; ctx.fill();
    if (ticks) for (const t of ticks) { const y = h - 6 - (h - 12) * t; ctx.fillStyle = t <= fill ? '#fff' : 'rgba(255,255,255,0.35)'; ctx.fillRect(4, y - 2, w - 8, 4); }
  }, { depthWrite: false });
  flatPlane(track, ln.at(0.5), ln.right, ln.up, ln.normal, 0.002);
  scene.add(track);
  // chip riding at the fill tip
  const chip = textPlane(0.11, 0.06, 2400, (ctx, w, h) => {
    rr(ctx, 4, 4, w - 8, h - 8, (h - 8) / 2); ctx.fillStyle = hex; ctx.fill();
    ctx.fillStyle = BRAND.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '110px "Bebas Neue"'; ctx.fillText(value, w / 2, h / 2 + 6);
  });
  const tip = ln.at(fill, 0, 0.05);
  facing(chip, tip, HEAD, 0);
  scene.add(chip);
}

// ---------------------------------------------------------------- AFTER B/C: chunky 3D track
function buildTrack(scene, assets, opts = {}) {
  const margin = 0.03;
  const patch = trackPatch(margin, 0, 60, 1);
  const T0 = -0.005, T1 = 1.0;
  // slab top
  const topMat = new THREE.MeshStandardMaterial({ color: '#120e26', roughness: 0.6, envMapIntensity: 0.12 });
  const top = new THREE.Mesh(patch.geometry(T0, T1, 0, 1, 0), topMat);
  scene.add(top);
  // lane grooves tinted per lane + highway art very subtly
  SCREEN.forEach((f, slice) => {
    const fr = LANES[f];
    const m = new THREE.Mesh(laneStrip(fr, 0, 1, -LANE_W / 2 + 0.002, LANE_W / 2 - 0.002, 0.0015, 60),
      laneMaterial(assets.highway, slice, { tint: PALETTE_AFTER[f], tintAmt: isHeld(f) ? 0.42 : 0.24, fadeHitOn: 0 }));
    CUR && CUR.lanes.push({ mat: m.material, f, tint: [0.24, 0.42] });
    m.material.uniforms.baseColor.value.set(0.42, 0.40, 0.55, 1.0);
    m.material.uniforms.fadeStart.value = 2;
    m.material.uniforms.fadeStartSpawn.value = 0.86;
    m.renderOrder = 1; scene.add(m);
  });
  // beat lines across the track
  for (let t = 0.17; t < 1; t += 0.095) {
    const a = patch.at(t, 0.04, 0.003), b = patch.at(t, 0.96, 0.003);
    const ln = new THREE.Mesh(new THREE.PlaneGeometry(a.distanceTo(b), 0.005), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.16 * (1 - t * 0.6), depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    orient(ln, a.clone().add(b).multiplyScalar(0.5), b.clone().sub(a), LANES[2].d);
    ln.renderOrder = 2; scene.add(ln);
  }
  // side lips (the "10px lip" of the menu tiles, as a slab edge)
  const lipMat = new THREE.MeshStandardMaterial({ color: '#4b3f86', roughness: 0.5 });
  const lipDark = new THREE.MeshStandardMaterial({ color: '#0a0816', roughness: 0.8, side: THREE.DoubleSide });
  for (const s of [0, 1]) {
    const A = [], B = [];
    for (let i = 0; i <= 60; i++) { const t = T0 + (T1 - T0) * i / 60; A.push(patch.at(t, s, 0)); B.push(patch.at(t, s, -0.028)); }
    scene.add(new THREE.Mesh(ribbon(A, B), lipDark));
  }
  {
    const A = [], B = [];
    for (let j = 0; j <= 10; j++) { A.push(patch.at(T0, j / 10, 0)); B.push(patch.at(T0, j / 10, -0.028)); }
    scene.add(new THREE.Mesh(ribbon(A, B), lipMat));
  }
  // chunky rails: rounded bars along both edges + thin raised dividers
  const railMat = new THREE.MeshPhysicalMaterial({ color: BRAND.lav, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.5 });
  const railLip = new THREE.MeshStandardMaterial({ color: '#6a5fa8', roughness: 0.5 });
  const divMat = new THREE.MeshPhysicalMaterial({ color: '#4a3f86', roughness: 0.35, clearcoat: 0.8, envMapIntensity: 0.4, emissive: C('#1d1640') });
  const railSegs = 14;
  const railBits = [[0.012, 0.016, railMat, railLip, true], [0.988, 0.016, railMat, railLip, true]];
  for (let k = 1; k < 5; k++) railBits.push([k / 5, 0.006, divMat, null, false]);
  for (const [s, w, mat, lipm, isRail] of railBits) {
    for (let i = 0; i < railSegs; i++) {
      const t0 = T0 + (T1 - T0) * i / railSegs, t1 = T0 + (T1 - T0) * (i + 1) / railSegs;
      const a = patch.at(t0, s), b = patch.at(t1, s);
      const len = a.distanceTo(b);
      const n = patch.normalAt(s);
      const hgt = isRail ? 0.016 : 0.006;
      const bar = new THREE.Mesh(new RoundedBoxGeometry(w, hgt, len + 0.002, 3, Math.min(w, hgt) / 2.2), mat);
      const mid = a.clone().add(b).multiplyScalar(0.5).addScaledVector(n, hgt / 2);
      const z = b.clone().sub(a).normalize();
      const x = new THREE.Vector3().crossVectors(n, z).normalize();
      bar.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, n, z));
      bar.position.copy(mid);
      scene.add(bar);
      if (isRail && lipm) {
        const lb = new THREE.Mesh(new THREE.BoxGeometry(w * 1.02, 0.008, len + 0.002), lipm);
        lb.quaternion.copy(bar.quaternion); lb.position.copy(mid).addScaledVector(n, -hgt / 2 - 0.003);
        scene.add(lb);
      }
    }
  }
  // meter fills lit inside the rails (option C) or troughs (option B)
  return patch;
}


// ---------------------------------------------------------------- real 3D HUD objects (Chunky 3D)
// Built from geometry and lit materials (bevels, clearcoat, a real lip block, extruded Gasoek One),
// rather than gloss and rims painted onto a flat texture.
let _font3d;
function text3D(str, size, depth, mat, opts = {}) {
  _font3d = _font3d || new Font(GASOEK);
  const bevel = opts.bevel ?? size * 0.035;
  const g = new TextGeometry(str, { font: _font3d, size, height: depth, curveSegments: 6, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments: 2 });
  g.computeBoundingBox();
  const bb = g.boundingBox;
  const align = opts.align || 'center';
  const dx = align === 'center' ? -(bb.max.x + bb.min.x) / 2 : align === 'left' ? -bb.min.x : -bb.max.x;
  g.translate(dx, -(bb.max.y + bb.min.y) / 2, -bb.min.z);
  return new THREE.Mesh(g, mat);
}
function roundedRectShape(w, h, r) {
  const sh = new THREE.Shape(), x = -w / 2, y = -h / 2;
  sh.moveTo(x + r, y); sh.lineTo(x + w - r, y); sh.quadraticCurveTo(x + w, y, x + w, y + r);
  sh.lineTo(x + w, y + h - r); sh.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  sh.lineTo(x + r, y + h); sh.quadraticCurveTo(x, y + h, x, y + h - r);
  sh.lineTo(x, y + r); sh.quadraticCurveTo(x, y, x + r, y);
  return sh;
}
function slab(w, h, d, r, mat, bevel = 0.003) {
  const g = new THREE.ExtrudeGeometry(roundedRectShape(w - 2 * bevel, h - 2 * bevel, Math.max(0.001, r - bevel)),
    { depth: d - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 12 });
  g.translate(0, 0, -(d - 2 * bevel) / 2);
  return new THREE.Mesh(g, mat); // centred, front face at z = +d/2
}
function star3D(R, r, depth, mat) {
  const sh = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 === 0 ? R : r;
    const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
    i ? sh.lineTo(x, y) : sh.moveTo(x, y);
  }
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: depth * 0.5, bevelSize: R * 0.12, bevelSegments: 2 });
  return new THREE.Mesh(g, mat);
}
const gloss = (hex, extra = {}) => new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.85, ...extra });

function scorePlaque3D() {
  // solid bevelled block with a real lip; the front is the readable tile face from the earlier version
  const W = 0.34, H = 0.21, D = 0.03, R = 0.03, BEV = 0.006;
  const grp = new THREE.Group();
  const body = slab(W, H, D, R, gloss(BRAND.acid, { emissive: shade(BRAND.acid, 0.08) }), BEV);
  const lip = slab(W - 0.004, H, D, R, gloss('#6f7d0e', { roughness: 0.45 }), BEV);
  lip.position.set(0, -0.013, -0.012);
  const fw = W - 2 * BEV, fh = H - 2 * BEV, ppm = 2400;
  const face = textPlane(fw, fh, ppm, (ctx, w, h) => {
    ctx.save();
    ctx.scale(w / 816, h / 504); // original 0.34 x 0.21 m tile drawn at 2400 px/m
    const W0 = 816, H0 = 504;
    drawTileFace(ctx, W0, H0, hexRgb(BRAND.acid), Math.round((R - BEV) * ppm), { ink: 0.55 });
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(16,12,31,0.85)'; ctx.font = '700 46px Monda'; ctx.fillText('SCORE', 60, 92);
    ctx.fillStyle = '#ffffff'; ctx.font = '240px "Bebas Neue"';
    ctx.shadowColor = 'rgba(16,12,31,0.5)'; ctx.shadowOffsetY = 8; ctx.fillText('48,250', 52, 300); ctx.shadowColor = 'transparent';
    for (let i = 0; i < 5; i++) { starPath(ctx, 92 + i * 80, 400, 34, 15); ctx.fillStyle = i < 2 ? '#ffffff' : 'rgba(16,12,31,0.35)'; ctx.fill(); }
    rr(ctx, W0 - 330, 356, 270, 84, 42); ctx.fillStyle = BRAND.ink; ctx.fill();
    ctx.fillStyle = BRAND.acid; ctx.textAlign = 'center'; ctx.font = '70px "Bebas Neue"'; ctx.fillText('PERFECT', W0 - 195, 422);
    ctx.restore();
  }, { side: THREE.FrontSide, depthWrite: true, transparent: true, alphaTest: 0.02 });
  face.position.z = D / 2 + 0.0006;
  grp.add(lip, body, face);
  return grp;
}
function puckBadge3D(hex, lipHex, str, textHex = BRAND.ink) {
  const grp = new THREE.Group();
  const R = 0.042, T = 0.02, b = 0.0065;
  const prof = [new THREE.Vector2(0, -T / 2), new THREE.Vector2(R - b, -T / 2)];
  for (let i = 1; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); prof.push(new THREE.Vector2(R - b + Math.cos(a) * b, -T / 2 + b + Math.sin(a) * b)); }
  for (let i = 1; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); prof.push(new THREE.Vector2(R - b + Math.cos(a) * b, T / 2 - b + Math.sin(a) * b)); }
  prof.push(new THREE.Vector2(0, T / 2));
  const geo = new THREE.LatheGeometry(prof, 56);
  geo.rotateX(Math.PI / 2); // axis -> z, face at +z
  const body = new THREE.Mesh(geo, gloss(hex, { emissive: shade(hex, 0.1) }));
  const lip = new THREE.Mesh(geo, gloss(lipHex, { roughness: 0.45 }));
  lip.scale.set(0.985, 0.985, 1);
  lip.position.set(0, -0.009, -0.01);
  // flat printed face, as in the earlier badge: tile art + Bebas Neue number
  const fd = (R - b) * 2;
  const face = textPlane(fd, fd, 3000, (ctx, w, h) => {
    ctx.save(); ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2); ctx.clip();
    drawTileFace(ctx, w, h, hexRgb(hex), w / 2, { ink: 0.35 });
    ctx.restore();
    // white numbers with the same soft ink drop shadow as the score tile
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(16,12,31,0.55)'; ctx.shadowOffsetY = h * 0.025;
    ctx.font = `${Math.round(h * 0.56)}px "Bebas Neue"`; ctx.fillText(str, w / 2, h / 2 + h * 0.04);
  }, { side: THREE.FrontSide, depthWrite: true, alphaTest: 0.05 });
  face.position.z = T / 2 + 0.0006;
  grp.add(lip, body, face);
  return grp;
}
function strikeRail(scene, hex) {
  // a slim physical rail across the track at the cross point; only a faint glow so the ghost notes stay clear
  const L = LANES[4], R = LANES[0];
  const a = L.at(CROSS_T, -LANE_W / 2 - 0.016, 0), b = R.at(CROSS_T, LANE_W / 2 + 0.016, 0);
  const n = LANES[2].normal.clone();
  const len = a.distanceTo(b);
  const x = b.clone().sub(a).normalize();
  const z = new THREE.Vector3().crossVectors(x, n).normalize();
  const rail = new THREE.Mesh(new RoundedBoxGeometry(len, 0.006, 0.009, 3, 0.0029),
    gloss(hex, { emissive: shade(hex, 0.3), envMapIntensity: 0.5 }));
  rail.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, n, z));
  rail.position.copy(a.clone().add(b).multiplyScalar(0.5)).addScaledVector(n, 0.003);
  scene.add(rail);
  const gt = canvasTex(256, 64, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.028), new THREE.MeshBasicMaterial({ color: hex, map: gt, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  orient(gl, rail.position.clone().addScaledVector(n, -0.002), x, LANES[2].d);
  gl.renderOrder = 6;
  scene.add(gl);
}

function buildChunky(scene, assets, res, variant) {
  const patch = buildTrack(scene, assets);
  strikeRail(scene, BRAND.acid);
  originalNotes(scene, PALETTE_AFTER, res, { glow: true });
  const st = sideLane(STAR_START, STAR_END), pw = sideLane(POWER_START, POWER_END);
  if (variant === 'chunky') {
    trough(scene, st, BRAND.acid, 0.42, null);
    trough(scene, pw, BRAND.magenta, 0.46, [0.2, 0.4, 0.6, 0.8]);
    // multiplier and streak: solid pucks riding the fill tips, tilted back so their thickness shows
    const mult = puckBadge3D(BRAND.magenta, '#a81a5f', '×4', '#ffffff');
    facing(mult, pw.at(0.46, 0, 0.068), HEAD, 12);
    scene.add(mult);
    const streak = puckBadge3D(BRAND.acid, '#6f7d0e', '48');
    facing(streak, st.at(0.42, 0, 0.068), HEAD, 12);
    scene.add(streak);
    // score plaque: a solid bevelled block with a real lip, inset screen and extruded numerals
    const plaque = scorePlaque3D();
    facing(plaque, st.at(0.5, 0.27, 0.17), HEAD, 14);
    plaque.rotateY(PLAQUE_YAW);
    scene.add(plaque);
  } else {
    // option C: meters become light strips inside the rails, HUD floats as menu tiles
    railFill(scene, patch, 0.988, BRAND.acid, 0.42 * 0.34);
    railFill(scene, patch, 0.012, BRAND.magenta, 0.46 * 0.34);
    const tiles = [
      { pos: V(-0.8, 1.62, 2.15), w: 0.5, h: 0.3, hex: BRAND.acid, label: 'SCORE', big: '48,250', stars: true },
      { pos: V(-0.72, 1.27, 1.5), w: 0.3, h: 0.19, hex: BRAND.teal, label: 'STREAK', big: '48' },
      { pos: V(1.05, 1.55, 2.05), w: 0.3, h: 0.24, hex: BRAND.magenta, label: 'POWER', big: '×4', bar: 0.46 },
    ];
    for (const tdef of tiles) {
      const tile = chunkyTile(tdef.w, tdef.h, tdef.hex, (ctx, w, h) => {
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = 'rgba(16,12,31,0.8)'; ctx.font = `700 ${Math.round(h * 0.11)}px Monda`; ctx.fillText(tdef.label, w / 2, h * 0.2);
        ctx.fillStyle = '#ffffff'; ctx.font = `${Math.round(h * (tdef.stars ? 0.5 : 0.58))}px "Bebas Neue"`;
        ctx.shadowColor = 'rgba(16,12,31,0.5)'; ctx.shadowOffsetY = h * 0.018; ctx.fillText(tdef.big, w / 2, h * (tdef.stars ? 0.66 : 0.74)); ctx.shadowColor = 'transparent';
        if (tdef.stars) for (let i = 0; i < 5; i++) { starPath(ctx, w / 2 + (i - 2) * h * 0.15, h * 0.83, h * 0.06, h * 0.026); ctx.fillStyle = i < 2 ? '#fff' : 'rgba(16,12,31,0.35)'; ctx.fill(); }
        if (tdef.bar != null) { rr(ctx, w * 0.12, h * 0.82, w * 0.76, h * 0.07, h * 0.035); ctx.fillStyle = 'rgba(16,12,31,0.55)'; ctx.fill(); rr(ctx, w * 0.12, h * 0.82, w * 0.76 * tdef.bar, h * 0.07, h * 0.035); ctx.fillStyle = '#fff'; ctx.fill(); }
      }, { radius: 0.035, ink: 0.5, depth: 0.03, lipDrop: 0.018 });
      facing(tile, tdef.pos, HEAD, 6);
      scene.add(tile);
    }
  }
}
function trough(scene, ln, hex, fill, ticks) {
  const n = ln.normal;
  const len = ln.dist;
  const z = ln.up.clone().negate();
  const x = new THREE.Vector3().crossVectors(n, z).normalize();
  const basis = new THREE.Matrix4().makeBasis(x, n, z);
  const outer = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.022, len, 4, 0.01), new THREE.MeshPhysicalMaterial({ color: '#2b2453', roughness: 0.35, clearcoat: 0.8, envMapIntensity: 0.35 }));
  outer.quaternion.setFromRotationMatrix(basis); outer.position.copy(ln.at(0.5, 0, 0.004)); scene.add(outer);
  const lip = new THREE.Mesh(new RoundedBoxGeometry(0.072, 0.012, len + 0.004, 3, 0.005), new THREE.MeshStandardMaterial({ color: '#0d0a1c', roughness: 0.6 }));
  lip.quaternion.copy(outer.quaternion); lip.position.copy(ln.at(0.5, 0, -0.012)); scene.add(lip);
  const channel = new THREE.Mesh(new RoundedBoxGeometry(0.048, 0.006, len - 0.03, 3, 0.003), new THREE.MeshStandardMaterial({ color: '#0b0817', roughness: 0.9 }));
  channel.quaternion.copy(outer.quaternion); channel.position.copy(ln.at(0.5, 0, 0.0135)); scene.add(channel);
  const flen = (len - 0.04) * fill;
  const f = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.012, flen, 4, 0.0058), new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05, emissive: shade(hex, 0.55), envMapIntensity: 0.3 }));
  f.quaternion.copy(outer.quaternion);
  f.position.copy(ln.at((0.02 + flen / 2) / len, 0, 0.017)); scene.add(f);
  if (ticks) for (const t of ticks) {
    const tk = new THREE.Mesh(new RoundedBoxGeometry(0.066, 0.008, 0.008, 2, 0.003), new THREE.MeshPhysicalMaterial({ color: t <= fill ? '#ffffff' : '#6a5fa8', roughness: 0.3, clearcoat: 1, emissive: t <= fill ? C('#555555') : C('#000000') }));
    tk.quaternion.copy(outer.quaternion); tk.position.copy(ln.at(0.02 / len + t * (len - 0.04) / len, 0, 0.018)); scene.add(tk);
  }
}
function railFill(scene, patch, s, hex, frac) {
  const a = patch.at(0.0, s), b = patch.at(frac, s);
  const n = patch.normalAt(s);
  const len = a.distanceTo(b);
  const z = b.clone().sub(a).normalize();
  const x = new THREE.Vector3().crossVectors(n, z).normalize();
  const bar = new THREE.Mesh(new RoundedBoxGeometry(0.018, 0.018, len, 3, 0.008), new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.2, clearcoat: 1, emissive: shade(hex, 0.7), envMapIntensity: 0.3 }));
  bar.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, n, z));
  bar.position.copy(a.clone().add(b).multiplyScalar(0.5).addScaledVector(n, 0.009));
  scene.add(bar);
}
function badge(scene, pos, hex, text, size) {
  const grp = new THREE.Group();
  const r = size / 2;
  const disc = textPlane(size, size, 3000, (ctx, w, h) => {
    ctx.save(); ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 3, 0, Math.PI * 2); ctx.clip();
    drawTileFace(ctx, w, h, hexRgb(hex), w / 2, { ink: 0.35 });
    ctx.restore();
    ctx.fillStyle = BRAND.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(h * 0.52)}px "Bebas Neue"`; ctx.fillText(text, w / 2, h / 2 + h * 0.04);
  }, { side: THREE.FrontSide, depthWrite: true, alphaTest: 0.05 });
  disc.position.z = 0.0006;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.014, 48), new THREE.MeshPhysicalMaterial({ color: shade(hex, 0.45), roughness: 0.4, clearcoat: 0.8 }));
  body.rotation.x = Math.PI / 2; body.position.set(0, -0.008, -0.007);
  grp.add(body, disc);
  facing(grp, pos, HEAD, 0);
  scene.add(grp);
}


// ---------------------------------------------------------------- AFTER C: Air fretboard
// No highway surface. The neck carries on across the stage as five light strings with fret wires;
// the HUD lives on a strike gate at the timing point and on a stage screen the notes stream out of.
const SCREEN_CENTER = V(0, 2.42, 6.35);
const SCREEN_W = 2.0, SCREEN_H = 0.84;
let _glowStripe;
function glowStripeTex() {
  if (_glowStripe) return _glowStripe;
  _glowStripe = canvasTex(64, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // fade toward the far (spawn) end: uv.y 0 at neck -> 1 at spawn, canvas y is flipped
    const f = ctx.createLinearGradient(0, 0, 0, h);
    f.addColorStop(0, 'rgba(0,0,0,0.85)'); f.addColorStop(0.35, 'rgba(0,0,0,0)'); f.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = f; ctx.fillRect(0, 0, w, h);
  });
  return _glowStripe;
}
function rodBetween(a, b, r, mat) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10, 1), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}
function buildAir(scene, assets, res) {
  const palette = PALETTE_AFTER;
  const H = GEM_LIFT; // strings run at gem height so the gems ride on them
  // strings + soft halo bands
  LANES.forEach((fr, f) => {
    const col = palette[f];
    const held = f === PRESSED;
    const mat = new THREE.MeshBasicMaterial({ color: held ? mixHex(col, '#ffffff', 0.35) : col, toneMapped: false });
    scene.add(rodBetween(fr.at(0, 0, H), fr.at(1, 0, H), held ? 0.0034 : 0.0028, mat));
    if (held) {
      // held string vibrates: a standing-wave blur between the neck and just past the strike fret
      const span = 0.24;
      for (const side of [-1, 1]) {
        const pts = [];
        for (let i = 0; i <= 40; i++) {
          const t = (i / 40) * span;
          pts.push(fr.at(t, side * 0.0065 * Math.sin((t / span) * Math.PI), H));
        }
        const blur = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.0022, 6, false),
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
        scene.add(blur);
      }
    }
    const halo = new THREE.Mesh(laneStrip(fr, 0, 1, held ? -0.03 : -0.016, held ? 0.03 : 0.016, H - 0.001, 40),
      new THREE.MeshBasicMaterial({ color: col, map: glowStripeTex(), transparent: true, opacity: held ? 0.75 : 0.42, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    halo.renderOrder = 2;
    scene.add(halo);
  });
  // fret wires every beat, across all five strings, just under them
  const L = LANES[4], R = LANES[0];
  const wireMat = (op) => new THREE.MeshStandardMaterial({ color: BRAND.lav, emissive: C('#4a4080'), roughness: 0.3, metalness: 0.6, transparent: true, opacity: op });
  let k = 0;
  for (let t = 0.19; t < 0.97; t += 0.07, k++) {
    const a = L.at(t, -LANE_W / 2 - 0.012, H - 0.006), b = R.at(t, LANE_W / 2 + 0.012, H - 0.006);
    scene.add(rodBetween(a, b, 0.0022, wireMat(1 - t * 0.55)));
    if (k % 3 === 1) { // inlay dot between the middle strings
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.011, 24), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 * (1 - t * 0.6), depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
      const mid = LANES[2];
      dot.rotation.x = 0;
      placeOnLane(dot, mid, t + 0.035, H - 0.008);
      dot.rotateX(-Math.PI / 2);
      scene.add(dot);
    }
  }
  // strike fret: brighter wire at the cross point, faint glow only
  {
    const a = L.at(CROSS_T, -LANE_W / 2 - 0.03, H - 0.006), b = R.at(CROSS_T, LANE_W / 2 + 0.03, H - 0.006);
    scene.add(rodBetween(a, b, 0.0042, gloss(BRAND.acid, { emissive: shade(BRAND.acid, 0.55), envMapIntensity: 0.5 })));
    const x = b.clone().sub(a).normalize();
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(a.distanceTo(b), 0.03), new THREE.MeshBasicMaterial({ color: BRAND.acid, map: haloStrip(), transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    orient(gl, a.clone().add(b).multiplyScalar(0.5).addScaledVector(LANES[2].normal, -0.004), x, LANES[2].d);
    scene.add(gl);
    // goal posts at either end: glass tubes that fill (power left, streak right)
    gatePost(scene, a.clone().addScaledVector(x, -0.012), BRAND.magenta, 0.46, '×4', [0.2, 0.4, 0.6, 0.8]);
    gatePost(scene, b.clone().addScaledVector(x, 0.012), BRAND.acid, 0.42, '48', null);
  }
  originalNotes(scene, palette, res, { glow: false });
  stageScreen(scene);
}
let _haloStrip;
function haloStrip() {
  if (_haloStrip) return _haloStrip;
  _haloStrip = canvasTex(256, 64, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  return _haloStrip;
}
function gatePost(scene, base, hex, fill, label, ticks) {
  const n = LANES[2].normal.clone();
  const Hh = 0.17, r = 0.012;
  const grp = new THREE.Group();
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), n);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(r, r, Hh, 32, 1, true),
    new THREE.MeshPhysicalMaterial({ color: '#d9d2ff', roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.2 }));
  glass.position.y = Hh / 2;
  const fillM = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.66, r * 0.66, Hh * fill, 24), gloss(hex, { emissive: shade(hex, 0.6), envMapIntensity: 0.4 }));
  fillM.position.y = (Hh * fill) / 2 + 0.004;
  const foot = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.012, 0.04, 3, 0.005), gloss('#2b2453', { envMapIntensity: 0.4 }));
  foot.position.y = 0.002;
  const cap = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, 0.0028, 10, 32), gloss(BRAND.lav, { envMapIntensity: 0.5 }));
  cap.rotation.x = Math.PI / 2; cap.position.y = Hh;
  grp.add(foot, fillM, glass, cap);
  if (ticks) for (const t of ticks) {
    const tk = new THREE.Mesh(new THREE.TorusGeometry(r * 1.03, 0.0016, 8, 32), new THREE.MeshBasicMaterial({ color: t <= fill ? '#ffffff' : '#8a80c0', toneMapped: false }));
    tk.rotation.x = Math.PI / 2; tk.position.y = Hh * t + 0.004; grp.add(tk);
  }
  grp.quaternion.copy(q);
  grp.position.copy(base).addScaledVector(n, -(GEM_LIFT - 0.006));
  scene.add(grp);
  // flat white number on a pill above the post, facing the player
  const pill = textPlane(0.085, 0.05, 2600, (ctx, w, h) => {
    rr(ctx, 3, 3, w - 6, h - 6, (h - 6) / 2); ctx.fillStyle = hex; ctx.fill();
    ctx.fillStyle = 'rgba(16,12,31,0.25)'; ctx.fillRect(0, h * 0.62, w, h); // lower shade band
    rr(ctx, 3, 3, w - 6, h - 6, (h - 6) / 2); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(16,12,31,0.55)'; ctx.shadowOffsetY = h * 0.05;
    ctx.font = `${Math.round(h * 0.78)}px "Bebas Neue"`; ctx.fillText(label, w / 2, h / 2 + h * 0.06);
  });
  // clip the pill to its rounded shape via alpha is already transparent outside; mask the shade band outside the pill
  const top = base.clone().addScaledVector(n, Hh - (GEM_LIFT - 0.006) + 0.04);
  facing(pill, top, HEAD, 0);
  scene.add(pill);
}
function stageScreen(scene) {
  const grp = new THREE.Group();
  const bez = slab(SCREEN_W + 0.1, SCREEN_H + 0.1, 0.08, 0.07, gloss('#2b2453', { envMapIntensity: 0.5 }), 0.012);
  const lip = slab(SCREEN_W + 0.08, SCREEN_H + 0.1, 0.08, 0.07, gloss('#14102a', { roughness: 0.5 }), 0.012);
  lip.position.set(0, -0.035, -0.035);
  const face = textPlane(SCREEN_W, SCREEN_H, 900, (ctx, w, h) => {
    rr(ctx, 0, 0, w, h, 40); ctx.save(); ctx.clip();
    const bg = ctx.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0d0a1e'); bg.addColorStop(1, '#17112f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    // LED pixel grid
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 1);
    for (let x = 0; x < w; x += 6) ctx.fillRect(x, 0, 1, h);
    // score block
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(248,248,252,0.6)'; ctx.font = '700 46px Monda'; ctx.fillText('SCORE', 70, 110);
    ctx.fillStyle = '#ffffff'; ctx.font = '330px "Bebas Neue"';
    ctx.shadowColor = 'rgba(232,255,58,0.35)'; ctx.shadowBlur = 30; ctx.fillText('48,250', 58, 400); ctx.shadowBlur = 0;
    for (let i = 0; i < 5; i++) { starPath(ctx, 98 + i * 82, 500, 34, 15); ctx.fillStyle = i < 2 ? BRAND.acid : 'rgba(255,255,255,0.16)'; ctx.fill(); }
    // multiplier block
    const mx = w - 560, my = 70;
    rr(ctx, mx, my, 480, 300, 40); ctx.fillStyle = BRAND.magenta; ctx.fill();
    ctx.fillStyle = 'rgba(16,12,31,0.22)'; ctx.fillRect(mx, my + 190, 480, 110);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '700 40px Monda'; ctx.textAlign = 'center'; ctx.fillText('MULTIPLIER', mx + 240, my + 62);
    ctx.fillStyle = '#ffffff'; ctx.font = '210px "Bebas Neue"'; ctx.shadowColor = 'rgba(16,12,31,0.5)'; ctx.shadowOffsetY = 8; ctx.fillText('×4', mx + 240, my + 262); ctx.shadowOffsetY = 0; ctx.shadowColor = 'transparent';
    // grade
    rr(ctx, w - 560, 410, 480, 110, 55); ctx.fillStyle = BRAND.acid; ctx.fill();
    ctx.fillStyle = BRAND.ink; ctx.font = '96px "Bebas Neue"'; ctx.fillText('PERFECT', w - 320, 500);
    // song progress along the bottom edge
    rr(ctx, 70, h - 120, w - 140, 26, 13); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
    rr(ctx, 70, h - 120, (w - 140) * 0.37, 26, 13); ctx.fillStyle = BRAND.acid; ctx.fill();
    ctx.fillStyle = 'rgba(248,248,252,0.6)'; ctx.font = '700 34px Monda'; ctx.textAlign = 'left'; ctx.fillText('GLASS HIGHWAY · MARLOWE QUINN', 70, h - 140);
    ctx.textAlign = 'right'; ctx.fillText('1:31 / 4:05', w - 70, h - 140);
    ctx.restore();
  }, { side: THREE.FrontSide, depthWrite: true, transparent: true, alphaTest: 0.02, fog: false });
  face.position.z = 0.0405;
  // emitter slot along the bottom edge where the strings leave the screen
  const slot = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.02, 0.03, 2, 0.008), new THREE.MeshBasicMaterial({ color: BRAND.acid, toneMapped: false }));
  slot.position.set(0, -SCREEN_H / 2 - 0.05, 0.03);
  grp.add(lip, bez, face, slot);
  facing(grp, SCREEN_CENTER, HEAD, 0);
  scene.add(grp);
}



// ---------------------------------------------------------------- hand-held guitar (VR preview)
// Like the game's anchored mode: spawn points stay fixed on the stage, the hit points ride on the
// guitar frets. Every HUD mesh is bent in the vertex shader: a point at fraction t along the
// highway (0 = neck, 1 = spawn) moves by (1 - t) of the neck's displacement at its position across
// the highway (linear between the left and right neck edges, so StarLane/PowerLane follow too).
const N_L0 = LANES[4].at(0, -LANE_W / 2, 0), N_R0 = LANES[0].at(0, LANE_W / 2, 0);
const F_L0 = LANES[4].at(1, -LANE_W / 2, 0), F_R0 = LANES[0].at(1, LANE_W / 2, 0);
const WARP = (() => {
  const n0 = N_L0.clone().add(N_R0).multiplyScalar(0.5);
  const a = F_L0.clone().add(F_R0).multiplyScalar(0.5).sub(n0);
  const w = N_R0.clone().sub(N_L0);
  return {
    uRig: { value: new THREE.Matrix4() }, uRigInv: { value: new THREE.Matrix4() },
    uN0: { value: n0 }, uA: { value: a }, uAinv: { value: 1 / a.lengthSq() }, uW: { value: w }, uWinv: { value: 1 / w.lengthSq() },
    uDL: { value: new THREE.Vector3() }, uDR: { value: new THREE.Vector3() },
  };
})();
const WARP_GLSL = `
uniform mat4 uRig; uniform mat4 uRigInv; uniform vec3 uN0; uniform vec3 uA; uniform float uAinv;
uniform vec3 uW; uniform float uWinv; uniform vec3 uDL; uniform vec3 uDR;
vec3 hudWarp(vec3 wp) {
  vec3 p = (uRigInv * vec4(wp, 1.0)).xyz;
  vec3 r = p - uN0;
  float tt = clamp(dot(r, uA) * uAinv, 0.0, 1.0);
  float ss = dot(r, uW) * uWinv + 0.5;
  p += (1.0 - tt) * mix(uDL, uDR, ss);
  return (uRig * vec4(p, 1.0)).xyz;
}
`;
const PROJECT_WARP = `
vec4 mvPosition = vec4( transformed, 1.0 );
vec4 hudWp = modelMatrix * mvPosition;
hudWp.xyz = hudWarp( hudWp.xyz );
mvPosition = viewMatrix * hudWp;
gl_Position = projectionMatrix * mvPosition;
`;
function patchWarp(mat) {
  if (!mat || mat.userData.hudWarp || mat.isLineMaterial) return;
  mat.userData.hudWarp = true;
  if (mat.isShaderMaterial) {
    Object.assign(mat.uniforms, WARP);
    mat.vertexShader = WARP_GLSL + mat.vertexShader.replace(
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
      'vec4 hudWp = modelMatrix * vec4(position, 1.0); hudWp.xyz = hudWarp(hudWp.xyz); gl_Position = projectionMatrix * viewMatrix * hudWp;');
  } else {
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, WARP);
      shader.vertexShader = WARP_GLSL + shader.vertexShader.replace('#include <project_vertex>', PROJECT_WARP);
    };
    mat.customProgramCacheKey = () => 'hudwarp';
  }
  mat.needsUpdate = true;
}
const REST_GZ_SIGN = Math.sign(new THREE.Vector3().crossVectors(FRET_RIGHT, GUP).dot(FACE)) || 1;
// pose: null for the authored rest pose, or { pivot, neck, away } in rig space
export function applyGuitarPose(scene, pose) {
  let pivot = P0, neck = NECK, face = FACE, up = GUP;
  if (pose) {
    pivot = pose.pivot; neck = pose.neck.clone().normalize();
    const vv = UPW.clone().projectOnPlane(neck);
    if (vv.lengthSq() < 1e-6) vv.set(0, 0, 1).projectOnPlane(neck);
    vv.normalize();
    const f0 = new THREE.Vector3().crossVectors(neck, vv).normalize();
    if (pose.away && f0.dot(pose.away) < 0) f0.negate();
    face = f0.clone().multiplyScalar(Math.cos(TILT)).addScaledVector(vv, Math.sin(TILT)).normalize();
    up = vv.clone().multiplyScalar(Math.cos(TILT)).addScaledVector(f0, -Math.sin(TILT)).normalize();
  }
  const right = neck.clone().negate();
  const gz = new THREE.Vector3().crossVectors(right, up).normalize();
  const outer = scene.userData.guitar;
  if (outer) {
    outer.position.copy(pivot);
    outer.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, gz));
    const inner = outer.children[0];
    if (inner) inner.scale.z = gz.dot(face) < 0 ? -1 : 1;
  }
  const frames = FRET_D.map((d, i) => laneFrame(SPAWN[i], pivot.clone().addScaledVector(neck, d).addScaledVector(face, 0.035), right));
  if (scene.userData.anim) scene.userData.anim.frames = pose ? frames : null;
  WARP.uDL.value.copy(frames[4].at(0, -LANE_W / 2, 0)).sub(N_L0);
  WARP.uDR.value.copy(frames[0].at(0, LANE_W / 2, 0)).sub(N_R0);
  const rig = scene.userData.rig;
  if (rig) { rig.updateMatrixWorld(true); WARP.uRig.value.copy(rig.matrixWorld); WARP.uRigInv.value.copy(rig.matrixWorld).invert(); }
}

// ---------------------------------------------------------------- animation step (VR preview)
const NOTE_SPEED = 0.42;   // lane fraction per second: about 2.1 s from spawn to the strike point
const HOLD_TIME = 0.22;    // how long a fret reads as held after a note is hit
export function updateHud(anim, dt) {
  if (!anim) return;
  const frames = anim.frames || LANES;
  const held = anim.held || (anim.held = [0, 0, 0, 0, 0]);
  for (let f = 0; f < 5; f++) held[f] = Math.max(0, held[f] - dt);
  for (const n of anim.notes) {
    const prev = n.t;
    n.t -= NOTE_SPEED * dt;
    if (prev >= CROSS_T && n.t < CROSS_T) held[n.f] = HOLD_TIME; // auto-play hit
    if (n.t < CROSS_T) n.t += 1.65;                              // recycle behind the spawn
    const vis = n.t <= 1.0;
    n.obj.visible = vis;
    if (vis) { n.obj.position.copy(frames[n.f].at(n.t, 0, GEM_LIFT)); n.obj.rotation.y += dt * 1.4; }
  }
  for (const g of anim.ghosts) {
    const h = GEM_LIFT + (held[g.f] > 0 ? 0 : GHOST_RAISE);
    const target = frames[g.f].at(CROSS_T, 0, h);
    g.obj.position.lerp(target, Math.min(1, dt * 20));
  }
  for (const h of anim.halos) { h.obj.visible = held[h.f] > 0; if (h.obj.visible) placeOnLane(h.obj, frames[h.f], CROSS_T, 0.005); }
  for (const l of anim.lanes) {
    const u = l.mat.uniforms;
    u.uvOffset.value.y = (u.uvOffset.value.y - dt * 0.9) % 9;
    if (l.highlight != null) u.highlight.value = held[l.f] > 0 ? l.highlight : 0;
    if (l.tint) u.tintAmt.value = held[l.f] > 0 ? l.tint[1] : l.tint[0];
  }
}

// ---------------------------------------------------------------- entry
const VIEWS = {
  player: { eye: V(0.02, 1.74, -0.3), target: V(0.2, 1.12, 1.4), fov: 64 },
  strike: { eye: V(0.02, 1.74, -0.3), target: null, fov: 26 },
  hud: { eye: V(0.02, 1.74, -0.3), target: null, fov: 24 },
};
export function createHudViewer(canvas, assets, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: !!opts.preserve });
  renderer.setPixelRatio(opts.pixelRatio || Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping; // keep brand colours saturated, like the 2D menu
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const res = new THREE.Vector2(opts.width || 1600, opts.height || 1200);
  const cache = {};
  const lineMats = [];
  if (opts.animate) ANIMATED = true;
  function sceneFor(variant) {
    if (cache[variant]) return cache[variant];
    const scene = new THREE.Scene();
    CUR = opts.animate ? { notes: [], ghosts: [], halos: [], lanes: [] } : null;
    scene.environment = envTex;
    scene.add(new THREE.HemisphereLight('#c9bfff', '#1a1030', 0.45));
    const key = new THREE.DirectionalLight('#ffffff', 1.1); key.position.set(1.5, 4, -1.5); scene.add(key);
    const rim = new THREE.DirectionalLight('#ff4fa8', 0.3); rim.position.set(-3, 2, 5); scene.add(rim);
    buildEnvironment(scene);
    scene.userData.guitar = buildGuitar(scene);
    const hudStart = scene.children.length;
    if (variant === 'before') buildBefore(scene, assets, res);
    else if (variant === 'polish') buildPolish(scene, assets, res);
    else if (variant === 'air') buildAir(scene, assets, res);
    else buildChunky(scene, assets, res, variant);
    if (opts.handTrack && CUR) {
      // everything the variant built bends with the guitar, except the pieces updateHud places itself
      const placed = new Set([...CUR.notes, ...CUR.ghosts, ...CUR.halos].map((e) => e.obj));
      scene.children.slice(hudStart).forEach((o) => {
        if (placed.has(o)) return;
        o.traverse((m) => { if (m.isMesh && m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach(patchWarp); });
      });
    }
    scene.traverse((o) => { if (o.material && o.material.isLineMaterial) lineMats.push(o.material); });
    scene.userData.anim = CUR; CUR = null;
    if (opts.xr) {
      // everything goes under one rig so the whole set-up can be re-centred on the player
      const rig = new THREE.Group();
      [...scene.children].forEach((c) => { if (!c.isLight) rig.add(c); });
      scene.add(rig);
      scene.userData.rig = rig;
    }
    cache[variant] = scene;
    return scene;
  }
  const camera = new THREE.PerspectiveCamera(64, res.x / res.y, 0.02, 120);
  const state = { variant: opts.variant || 'before', view: 'player', yaw: 0, pitch: 0 };
  function baseDir() {
    const v = VIEWS[state.view];
    const hudTarget = state.variant === 'air' ? SCREEN_CENTER : sideLane(STAR_START, STAR_END).at(0.47, 0.17, 0.12);
    const target = v.target || (state.view === 'hud' ? hudTarget : LANES[2].at(0.16, 0, 0.03));
    return target.clone().sub(v.eye).normalize();
  }
  function applyCamera() {
    const v = VIEWS[state.view];
    camera.position.copy(opts.eye || v.eye);
    camera.fov = opts.fov || v.fov;
    camera.aspect = res.x / res.y;
    camera.updateProjectionMatrix();
    let dir = opts.target ? opts.target.clone().sub(camera.position).normalize() : baseDir();
    // look-around: yaw about world up, pitch about camera right
    dir.applyAxisAngle(UPW, state.yaw);
    const right = new THREE.Vector3().crossVectors(dir, UPW).normalize();
    dir.applyAxisAngle(right, state.pitch);
    camera.lookAt(camera.position.clone().add(dir));
  }
  const api = {
    renderer, camera,
    setSize(w, h) {
      res.set(w, h);
      renderer.setSize(w, h, false);
      for (const m of lineMats) m.resolution.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
    },
    setVariant(v) { state.variant = v; },
    setView(name) { state.view = name; state.yaw = 0; state.pitch = 0; },
    look(dYaw, dPitch) {
      state.yaw = THREE.MathUtils.clamp(state.yaw + dYaw, -1.2, 1.2);
      state.pitch = THREE.MathUtils.clamp(state.pitch + dPitch, -0.7, 0.7);
    },
    render() {
      const scene = sceneFor(state.variant);
      for (const m of lineMats) m.resolution.set(res.x * renderer.getPixelRatio(), res.y * renderer.getPixelRatio());
      applyCamera();
      renderer.render(scene, camera);
    },
    prepare(list) { for (const v of list) sceneFor(v); },
    sceneFor,
    get variant() { return state.variant; },
    update(dt) { updateHud(sceneFor(state.variant).userData.anim, dt); },
    setGuitarPose(pose) { applyGuitarPose(sceneFor(state.variant), pose); },
  };
  api.setSize(res.x, res.y);
  return api;
}
export async function renderHud(canvas, variant, assets, opts = {}) {
  const viewer = createHudViewer(canvas, assets, { ...opts, pixelRatio: 1, preserve: true, variant });
  viewer.setVariant(variant);
  if (opts.focus) viewer.setView(opts.focus);
  viewer.render();
  return viewer;
}
export { HEAD };
