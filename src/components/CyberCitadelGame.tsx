import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { MAHIM_V2_DATA, AreaOfInterest, ThoughtEssay } from '../data/v2Data';
import {
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  Compass,
  Trophy,
  BookOpen,
  Send,
  ExternalLink,
  Copy,
  Check,
  X,
  Radio,
  Flame,
  Award,
  Gamepad2,
  Terminal,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface CyberCitadelGameProps {
  onSwitchToDossier?: () => void;
  onSwitchToForest?: () => void;
}

interface CoreOrb {
  mesh: THREE.Group;
  light: THREE.PointLight;
  position: THREE.Vector3;
  id: number;
  areaData: AreaOfInterest;
  collected: boolean;
}

interface StationTerminal {
  mesh: THREE.Group;
  position: THREE.Vector3;
  type: 'thought' | 'about' | 'contact';
  thoughtData?: ThoughtEssay;
  title: string;
  subtitle: string;
  radius: number;
}

export default function CyberCitadelGame({ onSwitchToDossier, onSwitchToForest }: CyberCitadelGameProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Gameplay HUD states
  const [speedKmh, setSpeedKmh] = useState(0);
  const [nitroFuel, setNitroFuel] = useState(100);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [score, setScore] = useState(0);
  const [collectedCoresCount, setCollectedCoresCount] = useState(0);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active Modals & Readouts
  const [activeTerminal, setActiveTerminal] = useState<StationTerminal | null>(null);
  const [unlockedArea, setUnlockedArea] = useState<AreaOfInterest | null>(null);
  const [showFullDossierModal, setShowFullDossierModal] = useState(false);
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);

  // References for Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);
  const engineOscRef = useRef<OscillatorNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Vehicle physics state
  const vehicleRef = useRef({
    position: new THREE.Vector3(0, 0.45, 12),
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 0,
    maxForwardSpeed: 42, // ~150 km/h
    maxReverseSpeed: -14,
    acceleration: 28,
    deceleration: 18,
    brakeForce: 45,
    steeringAngle: 0,
    heading: 0,
    angularVelocity: 0,
    driftFactor: 0.94,
    isAirborne: false,
    verticalVelocity: 0,
    gravity: 38,
    jumpForce: 14,
    nitro: 100,
    isNitro: false,
    chassisRoll: 0,
    chassisPitch: 0
  });

  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    handbrake: false,
    nitro: false,
    jump: false
  });

  const cameraModeRef = useRef<'chase' | 'cockpit' | 'birds-eye'>('chase');

  // Procedural Web Audio Engine (Car engine synthesis, nitro whoosh, crystal pickup chime)
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);

      // Low engine rumble synth
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = 45; // Idle pitch
      oscGain.gain.value = 0.08;

      const engineFilter = ctx.createBiquadFilter();
      engineFilter.type = 'lowpass';
      engineFilter.frequency.value = 260;

      osc.connect(engineFilter);
      engineFilter.connect(oscGain);
      oscGain.connect(master);
      osc.start();

      audioCtxRef.current = ctx;
      engineOscRef.current = osc;
      engineGainRef.current = oscGain;
      masterGainRef.current = master;
      setAudioEnabled(true);
    } catch {
      // Audio autoplay restrictions
    }
  }, []);

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      initAudio();
    } else {
      if (audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
        setAudioEnabled(false);
      } else {
        audioCtxRef.current.resume();
        setAudioEnabled(true);
      }
    }
  };

  const playChimeSound = () => {
    if (!audioCtxRef.current || !audioEnabled) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.09, now + idx * 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.35);
      o.connect(g);
      g.connect(masterGainRef.current || ctx.destination);
      o.start(now + idx * 0.06);
      o.stop(now + idx * 0.06 + 0.4);
    });
  };

  const playInteractSound = () => {
    if (!audioCtxRef.current || !audioEnabled) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(440, now);
    o.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    o.connect(g);
    g.connect(masterGainRef.current || ctx.destination);
    o.start(now);
    o.stop(now + 0.16);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Reset car position
  const resetVehicle = () => {
    const v = vehicleRef.current;
    v.position.set(0, 0.45, 12);
    v.velocity.set(0, 0, 0);
    v.speed = 0;
    v.heading = 0;
    v.steeringAngle = 0;
    v.verticalVelocity = 0;
    v.isAirborne = false;
  };

  // 3D Three.js Main Canvas Engine
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#02070a');
    scene.fog = new THREE.FogExp2('#02070a', 0.012);

    const camera = new THREE.PerspectiveCamera(
      62,
      container.clientWidth / container.clientHeight,
      0.1,
      350
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
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. LIGHTING
    const ambientLight = new THREE.AmbientLight('#0d2830', 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#2dd4bf', 2.4);
    dirLight.position.set(60, 100, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 280;
    const shadowD = 120;
    dirLight.shadow.camera.left = -shadowD;
    dirLight.shadow.camera.right = shadowD;
    dirLight.shadow.camera.top = shadowD;
    dirLight.shadow.camera.bottom = -shadowD;
    scene.add(dirLight);

    // 3. GLOSSY CYBER-GRID GROUND (Bricelab & GTA cyber style)
    const floorSize = 340;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize, 120, 120);
    floorGeo.rotateX(-Math.PI / 2);

    // Custom shader material for glowing cyber grid lines and circuit pulses
    const gridUniforms = {
      uTime: { value: 0 },
      uGridColor: { value: new THREE.Color('#0d3b43') },
      uGlowColor: { value: new THREE.Color('#2dd4bf') },
      uPlayerPos: { value: new THREE.Vector2(0, 0) }
    };

    const floorMat = new THREE.ShaderMaterial({
      uniforms: gridUniforms,
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
        uniform vec3 uGridColor;
        uniform vec3 uGlowColor;
        uniform vec2 uPlayerPos;

        void main() {
          vec2 coord = vWorldPos.xz * 0.25;
          vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
          float line = 1.0 - min(min(grid.x, grid.y), 1.0);

          vec3 col = mix(vec3(0.015, 0.03, 0.04), uGridColor, line * 0.7);

          // Pulse waves expanding outward from the player
          float d = length(vWorldPos.xz - uPlayerPos);
          float ring = sin(d * 0.35 - uTime * 3.5);
          float ringMask = smoothstep(0.85, 1.0, ring) * smoothstep(35.0, 0.0, d);
          col += uGlowColor * ringMask * 0.45;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 4. CELESTIAL BACKGROUND & FLOATING MATHEMATICAL POLYHEDRA
    const skyGroup = new THREE.Group();
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 450;
      starPos[i * 3 + 1] = 20 + Math.random() * 160;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 450;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: '#5eead4',
      size: 1.4,
      transparent: true,
      opacity: 0.75
    });
    const starField = new THREE.Points(starGeo, starMat);
    skyGroup.add(starField);

    // Giant mathematical floating torus and wireframe octahedra in the sky
    const skyTorusGeo = new THREE.TorusGeometry(32, 0.8, 16, 100);
    const skyTorusMat = new THREE.MeshBasicMaterial({
      color: '#2dd4bf',
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const skyTorus = new THREE.Mesh(skyTorusGeo, skyTorusMat);
    skyTorus.position.set(0, 48, -40);
    skyTorus.rotation.x = Math.PI / 3;
    skyGroup.add(skyTorus);

    const skyOctGeo = new THREE.OctahedronGeometry(14, 0);
    const skyOctMat = new THREE.MeshBasicMaterial({
      color: '#34d399',
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const skyOct = new THREE.Mesh(skyOctGeo, skyOctMat);
    skyOct.position.set(-65, 55, 30);
    skyGroup.add(skyOct);

    scene.add(skyGroup);

    // 5. STUNT RAMPS, ELEVATED TRACKS & BOOST PADS
    const trackGroup = new THREE.Group();

    // Ramps
    const rampMat = new THREE.MeshStandardMaterial({
      color: '#0f2930',
      roughness: 0.4,
      metalness: 0.8
    });
    const rampEdgeMat = new THREE.MeshBasicMaterial({
      color: '#2dd4bf'
    });

    const createRamp = (x: number, z: number, rotY: number, length = 12, height = 3.6) => {
      const rampSub = new THREE.Group();
      rampSub.position.set(x, 0, z);
      rampSub.rotation.y = rotY;

      const wedgeShape = new THREE.Shape();
      wedgeShape.moveTo(0, 0);
      wedgeShape.lineTo(length, height);
      wedgeShape.lineTo(length, 0);
      wedgeShape.closePath();

      const extrudeSettings = { depth: 7, bevelEnabled: false };
      const wedgeGeo = new THREE.ExtrudeGeometry(wedgeShape, extrudeSettings);
      wedgeGeo.center();
      wedgeGeo.translate(0, height / 2, 0);

      const rampMesh = new THREE.Mesh(wedgeGeo, rampMat);
      rampMesh.castShadow = true;
      rampMesh.receiveShadow = true;
      rampSub.add(rampMesh);

      // Glowing neon edge rails
      const edgeGeo = new THREE.BoxGeometry(length, 0.25, 0.25);
      const leftEdge = new THREE.Mesh(edgeGeo, rampEdgeMat);
      leftEdge.position.set(0, height / 2 + 0.15, -3.5);
      leftEdge.rotation.z = Math.atan2(height, length);
      const rightEdge = new THREE.Mesh(edgeGeo, rampEdgeMat);
      rightEdge.position.set(0, height / 2 + 0.15, 3.5);
      rightEdge.rotation.z = Math.atan2(height, length);
      rampSub.add(leftEdge, rightEdge);

      trackGroup.add(rampSub);
      return { x, z, rotY, length, height };
    };

    const ramps = [
      createRamp(0, -35, 0, 14, 4.2), // Mega center launch ramp
      createRamp(-45, 10, Math.PI / 2, 11, 3.2), // West ramp
      createRamp(45, -10, -Math.PI / 2, 11, 3.2), // East ramp
      createRamp(25, -70, Math.PI / 4, 12, 3.5) // North-east ramp
    ];

    // Speed Boost Pads (Glowing arrow tiles on ground)
    const boostPads: { pos: THREE.Vector3; mesh: THREE.Mesh }[] = [];
    const padGeo = new THREE.PlaneGeometry(5, 7);
    padGeo.rotateX(-Math.PI / 2);
    const padMat = new THREE.MeshBasicMaterial({
      color: '#f59e0b',
      transparent: true,
      opacity: 0.85
    });

    const padPositions = [
      new THREE.Vector3(0, 0.05, -15),
      new THREE.Vector3(-30, 0.05, 10),
      new THREE.Vector3(30, 0.05, -10),
      new THREE.Vector3(0, 0.05, 30)
    ];

    padPositions.forEach((pos) => {
      const padMesh = new THREE.Mesh(padGeo, padMat);
      padMesh.position.copy(pos);
      trackGroup.add(padMesh);
      boostPads.push({ pos, mesh: padMesh });
    });

    // Elevated highway ring / flyover loop
    const ringTrackGeo = new THREE.RingGeometry(85, 96, 64);
    ringTrackGeo.rotateX(-Math.PI / 2);
    const ringTrackMat = new THREE.MeshStandardMaterial({
      color: '#071b22',
      roughness: 0.5,
      metalness: 0.6,
      side: THREE.DoubleSide
    });
    const ringTrack = new THREE.Mesh(ringTrackGeo, ringTrackMat);
    ringTrack.position.set(0, 0.08, 0);
    ringTrack.receiveShadow = true;
    trackGroup.add(ringTrack);

    scene.add(trackGroup);

    // 6. CYBER SKYSCRAPERS & CITY PROFILES (Zero raster images, purely procedural)
    const cityGroup = new THREE.Group();
    const bldgMat = new THREE.MeshStandardMaterial({
      color: '#091e24',
      roughness: 0.35,
      metalness: 0.85
    });
    const windowMat = new THREE.MeshBasicMaterial({
      color: '#2dd4bf',
      transparent: true,
      opacity: 0.65
    });

    const bldgCount = 65;
    for (let i = 0; i < bldgCount; i++) {
      const angle = (i / bldgCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const radius = 115 + Math.random() * 45;
      const bx = Math.cos(angle) * radius;
      const bz = Math.sin(angle) * radius;

      const bw = 10 + Math.random() * 14;
      const bd = 10 + Math.random() * 14;
      const bh = 25 + Math.random() * 65;

      const bldgGeo = new THREE.BoxGeometry(bw, bh, bd);
      bldgGeo.translate(0, bh / 2, 0);
      const bldgMesh = new THREE.Mesh(bldgGeo, bldgMat);
      bldgMesh.position.set(bx, 0, bz);
      bldgMesh.castShadow = true;
      bldgMesh.receiveShadow = true;

      // Glowing crown spire
      const spireGeo = new THREE.CylinderGeometry(0.2, 0.8, 8, 6);
      spireGeo.translate(0, bh + 4, 0);
      const spire = new THREE.Mesh(spireGeo, windowMat);
      bldgMesh.add(spire);

      cityGroup.add(bldgMesh);
    }
    scene.add(cityGroup);

    // 7. HIGH-PERFORMANCE PROCEDURAL CYBER-ROVER VEHICLE
    const vehicleGroup = new THREE.Group();

    const carBodyMat = new THREE.MeshStandardMaterial({
      color: '#07161b',
      roughness: 0.2,
      metalness: 0.95
    });
    const neonTrimMat = new THREE.MeshBasicMaterial({
      color: '#2dd4bf'
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#0b2930',
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    const wheelMat = new THREE.MeshStandardMaterial({
      color: '#111',
      roughness: 0.6
    });

    // Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(2.3, 0.55, 4.4);
    const chassis = new THREE.Mesh(chassisGeo, carBodyMat);
    chassis.position.y = 0.55;
    chassis.castShadow = true;
    vehicleGroup.add(chassis);

    // Cockpit cabin
    const cabinGeo = new THREE.BoxGeometry(1.65, 0.55, 2.2);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.95, -0.2);
    cabin.castShadow = true;
    vehicleGroup.add(cabin);

    // Rear Aero Wing
    const wingGeo = new THREE.BoxGeometry(2.5, 0.08, 0.65);
    const wing = new THREE.Mesh(wingGeo, carBodyMat);
    wing.position.set(0, 1.25, 1.75);
    vehicleGroup.add(wing);

    const wingPillarGeo = new THREE.BoxGeometry(0.12, 0.45, 0.2);
    const wpLeft = new THREE.Mesh(wingPillarGeo, carBodyMat);
    wpLeft.position.set(-0.9, 0.98, 1.75);
    const wpRight = new THREE.Mesh(wingPillarGeo, carBodyMat);
    wpRight.position.set(0.9, 0.98, 1.75);
    vehicleGroup.add(wpLeft, wpRight);

    // Neon Accent Light Strips
    const neonStrips = [
      { size: [2.32, 0.06, 0.06], pos: [0, 0.45, -2.21] }, // Front splitter neon
      { size: [0.06, 0.06, 4.42], pos: [-1.16, 0.45, 0] }, // Left skirt
      { size: [0.06, 0.06, 4.42], pos: [1.16, 0.45, 0] }, // Right skirt
      { size: [2.32, 0.08, 0.06], pos: [0, 0.65, 2.21] } // Rear light bar
    ];
    neonStrips.forEach((strip) => {
      const sMesh = new THREE.Mesh(new THREE.BoxGeometry(strip.size[0], strip.size[1], strip.size[2]), neonTrimMat);
      sMesh.position.set(strip.pos[0], strip.pos[1], strip.pos[2]);
      vehicleGroup.add(sMesh);
    });

    // 4 Steerable & Rotating Wheels
    const wheelMeshes: THREE.Group[] = [];
    const wheelOffsets = [
      { x: -1.25, y: 0.45, z: -1.35, isFront: true },
      { x: 1.25, y: 0.45, z: -1.35, isFront: true },
      { x: -1.25, y: 0.45, z: 1.35, isFront: false },
      { x: 1.25, y: 0.45, z: 1.35, isFront: false }
    ];

    wheelOffsets.forEach((wo) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wo.x, wo.y, wo.z);

      const tireGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.42, 20);
      tireGeo.rotateZ(Math.PI / 2);
      const tireMesh = new THREE.Mesh(tireGeo, wheelMat);
      tireMesh.castShadow = true;
      wGroup.add(tireMesh);

      // Glowing cyber rim ring
      const rimGeo = new THREE.TorusGeometry(0.32, 0.04, 8, 24);
      rimGeo.rotateY(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, neonTrimMat);
      wGroup.add(rimMesh);

      vehicleGroup.add(wGroup);
      wheelMeshes.push(wGroup);
    });

    // Dual Headlight Cones (Active dynamic lighting)
    const leftHeadlight = new THREE.SpotLight('#5eead4', 4.5, 38, Math.PI / 6, 0.35, 1);
    leftHeadlight.position.set(-0.7, 0.6, -2.1);
    leftHeadlight.target.position.set(-0.7, 0, -22);
    vehicleGroup.add(leftHeadlight);
    vehicleGroup.add(leftHeadlight.target);

    const rightHeadlight = new THREE.SpotLight('#5eead4', 4.5, 38, Math.PI / 6, 0.35, 1);
    rightHeadlight.position.set(0.7, 0.6, -2.1);
    rightHeadlight.target.position.set(0.7, 0, -22);
    vehicleGroup.add(rightHeadlight);
    vehicleGroup.add(rightHeadlight.target);

    // Glowing Neon Underglow Light
    const underglowLight = new THREE.PointLight('#2dd4bf', 3.5, 7.5);
    underglowLight.position.set(0, 0.15, 0);
    vehicleGroup.add(underglowLight);

    // Rear Dual Nitro Thruster Sparks
    const thrusterGeo = new THREE.ConeGeometry(0.28, 1.4, 8);
    thrusterGeo.rotateX(-Math.PI / 2);
    const thrusterMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0
    });
    const thrusterMesh = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterMesh.position.set(0, 0.55, 2.7);
    vehicleGroup.add(thrusterMesh);

    scene.add(vehicleGroup);

    // 8. MINI-GAME 1: 10 NEURAL CORE ORBS (Collect all 10 to master Mahim's V2 areas!)
    const coreOrbs: CoreOrb[] = [];
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: '#2dd4bf',
      emissive: '#10b981',
      emissiveIntensity: 1.2,
      wireframe: true
    });

    const orbPositions = [
      new THREE.Vector3(0, 5.8, -42), // Top of mega launch ramp
      new THREE.Vector3(-45, 4.8, 10), // West elevated launch
      new THREE.Vector3(45, 4.8, -10), // East elevated launch
      new THREE.Vector3(-25, 1.5, -30),
      new THREE.Vector3(25, 1.5, -30),
      new THREE.Vector3(-55, 1.5, 35),
      new THREE.Vector3(55, 1.5, 35),
      new THREE.Vector3(0, 1.5, 55),
      new THREE.Vector3(0, 1.5, -85),
      new THREE.Vector3(35, 1.5, -75)
    ];

    orbPositions.forEach((pos, idx) => {
      const g = new THREE.Group();
      g.position.copy(pos);

      const m = new THREE.Mesh(coreGeo, coreMat);
      g.add(m);

      // Inner glowing core
      const innerMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 16, 16),
        new THREE.MeshBasicMaterial({ color: '#6ee7b7' })
      );
      g.add(innerMesh);

      // Point light
      const pLight = new THREE.PointLight('#34d399', 3.0, 14);
      g.add(pLight);

      scene.add(g);
      coreOrbs.push({
        mesh: g,
        light: pLight,
        position: pos,
        id: idx + 1,
        areaData: MAHIM_V2_DATA.areasOfInterest[idx % MAHIM_V2_DATA.areasOfInterest.length],
        collected: false
      });
    });

    // 9. STATIONS & INTERACTIVE 3D TERMINALS (V2 Essays, About Mahim, Contact Beacon)
    const stations: StationTerminal[] = [];

    const createTerminalStructure = (
      pos: THREE.Vector3,
      accentColor: string,
      type: 'thought' | 'about' | 'contact',
      title: string,
      subtitle: string,
      thoughtData?: ThoughtEssay
    ) => {
      const g = new THREE.Group();
      g.position.copy(pos);

      // Base ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(3.5, 4.0, 32),
        new THREE.MeshBasicMaterial({ color: accentColor, side: THREE.DoubleSide })
      );
      ring.rotateX(-Math.PI / 2);
      ring.position.y = 0.05;
      g.add(ring);

      // Holographic Holo-Monolith Pillar
      const colGeo = new THREE.BoxGeometry(1.4, 4.5, 1.4);
      const colMat = new THREE.MeshStandardMaterial({
        color: '#081c22',
        roughness: 0.2,
        metalness: 0.9
      });
      const colMesh = new THREE.Mesh(colGeo, colMat);
      colMesh.position.y = 2.25;
      colMesh.castShadow = true;
      g.add(colMesh);

      // Floating holographic badge
      const badgeGeo = new THREE.OctahedronGeometry(0.9, 0);
      const badgeMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 1.4,
        wireframe: true
      });
      const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
      badgeMesh.position.y = 5.2;
      g.add(badgeMesh);

      // Beacon light
      const bLight = new THREE.PointLight(accentColor, 4.0, 18);
      bLight.position.set(0, 5.2, 0);
      g.add(bLight);

      scene.add(g);

      const termObj: StationTerminal = {
        mesh: g,
        position: pos,
        type,
        thoughtData,
        title,
        subtitle,
        radius: 6.5
      };
      stations.push(termObj);
      return termObj;
    };

    // Central Matrix Hub: About Mahim (V2 narrative)
    createTerminalStructure(
      new THREE.Vector3(0, 0, 0),
      '#34d399',
      'about',
      'Core Matrix Terminal',
      'Mahimur Rahman Khan &bull; Origin Narrative & Discipline'
    );

    // Contact Transmission Tower (V2 contact info)
    createTerminalStructure(
      new THREE.Vector3(0, 0, -115),
      '#f59e0b',
      'contact',
      'Transmission Beacon',
      'Direct Touchpoint &bull; Savar, Dhaka, Bangladesh'
    );

    // 4 Thought Archives (The 4 V2 Essays)
    const thoughtPositions = [
      new THREE.Vector3(-60, 0, -45),
      new THREE.Vector3(60, 0, -45),
      new THREE.Vector3(-60, 0, 45),
      new THREE.Vector3(60, 0, 45)
    ];
    MAHIM_V2_DATA.thoughts.forEach((thought, idx) => {
      createTerminalStructure(
        thoughtPositions[idx],
        '#38bdf8',
        'thought',
        thought.title,
        `${thought.readTime} &bull; ${thought.date}`,
        thought
      );
    });

    // 10. INPUT LISTENERS
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input modal
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;

      const k = e.key.toLowerCase();
      const keys = keysRef.current;

      if (k === 'w' || e.key === 'ArrowUp') keys.forward = true;
      if (k === 's' || e.key === 'ArrowDown') keys.backward = true;
      if (k === 'a' || e.key === 'ArrowLeft') keys.left = true;
      if (k === 'd' || e.key === 'ArrowRight') keys.right = true;
      if (e.key === ' ' || k === 'space') {
        e.preventDefault();
        keys.handbrake = true;
      }
      if (e.key === 'Shift') keys.nitro = true;
      if (k === 'j') keys.jump = true;

      // Hotkey: E to interact with nearby terminal
      if (k === 'e' || e.key === 'Enter') {
        const vPos = vehicleRef.current.position;
        const nearTerm = stations.find((st) => st.position.distanceTo(vPos) <= st.radius);
        if (nearTerm) {
          playInteractSound();
          setActiveTerminal(nearTerm);
        }
      }

      // Hotkey: R to reset car
      if (k === 'r') resetVehicle();

      // Hotkey: M to toggle audio
      if (k === 'm') toggleAudio();

      // Hotkey: V to switch camera
      if (k === 'v') {
        cameraModeRef.current =
          cameraModeRef.current === 'chase'
            ? 'cockpit'
            : cameraModeRef.current === 'cockpit'
            ? 'birds-eye'
            : 'chase';
      }

      // Hotkey: Escape closes modals
      if (e.key === 'Escape') {
        setActiveTerminal(null);
        setUnlockedArea(null);
        setShowFullDossierModal(false);
        setShowControlsModal(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const keys = keysRef.current;
      if (k === 'w' || e.key === 'ArrowUp') keys.forward = false;
      if (k === 's' || e.key === 'ArrowDown') keys.backward = false;
      if (k === 'a' || e.key === 'ArrowLeft') keys.left = false;
      if (k === 'd' || e.key === 'ArrowRight') keys.right = false;
      if (e.key === ' ' || k === 'space') keys.handbrake = false;
      if (e.key === 'Shift') keys.nitro = false;
      if (k === 'j') keys.jump = false;
    };

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);

    // 11. MAIN 60-120 FPS GAME SIMULATION LOOP
    const clock = new THREE.Clock();
    let animFrameId = 0;
    let localScore = 0;
    let localCores = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Update shader uniforms
      gridUniforms.uTime.value = elapsed;
      gridUniforms.uPlayerPos.value.set(vehicleRef.current.position.x, vehicleRef.current.position.z);

      // Rotate floating celestial polyhedra & station badges
      skyTorus.rotation.z = elapsed * 0.15;
      skyOct.rotation.x = elapsed * 0.2;
      skyOct.rotation.y = elapsed * 0.3;

      stations.forEach((st, idx) => {
        const badge = st.mesh.children[2];
        if (badge) {
          badge.rotation.y = elapsed * 1.4 + idx;
          badge.position.y = 5.2 + Math.sin(elapsed * 2.2 + idx) * 0.25;
        }
      });

      // Animate core orbs
      coreOrbs.forEach((orb) => {
        if (!orb.collected) {
          orb.mesh.rotation.y = elapsed * 2.2;
          orb.mesh.position.y = orb.position.y + Math.sin(elapsed * 3.0 + orb.id) * 0.25;
        }
      });

      // --- VEHICLE ARCADE PHYSICS SIMULATION ---
      const v = vehicleRef.current;
      const keys = keysRef.current;

      // Nitro & Boost pads check
      let currentMaxSpeed = v.maxForwardSpeed;
      let accelMultiplier = 1.0;

      // Check if over a boost pad
      const overPad = boostPads.some((pad) => pad.pos.distanceTo(v.position) < 3.8);
      if (overPad) {
        currentMaxSpeed = 62; // ~220 km/h hyper boost
        accelMultiplier = 2.4;
        thrusterMat.opacity = THREE.MathUtils.lerp(thrusterMat.opacity, 0.95, 0.2);
      } else if (keys.nitro && v.nitro > 0 && keys.forward) {
        v.nitro = Math.max(0, v.nitro - dt * 28);
        currentMaxSpeed = 56; // ~200 km/h
        accelMultiplier = 1.9;
        thrusterMat.opacity = THREE.MathUtils.lerp(thrusterMat.opacity, 0.9, 0.2);
        setIsNitroActive(true);
      } else {
        v.nitro = Math.min(100, v.nitro + dt * 14); // Recharge nitro
        thrusterMat.opacity = THREE.MathUtils.lerp(thrusterMat.opacity, 0, 0.15);
        setIsNitroActive(false);
      }
      setNitroFuel(Math.round(v.nitro));

      // Acceleration & Braking
      if (keys.forward) {
        v.speed += v.acceleration * accelMultiplier * dt;
        if (v.speed > currentMaxSpeed) v.speed = currentMaxSpeed;
      } else if (keys.backward) {
        if (v.speed > 0.5) {
          v.speed -= v.brakeForce * dt;
        } else {
          v.speed -= v.acceleration * 0.6 * dt;
          if (v.speed < v.maxReverseSpeed) v.speed = v.maxReverseSpeed;
        }
      } else {
        // Natural rolling resistance
        if (v.speed > 0) {
          v.speed = Math.max(0, v.speed - v.deceleration * dt);
        } else if (v.speed < 0) {
          v.speed = Math.min(0, v.speed + v.deceleration * dt);
        }
      }

      // Handbrake drift
      if (keys.handbrake) {
        v.speed *= Math.pow(0.82, dt * 60);
      }

      // Steering
      const steerInput = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
      const targetSteerAngle = steerInput * 0.42;
      v.steeringAngle = THREE.MathUtils.lerp(v.steeringAngle, targetSteerAngle, 0.18);

      // Turning is proportional to speed
      const speedFactor = Math.abs(v.speed) / v.maxForwardSpeed;
      const turnSign = v.speed >= 0 ? 1 : -1;
      v.heading += v.steeringAngle * speedFactor * turnSign * 2.8 * dt;

      // Chassis roll & pitch dynamics for weight transfer feel
      const targetRoll = -v.steeringAngle * speedFactor * 0.28;
      v.chassisRoll = THREE.MathUtils.lerp(v.chassisRoll, targetRoll, 0.15);

      const targetPitch = (keys.forward ? -0.06 : keys.backward ? 0.08 : 0) * speedFactor;
      v.chassisPitch = THREE.MathUtils.lerp(v.chassisPitch, targetPitch, 0.15);

      // Vertical Physics: Ramps, Jumping & Gravity
      // Check if on any ramp
      let groundHeight = 0.45;
      ramps.forEach((ramp) => {
        const dx = v.position.x - ramp.x;
        const dz = v.position.z - ramp.z;
        const rotatedX = dx * Math.cos(-ramp.rotY) - dz * Math.sin(-ramp.rotY);
        const rotatedZ = dx * Math.sin(-ramp.rotY) + dz * Math.cos(-ramp.rotY);

        if (Math.abs(rotatedZ) < 3.5 && rotatedX >= -ramp.length / 2 && rotatedX <= ramp.length / 2) {
          const progressAlongRamp = (rotatedX + ramp.length / 2) / ramp.length;
          const rampH = progressAlongRamp * ramp.height;
          if (rampH > groundHeight) {
            groundHeight = rampH + 0.45;
            // Ramp launch kicker velocity
            if (v.speed > 18 && progressAlongRamp > 0.88 && !v.isAirborne) {
              v.verticalVelocity = v.speed * 0.38;
              v.isAirborne = true;
            }
          }
        }
      });

      // Jump button
      if (keys.jump && !v.isAirborne) {
        v.verticalVelocity = v.jumpForce;
        v.isAirborne = true;
      }

      if (v.isAirborne) {
        v.position.y += v.verticalVelocity * dt;
        v.verticalVelocity -= v.gravity * dt;
        if (v.position.y <= groundHeight) {
          v.position.y = groundHeight;
          v.verticalVelocity = 0;
          v.isAirborne = false;
        }
      } else {
        v.position.y = groundHeight;
      }

      // Compute forward & lateral velocity vectors
      const forwardDir = new THREE.Vector3(-Math.sin(v.heading), 0, -Math.cos(v.heading));
      v.position.x += forwardDir.x * v.speed * dt;
      v.position.z += forwardDir.z * v.speed * dt;

      // Boundary clamp to arena
      v.position.x = THREE.MathUtils.clamp(v.position.x, -160, 160);
      v.position.z = THREE.MathUtils.clamp(v.position.z, -160, 160);

      // Update vehicle transform
      vehicleGroup.position.copy(v.position);
      vehicleGroup.rotation.set(v.chassisPitch, v.heading, v.chassisRoll);

      // Rotate and steer wheels
      const wheelSpin = (v.speed * dt) / 0.45;
      wheelMeshes.forEach((wMesh, idx) => {
        const tire = wMesh.children[0];
        if (tire) tire.rotation.x += wheelSpin;
        if (wheelOffsets[idx].isFront) {
          wMesh.rotation.y = v.steeringAngle;
        }
      });

      // Update Engine Synthesizer Pitch & Volume
      if (engineOscRef.current && engineGainRef.current && audioEnabled) {
        const normalizedSpeed = Math.abs(v.speed) / v.maxForwardSpeed;
        engineOscRef.current.frequency.value = 45 + normalizedSpeed * 180 + (isNitroActive ? 80 : 0);
        engineGainRef.current.gain.value = 0.08 + normalizedSpeed * 0.08;
      }

      // --- CHECK COLLISIONS WITH NEURAL CORE ORBS ---
      coreOrbs.forEach((orb) => {
        if (!orb.collected && orb.position.distanceTo(v.position) < 3.2) {
          orb.collected = true;
          orb.mesh.visible = false;
          playChimeSound();
          localScore += 250;
          localCores += 1;
          setScore(localScore);
          setCollectedCoresCount(localCores);
          setUnlockedArea(orb.areaData);

          if (localCores >= 10) {
            setMissionComplete(true);
          }
        }
      });

      // --- CHECK PROXIMITY TO TERMINALS & STATIONS ---
      const nearStation = stations.find((st) => st.position.distanceTo(v.position) <= st.radius);
      if (nearStation) {
        setActivePrompt(`[E / ENTER] ACCESS ${nearStation.title.toUpperCase()}`);
      } else {
        setActivePrompt(null);
      }

      // Update Speedometer UI
      setSpeedKmh(Math.round(Math.abs(v.speed) * 3.6));

      // --- CAMERA MODES & SMOOTH CHASING ---
      if (cameraModeRef.current === 'chase') {
        const chaseDist = 8.5;
        const chaseHeight = 3.6;
        const targetCamX = v.position.x + Math.sin(v.heading) * chaseDist;
        const targetCamZ = v.position.z + Math.cos(v.heading) * chaseDist;
        const targetCamY = v.position.y + chaseHeight;

        camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
        const lookTarget = v.position.clone().add(new THREE.Vector3(0, 1.2, 0));
        camera.lookAt(lookTarget);
      } else if (cameraModeRef.current === 'cockpit') {
        const eyeX = v.position.x - Math.sin(v.heading) * 0.4;
        const eyeZ = v.position.z - Math.cos(v.heading) * 0.4;
        const eyeY = v.position.y + 1.1;

        camera.position.set(eyeX, eyeY, eyeZ);
        const lookX = v.position.x - Math.sin(v.heading) * 20;
        const lookZ = v.position.z - Math.cos(v.heading) * 20;
        camera.lookAt(lookX, v.position.y + 0.9, lookZ);
      } else {
        // Birds-eye camera
        camera.position.lerp(
          new THREE.Vector3(v.position.x, v.position.y + 38, v.position.z + 18),
          0.1
        );
        camera.lookAt(v.position);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#02070a] text-cream select-none font-sans">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* Cyber Vignette & Scanline Overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 60%, rgba(2, 7, 10, 0.85) 100%)'
        }}
      />

      {/* TOP BRICELAB-STYLE HUD HEADER */}
      <header className="fixed top-0 left-0 right-0 z-30 flex flex-wrap items-center justify-between gap-3 px-4 md:px-8 py-3.5 pointer-events-none">
        {/* Profile Pill */}
        <div className="pointer-events-auto flex items-center gap-3 bg-[#030d12]/90 backdrop-blur-2xl border border-teal-500/30 rounded-full px-4 py-2 shadow-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              {MAHIM_V2_DATA.name}
            </div>
            <div className="text-[10px] font-mono text-teal-300/80">
              {MAHIM_V2_DATA.role} &bull; {MAHIM_V2_DATA.location}
            </div>
          </div>
        </div>

        {/* Center Mission & Objective Banner */}
        <div className="pointer-events-auto hidden md:flex items-center gap-3 bg-[#030d12]/90 backdrop-blur-2xl border border-white/10 rounded-full px-5 py-2 text-xs font-mono">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-neutral-300">
            Cores: <strong className="text-teal-300">{collectedCoresCount}/10</strong>
          </span>
          <span className="opacity-40">&bull;</span>
          <span className="text-neutral-300">
            Score: <strong className="text-amber-300">{score}</strong>
          </span>
          {missionComplete && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
              AI ARCHITECT MASTERED
            </span>
          )}
        </div>

        {/* Right Quick Actions (Audio, Camera, Dossier, Controls) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Audio Engine Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2.5 rounded-full border backdrop-blur-2xl transition-all cursor-pointer ${
              audioEnabled
                ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                : 'bg-black/60 border-white/10 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Engine & Cyber Sound Effects (Hotkey: M)"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Vehicle */}
          <button
            onClick={resetVehicle}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-neutral-300 hover:text-white backdrop-blur-2xl transition-colors cursor-pointer"
            title="Reset Vehicle to Track (Hotkey: R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Controls Modal Helper */}
          <button
            onClick={() => setShowControlsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white backdrop-blur-2xl transition-colors cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Controls</span>
          </button>

          {/* 3D Forest Sanctuary Walk button */}
          {onSwitchToForest && (
            <button
              onClick={onSwitchToForest}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 font-semibold text-xs font-mono transition-all cursor-pointer"
              title="Switch to 4K 3D Forest Walk"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Forest</span>
            </button>
          )}

          {/* Switch to Editorial Dossier button */}
          {onSwitchToDossier && (
            <button
              onClick={onSwitchToDossier}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-xs font-mono transition-all cursor-pointer"
              title="Switch to Clean Editorial Dossier"
            >
              <Layers className="w-3.5 h-3.5 text-teal-300" />
              <span>2D View</span>
            </button>
          )}

          {/* Full V2 Dossier View Modal */}
          <button
            onClick={() => setShowFullDossierModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-teal-400 hover:bg-teal-300 text-[#02070a] font-semibold text-xs font-mono transition-all shadow-md cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>V2 Dossier</span>
          </button>
        </div>
      </header>

      {/* INTERACTIVE PROMPT BANNER (when near a terminal or objective) */}
      {activePrompt && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-bounce">
          <div className="px-5 py-2.5 rounded-full bg-teal-400 text-[#02070a] font-mono font-bold text-xs sm:text-sm tracking-wider shadow-2xl shadow-teal-400/50 flex items-center gap-2">
            <Radio className="w-4 h-4 animate-spin" />
            <span>{activePrompt}</span>
          </div>
        </div>
      )}

      {/* SPEEDOMETER & NITRO GAUGE HUD (Bottom-Right, Bricelab / GTA style) */}
      <div className="fixed bottom-6 right-6 z-20 pointer-events-none flex flex-col items-end gap-2">
        <div className="bg-[#030d12]/90 backdrop-blur-2xl border border-teal-500/30 rounded-3xl p-5 shadow-2xl flex flex-col items-end min-w-[170px]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-mono font-bold text-white tracking-tighter">
              {speedKmh}
            </span>
            <span className="text-xs font-mono text-teal-300 uppercase">KM/H</span>
          </div>

          {/* Nitro Fuel Bar */}
          <div className="w-full mt-3">
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-1">
              <span className="flex items-center gap-1 text-teal-300">
                <Flame className={`w-3 h-3 ${isNitroActive ? 'text-amber-400' : ''}`} />
                NITRO
              </span>
              <span>{nitroFuel}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 rounded-full ${
                  isNitroActive
                    ? 'bg-gradient-to-r from-amber-400 to-teal-400 animate-pulse'
                    : 'bg-teal-400'
                }`}
                style={{ width: `${nitroFuel}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
          HOLD SHIFT FOR NITRO &bull; SPACE TO DRIFT &bull; J TO JUMP
        </div>
      </div>

      {/* MOBILE TOUCH CONTROLS (for phones and tablets) */}
      <div className="fixed bottom-6 left-6 z-20 pointer-events-auto flex lg:hidden items-center gap-3">
        <div className="grid grid-cols-3 gap-1.5 bg-black/70 backdrop-blur-md p-2 rounded-2xl border border-white/10">
          <div />
          <button
            onTouchStart={() => (keysRef.current.forward = true)}
            onTouchEnd={() => (keysRef.current.forward = false)}
            className="w-12 h-12 rounded-xl bg-teal-400/20 text-teal-200 font-bold active:bg-teal-400 active:text-black flex items-center justify-center"
          >
            &uarr;
          </button>
          <div />
          <button
            onTouchStart={() => (keysRef.current.left = true)}
            onTouchEnd={() => (keysRef.current.left = false)}
            className="w-12 h-12 rounded-xl bg-white/10 text-white font-bold active:bg-teal-400 active:text-black flex items-center justify-center"
          >
            &larr;
          </button>
          <button
            onTouchStart={() => (keysRef.current.backward = true)}
            onTouchEnd={() => (keysRef.current.backward = false)}
            className="w-12 h-12 rounded-xl bg-white/10 text-white font-bold active:bg-teal-400 active:text-black flex items-center justify-center"
          >
            &darr;
          </button>
          <button
            onTouchStart={() => (keysRef.current.right = true)}
            onTouchEnd={() => (keysRef.current.right = false)}
            className="w-12 h-12 rounded-xl bg-white/10 text-white font-bold active:bg-teal-400 active:text-black flex items-center justify-center"
          >
            &rarr;
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onTouchStart={() => (keysRef.current.nitro = true)}
            onTouchEnd={() => (keysRef.current.nitro = false)}
            className="px-4 py-2.5 rounded-xl bg-amber-400 text-black font-mono font-bold text-xs"
          >
            BOOST
          </button>
          <button
            onTouchStart={() => (keysRef.current.jump = true)}
            onTouchEnd={() => (keysRef.current.jump = false)}
            className="px-4 py-2.5 rounded-xl bg-teal-400 text-black font-mono font-bold text-xs"
          >
            JUMP
          </button>
        </div>
      </div>

      {/* MODAL 1: ACTIVE STATION TERMINAL DIALOG (About / Thoughts / Contact) */}
      {activeTerminal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="relative max-w-3xl w-full max-h-[85vh] overflow-y-auto bg-[#030d12] border border-teal-500/40 rounded-3xl p-6 md:p-10 shadow-2xl font-sans text-cream">
            <button
              onClick={() => setActiveTerminal(null)}
              className="sticky top-2 float-right p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-400 text-[#02070a]">
                HOLOGRAPHIC ARCHIVE
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-teal-300">
                {activeTerminal.subtitle}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-display italic text-white mb-4">
              {activeTerminal.title}
            </h2>

            {/* About Mahim Terminal Content */}
            {activeTerminal.type === 'about' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <h4 className="text-sm font-mono uppercase text-teal-300">
                    V2 Origin Narrative
                  </h4>
                  {MAHIM_V2_DATA.narrative.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-neutral-300">
                      {p}
                    </p>
                  ))}
                </div>

                {/* V2 Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MAHIM_V2_DATA.stats.map((st) => (
                    <div
                      key={st.label}
                      className="p-4 rounded-xl bg-black/50 border border-teal-500/25"
                    >
                      <div className="text-3xl font-mono font-bold text-teal-300 mb-1">
                        {st.value}
                      </div>
                      <div className="text-xs font-semibold text-white mb-0.5">{st.label}</div>
                      <div className="text-[11px] text-neutral-400">{st.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thought Essay Terminal Content */}
            {activeTerminal.type === 'thought' && activeTerminal.thoughtData && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/30 text-teal-200 text-xs sm:text-sm italic leading-relaxed">
                  &ldquo;{activeTerminal.thoughtData.excerpt}&rdquo;
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-sm leading-relaxed text-neutral-200 space-y-3">
                  <p>{activeTerminal.thoughtData.content}</p>
                </div>
              </div>
            )}

            {/* Contact Beacon Terminal Content */}
            {activeTerminal.type === 'contact' && (
              <div className="space-y-6">
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Have an inquiry regarding autonomous systems, mathematics, or software
                  architecture? Connect directly with Mahimur Rahman Khan.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`mailto:${MAHIM_V2_DATA.email}`}
                    className="p-4 rounded-2xl bg-teal-400 hover:bg-teal-300 text-[#02070a] font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Direct Email</span>
                  </a>
                  <button
                    onClick={() => handleCopy(MAHIM_V2_DATA.email, 'email')}
                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedKey === 'email' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied {MAHIM_V2_DATA.email}!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Email Address</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-4 border-t border-white/10">
                  <a
                    href={MAHIM_V2_DATA.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 flex items-center gap-1"
                  >
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={MAHIM_V2_DATA.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 flex items-center gap-1"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={MAHIM_V2_DATA.linktree}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 flex items-center gap-1"
                  >
                    <span>Linktree</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setActiveTerminal(null)}
                className="px-5 py-2 rounded-full bg-teal-400 text-[#02070a] font-semibold text-xs cursor-pointer"
              >
                Return to Game Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UNLOCKED CORE ORB NOTIFICATION */}
      {unlockedArea && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[90%] bg-[#030d12]/95 backdrop-blur-2xl border border-teal-400/50 rounded-3xl p-5 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-400 text-[#02070a]">
              CORE UNLOCKED &bull; {unlockedArea.id}
            </span>
            <button
              onClick={() => setUnlockedArea(null)}
              className="p-1 rounded-full text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h4 className="text-lg font-bold text-white mb-1">{unlockedArea.title}</h4>
          <p className="text-xs text-neutral-300 leading-relaxed mb-3">{unlockedArea.summary}</p>
          <div className="text-[10px] font-mono text-teal-300">
            +250 PTS &bull; Area cataloged in V2 Dossier
          </div>
        </div>
      )}

      {/* MODAL 3: FULL V2 DOSSIER ARCHIVE */}
      {showFullDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-[#02080c] border border-teal-500/35 rounded-3xl p-6 sm:p-10 shadow-2xl font-sans text-cream">
            <button
              onClick={() => setShowFullDossierModal(false)}
              className="sticky top-2 float-right p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-xs font-mono uppercase tracking-widest text-teal-300 mb-2">
              BRANCH V2 SPECIFICATION &bull; MAHIMUR RAHMAN KHAN
            </div>
            <h2 className="text-3xl md:text-5xl font-display italic text-white mb-3">
              {MAHIM_V2_DATA.name}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-neutral-400 mb-8">
              {MAHIM_V2_DATA.role} &bull; {MAHIM_V2_DATA.location} &bull; {MAHIM_V2_DATA.domain}
            </p>

            {/* Narrative */}
            <div className="mb-10 space-y-4">
              <h3 className="text-lg font-semibold text-teal-300 font-mono uppercase tracking-wider">
                Foundational Narrative
              </h3>
              {MAHIM_V2_DATA.narrative.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-neutral-200">
                  {p}
                </p>
              ))}
            </div>

            {/* 6 Areas of Interest */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-teal-300 font-mono uppercase tracking-wider mb-4">
                Six Areas of Interest
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MAHIM_V2_DATA.areasOfInterest.map((area) => (
                  <div
                    key={area.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10"
                  >
                    <div className="text-xs font-mono text-teal-300 mb-1">
                      {area.id} &bull; {area.title}
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">{area.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Thoughts */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-teal-300 font-mono uppercase tracking-wider mb-4">
                Recent Thoughts & Reflections
              </h3>
              <div className="space-y-4">
                {MAHIM_V2_DATA.thoughts.map((thought) => (
                  <div
                    key={thought.title}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
                      <span className="text-white font-medium text-sm">{thought.title}</span>
                      <span>{thought.readTime}</span>
                    </div>
                    <p className="text-xs italic text-teal-300/90 mb-3">&ldquo;{thought.excerpt}&rdquo;</p>
                    <p className="text-xs text-neutral-300 leading-relaxed">{thought.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowFullDossierModal(false)}
                className="px-5 py-2.5 rounded-full bg-teal-400 text-[#02070a] font-semibold text-xs cursor-pointer"
              >
                Close & Resume Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CONTROLS & GAMEPLAY GUIDE */}
      {showControlsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="relative max-w-xl w-full bg-[#030d12] border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl font-sans text-cream">
            <button
              onClick={() => setShowControlsModal(false)}
              className="sticky top-2 float-right p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-display italic text-white mb-2">
              Cyber-Rover Flight & Drive Controls
            </h3>
            <p className="text-xs text-neutral-300 mb-6 font-mono">
              Navigate the 3D Cyber Citadel, hit stunt ramps, and collect neural cores to learn all
              about Mahimur Rahman Khan.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-neutral-300">Drive / Reverse</span>
                <span className="text-teal-300 font-bold">W / S or &uarr; / &darr;</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-neutral-300">Steer</span>
                <span className="text-teal-300 font-bold">A / D or &larr; / &rarr;</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-neutral-300">Hyper Nitro Boost</span>
                <span className="text-teal-300 font-bold">Hold Shift</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-neutral-300">Handbrake Drift</span>
                <span className="text-teal-300 font-bold">Spacebar</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-neutral-300">Jump / Hop</span>
                <span className="text-teal-300 font-bold">J key</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-neutral-300">Interact with Terminal</span>
                <span className="text-teal-300 font-bold">E / Enter</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-neutral-300">Reset Vehicle</span>
                <span className="text-teal-300 font-bold">R key</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-neutral-300">Audio Sound Effects</span>
                <span className="text-teal-300 font-bold">M key</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowControlsModal(false)}
                className="px-5 py-2 rounded-full bg-teal-400 text-[#02070a] font-semibold text-xs cursor-pointer"
              >
                Let&apos;s Play
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
