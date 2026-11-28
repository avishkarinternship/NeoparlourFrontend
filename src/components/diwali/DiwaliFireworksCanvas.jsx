import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useDarkMode } from '../../context/DarkModeContext';
import { DIWALI_CONFIG } from './diwaliConfig';

/**
 * Photorealistic 360° Spherical Starburst Fireworks Engine
 * --------------------------------------------------------
 * 1. STRICT 2-COLOR PALETTES PER MODE:
 *    - DARK MODE: Radiant Diwali Gold & Firecracker Crimson Red
 *    - LIGHT MODE: Royal Purple & Vibrant Pink
 * 2. WHOLE-COMPONENT SPREADING TINT ILLUMINATION:
 *    - When the cracker bursts, a dynamic wave of ambient light and rich color tint
 *      sweeps across the ENTIRE hero component.
 *    - PERSISTS UNTIL THE CRACKER FINISHES: Stays active during the entire starburst
 *      bloom & lingering twinkle, and smoothly dissolves in tandem as the cracker fades out.
 * 3. REALISTIC 1.5-SECOND ASCENT:
 *    - True 1500ms ascent with aerodynamic deceleration near apex.
 *    - Multilayer incandescent rocket head + radiant comet tail + fuse spark wake.
 * 4. 360° ZERO-GRAVITY CHRYSANTHEMUM STARBURST:
 *    - Non-hollow glowing sunburst core + 85-115 radial spokes + diamond star flares.
 * 5. CONFINED STRICTLY TO THE HERO SECTION (#hero-section).
 */

// DARK MODE: Strictly 2 Colors (Radiant Diwali Gold & Crimson Red)
const DARK_PALETTES = [
  {
    name: 'Diwali Gold',
    rgb: '255, 215, 0',
    coreRgb: '255, 248, 200',
    flashRgb: '255, 215, 60'
  },
  {
    name: 'Crimson Red',
    rgb: '255, 24, 70',
    coreRgb: '255, 195, 210',
    flashRgb: '255, 50, 80'
  }
];

// LIGHT MODE: Strictly 2 Colors (Royal Purple & Vibrant Pink)
const LIGHT_PALETTES = [
  {
    name: 'Royal Purple',
    rgb: '155, 38, 220', // Rich, vibrant royal purple
    coreRgb: '110, 20, 165',
    flashRgb: '168, 85, 247' // Atmospheric purple tint wash across the hero section
  },
  {
    name: 'Vibrant Pink',
    rgb: '244, 63, 142', // Vivid, festive rose pink
    coreRgb: '190, 24, 95',
    flashRgb: '251, 113, 133' // Atmospheric rosy pink tint wash across the hero section
  }
];

// Pre-rendered optical star flare sprite cache
const spriteCache = new Map();

function getStarFlareSprite(rgbStr, isDark) {
  const cacheKey = `${rgbStr}_${isDark ? 'dark' : 'light'}`;
  if (spriteCache.has(cacheKey)) {
    return spriteCache.get(cacheKey);
  }

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  if (isDark) {
    // Dark Mode: Luminous white-hot center bleeding into vibrant glow
    const radGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.46);
    radGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
    radGlow.addColorStop(0.12, `rgba(${rgbStr}, 0.9)`);
    radGlow.addColorStop(0.45, `rgba(${rgbStr}, 0.22)`);
    radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
    ctx.fill();

    const hGrad = ctx.createLinearGradient(0, cy, size, cy);
    hGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    hGrad.addColorStop(0.35, `rgba(${rgbStr}, 0.35)`);
    hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    hGrad.addColorStop(0.65, `rgba(${rgbStr}, 0.35)`);
    hGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.moveTo(2, cy);
    ctx.lineTo(cx, cy - 2.5);
    ctx.lineTo(size - 2, cy);
    ctx.lineTo(cx, cy + 2.5);
    ctx.closePath();
    ctx.fill();

    const vGrad = ctx.createLinearGradient(cx, 0, cx, size);
    vGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    vGrad.addColorStop(0.35, `rgba(${rgbStr}, 0.35)`);
    vGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    vGrad.addColorStop(0.65, `rgba(${rgbStr}, 0.35)`);
    vGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.moveTo(cx, 2);
    ctx.lineTo(cx + 2.5, cy);
    ctx.lineTo(cx, size - 2);
    ctx.lineTo(cx - 2.5, cy);
    ctx.closePath();
    ctx.fill();

    const pin = ctx.createRadialGradient(cx, cy, 0, cx, cy, 5);
    pin.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pin.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = pin;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Light Mode (Purple & Pink): High-contrast saturated jewel star flare for light grey background
    const radGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.46);
    radGlow.addColorStop(0, `rgba(${rgbStr}, 1)`);
    radGlow.addColorStop(0.25, `rgba(${rgbStr}, 0.65)`);
    radGlow.addColorStop(0.55, `rgba(${rgbStr}, 0.2)`);
    radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
    ctx.fill();

    const hGrad = ctx.createLinearGradient(0, cy, size, cy);
    hGrad.addColorStop(0, `rgba(${rgbStr}, 0)`);
    hGrad.addColorStop(0.32, `rgba(${rgbStr}, 0.55)`);
    hGrad.addColorStop(0.5, `rgba(255, 255, 255, 0.95)`);
    hGrad.addColorStop(0.68, `rgba(${rgbStr}, 0.55)`);
    hGrad.addColorStop(1, `rgba(${rgbStr}, 0)`);
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.moveTo(2, cy);
    ctx.lineTo(cx, cy - 2.5);
    ctx.lineTo(size - 2, cy);
    ctx.lineTo(cx, cy + 2.5);
    ctx.closePath();
    ctx.fill();

    const vGrad = ctx.createLinearGradient(cx, 0, cx, size);
    vGrad.addColorStop(0, `rgba(${rgbStr}, 0)`);
    vGrad.addColorStop(0.32, `rgba(${rgbStr}, 0.55)`);
    vGrad.addColorStop(0.5, `rgba(255, 255, 255, 0.95)`);
    vGrad.addColorStop(0.68, `rgba(${rgbStr}, 0.55)`);
    vGrad.addColorStop(1, `rgba(${rgbStr}, 0)`);
    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.moveTo(cx, 2);
    ctx.lineTo(cx + 2.5, cy);
    ctx.lineTo(cx, size - 2);
    ctx.lineTo(cx - 2.5, cy);
    ctx.closePath();
    ctx.fill();

    const pin = ctx.createRadialGradient(cx, cy, 0, cx, cy, 5.5);
    pin.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pin.addColorStop(0.4, `rgba(${rgbStr}, 0.9)`);
    pin.addColorStop(1, `rgba(${rgbStr}, 0)`);
    ctx.fillStyle = pin;
    ctx.beginPath();
    ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }

  spriteCache.set(cacheKey, canvas);
  return canvas;
}

const DiwaliFireworksCanvas = ({ enabled = true }) => {
  const location = useLocation();
  const darkModeContext = useDarkMode();
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const [heroElement, setHeroElement] = useState(null);

  // Safe detection of dark mode state
  const isDark = darkModeContext
    ? Boolean(darkModeContext.isDark)
    : typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const isDarkRef = useRef(isDark);
  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  const stateRef = useRef({
    rockets: [],
    starbursts: [],
    flashes: [],
    lastLaunchTime: 0,
    launchInterval: 3600, // Launch a new cracker every ~3.6s
    width: 0,
    height: 0,
    dpr: 1,
    inView: true
  });

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Helper to locate hero section in the current DOM
  const findHeroSection = () => {
    return (
      document.getElementById('hero-section') ||
      document.querySelector(DIWALI_CONFIG.heroSelector) ||
      document.getElementById('search-bar-section')?.closest('section')
    );
  };

  // Robust Hero Section detection:
  // Catches when async API requests finish and React swaps the skeleton for the real hero section.
  useEffect(() => {
    if (!enabled) {
      setHeroElement(null);
      return;
    }

    const checkHero = () => {
      const el = findHeroSection();
      if (el && el.isConnected) {
        setHeroElement((prev) => (prev === el ? prev : el));
        return true;
      } else {
        setHeroElement((prev) => (prev ? null : prev));
        return false;
      }
    };

    checkHero();

    const mutationObserver = new MutationObserver(() => {
      checkHero();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    const pollInterval = setInterval(() => {
      checkHero();
    }, 250);

    return () => {
      mutationObserver.disconnect();
      clearInterval(pollInterval);
    };
  }, [enabled, location.pathname]);

  // Create a realistic ascending rocket taking ~1.5 seconds (1500ms) to climb to apex
  const createRocket = (targetX = null) => {
    const state = stateRef.current;
    if (!state.width || !state.height) return;

    const currentDark = isDarkRef.current;
    const palettes = currentDark ? DARK_PALETTES : LIGHT_PALETTES;
    const palette = pick(palettes);

    const startX = targetX !== null ? targetX : state.width * (0.2 + Math.random() * 0.6);
    const startY = state.height;
    // Apex target in upper 20% to 38% of hero section
    const targetY = state.height * (0.22 + Math.random() * 0.16);

    state.rockets.push({
      startX,
      startY,
      x: startX,
      y: startY,
      targetY,
      driftX: (Math.random() - 0.5) * 14,
      wobbleSpeed: 0.008 + Math.random() * 0.004,
      wobblePhase: Math.random() * Math.PI * 2,
      startTime: performance.now(),
      duration: 1500, // Exactly 1.5 seconds ascent duration
      palette,
      isDark: currentDark,
      trail: [],
      fuseSparks: [],
      alive: true
    });
  };

  // Detonate into 360° Spherical Starburst with whole-component spreading tint glow
  const explodeRocket = (rocket) => {
    const state = stateRef.current;
    const { x, y, palette, isDark: rocketDark } = rocket;

    // 1. DYNAMIC SPREADING TINT ILLUMINATING THE WHOLE COMPONENT
    // Duration matches the full lifetime of the starburst (2550ms) so the tint stays until the cracker finishes!
    const heroDiag = Math.hypot(state.width, state.height);
    state.flashes.push({
      x,
      y,
      startTime: performance.now(),
      duration: 2550, // Stays active throughout the entire starburst until cracker finishes
      maxRadius: heroDiag * 1.3, // Sweeps across every edge and corner of the hero section
      flashRgb: palette.flashRgb,
      isDark: rocketDark,
      alive: true
    });

    // 2. 360° Starburst Rays (Matching reference image)
    const maxBloomRadius = Math.min(state.width, state.height) * (0.32 + Math.random() * 0.08);
    const rayCount = 88 + Math.floor(Math.random() * 26);
    const rays = [];

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.04;

      // Tiered depth shells for dense 3D chrysanthemum effect
      const shellRand = Math.random();
      const shellTier = shellRand < 0.22 ? 0.44 : shellRand < 0.5 ? 0.7 : shellRand < 0.8 ? 0.88 : 1.0;
      const targetDist = maxBloomRadius * shellTier * (0.9 + Math.random() * 0.2);

      rays.push({
        angle,
        targetDist,
        currentDist: 0,
        spriteSize: 18 + Math.random() * 12,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.009 + Math.random() * 0.007
      });
    }

    // 3. Inner Core Embers (glowing non-hollow center)
    const coreEmbers = [];
    const emberCount = 26;
    for (let e = 0; e < emberCount; e++) {
      const emberAngle = Math.random() * Math.PI * 2;
      const emberDist = Math.random() * 26 + 4;
      coreEmbers.push({
        angle: emberAngle,
        dist: emberDist,
        size: Math.random() * 14 + 10,
        phase: Math.random() * Math.PI * 2
      });
    }

    state.starbursts.push({
      cx: x,
      cy: y,
      palette,
      isDark: rocketDark,
      sprite: getStarFlareSprite(palette.rgb, rocketDark),
      rays,
      coreEmbers,
      alpha: 1,
      coreRadius: 36,
      startTime: performance.now(),
      bloomDuration: 750, // Rapid initial blast expanding over 750ms
      lingerDuration: 1800, // Linger and sparkle in mid-air
      totalDuration: 2550, // Total lifetime before fully dissipating
      alive: true
    });
  };

  // Main canvas animation lifecycle tied to heroElement
  useEffect(() => {
    if (!enabled || !heroElement || !heroElement.isConnected) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const state = stateRef.current;

    const resizeToHero = () => {
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      const width = heroElement.clientWidth;
      const height = heroElement.clientHeight;

      if (!width || !height) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      state.width = width;
      state.height = height;
      state.dpr = dpr;
    };

    resizeToHero();

    const resizeObserver = new ResizeObserver(() => {
      resizeToHero();
    });
    resizeObserver.observe(heroElement);

    // Track scroll visibility to pause rendering when hero is scrolled out of view
    const handleScrollVisibility = () => {
      const rect = heroElement.getBoundingClientRect();
      state.inView = rect.bottom > 0 && rect.top < window.innerHeight;
    };

    handleScrollVisibility();
    window.addEventListener('scroll', handleScrollVisibility, { passive: true });

    // Launch initial rocket
    createRocket();
    state.lastLaunchTime = performance.now();

    const loop = (currentTime) => {
      animFrameRef.current = requestAnimationFrame(loop);

      if (document.hidden || !state.inView) return;

      const { width, height, dpr } = state;
      if (!width || !height) return;

      const currentDark = isDarkRef.current;

      try {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Dark Mode: Additive glow for black background; Light Mode: Saturated source-over for light grey background
        ctx.globalCompositeOperation = currentDark ? 'lighter' : 'source-over';
        ctx.globalAlpha = 1.0;

        // -------------------------------------------------------------
        // 1. DYNAMIC SPREADING TINT ILLUMINATING THE WHOLE COMPONENT
        // (Soft, delicate atmospheric glow that persists until cracker finishes)
        // -------------------------------------------------------------
        for (let i = state.flashes.length - 1; i >= 0; i--) {
          const flash = state.flashes[i];
          const elapsed = currentTime - flash.startTime;

          if (elapsed >= flash.duration) {
            state.flashes.splice(i, 1);
            continue;
          }

          // A. Spreading Wavefront: sweeps rapidly from burst center across entire hero component
          const waveProgress = Math.min(1, elapsed / 500);
          const waveEase = 1 - Math.pow(1 - waveProgress, 2.5);
          const currentRadius = 40 + (flash.maxRadius - 40) * waveEase;

          // B. Gentle, refined intensity envelope:
          // 0-120ms: initial soft flash
          // 120-1800ms: soft, delicate ambient tint plateau (never overpowering text)
          // 1800-2550ms: smooth fade-out in tandem with the cracker
          let intensity = 1;
          if (elapsed < 120) {
            intensity = elapsed / 120;
          } else if (elapsed <= 1800) {
            intensity = 0.52 - 0.12 * ((elapsed - 120) / (1800 - 120)); // Soft, gentle plateau (0.52 -> 0.40)
          } else {
            const fadeProgress = (elapsed - 1800) / (flash.duration - 1800);
            intensity = Math.max(0, 0.40 * (1 - fadeProgress));
          }

          // 1. Full-component atmospheric tint wash (subtle, delicate veil)
          const ambientAlpha = flash.isDark ? intensity * 0.08 : intensity * 0.055;
          ctx.globalAlpha = ambientAlpha;
          ctx.fillStyle = `rgb(${flash.flashRgb})`;
          ctx.fillRect(0, 0, width, height);

          // 2. Soft expanding radial light bloom
          ctx.globalAlpha = 1.0;
          const waveGrad = ctx.createRadialGradient(
            flash.x, flash.y, 0,
            flash.x, flash.y, currentRadius
          );

          if (flash.isDark) {
            waveGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.32})`);
            waveGrad.addColorStop(0.2, `rgba(${flash.flashRgb}, ${intensity * 0.2})`);
            waveGrad.addColorStop(0.65, `rgba(${flash.flashRgb}, ${intensity * 0.06})`);
            waveGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else {
            // Light Mode (Soft Purple & Pink glow)
            waveGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.22})`);
            waveGrad.addColorStop(0.25, `rgba(${flash.flashRgb}, ${intensity * 0.16})`);
            waveGrad.addColorStop(0.7, `rgba(${flash.flashRgb}, ${intensity * 0.04})`);
            waveGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          }

          ctx.fillStyle = waveGrad;
          ctx.fillRect(0, 0, width, height);
        }

        // -------------------------------------------------------------
        // 2. REALISTIC 1.5-SECOND ROCKET ASCENT (100% Constant Brightness)
        // -------------------------------------------------------------
        ctx.globalAlpha = 1.0;

        for (let i = state.rockets.length - 1; i >= 0; i--) {
          const r = state.rockets[i];
          const elapsed = currentTime - r.startTime;
          const progress = Math.min(1, elapsed / r.duration);

          // Realistic physics ease-out: brisk initial thrust, decelerating near apex
          const climbEase = 1 - Math.pow(1 - progress, 2.1);
          r.y = r.startY - (r.startY - r.targetY) * climbEase;

          // Natural organic aerodynamic sway
          const sway = Math.sin(elapsed * r.wobbleSpeed + r.wobblePhase) * 1.6;
          r.x = r.startX + sway + r.driftX * progress;

          // Record trail
          r.trail.push({ x: r.x, y: r.y });
          if (r.trail.length > 20) r.trail.shift();

          // Continuous micro fuse sparks (authentic burning propellant wake)
          for (let spCount = 0; spCount < 3; spCount++) {
            r.fuseSparks.push({
              x: r.x + (Math.random() - 0.5) * 3,
              y: r.y + Math.random() * 4,
              vx: (Math.random() - 0.5) * 1.4,
              vy: Math.random() * 2.6 + 1.2,
              life: 1.0,
              decay: 0.04 + Math.random() * 0.025,
              color: Math.random() < 0.65 ? r.palette.rgb : (r.isDark ? '255, 245, 180' : '255, 195, 230'),
              size: Math.random() * 1.6 + 0.7
            });
          }

          // Render & update fuse sparks with full luminosity
          ctx.globalAlpha = 1.0;
          for (let s = r.fuseSparks.length - 1; s >= 0; s--) {
            const sp = r.fuseSparks[s];
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.vx *= 0.94;
            sp.vy *= 0.96;
            sp.life -= sp.decay;

            if (sp.life <= 0) {
              r.fuseSparks.splice(s, 1);
              continue;
            }

            ctx.fillStyle = `rgba(${sp.color}, ${Math.max(0, sp.life)})`;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
            ctx.fill();
          }

          // Radiant tapered exhaust comet tail
          if (r.trail.length > 2) {
            for (let t = 0; t < r.trail.length - 1; t++) {
              const p1 = r.trail[t];
              const p2 = r.trail[t + 1];
              const segProgress = (t + 1) / r.trail.length;

              // Core bright spine of tail
              ctx.strokeStyle = r.isDark
                ? `rgba(255, 255, 240, ${segProgress * 0.6})`
                : `rgba(255, 235, 248, ${segProgress * 0.75})`;
              ctx.lineWidth = 0.6 + segProgress * 1.4;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();

              // Outer rich envelope
              ctx.strokeStyle = `rgba(${r.palette.rgb}, ${segProgress * 0.85})`;
              ctx.lineWidth = 1.2 + segProgress * 2.6;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }

          // Multilayer incandescent rocket head
          ctx.globalAlpha = 1.0;
          const headGlow = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 14);
          if (r.isDark) {
            headGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
            headGlow.addColorStop(0.2, `rgba(${r.palette.coreRgb}, 0.95)`);
            headGlow.addColorStop(0.55, `rgba(${r.palette.rgb}, 0.5)`);
            headGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else {
            headGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
            headGlow.addColorStop(0.25, `rgba(${r.palette.rgb}, 0.9)`);
            headGlow.addColorStop(0.65, `rgba(${r.palette.coreRgb}, 0.45)`);
            headGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          }

          ctx.fillStyle = headGlow;
          ctx.beginPath();
          ctx.arc(r.x, r.y, 14, 0, Math.PI * 2);
          ctx.fill();

          // White-hot burning core pin
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Optical twinkle cross on head
          ctx.strokeStyle = r.isDark ? 'rgba(255, 255, 245, 0.9)' : `rgba(255, 255, 255, 0.9)`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(r.x - 4, r.y);
          ctx.lineTo(r.x + 4, r.y);
          ctx.moveTo(r.x, r.y - 4);
          ctx.lineTo(r.x, r.y + 4);
          ctx.stroke();

          // Apex detonation after 1.5s
          if (progress >= 1 || elapsed >= r.duration) {
            explodeRocket(r);
            state.rockets.splice(i, 1);
          }
        }

        // -------------------------------------------------------------
        // 3. 360° SPHERICAL STARBURST
        // -------------------------------------------------------------
        for (let sIdx = state.starbursts.length - 1; sIdx >= 0; sIdx--) {
          const sb = state.starbursts[sIdx];
          const elapsed = currentTime - sb.startTime;

          // Calculate global fade over time
          let globalAlpha = 1;
          if (elapsed > sb.lingerDuration) {
            globalAlpha = Math.max(0, 1 - (elapsed - sb.lingerDuration) / (sb.totalDuration - sb.lingerDuration));
          }

          if (elapsed >= sb.totalDuration || globalAlpha <= 0) {
            state.starbursts.splice(sIdx, 1);
            continue;
          }

          // Smooth explosive bloom expansion: fast initial blast, smooth coasting stop
          const bloomProgress = Math.min(1, elapsed / sb.bloomDuration);
          const easeOut = 1 - Math.pow(1 - bloomProgress, 3.2);

          // A. Radiating Beam Spokes & Star Diamond Tips
          for (let rIdx = 0; rIdx < sb.rays.length; rIdx++) {
            const ray = sb.rays[rIdx];
            ray.currentDist = ray.targetDist * easeOut;

            const cosA = Math.cos(ray.angle);
            const sinA = Math.sin(ray.angle);

            const tipX = sb.cx + cosA * ray.currentDist;
            const tipY = sb.cy + sinA * ray.currentDist;

            // Natural chemical scintillation twinkle
            const twinkle = 0.82 + Math.sin(elapsed * ray.twinkleSpeed + ray.twinklePhase) * 0.18;
            const currentAlpha = globalAlpha * twinkle;

            const beamGrad = ctx.createLinearGradient(sb.cx, sb.cy, tipX, tipY);
            if (sb.isDark) {
              beamGrad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha * 0.95})`);
              beamGrad.addColorStop(0.25, `rgba(${sb.palette.rgb}, ${currentAlpha * 0.85})`);
              beamGrad.addColorStop(0.75, `rgba(${sb.palette.rgb}, ${currentAlpha * 0.5})`);
              beamGrad.addColorStop(1, `rgba(255, 255, 255, ${currentAlpha * 0.95})`);
            } else {
              // Light Mode (Purple & Pink)
              beamGrad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha * 0.8})`);
              beamGrad.addColorStop(0.25, `rgba(${sb.palette.rgb}, ${currentAlpha * 0.95})`);
              beamGrad.addColorStop(0.75, `rgba(${sb.palette.rgb}, ${currentAlpha * 0.75})`);
              beamGrad.addColorStop(1, `rgba(${sb.palette.rgb}, ${currentAlpha * 0.95})`);
            }

            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = beamGrad;
            ctx.lineWidth = 1.35;
            ctx.beginPath();
            ctx.moveTo(sb.cx, sb.cy);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();

            // Star diamond lens flare sprite at tip
            const spriteSize = ray.spriteSize * (0.85 + twinkle * 0.25);
            ctx.globalAlpha = currentAlpha;
            ctx.drawImage(
              sb.sprite,
              tipX - spriteSize / 2,
              tipY - spriteSize / 2,
              spriteSize,
              spriteSize
            );

            // Bright anti-aliased center pin at tip
            ctx.fillStyle = sb.isDark
              ? `rgba(255, 255, 255, ${currentAlpha})`
              : `rgba(255, 255, 255, ${currentAlpha})`;
            ctx.beginPath();
            ctx.arc(tipX, tipY, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }

          // B. Radiant Sunburst Center (Non-Hollow Glowing Core)
          ctx.globalAlpha = 1.0;
          const coreAlpha = globalAlpha;
          const coreGrad = ctx.createRadialGradient(
            sb.cx, sb.cy, 0,
            sb.cx, sb.cy, sb.coreRadius
          );
          if (sb.isDark) {
            coreGrad.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha * 0.98})`);
            coreGrad.addColorStop(0.18, `rgba(255, 250, 220, ${coreAlpha * 0.92})`);
            coreGrad.addColorStop(0.45, `rgba(${sb.palette.rgb}, ${coreAlpha * 0.8})`);
            coreGrad.addColorStop(0.8, `rgba(${sb.palette.rgb}, ${coreAlpha * 0.3})`);
            coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else {
            // Light Mode (Purple & Pink glowing core)
            coreGrad.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha * 0.98})`);
            coreGrad.addColorStop(0.2, `rgba(255, 230, 248, ${coreAlpha * 0.95})`);
            coreGrad.addColorStop(0.5, `rgba(${sb.palette.rgb}, ${coreAlpha * 0.85})`);
            coreGrad.addColorStop(0.8, `rgba(${sb.palette.coreRgb}, ${coreAlpha * 0.35})`);
            coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          }

          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(sb.cx, sb.cy, sb.coreRadius, 0, Math.PI * 2);
          ctx.fill();

          // C. Inner Core Embers
          for (let e = 0; e < sb.coreEmbers.length; e++) {
            const emb = sb.coreEmbers[e];
            const embTwinkle = 0.7 + Math.sin(elapsed * 0.012 + emb.phase) * 0.3;
            const embX = sb.cx + Math.cos(emb.angle) * emb.dist;
            const embY = sb.cy + Math.sin(emb.angle) * emb.dist;
            const embSize = emb.size * embTwinkle;

            ctx.globalAlpha = globalAlpha * embTwinkle;
            ctx.drawImage(
              sb.sprite,
              embX - embSize / 2,
              embY - embSize / 2,
              embSize,
              embSize
            );
          }
        }

        // CRITICAL: Always restore globalAlpha to 1.0 at end of frame
        ctx.globalAlpha = 1.0;

        // -------------------------------------------------------------
        // 4. AUTOMATIC LAUNCH RHYTHM
        // -------------------------------------------------------------
        if (currentTime - state.lastLaunchTime >= state.launchInterval) {
          state.lastLaunchTime = currentTime;
          createRocket();
        }
      } catch (err) {
        // Prevent animation thread lockup
        console.warn('[DiwaliFireworks] Render error caught:', err);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);

    const handleHeroClick = (e) => {
      if (!DIWALI_CONFIG.clickToBurst) return;
      const interactive = e.target?.closest?.(
        'button, a, input, select, textarea, label, [role="button"], [role="menuitem"], .diwali-interactive'
      );
      if (!interactive) {
        const rect = heroElement.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        createRocket(clickX);
      }
    };

    heroElement.addEventListener('click', handleHeroClick);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScrollVisibility);
      heroElement.removeEventListener('click', handleHeroClick);
    };
  }, [enabled, heroElement]);

  if (!enabled || !heroElement) return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      className="diwali-hero-fireworks-canvas pointer-events-none overflow-hidden select-none block"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: DIWALI_CONFIG.zIndex,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    />,
    heroElement
  );
};

export default React.memo(DiwaliFireworksCanvas);
