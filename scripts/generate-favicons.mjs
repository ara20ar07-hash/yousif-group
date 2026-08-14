import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Gold Gradients -->
    <linearGradient id="goldTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE875" />
      <stop offset="40%" stop-color="#FFD000" />
      <stop offset="100%" stop-color="#E59E00" />
    </linearGradient>

    <linearGradient id="goldBottomGrad" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#FFA800" />
      <stop offset="45%" stop-color="#FFD700" />
      <stop offset="70%" stop-color="#FFEFA6" />
      <stop offset="100%" stop-color="#E59E00" />
    </linearGradient>

    <linearGradient id="bracketGold" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E59E00" />
      <stop offset="60%" stop-color="#FFD200" />
      <stop offset="100%" stop-color="#FFE66D" />
    </linearGradient>

    <!-- Radial Glows for Light Flares -->
    <radialGradient id="topFlare" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
      <stop offset="25%" stop-color="#FFE875" stop-opacity="0.9" />
      <stop offset="60%" stop-color="#FF9900" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#FF8800" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="bottomFlare" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
      <stop offset="30%" stop-color="#FFEA78" stop-opacity="0.75" />
      <stop offset="65%" stop-color="#FF9900" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#FF8800" stop-opacity="0" />
    </radialGradient>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Deep Black Squircle Background -->
  <rect width="512" height="512" rx="90" fill="#000000" />

  <!-- The Monogram Graphic -->
  <g id="yc-logo">

    <!-- ==================== C / G Letter Structure ==================== -->
    
    <!-- 1. C Top-White Upper Arc and Loop -->
    <!-- White outer loop of C from top junction down through the back of C -->
    <path 
      d="M 270 108 L 380 108 C 445 108 495 155 495 230 C 495 285 460 330 420 355 L 420 395 C 475 365 520 305 520 230 C 520 135 450 82 375 82 L 270 82 Z"
      fill="#FFFFFF"
      transform="translate(-18, 12)"
    />

    <!-- Inner circle/cutout border (White inner contour of C) -->
    <path 
      d="M 370 145 C 420 145 452 185 452 238 C 452 290 420 330 370 330 C 325 330 295 292 295 238 C 295 185 325 145 370 145 Z"
      fill="none"
      stroke="#FFFFFF"
      stroke-width="26"
      transform="translate(-18, 12)"
    />

    <!-- 2. C Bottom Golden Glow Arc -->
    <path 
      d="M 245 315 C 265 375 320 415 390 415 C 425 415 458 402 485 380 L 468 360 C 445 380 418 390 390 390 C 335 390 290 358 272 310 Z"
      fill="url(#goldBottomGrad)"
      filter="url(#softGlow)"
      transform="translate(-18, 12)"
    />

    <!-- 3. Bottom Right Gold 'G' Bracket -->
    <path 
      d="M 445 378 L 500 378 L 500 295 L 480 295 L 480 358 L 445 358 Z"
      fill="url(#bracketGold)"
      filter="url(#softGlow)"
      transform="translate(-18, 12)"
    />

    <!-- ==================== Y Letter Structure ==================== -->

    <!-- 4. Y Top-Left Gold Wing & Diagonal Accent -->
    <path 
      d="M 45 108 L 140 108 L 175 160 L 152 176 L 125 134 L 68 134 L 110 205 L 90 220 Z"
      fill="url(#goldTopGrad)"
      filter="url(#softGlow)"
      transform="translate(-8, 12)"
    />

    <!-- 5. Y Central Gold Inner V-Chevron -->
    <path 
      d="M 148 114 L 245 114 L 180 242 L 148 180 L 170 180 L 180 200 L 220 134 L 148 134 Z"
      fill="url(#goldTopGrad)"
      filter="url(#softGlow)"
      transform="translate(-8, 12)"
    />

    <!-- 6. Y White Body, Left Lower Arm & Vertical Stem -->
    <!-- Left diagonal white arm -->
    <path 
      d="M 98 214 L 180 348 L 180 465 L 128 465 L 128 360 L 68 260 L 98 214 Z"
      fill="#FFFFFF"
      transform="translate(-8, 12)"
    />

    <!-- Vertical Stem White Tube/Outline -->
    <path 
      d="M 180 348 L 240 252 L 272 272 L 206 375 L 206 465 L 180 465 Z"
      fill="#FFFFFF"
      transform="translate(-8, 12)"
    />

    <!-- Inside Hollow cutout for Y lower stem -->
    <rect 
      x="142" 
      y="370" 
      width="48" 
      height="80" 
      fill="#000000" 
      transform="translate(-8, 12)"
    />

    <!-- ==================== Light Glints & Flares ==================== -->

    <!-- Top Gold Lens Flare Glint (at Y/C intersection top right) -->
    <ellipse cx="355" cy="106" rx="45" ry="12" fill="url(#topFlare)" />
    <ellipse cx="355" cy="106" rx="12" ry="45" fill="url(#topFlare)" />
    <circle cx="355" cy="106" r="8" fill="#FFFFFF" />

    <!-- Bottom Gold Flare Glow (on the C lower arc) -->
    <ellipse cx="352" cy="405" rx="38" ry="10" fill="url(#bottomFlare)" />
    <ellipse cx="352" cy="405" rx="10" ry="38" fill="url(#bottomFlare)" />
    <circle cx="352" cy="405" r="5" fill="#FFFFFF" />

  </g>
</svg>`;

async function run() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write the vector favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
  console.log('Saved public/favicon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // 2. Generate PNG sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, name));
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // 3. Multi-resolution favicon.ico (16, 32, 48)
  const icoBuffer = await pngToIco([
    path.join(publicDir, 'favicon-16x16.png'),
    path.join(publicDir, 'favicon-32x32.png'),
    path.join(publicDir, 'favicon-48x48.png'),
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated public/favicon.ico');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
