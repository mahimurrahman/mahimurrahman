import { useEffect, useRef, useState, useCallback, MouseEvent } from 'react';
import * as THREE from 'three';
import { FOREST_WAYPOINTS, MAHIM_PROFILE, WaypointNode } from '../data/portfolioData';
import ArchitecturalFooterModal from './ArchitecturalFooterModal';
import ContactDrawer from './ContactDrawer';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import ScrollTimelineScrubber from './ScrollTimelineScrubber';
import {
  Compass,
  Sun,
  Moon,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  Cpu,
  Terminal,
  ExternalLink,
  Mail,
  ChevronRight,
  ChevronLeft,
  Navigation,
  Eye,
  User,
  Layers,
  Footprints,
  X,
  Check,
  Keyboard,
  Clock,
  ArrowUpRight,
  Gamepad2
} from 'lucide-react';

export type AtmospherePreset = 'golden-hour' | 'bioluminescent-night' | 'emerald-mist';
export type CameraPerspective = 'third-person' | 'first-person';

interface ForestSanctuary3DProps {
  onSwitchToEditorial: () => void;
  onSwitchToGame?: () => void;
}

// Deterministic pseudo-random generator for reproducible botanical placement
function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Smooth winding forest path X coordinate as a function of Z
export function getPathX(z: number): number {
  return Math.sin(z * 0.042) * 4.5 + Math.cos(z * 0.018) * 1.6;
}

// Procedural elevation of the forest floor as a function of (x, z)
export function getTerrainHeight(x: number, z: number): number {
  const pathCenter = getPathX(z);
  const distFromPath = Math.abs(x - pathCenter);
  // Keep the walking path gently undulating and flat cross-wise, while hills rise on both sides
  const baseWave = Math.sin(z * 0.025) * 0.65 + Math.cos(z * 0.012) * 0.4;
  const hillFactor = Math.min(1, Math.max(0, (distFromPath - 3.0) / 14.0));
  const hills =
    (Math.sin(x * 0.09 + z * 0.06) * 2.4 +
      Math.cos(x * 0.05 - z * 0.08) * 1.8 +
      Math.sin(x * 0.18 + z * 0.15) * 0.6) *
    (hillFactor * hillFactor);
  return baseWave + hills;
}

export default function ForestSanctuary3D({ onSwitchToEditorial, onSwitchToGame }: ForestSanctuary3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Modals & Drawers based on navbar.gallery, footer.design, cta.gallery
  const [activeWaypoint, setActiveWaypoint] = useState<WaypointNode>(FOREST_WAYPOINTS[0]);
  const [inspectedWaypoint, setInspectedWaypoint] = useState<WaypointNode | null>(null);
  const [showReaBlueprintModal, setShowReaBlueprintModal] = useState(false);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [showFooterModal, setShowFooterModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Environment & Player State
  const [progressPercent, setProgressPercent] = useState(0);
  const [atmosphere, setAtmosphere] = useState<AtmospherePreset>('bioluminescent-night');
  const [cameraMode, setCameraMode] = useState<CameraPerspective>('third-person');
  const [isAutoWalking, setIsAutoWalking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isWalkingState, setIsWalkingState] = useState(false);
  const [dhakaTime, setDhakaTime] = useState('');
  const [cardMousePos, setCardMousePos] = useState({ x: 0, y: 0 });

  // Live Dhaka Clock (UTC+6)
  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).format(new Date());
        setDhakaTime(timeStr);
      } catch {
        setDhakaTime('Dhaka BD');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mutable refs for 60fps animation loop access
  const playerStateRef = useRef({
    z: 14, // Starts just before Waypoint 01 (z=10)
    x: getPathX(14),
    y: getTerrainHeight(getPathX(14), 14),
    targetZ: null as number | null,
    velocityZ: 0,
    velocityX: 0,
    heading: 0,
    walkCycle: 0,
    cameraYawOffset: 0,
    cameraPitchOffset: 0.12,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    keys: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false
    }
  });

  const atmosphereRef = useRef<AtmospherePreset>(atmosphere);
  const cameraModeRef = useRef<CameraPerspective>(cameraMode);
  const autoWalkRef = useRef<boolean>(isAutoWalking);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    atmosphereRef.current = atmosphere;
  }, [atmosphere]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    autoWalkRef.current = isAutoWalking;
  }, [isAutoWalking]);

  // Procedural Web Audio API Forest Ambience (wind through leaves + harmonic sanctuary chimes)
  const toggleForestAudio = useCallback(() => {
    if (!audioEnabled) {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.18;
        masterGain.connect(ctx.destination);

        // Pink noise buffer for gentle forest breeze
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.153852;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 380;
        filter.Q.value = 0.7;

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start(0);

        // Warm harmonic drone pad (Fmaj9 botanical sanctuary chord)
        [174.61, 220.0, 261.63, 329.63, 392.0].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.value = freq;
          oscGain.gain.value = 0.035 / (idx + 1);
          osc.connect(oscGain);
          oscGain.connect(masterGain);
          osc.start();
        });

        audioCtxRef.current = ctx;
        audioGainRef.current = masterGain;
        setAudioEnabled(true);
      } catch {
        // Ignore audio errors if blocked
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAudioEnabled(false);
    }
  }, [audioEnabled]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Teleport / Autopilot glide to specific waypoint
  const walkToWaypoint = useCallback((wp: WaypointNode) => {
    playerStateRef.current.targetZ = wp.zPosition + 5.5;
    setIsAutoWalking(false);
    setActiveWaypoint(wp);
  }, []);

  // Scrolltide timeline scrubber handler
  const handleScrubToPercent = useCallback((pct: number) => {
    const targetZ = 14 - (pct / 100) * 220;
    playerStateRef.current.targetZ = targetZ;
    setIsAutoWalking(false);
  }, []);

  // Copy email helper
  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(MAHIM_PROFILE.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCardMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCardMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Main Three.js 4K Procedural Forest Sanctuary setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#041318');
    scene.fog = new THREE.FogExp2('#041318', 0.015);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      260
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    // 2. LIGHTING SYSTEM
    const hemiLight = new THREE.HemisphereLight('#6ee7b7', '#062c22', 0.85);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#a7f3d0', 1.9);
    dirLight.position.set(35, 65, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 220;
    const d = 85;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // 3. SKY DOME WITH PROCEDURAL AURORA / SUNLIGHT SHADER
    const skyGeo = new THREE.SphereGeometry(235, 32, 24);
    const skyUniforms = {
      uTime: { value: 0 },
      uTopColor: { value: new THREE.Color('#020b12') },
      uHorizonColor: { value: new THREE.Color('#092c2e') },
      uGlowColor: { value: new THREE.Color('#2dd4bf') }
    };
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: skyUniforms,
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPos;
        uniform float uTime;
        uniform vec3 uTopColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uGlowColor;

        void main() {
          vec3 dir = normalize(vWorldPos);
          float h = clamp(dir.y, 0.0, 1.0);
          vec3 col = mix(uHorizonColor, uTopColor, pow(h, 0.55));

          // Subtle celestial aurora ribbons in the upper canopy sky
          float aurora = sin(dir.x * 6.0 + uTime * 0.25) * cos(dir.z * 4.0 - uTime * 0.18);
          float auroraMask = smoothstep(0.15, 0.65, h) * smoothstep(0.95, 0.45, h);
          col += uGlowColor * max(0.0, aurora) * auroraMask * 0.22;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // 4. PROCEDURAL FOREST FLOOR & WINDING STONE/MOSS TRAIL
    const terrainWidth = 140;
    const terrainLength = 310;
    const terrainGeo = new THREE.PlaneGeometry(terrainWidth, terrainLength, 140, 280);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    const colors: number[] = [];
    const cPathInner = new THREE.Color('#2d3732');
    const cPathEdge = new THREE.Color('#1a382b');
    const cMoss = new THREE.Color('#0b291e');
    const cDeepForest = new THREE.Color('#051712');
    const tempColor = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i) - 95; // Shift Z range to [-250, +60]
      posAttr.setZ(i, vz);

      const vy = getTerrainHeight(vx, vz);
      posAttr.setY(i, vy);

      const pCenter = getPathX(vz);
      const dist = Math.abs(vx - pCenter);

      if (dist < 1.9) {
        // Stepping stone & golden-moss trail center
        const stoneNoise = Math.sin(vz * 1.4) * Math.cos(vx * 1.8) * 0.5 + 0.5;
        tempColor.copy(cPathInner).lerp(cPathEdge, stoneNoise * 0.45);
      } else if (dist < 4.5) {
        const t = (dist - 1.9) / 2.6;
        tempColor.copy(cPathEdge).lerp(cMoss, t);
      } else {
        const t = Math.min(1, (dist - 4.5) / 22.0);
        tempColor.copy(cMoss).lerp(cDeepForest, t);
      }
      colors.push(tempColor.r, tempColor.g, tempColor.b);
    }
    terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.05
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // 5. STEPPING STONES & LUMINOUS GARDEN PATH MARKERS
    const stoneCount = 190;
    const stoneGeo = new THREE.CylinderGeometry(0.65, 0.78, 0.14, 7);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: '#374740',
      roughness: 0.75,
      metalness: 0.12
    });
    const stonesInstanced = new THREE.InstancedMesh(stoneGeo, stoneMat, stoneCount);
    stonesInstanced.receiveShadow = true;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < stoneCount; i++) {
      const z = 18 - i * 1.28;
      const x = getPathX(z) + (seededRandom(i * 11) - 0.5) * 1.25;
      const y = getTerrainHeight(x, z) + 0.03;
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, seededRandom(i * 17) * Math.PI * 2, 0);
      const sx = 0.75 + seededRandom(i * 23) * 0.65;
      const sz = 0.65 + seededRandom(i * 29) * 0.5;
      dummy.scale.set(sx, 1, sz);
      dummy.updateMatrix();
      stonesInstanced.setMatrixAt(i, dummy.matrix);
    }
    scene.add(stonesInstanced);

    // 6. INSTANCED ANCIENT TREES (TRUNKS + MULTI-TIER SWAYING CANOPIES)
    const treeCount = 420;
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.55, 5.5, 7);
    trunkGeo.translate(0, 2.75, 0);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: '#2b1d14',
      roughness: 0.92
    });

    const canopyGeo1 = new THREE.ConeGeometry(2.6, 5.2, 7);
    canopyGeo1.translate(0, 5.6, 0);
    const canopyGeo2 = new THREE.ConeGeometry(2.0, 4.4, 7);
    canopyGeo2.translate(0, 8.0, 0);
    const canopyGeo3 = new THREE.ConeGeometry(1.3, 3.4, 7);
    canopyGeo3.translate(0, 10.1, 0);

    const canopyMat = new THREE.MeshStandardMaterial({
      color: '#0f3d29',
      roughness: 0.78,
      metalness: 0.04,
      flatShading: true
    });

    const trunksMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
    const canopyMesh1 = new THREE.InstancedMesh(canopyGeo1, canopyMat, treeCount);
    const canopyMesh2 = new THREE.InstancedMesh(canopyGeo2, canopyMat, treeCount);
    const canopyMesh3 = new THREE.InstancedMesh(canopyGeo3, canopyMat, treeCount);

    trunksMesh.castShadow = true;
    canopyMesh1.castShadow = true;
    canopyMesh2.castShadow = true;

    const cColor = new THREE.Color();
    let placedTrees = 0;
    for (let i = 0; i < treeCount * 2 && placedTrees < treeCount; i++) {
      const z = 30 - seededRandom(i * 3 + 1) * 265;
      const side = seededRandom(i * 3 + 2) > 0.5 ? 1 : -1;
      const distFromCenter = 4.6 + Math.pow(seededRandom(i * 3 + 3), 1.35) * 48;
      const x = getPathX(z) + side * distFromCenter;

      // Avoid placing trees directly on top of waypoint clearings
      const nearWaypoint = FOREST_WAYPOINTS.some(
        (wp) => Math.hypot(x - (getPathX(wp.zPosition) + wp.xOffset), z - wp.zPosition) < 6.8
      );
      if (nearWaypoint) continue;

      const y = getTerrainHeight(x, z) - 0.15;
      const scale = 0.75 + seededRandom(i * 7) * 1.45;
      dummy.position.set(x, y, z);
      dummy.rotation.set(
        (seededRandom(i * 13) - 0.5) * 0.06,
        seededRandom(i * 19) * Math.PI * 2,
        (seededRandom(i * 23) - 0.5) * 0.06
      );
      dummy.scale.set(scale, scale * (0.9 + seededRandom(i * 31) * 0.35), scale);
      dummy.updateMatrix();

      trunksMesh.setMatrixAt(placedTrees, dummy.matrix);
      canopyMesh1.setMatrixAt(placedTrees, dummy.matrix);
      canopyMesh2.setMatrixAt(placedTrees, dummy.matrix);
      canopyMesh3.setMatrixAt(placedTrees, dummy.matrix);

      // Rich botanical variation in foliage hues (deep emerald, jade, warm moss)
      cColor.setHSL(
        0.38 + (seededRandom(i * 41) - 0.5) * 0.08,
        0.58 + seededRandom(i * 43) * 0.2,
        0.14 + seededRandom(i * 47) * 0.12
      );
      canopyMesh1.setColorAt(placedTrees, cColor);
      canopyMesh2.setColorAt(placedTrees, cColor.clone().offsetHSL(0.01, 0, 0.03));
      canopyMesh3.setColorAt(placedTrees, cColor.clone().offsetHSL(0.02, 0, 0.06));

      placedTrees++;
    }
    scene.add(trunksMesh, canopyMesh1, canopyMesh2, canopyMesh3);

    // 7. BIOLUMINESCENT FERNS, FLOWERS & CRYSTALLINE FLORA ALONG THE GARDEN BORDERS
    const floraCount = 650;
    const floraGeo = new THREE.DodecahedronGeometry(0.32, 0);
    floraGeo.scale(1, 0.65, 1);
    const floraMat = new THREE.MeshStandardMaterial({
      color: '#10b981',
      emissive: '#059669',
      emissiveIntensity: 0.65,
      roughness: 0.4
    });
    const floraInstanced = new THREE.InstancedMesh(floraGeo, floraMat, floraCount);

    for (let i = 0; i < floraCount; i++) {
      const z = 25 - seededRandom(i * 5 + 9) * 250;
      const side = seededRandom(i * 5 + 10) > 0.5 ? 1 : -1;
      const offset = 2.0 + seededRandom(i * 5 + 11) * 16.0;
      const x = getPathX(z) + side * offset;
      const y = getTerrainHeight(x, z) + 0.1;

      dummy.position.set(x, y, z);
      dummy.rotation.set(0, seededRandom(i * 15) * Math.PI, 0);
      const s = 0.5 + seededRandom(i * 19) * 1.3;
      dummy.scale.set(s, s * 0.8, s);
      dummy.updateMatrix();
      floraInstanced.setMatrixAt(i, dummy.matrix);

      const huePick = seededRandom(i * 37);
      if (huePick < 0.55) {
        cColor.set('#10b981'); // Emerald fern
      } else if (huePick < 0.82) {
        cColor.set('#2dd4bf'); // Bioluminescent cyan blossom
      } else {
        cColor.set('#f59e0b'); // Golden lotus bud
      }
      floraInstanced.setColorAt(i, cColor);
    }
    scene.add(floraInstanced);

    // 8. VOLUMETRIC SUNBEAMS / GOD-RAYS BREAKING THROUGH THE CANOPY
    const sunbeamGroup = new THREE.Group();
    const beamGeo = new THREE.ConeGeometry(4.5, 32, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: '#6ee7b7',
      transparent: true,
      opacity: 0.045,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 18; i++) {
      const z = 12 - i * 13;
      const x = getPathX(z) + (seededRandom(i * 99) - 0.5) * 8;
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(x, 14, z);
      beam.rotation.z = -0.22;
      beam.rotation.x = 0.1;
      sunbeamGroup.add(beam);
    }
    scene.add(sunbeamGroup);

    // 9. WAYPOINT ARCHITECTURAL SHRINES & HOLOGRAPHIC MONOLITHS
    const waypointMeshes: {
      node: WaypointNode;
      group: THREE.Group;
      ring: THREE.Mesh;
      core: THREE.Mesh;
      light: THREE.PointLight;
    }[] = [];

    // Load Mahim's portrait texture for the Sanctuary Gate & Summit shrines
    const texLoader = new THREE.TextureLoader();
    const portraitTex = texLoader.load('/refined_mahim_portrait.jpg');
    portraitTex.colorSpace = THREE.SRGBColorSpace;

    FOREST_WAYPOINTS.forEach((wp, idx) => {
      const group = new THREE.Group();
      const wx = getPathX(wp.zPosition) + wp.xOffset;
      const wz = wp.zPosition;
      const wy = getTerrainHeight(wx, wz);
      group.position.set(wx, wy, wz);

      // Rotate shrine slightly toward the walking path
      const lookTargetX = getPathX(wp.zPosition + 2);
      group.lookAt(lookTargetX, wy, wp.zPosition + 2);

      // Stepped stone sanctuary dais
      const baseGeo = new THREE.CylinderGeometry(2.7, 3.2, 0.35, 8);
      const baseMat = new THREE.MeshStandardMaterial({
        color: '#1e2925',
        roughness: 0.6,
        metalness: 0.25
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.17;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Glowing rune ring embedded in the stone dais
      const daisRingGeo = new THREE.RingGeometry(2.1, 2.35, 32);
      daisRingGeo.rotateX(-Math.PI / 2);
      const daisRingMat = new THREE.MeshBasicMaterial({
        color: wp.accentColor,
        side: THREE.DoubleSide
      });
      const daisRing = new THREE.Mesh(daisRingGeo, daisRingMat);
      daisRing.position.y = 0.36;
      group.add(daisRing);

      // Twin obsidian monolith pillars
      const pillarGeo = new THREE.BoxGeometry(0.38, 4.2, 0.38);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: '#0f1715',
        roughness: 0.3,
        metalness: 0.7
      });
      const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
      leftPillar.position.set(-1.65, 2.2, 0);
      leftPillar.castShadow = true;
      const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
      rightPillar.position.set(1.65, 2.2, 0);
      rightPillar.castShadow = true;
      group.add(leftPillar, rightPillar);

      // Top archway beam
      const archGeo = new THREE.BoxGeometry(4.1, 0.35, 0.5);
      const archMesh = new THREE.Mesh(archGeo, pillarMat);
      archMesh.position.set(0, 4.35, 0);
      group.add(archMesh);

      // Rotating orbital torus ring
      const ringGeo = new THREE.TorusGeometry(1.15, 0.045, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: wp.accentColor,
        emissive: wp.accentColor,
        emissiveIntensity: 1.4,
        roughness: 0.2,
        metalness: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(0, 2.35, 0);
      group.add(ringMesh);

      // Centerpiece: Portrait frame on Gate (idx 0), REA Polyhedron on Citadel (idx 1), etc.
      let coreMesh: THREE.Mesh;
      if (idx === 0) {
        const frameGeo = new THREE.PlaneGeometry(1.5, 1.9);
        const frameMat = new THREE.MeshBasicMaterial({
          map: portraitTex,
          side: THREE.DoubleSide
        });
        coreMesh = new THREE.Mesh(frameGeo, frameMat);
      } else if (idx === 1) {
        // REA Binary Decompiler Icosahedron Core with wireframe cage
        const icoGeo = new THREE.IcosahedronGeometry(0.72, 1);
        const icoMat = new THREE.MeshStandardMaterial({
          color: wp.accentColor,
          emissive: wp.accentColor,
          emissiveIntensity: 0.9,
          wireframe: true
        });
        coreMesh = new THREE.Mesh(icoGeo, icoMat);
      } else {
        const octGeo = new THREE.OctahedronGeometry(0.68, 0);
        const octMat = new THREE.MeshStandardMaterial({
          color: wp.accentColor,
          emissive: wp.accentColor,
          emissiveIntensity: 0.85,
          roughness: 0.15,
          metalness: 0.9,
          flatShading: true
        });
        coreMesh = new THREE.Mesh(octGeo, octMat);
      }
      coreMesh.position.set(0, 2.35, 0);
      group.add(coreMesh);

      // Dedicated Pond of Reflections mirror water at Waypoint 05 (idx === 4)
      if (idx === 4) {
        const pondGeo = new THREE.CircleGeometry(5.5, 48);
        pondGeo.rotateX(-Math.PI / 2);
        const pondMat = new THREE.MeshStandardMaterial({
          color: '#0d3b3e',
          emissive: '#06282a',
          emissiveIntensity: 0.4,
          roughness: 0.08,
          metalness: 0.85
        });
        const pondMesh = new THREE.Mesh(pondGeo, pondMat);
        pondMesh.position.set(-2.2, 0.08, 1.5);
        group.add(pondMesh);
      }

      // Shrine point light
      const light = new THREE.PointLight(wp.accentColor, 3.2, 16);
      light.position.set(0, 2.6, 0.8);
      group.add(light);

      scene.add(group);
      waypointMeshes.push({
        node: wp,
        group,
        ring: ringMesh,
        core: coreMesh,
        light
      });
    });

    // 10. ARTICULATED 3D EXPLORER AVATAR (MAHIM WALKING THROUGH THE FOREST)
    const avatarGroup = new THREE.Group();

    const cloakMat = new THREE.MeshStandardMaterial({
      color: '#111827',
      roughness: 0.5,
      metalness: 0.3
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: '#2dd4bf',
      emissive: '#2dd4bf',
      emissiveIntensity: 0.85
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: '#d6a886',
      roughness: 0.6
    });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.68, 0.26), cloakMat);
    torso.position.y = 1.12;
    torso.castShadow = true;
    avatarGroup.add(torso);

    // Glowing cyber-botanical backpack / beacon unit on back
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.16), trimMat);
    pack.position.set(0, 1.15, 0.18);
    avatarGroup.add(pack);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), skinMat);
    head.position.y = 1.64;
    head.castShadow = true;
    avatarGroup.add(head);

    // Hair / Hood cap
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.205, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
      cloakMat
    );
    hair.position.y = 1.66;
    avatarGroup.add(hair);

    // Articulated limbs (pivoted at shoulder / hip)
    const createLimb = (w: number, h: number, d: number, x: number, y: number) => {
      const pivot = new THREE.Group();
      pivot.position.set(x, y, 0);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cloakMat);
      mesh.position.y = -h / 2;
      mesh.castShadow = true;
      pivot.add(mesh);
      avatarGroup.add(pivot);
      return pivot;
    };

    const leftLeg = createLimb(0.16, 0.72, 0.16, -0.13, 0.76);
    const rightLeg = createLimb(0.16, 0.72, 0.16, 0.13, 0.76);
    const leftArm = createLimb(0.13, 0.62, 0.13, -0.32, 1.42);
    const rightArm = createLimb(0.13, 0.62, 0.13, 0.32, 1.42);

    // Explorer lantern held by right arm
    const lanternOrb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), trimMat);
    lanternOrb.position.set(0, -0.66, -0.1);
    rightArm.add(lanternOrb);

    const avatarLight = new THREE.PointLight('#34d399', 2.2, 11);
    avatarLight.position.set(0, 1.5, -0.4);
    avatarGroup.add(avatarLight);

    scene.add(avatarGroup);

    // 11. BIOLUMINESCENT FIREFLIES & FLOATING POLLEN PARTICLE FIELD
    const fireflyCount = 750;
    const fireflyGeo = new THREE.BufferGeometry();
    const ffPositions = new Float32Array(fireflyCount * 3);
    const ffPhases = new Float32Array(fireflyCount);

    for (let i = 0; i < fireflyCount; i++) {
      const z = 25 - seededRandom(i * 11 + 3) * 255;
      const x = getPathX(z) + (seededRandom(i * 11 + 5) - 0.5) * 44;
      const y = getTerrainHeight(x, z) + 0.4 + seededRandom(i * 11 + 7) * 9.0;
      ffPositions[i * 3] = x;
      ffPositions[i * 3 + 1] = y;
      ffPositions[i * 3 + 2] = z;
      ffPhases[i] = seededRandom(i * 19) * Math.PI * 2;
    }
    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(ffPositions, 3));
    fireflyGeo.setAttribute('aPhase', new THREE.BufferAttribute(ffPhases, 1));

    const fireflyUniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#6ee7b7') }
    };

    const fireflyMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: fireflyUniforms,
      vertexShader: `
        attribute float aPhase;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * 1.4 + aPhase) * 0.45;
          p.x += cos(uTime * 0.9 + aPhase) * 0.35;
          vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPos;
          gl_PointSize = clamp(110.0 / -mvPos.z, 2.0, 11.0);
          vAlpha = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 2.6 + aPhase * 2.0));
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        uniform vec3 uColor;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;
          float glow = smoothstep(0.5, 0.05, d);
          gl_FragColor = vec4(uColor, glow * vAlpha);
        }
      `
    });
    const fireflyPoints = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflyPoints);

    // 12. INPUT LISTENERS (KEYBOARD, SCROLL WHEEL, POINTER DRAG)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore navigation keys if typing in input
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      const k = e.key.toLowerCase();
      const st = playerStateRef.current;

      // Close modals on Escape
      if (e.key === 'Escape') {
        setInspectedWaypoint(null);
        setShowReaBlueprintModal(false);
        setShowContactDrawer(false);
        setShowFooterModal(false);
        setShowShortcutsModal(false);
        return;
      }

      // Hotkey: Space toggles auto-walk stroll
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        setIsAutoWalking((prev) => !prev);
        return;
      }

      // Hotkey: M toggles forest audio
      if (k === 'm' && !e.repeat) {
        toggleForestAudio();
        return;
      }

      // Hotkey: C toggles camera perspective
      if (k === 'c' && !e.repeat) {
        setCameraMode((prev) => (prev === 'third-person' ? 'first-person' : 'third-person'));
        return;
      }

      // Hotkey: F toggles architectural footer (footer.design)
      if (k === 'f' && !e.repeat) {
        setShowFooterModal((prev) => !prev);
        return;
      }

      // Hotkey: ? toggles keyboard guide (styles.refero.design)
      if ((e.key === '?' || e.key === '/') && !e.repeat) {
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // Hotkey: 1 to 6 jumps to shrines
      if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (FOREST_WAYPOINTS[idx]) {
          walkToWaypoint(FOREST_WAYPOINTS[idx]);
        }
        return;
      }

      if (k === 'w' || e.key === 'ArrowUp') {
        st.keys.forward = true;
        st.targetZ = null;
      }
      if (k === 's' || e.key === 'ArrowDown') {
        st.keys.backward = true;
        st.targetZ = null;
      }
      if (k === 'a' || e.key === 'ArrowLeft') {
        st.keys.left = true;
      }
      if (k === 'd' || e.key === 'ArrowRight') {
        st.keys.right = true;
      }
      if (e.key === 'Shift') {
        st.keys.sprint = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const st = playerStateRef.current;
      if (k === 'w' || e.key === 'ArrowUp') st.keys.forward = false;
      if (k === 's' || e.key === 'ArrowDown') st.keys.backward = false;
      if (k === 'a' || e.key === 'ArrowLeft') st.keys.left = false;
      if (k === 'd' || e.key === 'ArrowRight') st.keys.right = false;
      if (e.key === 'Shift') st.keys.sprint = false;
    };

    const handleWheel = (e: WheelEvent) => {
      const st = playerStateRef.current;
      st.targetZ = null;
      st.velocityZ -= e.deltaY * 0.0085;
      st.velocityZ = Math.max(-18, Math.min(18, st.velocityZ));
    };

    const handlePointerDown = (e: MouseEvent<HTMLDivElement> | globalThis.MouseEvent) => {
      const st = playerStateRef.current;
      st.isDragging = true;
      st.lastMouseX = e.clientX;
      st.lastMouseY = e.clientY;
    };

    const handlePointerMove = (e: globalThis.MouseEvent) => {
      const st = playerStateRef.current;
      if (!st.isDragging) return;
      const dx = e.clientX - st.lastMouseX;
      const dy = e.clientY - st.lastMouseY;
      st.lastMouseX = e.clientX;
      st.lastMouseY = e.clientY;
      st.cameraYawOffset = Math.max(-1.25, Math.min(1.25, st.cameraYawOffset - dx * 0.0045));
      st.cameraPitchOffset = Math.max(-0.15, Math.min(0.65, st.cameraPitchOffset + dy * 0.0035));
    };

    const handlePointerUp = () => {
      playerStateRef.current.isDragging = false;
    };

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const domElem = renderer.domElement;
    domElem.addEventListener('wheel', handleWheel, { passive: true });
    domElem.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('resize', handleResize);

    // 13. REAL-TIME ANIMATION LOOP
    const clock = new THREE.Clock();
    let animFrameId = 0;
    let lastNearestId = FOREST_WAYPOINTS[0].id;
    let lastWalkBool = false;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Update atmosphere colors smoothly
      const preset = atmosphereRef.current;
      if (preset === 'golden-hour') {
        scene.fog?.color.lerp(new THREE.Color('#1f1912'), 0.05);
        skyUniforms.uTopColor.value.lerp(new THREE.Color('#0f172a'), 0.05);
        skyUniforms.uHorizonColor.value.lerp(new THREE.Color('#452715'), 0.05);
        skyUniforms.uGlowColor.value.lerp(new THREE.Color('#f59e0b'), 0.05);
        dirLight.color.lerp(new THREE.Color('#fde68a'), 0.05);
        dirLight.intensity = THREE.MathUtils.lerp(dirLight.intensity, 2.5, 0.05);
        fireflyUniforms.uColor.value.lerp(new THREE.Color('#fbbf24'), 0.05);
      } else if (preset === 'emerald-mist') {
        scene.fog?.color.lerp(new THREE.Color('#07221d'), 0.05);
        skyUniforms.uTopColor.value.lerp(new THREE.Color('#041715'), 0.05);
        skyUniforms.uHorizonColor.value.lerp(new THREE.Color('#0e3a2f'), 0.05);
        skyUniforms.uGlowColor.value.lerp(new THREE.Color('#10b981'), 0.05);
        dirLight.color.lerp(new THREE.Color('#a7f3d0'), 0.05);
        dirLight.intensity = THREE.MathUtils.lerp(dirLight.intensity, 1.8, 0.05);
        fireflyUniforms.uColor.value.lerp(new THREE.Color('#34d399'), 0.05);
      } else {
        // bioluminescent-night
        scene.fog?.color.lerp(new THREE.Color('#030f14'), 0.05);
        skyUniforms.uTopColor.value.lerp(new THREE.Color('#02080d'), 0.05);
        skyUniforms.uHorizonColor.value.lerp(new THREE.Color('#062329'), 0.05);
        skyUniforms.uGlowColor.value.lerp(new THREE.Color('#2dd4bf'), 0.05);
        dirLight.color.lerp(new THREE.Color('#5eead4'), 0.05);
        dirLight.intensity = THREE.MathUtils.lerp(dirLight.intensity, 1.35, 0.05);
        fireflyUniforms.uColor.value.lerp(new THREE.Color('#5eead4'), 0.05);
      }

      skyUniforms.uTime.value = elapsed;
      fireflyUniforms.uTime.value = elapsed;

      // Player physics & movement along the winding sanctuary path
      const st = playerStateRef.current;
      const speedMult = st.keys.sprint ? 15.5 : 9.2;

      if (st.targetZ !== null) {
        const diff = st.targetZ - st.z;
        if (Math.abs(diff) < 0.35) {
          st.targetZ = null;
          st.velocityZ = 0;
        } else {
          st.velocityZ = THREE.MathUtils.clamp(diff * 2.4, -15, 15);
        }
      } else if (autoWalkRef.current) {
        st.velocityZ = -6.8;
        if (st.z <= -205) {
          st.z = 14; // Loop gently back to sanctuary entrance
        }
      } else {
        let inputZ = 0;
        if (st.keys.forward) inputZ -= 1;
        if (st.keys.backward) inputZ += 1;
        if (inputZ !== 0) {
          st.velocityZ = THREE.MathUtils.lerp(st.velocityZ, inputZ * speedMult, 0.14);
        } else {
          st.velocityZ *= 0.88;
        }
      }

      let inputX = 0;
      if (st.keys.left) inputX -= 1;
      if (st.keys.right) inputX += 1;
      if (inputX !== 0) {
        st.velocityX = THREE.MathUtils.lerp(st.velocityX, inputX * 5.5, 0.15);
      } else {
        // Gently guide walker back toward the stone trail centerline when walking forward
        const idealX = getPathX(st.z);
        const pullToTrail = Math.abs(st.velocityZ) > 0.2 ? (idealX - st.x) * 2.2 : 0;
        st.velocityX = THREE.MathUtils.lerp(st.velocityX, pullToTrail, 0.1);
      }

      st.z = THREE.MathUtils.clamp(st.z + st.velocityZ * dt, -212, 18);
      const pathCenterNow = getPathX(st.z);
      st.x = THREE.MathUtils.clamp(
        st.x + st.velocityX * dt,
        pathCenterNow - 8.5,
        pathCenterNow + 8.5
      );
      st.y = getTerrainHeight(st.x, st.z);

      const totalSpeed = Math.hypot(st.velocityZ, st.velocityX);
      const isMoving = totalSpeed > 0.25;
      if (isMoving !== lastWalkBool) {
        lastWalkBool = isMoving;
        setIsWalkingState(isMoving);
      }

      // Compute forward tangent along the path for natural character orientation
      const lookAheadZ = st.z + (st.velocityZ <= 0.1 ? -1.8 : 1.8);
      const lookAheadX = getPathX(lookAheadZ) + st.velocityX * 0.15;
      const targetHeading = Math.atan2(lookAheadX - st.x, lookAheadZ - st.z);
      st.heading = THREE.MathUtils.lerp(st.heading, targetHeading, 0.12);

      // Update 3D Explorer Avatar transform & procedural walk cycle
      avatarGroup.position.set(st.x, st.y, st.z);
      avatarGroup.rotation.y = st.heading + Math.PI; // Face walking direction
      avatarGroup.visible = cameraModeRef.current === 'third-person';

      if (isMoving) {
        st.walkCycle += dt * (4.5 + totalSpeed * 0.55);
        const swing = Math.sin(st.walkCycle) * Math.min(0.65, totalSpeed * 0.08);
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        leftArm.rotation.x = -swing * 0.75;
        rightArm.rotation.x = swing * 0.75;
        avatarGroup.position.y = st.y + Math.abs(Math.cos(st.walkCycle)) * 0.06;
      } else {
        // Gentle breathing idle animation
        leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.15);
        rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.15);
        leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, 0.15);
        rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, 0.15);
        avatarGroup.position.y = st.y + Math.sin(elapsed * 2.0) * 0.02;
      }

      // Slowly relax camera yaw offset when not dragging
      if (!st.isDragging) {
        st.cameraYawOffset = THREE.MathUtils.lerp(st.cameraYawOffset, 0, 0.03);
      }

      // Position Camera (Third-Person Cinematic Follow vs First-Person Immersive Eye)
      if (cameraModeRef.current === 'third-person') {
        const camDist = 6.2;
        const camAngle = st.cameraYawOffset;
        const targetCamX = st.x + Math.sin(camAngle) * camDist;
        const targetCamZ = st.z + Math.cos(camAngle) * camDist;
        const targetCamY = st.y + 2.65 + st.cameraPitchOffset * 4.0;

        camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.1);
        const lookAtTarget = new THREE.Vector3(
          getPathX(st.z - 6),
          st.y + 1.45,
          st.z - 6
        );
        camera.lookAt(lookAtTarget);
      } else {
        const eyePos = new THREE.Vector3(st.x, st.y + 1.72, st.z - 0.15);
        camera.position.lerp(eyePos, 0.22);
        const lookDirX =
          st.x - Math.sin(st.cameraYawOffset) * 12 + (getPathX(st.z - 10) - st.x) * 0.6;
        const lookDirY = st.y + 1.6 - st.cameraPitchOffset * 5.0;
        const lookDirZ = st.z - Math.cos(st.cameraYawOffset) * 12;
        camera.lookAt(lookDirX, lookDirY, lookDirZ);
      }

      // Animate Waypoint Shrines & Check Closest Shrine
      let closestWp = FOREST_WAYPOINTS[0];
      let minDist = Infinity;

      waypointMeshes.forEach((wm, idx) => {
        wm.ring.rotation.z = elapsed * 0.45 + idx;
        wm.ring.rotation.x = Math.sin(elapsed * 0.6 + idx) * 0.25;
        if (idx !== 0) {
          wm.core.rotation.y = elapsed * 0.7;
          wm.core.rotation.x = elapsed * 0.35;
        }
        wm.core.position.y = 2.35 + Math.sin(elapsed * 1.8 + idx) * 0.12;

        const d = Math.abs(st.z - wm.node.zPosition);
        if (d < minDist) {
          minDist = d;
          closestWp = wm.node;
        }
      });

      if (closestWp.id !== lastNearestId) {
        lastNearestId = closestWp.id;
        setActiveWaypoint(closestWp);
      }

      // Update trail progress percentage (from z=14 to z=-206)
      const pct = Math.round(THREE.MathUtils.clamp(((14 - st.z) / 220) * 100, 0, 100));
      setProgressPercent(pct);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      domElem.removeEventListener('wheel', handleWheel);
      domElem.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const currentIndex = FOREST_WAYPOINTS.findIndex((w) => w.id === activeWaypoint.id);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#030f14] text-[#f5f5f5] select-none font-sans">
      {/* 3D WebGL Viewport Container */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Subtle Cinematic Vignette Overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 55%, rgba(2, 10, 14, 0.72) 100%)'
        }}
      />

      {/* 1. TOP FLOATING ISLAND NAVBAR (Navbar.gallery + Styles.refero.design standard) */}
      <header className="fixed top-0 left-0 right-0 z-30 flex flex-wrap items-center justify-between gap-3 px-4 md:px-8 py-3.5 pointer-events-none">
        {/* Left: Identity Pill with Live Dhaka Clock & Availability Status */}
        <div className="pointer-events-auto flex items-center gap-3 bg-[#030d12]/85 backdrop-blur-2xl border border-white/10 rounded-full pl-2 pr-4 py-1.5 shadow-2xl shadow-black/70">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-emerald-400/50 shrink-0 bg-gradient-to-br from-emerald-500/30 to-teal-900 flex items-center justify-center">
            <span className="font-mono text-xs font-bold text-emerald-300">MRK</span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#030d12] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">
                {MAHIM_PROFILE.name}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Available for AI Systems
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-mono">
              <Compass className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-200/90 truncate">{activeWaypoint.biome}</span>
              <span className="opacity-30">&bull;</span>
              <span className="text-white/80 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-500" />
                {dhakaTime} GMT+6
              </span>
            </div>
          </div>
        </div>

        {/* Center: Shrine Stepper Breadcrumbs (navbar.gallery segment switcher) */}
        <nav className="pointer-events-auto hidden xl:flex items-center gap-1 bg-[#030d12]/85 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 shadow-2xl shadow-black/70">
          {FOREST_WAYPOINTS.map((wp) => {
            const isActive = wp.id === activeWaypoint.id;
            return (
              <button
                key={wp.id}
                onClick={() => walkToWaypoint(wp)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-400 text-[#041318] font-semibold shadow-md shadow-emerald-400/20'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{wp.number}</span>
                <span>{wp.title.replace(/^The\s+/i, '').split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Interactive Controls (Sound EQ, REA Blueprint, Atmosphere, Camera, Connect, Shortcuts) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Audio Soundscape Toggle with Animated EQ Equalizer Bars */}
          <button
            onClick={toggleForestAudio}
            className={`px-3 py-2 rounded-full border backdrop-blur-2xl transition-all flex items-center gap-2 text-xs font-mono cursor-pointer ${
              audioEnabled
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-md shadow-emerald-500/20'
                : 'bg-[#030d12]/85 border-white/10 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Procedural Forest Breeze & Sanctuary Audio (Hotkey: M)"
          >
            {audioEnabled ? (
              <>
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-emerald-400 animate-pulse" />
                  <span className="w-0.5 h-3 bg-emerald-300 animate-pulse delay-75" />
                  <span className="w-0.5 h-1.5 bg-emerald-400 animate-pulse delay-150" />
                </div>
                <span className="hidden sm:inline">Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Audio</span>
              </>
            )}
          </button>

          {/* Dedicated REA Reverse Engineering Blueprint Trigger */}
          <button
            onClick={() => setShowReaBlueprintModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-teal-500/15 hover:bg-teal-500/25 text-teal-200 border border-teal-400/35 backdrop-blur-2xl transition-all cursor-pointer shadow-lg"
            title="Inspect REA (morluto/rea) Reverse Engineering System Architecture"
          >
            <Cpu className="w-3.5 h-3.5 text-teal-300" />
            <span className="hidden sm:inline">REA Matrix</span>
          </button>

          {/* Atmosphere Preset Cycle */}
          <button
            onClick={() =>
              setAtmosphere((prev) =>
                prev === 'bioluminescent-night'
                  ? 'golden-hour'
                  : prev === 'golden-hour'
                  ? 'emerald-mist'
                  : 'bioluminescent-night'
              )
            }
            className="p-2.5 rounded-full bg-[#030d12]/85 hover:bg-[#071d24] border border-white/10 text-emerald-300 backdrop-blur-2xl transition-colors cursor-pointer"
            title={`Atmosphere: ${atmosphere} (Click to cycle)`}
          >
            {atmosphere === 'golden-hour' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : atmosphere === 'emerald-mist' ? (
              <Sparkles className="w-4 h-4 text-emerald-300" />
            ) : (
              <Moon className="w-4 h-4 text-teal-300" />
            )}
          </button>

          {/* 1st / 3rd Person Camera Toggle (Hotkey: C) */}
          <button
            onClick={() =>
              setCameraMode((prev) =>
                prev === 'third-person' ? 'first-person' : 'third-person'
              )
            }
            className="px-3 py-2 rounded-full bg-[#030d12]/85 hover:bg-[#071d24] border border-white/10 text-xs text-neutral-200 flex items-center gap-1.5 backdrop-blur-2xl transition-colors cursor-pointer"
            title="Switch between 3rd-Person Avatar Walk and 1st-Person Forest View (Hotkey: C)"
          >
            {cameraMode === 'third-person' ? (
              <>
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">3rd Person</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden md:inline">1st Person</span>
              </>
            )}
          </button>

          {/* Direct CTA: Connect Drawer (cta.gallery standard) */}
          <button
            onClick={() => setShowContactDrawer(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-400 hover:bg-emerald-300 text-[#041318] font-semibold text-xs transition-all shadow-md shadow-emerald-950/60 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Connect</span>
          </button>

          {/* Architectural Footer Trigger (footer.design standard, Hotkey: F) */}
          <button
            onClick={() => setShowFooterModal(true)}
            className="p-2.5 rounded-full bg-[#030d12]/85 hover:bg-[#071d24] border border-white/10 text-neutral-300 hover:text-white backdrop-blur-2xl transition-colors cursor-pointer"
            title="Open Architectural Footer & Sitemap (Hotkey: F)"
          >
            <Navigation className="w-4 h-4" />
          </button>

          {/* Keyboard Shortcuts Guide Helper (styles.refero.design standard, Hotkey: ?) */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-2.5 rounded-full bg-[#030d12]/85 hover:bg-[#071d24] border border-white/10 text-neutral-300 hover:text-white backdrop-blur-2xl transition-colors cursor-pointer"
            title="Keyboard & Navigation Shortcuts Guide (Hotkey: ?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Switch to 3D Cyber Citadel Game */}
          {onSwitchToGame && (
            <button
              onClick={onSwitchToGame}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-teal-400 hover:bg-teal-300 text-[#02070a] font-semibold text-xs transition-all shadow-md cursor-pointer"
              title="Launch 3D Cyber Citadel Rover Game"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D Game</span>
            </button>
          )}

          {/* Switch to Classic 2D Editorial View */}
          <button
            onClick={onSwitchToEditorial}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-medium backdrop-blur-2xl transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2D View</span>
          </button>
        </div>
      </header>

      {/* 2. LEFT SIDEBAR: INTERACTIVE FOREST TRAIL MINIMAP & CONTROLS */}
      <aside className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-3 pointer-events-auto">
        <div className="bg-[#030d12]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 w-60 shadow-2xl shadow-black/80">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-300/90 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Trail Navigation
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              0{currentIndex + 1} / 0{FOREST_WAYPOINTS.length}
            </span>
          </div>

          <div className="relative flex flex-col gap-2 pl-3 border-l border-emerald-500/25">
            {FOREST_WAYPOINTS.map((wp) => {
              const isCurrent = wp.id === activeWaypoint.id;
              return (
                <button
                  key={wp.id}
                  onClick={() => walkToWaypoint(wp)}
                  className={`group relative text-left transition-all cursor-pointer py-1 ${
                    isCurrent ? 'opacity-100' : 'opacity-55 hover:opacity-90'
                  }`}
                >
                  <span
                    className={`absolute -left-[17px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-emerald-400 scale-125 ring-4 ring-emerald-400/20'
                        : 'bg-neutral-600 group-hover:bg-emerald-300'
                    }`}
                  />
                  <div className="text-xs font-medium text-white truncate">{wp.title}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{wp.biome}</div>
                </button>
              );
            })}
          </div>

          {/* Autopilot Stroll Toggle (Hotkey: Space) */}
          <button
            onClick={() => {
              playerStateRef.current.targetZ = null;
              setIsAutoWalking((prev) => !prev);
            }}
            className={`mt-4 w-full py-2.5 px-3 rounded-2xl text-xs font-medium flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              isAutoWalking
                ? 'bg-emerald-400 text-[#041318] border-emerald-300 font-semibold shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-emerald-200 border-white/10'
            }`}
          >
            {isAutoWalking ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Auto-Walk (Space)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Auto-Walk Forest (Space)</span>
              </>
            )}
          </button>

          {/* Controls Quick Hints */}
          <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-neutral-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Walk:</span>
              <span className="text-neutral-200">W A S D</span>
            </div>
            <div className="flex justify-between">
              <span>Timeline:</span>
              <span className="text-neutral-200">Scroll / Drag</span>
            </div>
            <div className="flex justify-between">
              <span>Shortcuts:</span>
              <span className="text-emerald-400">[?] or Click</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 3. BOTTOM SPATIAL WAYPOINT CARD & SCROLLTIDE SCRUBBER (cta.gallery + scrolltide.co) */}
      <div className="fixed bottom-4 md:bottom-6 left-4 right-4 md:left-8 md:right-8 z-20 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4 pointer-events-none">
        {/* Active Clearing Magnetic Spotlight Card */}
        <div
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          className="pointer-events-auto relative max-w-xl w-full bg-[#030d12]/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 md:p-6 shadow-2xl shadow-black/80 transition-all duration-300 overflow-hidden"
        >
          {/* Mouse tracking radial spotlight glow (cta.gallery style) */}
          <div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-50 transition-opacity"
            style={{
              background: `radial-gradient(350px circle at ${cardMousePos.x}px ${cardMousePos.y}px, rgba(52, 211, 153, 0.18), transparent 45%)`
            }}
          />

          {/* Scrolltide 3D Path Timeline Scrubber embedded at top of card */}
          <div className="mb-4 pb-3 border-b border-white/10">
            <ScrollTimelineScrubber
              progressPercent={progressPercent}
              activeWaypoint={activeWaypoint}
              onScrubToPercent={handleScrubToPercent}
              onTeleportToWaypoint={walkToWaypoint}
            />
          </div>

          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider text-[#041318]"
                style={{ backgroundColor: activeWaypoint.accentColor }}
              >
                Shrine {activeWaypoint.number}
              </span>
              <span className="text-xs font-mono text-emerald-300/90 truncate">
                {activeWaypoint.subtitle}
              </span>
            </div>

            {isWalkingState && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-300 animate-pulse">
                <Footprints className="w-3.5 h-3.5" />
                Walking...
              </span>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-display italic text-white mb-2">
            {activeWaypoint.title}
          </h2>

          <p className="text-xs md:text-sm text-neutral-300 leading-relaxed mb-4 line-clamp-3">
            {activeWaypoint.summary}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {activeWaypoint.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Card Actions (cta.gallery magnetic buttons) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setInspectedWaypoint(activeWaypoint)}
              className="px-4 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-[#041318] font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Inspect Shrine Dossier</span>
            </button>

            {activeWaypoint.id === 'rea-citadel' && (
              <button
                onClick={() => setShowReaBlueprintModal(true)}
                className="px-4 py-2.5 rounded-full bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/40 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>REA System Matrix</span>
              </button>
            )}

            {activeWaypoint.id === 'summit-portal' && (
              <button
                onClick={() => setShowContactDrawer(true)}
                className="px-4 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-[#041318] font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Connect With Mahim</span>
              </button>
            )}

            {/* Prev / Next Shrine Quick Walk */}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => {
                  const prevIdx =
                    (currentIndex - 1 + FOREST_WAYPOINTS.length) % FOREST_WAYPOINTS.length;
                  walkToWaypoint(FOREST_WAYPOINTS[prevIdx]);
                }}
                className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors cursor-pointer"
                title="Walk to Previous Shrine"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const nextIdx = (currentIndex + 1) % FOREST_WAYPOINTS.length;
                  walkToWaypoint(FOREST_WAYPOINTS[nextIdx]);
                }}
                className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Walk to Next Shrine"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Touch On-Screen Walk Pad */}
        <div className="pointer-events-auto flex lg:hidden items-center justify-between gap-2 bg-[#030d12]/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5">
          <button
            onTouchStart={() => (playerStateRef.current.keys.forward = true)}
            onTouchEnd={() => (playerStateRef.current.keys.forward = false)}
            onMouseDown={() => (playerStateRef.current.keys.forward = true)}
            onMouseUp={() => (playerStateRef.current.keys.forward = false)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-400/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold text-center active:scale-95"
          >
            Hold to Walk Forward ↑
          </button>
          <button
            onTouchStart={() => (playerStateRef.current.keys.backward = true)}
            onTouchEnd={() => (playerStateRef.current.keys.backward = false)}
            onMouseDown={() => (playerStateRef.current.keys.backward = true)}
            onMouseUp={() => (playerStateRef.current.keys.backward = false)}
            className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium active:scale-95"
          >
            Step Back ↓
          </button>
        </div>
      </div>

      {/* 4. MODAL: WAYPOINT SHRINE DEEP DOSSIER */}
      {inspectedWaypoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="relative max-w-4xl w-full max-h-[88vh] overflow-y-auto bg-[#040e12] border border-emerald-500/30 rounded-3xl p-6 md:p-10 shadow-2xl font-sans text-cream">
            <button
              onClick={() => setInspectedWaypoint(null)}
              className="sticky top-2 float-right p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-bold text-[#041318]"
                style={{ backgroundColor: inspectedWaypoint.accentColor }}
              >
                SHRINE {inspectedWaypoint.number}
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-300">
                {inspectedWaypoint.biome}
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-display italic text-white mb-2">
              {inspectedWaypoint.title}
            </h2>
            <p className="text-sm font-mono text-neutral-400 mb-6">
              {inspectedWaypoint.subtitle}
            </p>

            {/* Portrait & Bio banner if on Gate or Summit */}
            {(inspectedWaypoint.id === 'sanctuary-gate' ||
              inspectedWaypoint.id === 'summit-portal') && (
              <div className="flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/10 mb-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-950 to-black border border-emerald-400/40 shrink-0 flex flex-col items-center justify-center p-3 shadow-inner">
                  <div className="w-8 h-8 rounded-full border border-emerald-400 flex items-center justify-center text-emerald-300 font-mono font-bold text-xs mb-1">
                    AI
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest text-center">
                    MRK &bull; V2
                  </span>
                </div>
                <div className="space-y-2 text-xs md:text-sm text-neutral-200 leading-relaxed">
                  {MAHIM_PROFILE.bio.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">
                {inspectedWaypoint.details.heading}
              </h3>
              <p className="text-sm md:text-base text-neutral-300 leading-relaxed">
                {inspectedWaypoint.details.body}
              </p>
            </div>

            {/* Metrics Grid (styles.refero.design telemetry cards) */}
            {inspectedWaypoint.details.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {inspectedWaypoint.details.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="p-4 rounded-2xl bg-black/50 border border-white/10"
                  >
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      {m.label}
                    </div>
                    <div className="text-sm md:text-base font-semibold text-white font-mono">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Code / Architecture Diagram Snippet */}
            {inspectedWaypoint.details.codeSnippet && (
              <pre className="p-4 rounded-2xl bg-black/60 border border-teal-500/30 text-teal-200 font-mono text-xs overflow-x-auto mb-8 leading-relaxed">
                {inspectedWaypoint.details.codeSnippet}
              </pre>
            )}

            {/* Detailed Items */}
            {inspectedWaypoint.details.items && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {inspectedWaypoint.details.items.map((item) => (
                  <div
                    key={item.title}
                    className="p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-base font-semibold text-white">{item.title}</h4>
                      {item.badge && (
                        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <div className="text-xs font-mono text-emerald-300/80 mb-2">
                        {item.subtitle}
                      </div>
                    )}
                    <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick External Links & Contact Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    setInspectedWaypoint(null);
                    setShowContactDrawer(true);
                  }}
                  className="px-4 py-2 rounded-full bg-emerald-400 text-[#041318] font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Connect With Mahim</span>
                </button>
                <button
                  onClick={handleCopyEmail}
                  className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Email!</span>
                    </>
                  ) : (
                    <span>Copy {MAHIM_PROFILE.email}</span>
                  )}
                </button>
                <a
                  href={MAHIM_PROFILE.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-neutral-200 flex items-center gap-1"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={MAHIM_PROFILE.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-neutral-200 flex items-center gap-1"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button
                onClick={() => setInspectedWaypoint(null)}
                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white cursor-pointer"
              >
                Return to Forest Walk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: INTERACTIVE REA (morluto/rea) REVERSE ENGINEERING SYSTEM ARCHITECTURE */}
      {showReaBlueprintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="relative max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-[#040e12] border border-teal-400/35 rounded-3xl p-6 md:p-10 shadow-2xl font-sans text-cream">
            <button
              onClick={() => setShowReaBlueprintModal(false)}
              className="sticky top-2 float-right p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-400 text-[#041318]">
                SYSTEM MATRIX
              </span>
              <a
                href="https://github.com/morluto/rea"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-teal-300 hover:underline flex items-center gap-1"
              >
                github.com/morluto/rea (rea-agents)
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h2 className="text-3xl md:text-4xl font-display italic text-white mb-3">
              REA: Reverse Engineer Anything &mdash; Architectural Breakdown
            </h2>
            <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed mb-8">
              One Model Context Protocol (MCP) server and CLI system for reverse engineering across
              native binaries, JavaScript/Electron applications, .NET assemblies, Android APKs,
              firmware, and live runtime behavior &mdash; engineered with inward-flowing dependencies and
              strict Evidence provenance.
            </p>

            {/* 4-Layer Inward Dependency Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  step: 'LAYER 01',
                  title: 'Entry & MCP/CLI Adapters',
                  files: 'src/main.ts • src/cli.ts • src/server/',
                  desc: 'Dispatches stdio & streamable HTTP MCP requests or one-shot CLI invocations. Supports compact and full JSON Schema profiles to optimize agent token overhead.'
                },
                {
                  step: 'LAYER 02',
                  title: 'Application & Session Core',
                  files: 'SessionProviderRouter • BinarySession • CapabilityScope',
                  desc: 'Manages one immutable deep provider binding per binary target, disjoint auxiliary routing, AnalysisSnapshotCache, and retryable resource cleanup.'
                },
                {
                  step: 'LAYER 03',
                  title: 'Deep & Auxiliary Providers',
                  files: 'Hopper • Ghidra • IDA • Kuna • JADX • CDP',
                  desc: 'Bridges native decompilers (Hopper Python socket, Ghidra headless Java bridge, IDA MCP), static AST/ASAR/CIL readers, and owned process groups (src/process/).'
                },
                {
                  step: 'LAYER 04',
                  title: 'Domain & Evidence Ledger',
                  files: 'src/domain/ • EvidenceLedger • Contracts',
                  desc: 'Pure side-effect-free modules. Distinguishes Observations, Derivations, Inferences, and explicit Unknowns (NOT_ENOUGH_INFO) with byte-offset provenance.'
                }
              ].map((layer) => (
                <div
                  key={layer.step}
                  className="p-4 rounded-2xl bg-teal-950/30 border border-teal-400/25 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[10px] font-mono text-teal-300 uppercase tracking-widest mb-1">
                      {layer.step}
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">{layer.title}</h3>
                    <div className="text-[11px] font-mono text-emerald-300/80 mb-3">
                      {layer.files}
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">{layer.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Target Matrix Table */}
            <h3 className="text-lg font-semibold text-teal-200 mb-3 font-display italic">
              Supported Target Capabilities & Provenance Outputs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {[
                {
                  target: 'Native Binaries (ELF / PE / Mach-O / DOS)',
                  output:
                    'Pseudocode, assembly, CFG, strings, symbols, xrefs via Hopper, Ghidra, IDA, Kuna, Rizin, objdump'
                },
                {
                  target: 'JavaScript & Electron Apps',
                  output:
                    'ASAR extraction, AST module graphs, preload/IPC boundaries, source-map reconstruction, V8 Inspector'
                },
                {
                  target: '.NET Assemblies & IL2CPP / Godot',
                  output:
                    'PE/CLI metadata, CIL instructions, Unity global-metadata.dat (v24–39), Godot PCK v2–4 inventory'
                },
                {
                  target: 'Android APK / JEB / Flutter / ADB',
                  output:
                    'Headless JADX decompilation, v1–v3.1 APK signatures, Apktool resources, Dart snapshot IDs, live ADB'
                },
                {
                  target: 'AI Models, GPU & EVM Bytecode',
                  output:
                    'GGUF & safetensors tensor headers, CUDA fatbin/CUBIN/PTX kernels, EVM selector & mutability dispatch'
                },
                {
                  target: 'RL AgentEnv Synthesis & Captures',
                  output:
                    'Transforms recorded browser HAR/SAZ/pcap sessions into runnable Dockerized RL environments for AI agents'
                }
              ].map((cap) => (
                <div
                  key={cap.target}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <div className="text-xs font-semibold text-white mb-1">{cap.target}</div>
                  <div className="text-xs text-neutral-400 leading-relaxed">{cap.output}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="text-xs text-neutral-400 font-mono">
                Quick CLI: <code className="text-teal-300">npx rea-agents setup</code> &bull;{' '}
                <code className="text-teal-300">rea environment-build ./session.har ./my-env</code>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowReaBlueprintModal(false);
                    walkToWaypoint(FOREST_WAYPOINTS[1]);
                  }}
                  className="px-4 py-2 rounded-full bg-teal-400 text-[#041318] font-semibold text-xs cursor-pointer shadow-md"
                >
                  Walk to REA Shrine in 3D Forest
                </button>
                <button
                  onClick={() => setShowReaBlueprintModal(false)}
                  className="px-4 py-2 rounded-full bg-white/10 text-white text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: CONTACT DRAWER (cta.gallery standard) */}
      <ContactDrawer
        isOpen={showContactDrawer}
        onClose={() => setShowContactDrawer(false)}
      />

      {/* 7. MODAL: ARCHITECTURAL FOOTER (footer.design standard) */}
      <ArchitecturalFooterModal
        isOpen={showFooterModal}
        onClose={() => setShowFooterModal(false)}
        onTeleportToWaypoint={walkToWaypoint}
        onOpenReaModal={() => setShowReaBlueprintModal(true)}
      />

      {/* 8. MODAL: KEYBOARD SHORTCUTS GUIDE (styles.refero.design standard) */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
