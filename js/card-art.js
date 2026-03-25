/**
 * Empathly — Generative Card Art
 * Creates unique SVG art for each emotion card.
 * Abstract, watercolor-inspired, layered shapes.
 */

const CardArt = (function () {
  'use strict';

  // Seeded random for deterministic art per emotion
  function seededRandom(seed) {
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s & 0x7fffffff) / 2147483647;
    };
  }

  function hexToRGB(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }

  function lighten(hex, amount) {
    const { r, g, b } = hexToRGB(hex);
    return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
  }

  function darken(hex, amount) {
    const { r, g, b } = hexToRGB(hex);
    return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
  }

  const CATEGORY_PALETTES = {
    licht: { colors: ['#F6C344', '#FFEAA7', '#FD9644', '#F8E8B0', '#FFF3C4'], accent: '#F39C12' },
    mitte: { colors: ['#7BAFD4', '#A8D8EA', '#6C8EBF', '#B8D4E3', '#D4E6F1'], accent: '#5B9BD5' },
    schwere: { colors: ['#6B6570', '#9B8EA8', '#4A4453', '#8E7B98', '#B8A9C9'], accent: '#5D4E6D' },
    sturm: { colors: ['#E74C3C', '#FF7675', '#D35400', '#E08040', '#F5B041'], accent: '#C0392B' },
    angst: { colors: ['#8E44AD', '#BB8FCE', '#6C3483', '#A569BD', '#D2B4DE'], accent: '#7D3C98' },
    schatten: { colors: ['#5D6D7E', '#85929E', '#34495E', '#7F8C8D', '#AEB6BF'], accent: '#2C3E50' }
  };

  // Pattern generators per category
  const categoryPatterns = {
    licht: generateLichtArt,
    mitte: generateMitteArt,
    schwere: generateSchwereArt,
    sturm: generateSturmArt,
    angst: generateAngstArt,
    schatten: generateSchattenArt
  };

  function generateCardArt(emotionId, categoryId) {
    const palette = CATEGORY_PALETTES[categoryId] || CATEGORY_PALETTES.licht;
    const rng = seededRandom(emotionId + categoryId);
    const w = 110, h = 149;
    const uid = emotionId.replace(/[^a-z0-9]/gi, '') + Math.floor(rng() * 9999);

    const patternFn = categoryPatterns[categoryId] || generateLichtArt;
    const shapes = patternFn(rng, palette, w, h, uid);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <filter id="wc-${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="${0.015 + rng() * 0.025}" numOctaves="4" seed="${Math.floor(rng() * 100)}" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="${8 + rng() * 12}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="blur-${uid}">
      <feGaussianBlur stdDeviation="${2 + rng() * 3}"/>
    </filter>
    <filter id="softblur-${uid}">
      <feGaussianBlur stdDeviation="${1 + rng() * 1.5}"/>
    </filter>
    <radialGradient id="rg-${uid}" cx="${40 + rng() * 30}%" cy="${30 + rng() * 40}%" r="60%">
      <stop offset="0%" stop-color="${lighten(palette.colors[0], 0.4)}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${palette.colors[1]}" stop-opacity="0.3"/>
    </radialGradient>
    <linearGradient id="lg-${uid}" x1="0%" y1="0%" x2="${rng() > 0.5 ? '100' : '0'}%" y2="100%">
      <stop offset="0%" stop-color="${palette.colors[2]}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${lighten(palette.colors[0], 0.5)}" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#lg-${uid})"/>
  <rect width="${w}" height="${h}" fill="url(#rg-${uid})" opacity="0.7"/>
  ${shapes}
</svg>`;
  }

  // ── Licht: radial bursts, sun rays, floating particles, warm gradients ──
  function generateLichtArt(rng, palette, w, h, uid) {
    let svg = '';
    const cx = w * (0.3 + rng() * 0.4);
    const cy = h * (0.2 + rng() * 0.3);

    // Sun rays
    const rayCount = 6 + Math.floor(rng() * 6);
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const len = 30 + rng() * 60;
      const x2 = cx + Math.cos(angle) * len;
      const y2 = cy + Math.sin(angle) * len;
      svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${palette.colors[Math.floor(rng() * 3)]}" stroke-width="${1 + rng() * 3}" opacity="${0.2 + rng() * 0.3}" filter="url(#softblur-${uid})"/>`;
    }

    // Radial burst circles
    for (let i = 0; i < 4; i++) {
      const r = 10 + rng() * 30;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${palette.colors[Math.floor(rng() * palette.colors.length)]}" stroke-width="${0.5 + rng()}" opacity="${0.15 + rng() * 0.25}" filter="url(#wc-${uid})"/>`;
    }

    // Central glow
    svg += `<circle cx="${cx}" cy="${cy}" r="${8 + rng() * 12}" fill="${lighten(palette.colors[0], 0.3)}" opacity="${0.5 + rng() * 0.3}" filter="url(#blur-${uid})"/>`;

    // Floating particles
    for (let i = 0; i < 12 + Math.floor(rng() * 8); i++) {
      const px = rng() * w;
      const py = rng() * h;
      const pr = 1 + rng() * 4;
      svg += `<circle cx="${px}" cy="${py}" r="${pr}" fill="${palette.colors[Math.floor(rng() * palette.colors.length)]}" opacity="${0.15 + rng() * 0.4}" filter="url(#softblur-${uid})"/>`;
    }

    return svg;
  }

  // ── Mitte: flowing waves, soft circles, horizontal layers, mist ──
  function generateMitteArt(rng, palette, w, h, uid) {
    let svg = '';

    // Horizontal wave layers
    for (let i = 0; i < 5; i++) {
      const y = h * (0.15 + i * 0.18) + rng() * 15;
      const amp = 5 + rng() * 15;
      const freq = 0.03 + rng() * 0.04;
      let d = `M 0 ${y}`;
      for (let x = 0; x <= w; x += 3) {
        d += ` L ${x} ${y + Math.sin(x * freq + i * 2) * amp}`;
      }
      d += ` L ${w} ${h} L 0 ${h} Z`;
      svg += `<path d="${d}" fill="${palette.colors[i % palette.colors.length]}" opacity="${0.12 + rng() * 0.18}" filter="url(#wc-${uid})"/>`;
    }

    // Soft circles (mist)
    for (let i = 0; i < 6; i++) {
      const cx = rng() * w;
      const cy = rng() * h;
      const r = 15 + rng() * 35;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${lighten(palette.colors[Math.floor(rng() * 3)], 0.3)}" opacity="${0.1 + rng() * 0.15}" filter="url(#blur-${uid})"/>`;
    }

    return svg;
  }

  // ── Schwere: falling shapes, dark pools, heavy drips, deep gradients ──
  function generateSchwereArt(rng, palette, w, h, uid) {
    let svg = '';

    // Dark pools at bottom
    for (let i = 0; i < 3; i++) {
      const cx = rng() * w;
      const cy = h * (0.6 + rng() * 0.3);
      const rx = 20 + rng() * 40;
      const ry = 10 + rng() * 20;
      svg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${darken(palette.colors[Math.floor(rng() * 3)], 0.3)}" opacity="${0.2 + rng() * 0.25}" filter="url(#wc-${uid})"/>`;
    }

    // Falling drip shapes
    for (let i = 0; i < 6 + Math.floor(rng() * 4); i++) {
      const x = rng() * w;
      const y1 = rng() * h * 0.4;
      const y2 = y1 + 20 + rng() * 60;
      const bw = 2 + rng() * 5;
      svg += `<line x1="${x}" y1="${y1}" x2="${x + rng() * 6 - 3}" y2="${y2}" stroke="${palette.colors[Math.floor(rng() * palette.colors.length)]}" stroke-width="${bw}" stroke-linecap="round" opacity="${0.1 + rng() * 0.2}" filter="url(#softblur-${uid})"/>`;
    }

    // Deep gradient overlay
    svg += `<rect width="${w}" height="${h}" fill="${darken(palette.accent, 0.4)}" opacity="${0.15 + rng() * 0.1}" filter="url(#blur-${uid})"/>`;

    return svg;
  }

  // ── Sturm: sharp angles, lightning, flame shapes, energy lines ──
  function generateSturmArt(rng, palette, w, h, uid) {
    let svg = '';

    // Lightning bolts
    for (let i = 0; i < 2 + Math.floor(rng() * 3); i++) {
      let x = rng() * w;
      let y = 0;
      let d = `M ${x} ${y}`;
      const segments = 4 + Math.floor(rng() * 4);
      for (let s = 0; s < segments; s++) {
        x += (rng() - 0.5) * 30;
        y += h / segments + rng() * 10;
        d += ` L ${x} ${y}`;
      }
      svg += `<path d="${d}" fill="none" stroke="${palette.colors[Math.floor(rng() * 3)]}" stroke-width="${1 + rng() * 2.5}" opacity="${0.2 + rng() * 0.3}" filter="url(#softblur-${uid})"/>`;
    }

    // Sharp angle shapes (triangles)
    for (let i = 0; i < 4 + Math.floor(rng() * 3); i++) {
      const tx = rng() * w;
      const ty = rng() * h;
      const size = 10 + rng() * 25;
      const d = `M ${tx} ${ty - size} L ${tx + size * 0.6} ${ty + size * 0.4} L ${tx - size * 0.6} ${ty + size * 0.4} Z`;
      svg += `<path d="${d}" fill="${palette.colors[Math.floor(rng() * palette.colors.length)]}" opacity="${0.1 + rng() * 0.2}" filter="url(#wc-${uid})"/>`;
    }

    // Energy lines
    for (let i = 0; i < 5; i++) {
      const x1 = rng() * w; const y1 = rng() * h;
      const x2 = rng() * w; const y2 = rng() * h;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${palette.accent}" stroke-width="${0.5 + rng()}" opacity="${0.1 + rng() * 0.15}"/>`;
    }

    return svg;
  }

  // ── Angst: concentric pressure circles, sharp spikes, vortex spirals ──
  function generateAngstArt(rng, palette, w, h, uid) {
    let svg = '';
    const cx = w * 0.5 + (rng() - 0.5) * 20;
    const cy = h * 0.45 + (rng() - 0.5) * 20;

    // Concentric pressure circles
    for (let i = 0; i < 6 + Math.floor(rng() * 4); i++) {
      const r = 8 + i * (8 + rng() * 6);
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${palette.colors[i % palette.colors.length]}" stroke-width="${0.5 + rng() * 1.5}" opacity="${0.12 + rng() * 0.18}" filter="url(#wc-${uid})"/>`;
    }

    // Sharp spikes emanating outward
    const spikeCount = 8 + Math.floor(rng() * 6);
    for (let i = 0; i < spikeCount; i++) {
      const angle = (i / spikeCount) * Math.PI * 2 + rng() * 0.3;
      const innerR = 10 + rng() * 15;
      const outerR = 35 + rng() * 50;
      const x1 = cx + Math.cos(angle) * innerR;
      const y1 = cy + Math.sin(angle) * innerR;
      const x2 = cx + Math.cos(angle) * outerR;
      const y2 = cy + Math.sin(angle) * outerR;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${palette.colors[Math.floor(rng() * 3)]}" stroke-width="${0.5 + rng()}" opacity="${0.15 + rng() * 0.2}"/>`;
    }

    // Vortex spiral
    let spiralD = `M ${cx} ${cy}`;
    for (let t = 0; t < 4 * Math.PI; t += 0.3) {
      const r = t * (2 + rng() * 2);
      const sx = cx + Math.cos(t) * r;
      const sy = cy + Math.sin(t) * r;
      spiralD += ` L ${sx} ${sy}`;
    }
    svg += `<path d="${spiralD}" fill="none" stroke="${palette.accent}" stroke-width="0.7" opacity="${0.12 + rng() * 0.1}" filter="url(#softblur-${uid})"/>`;

    return svg;
  }

  // ── Schatten: layered shadows, fog, cracks, fading shapes ──
  function generateSchattenArt(rng, palette, w, h, uid) {
    let svg = '';

    // Layered shadow rectangles
    for (let i = 0; i < 5; i++) {
      const y = h * (0.1 + i * 0.18);
      const sh = 15 + rng() * 30;
      const opacity = 0.06 + i * 0.04 + rng() * 0.05;
      svg += `<rect x="0" y="${y}" width="${w}" height="${sh}" fill="${darken(palette.colors[i % palette.colors.length], 0.2)}" opacity="${opacity}" filter="url(#wc-${uid})"/>`;
    }

    // Fog circles
    for (let i = 0; i < 5; i++) {
      const fx = rng() * w;
      const fy = rng() * h;
      const fr = 20 + rng() * 40;
      svg += `<circle cx="${fx}" cy="${fy}" r="${fr}" fill="${lighten(palette.colors[Math.floor(rng() * 3)], 0.2)}" opacity="${0.06 + rng() * 0.1}" filter="url(#blur-${uid})"/>`;
    }

    // Crack lines
    for (let i = 0; i < 3 + Math.floor(rng() * 3); i++) {
      let x = rng() * w;
      let y = rng() * h * 0.5;
      let d = `M ${x} ${y}`;
      const segs = 3 + Math.floor(rng() * 4);
      for (let s = 0; s < segs; s++) {
        x += (rng() - 0.5) * 20;
        y += 10 + rng() * 20;
        d += ` L ${x} ${y}`;
      }
      svg += `<path d="${d}" fill="none" stroke="${darken(palette.accent, 0.3)}" stroke-width="${0.3 + rng() * 0.8}" opacity="${0.15 + rng() * 0.15}"/>`;
    }

    // Fading shapes
    for (let i = 0; i < 3; i++) {
      const cx = rng() * w;
      const cy = rng() * h;
      const r = 5 + rng() * 15;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${palette.colors[Math.floor(rng() * palette.colors.length)]}" opacity="${0.04 + rng() * 0.08}" filter="url(#blur-${uid})"/>`;
    }

    return svg;
  }

  return { generateCardArt };
})();
