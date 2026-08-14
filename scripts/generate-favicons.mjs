import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF089" />
      <stop offset="35%" stop-color="#FFD23F" />
      <stop offset="100%" stop-color="#D99B00" />
    </linearGradient>
    <linearGradient id="goldInnerGlow" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFB800" />
      <stop offset="50%" stop-color="#FFD23F" />
      <stop offset="100%" stop-color="#FFEFA6" />
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141720" />
      <stop offset="60%" stop-color="#07090D" />
      <stop offset="100%" stop-color="#020304" />
    </linearGradient>
    <radialGradient id="centerGlow" cx="60%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFD23F" stop-opacity="0.25" />
      <stop offset="60%" stop-color="#FFB800" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#FFB800" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Luxury dark background with smooth rounded corners -->
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)" />
  
  <!-- Subtle gold border around favicon -->
  <rect width="496" height="496" x="8" y="8" rx="92" fill="none" stroke="url(#goldGrad)" stroke-width="8" opacity="0.75" />

  <!-- Ambient warm gold radial background light -->
  <circle cx="280" cy="256" r="180" fill="url(#centerGlow)" />

  <!-- Monogram Container -->
  <g id="monogram">
    <!-- 1. C / G Letter Element (Right side & interlocking) -->
    <!-- Outer White Arc of C -->
    <path 
      d="M 388 185 A 118 118 0 1 0 350 368" 
      fill="none" 
      stroke="#FFFFFF" 
      stroke-width="32" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <!-- Inner Bottom Gold Arc of C (The Glowing Smile) -->
    <path 
      d="M 235 348 A 86 86 0 0 0 365 358" 
      fill="none" 
      stroke="url(#goldInnerGlow)" 
      stroke-width="22" 
      stroke-linecap="round"
    />

    <!-- Bottom-Right Gold Corner Accent Bracket -->
    <path 
      d="M 338 412 L 402 412 L 402 342" 
      fill="none" 
      stroke="url(#goldGrad)" 
      stroke-width="24" 
      stroke-linecap="round" 
      stroke-linejoin="miter" 
    />

    <!-- 2. Y Letter Element (Left side & stem) -->
    <!-- Left Branch Outer Gold Segment -->
    <path 
      d="M 78 98 L 140 220" 
      fill="none" 
      stroke="url(#goldGrad)" 
      stroke-width="22" 
      stroke-linecap="square" 
    />

    <!-- Y Top-Left Gold Cap Connector -->
    <path 
      d="M 78 98 L 148 98" 
      fill="none" 
      stroke="url(#goldGrad)" 
      stroke-width="22" 
      stroke-linecap="square" 
    />

    <!-- Y Main White Ribbon Structure -->
    <!-- Left diagonal going down to junction -->
    <path 
      d="M 148 98 L 228 258" 
      fill="none" 
      stroke="#FFFFFF" 
      stroke-width="32" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <!-- Right diagonal coming down to junction -->
    <path 
      d="M 308 98 L 228 258" 
      fill="none" 
      stroke="#FFFFFF" 
      stroke-width="32" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />

    <!-- Vertical Stem going straight down -->
    <path 
      d="M 228 258 L 228 402" 
      fill="none" 
      stroke="#FFFFFF" 
      stroke-width="32" 
      stroke-linecap="round" 
    />
  </g>
</svg>`;

async function run() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write SVG favicon
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
  console.log('Saved favicon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // Generate PNG sizes
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

  // Generate multi-size favicon.ico
  const icoBuffer = await pngToIco([
    path.join(publicDir, 'favicon-16x16.png'),
    path.join(publicDir, 'favicon-32x32.png'),
    path.join(publicDir, 'favicon-48x48.png'),
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico with 16, 32, 48px icons');

  // Also write site.webmanifest
  const manifest = {
    name: "Yousif Group Co.",
    short_name: "Yousif Group",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#05070a",
    background_color: "#05070a",
    display: "standalone"
  };
  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Generated site.webmanifest');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
