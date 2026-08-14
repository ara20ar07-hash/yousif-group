interface YousifLogoProps {
  className?: string;
}

export default function YousifLogo({ className = "w-7 h-7 sm:w-9 sm:h-9" }: YousifLogoProps) {
  return (
    <svg 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 select-none`}
      aria-label="Yousif Group YG Logo"
    >
      <defs>
        {/* Top Gold Gradient */}
        <linearGradient id="ygNavGoldTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE875" />
          <stop offset="40%" stopColor="#FFD000" />
          <stop offset="100%" stopColor="#E59E00" />
        </linearGradient>

        {/* Bottom Gold Gradient */}
        <linearGradient id="ygNavGoldBottom" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FFA800" />
          <stop offset="45%" stopColor="#FFD700" />
          <stop offset="70%" stopColor="#FFEFA6" />
          <stop offset="100%" stopColor="#E59E00" />
        </linearGradient>

        {/* Bracket Gold Gradient */}
        <linearGradient id="ygNavBracketGold" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E59E00" />
          <stop offset="60%" stopColor="#FFD200" />
          <stop offset="100%" stopColor="#FFE66D" />
        </linearGradient>

        {/* Glow Lens Flare Gradients */}
        <radialGradient id="ygNavTopFlare" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="25%" stopColor="#FFE875" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FF9900" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FF8800" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="ygNavBottomFlare" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#FFEA78" stopOpacity="0.75" />
          <stop offset="65%" stopColor="#FF9900" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF8800" stopOpacity="0" />
        </radialGradient>

        <filter id="ygNavGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* The Standalone Gold & White YG Logo Symbol (No background, no circle) */}
      <g id="yg-navbar-symbol">
        {/* ==================== G Letter Structure ==================== */}
        
        {/* 1. G Upper White Arc and Loop */}
        <path 
          d="M 270 108 L 380 108 C 445 108 495 155 495 230 C 495 285 460 330 420 355 L 420 395 C 475 365 520 305 520 230 C 520 135 450 82 375 82 L 270 82 Z"
          fill="#FFFFFF"
          transform="translate(-14, 12)"
        />

        {/* Inner contour of G */}
        <path 
          d="M 370 145 C 420 145 452 185 452 238 C 452 290 420 330 370 330 C 325 330 295 292 295 238 C 295 185 325 145 370 145 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="26"
          transform="translate(-14, 12)"
        />

        {/* 2. G Lower Golden Glow Arc */}
        <path 
          d="M 245 315 C 265 375 320 415 390 415 C 425 415 458 402 485 380 L 468 360 C 445 380 418 390 390 390 C 335 390 290 358 272 310 Z"
          fill="url(#ygNavGoldBottom)"
          filter="url(#ygNavGlow)"
          transform="translate(-14, 12)"
        />

        {/* 3. Bottom Right Gold 'G' Bracket */}
        <path 
          d="M 445 378 L 500 378 L 500 295 L 480 295 L 480 358 L 445 358 Z"
          fill="url(#ygNavBracketGold)"
          filter="url(#ygNavGlow)"
          transform="translate(-14, 12)"
        />

        {/* ==================== Y Letter Structure ==================== */}

        {/* 4. Y Top-Left Gold Wing & Diagonal Accent */}
        <path 
          d="M 45 108 L 140 108 L 175 160 L 152 176 L 125 134 L 68 134 L 110 205 L 90 220 Z"
          fill="url(#ygNavGoldTop)"
          filter="url(#ygNavGlow)"
          transform="translate(-4, 12)"
        />

        {/* 5. Y Central Gold Inner V-Chevron */}
        <path 
          d="M 148 114 L 245 114 L 180 242 L 148 180 L 170 180 L 180 200 L 220 134 L 148 134 Z"
          fill="url(#ygNavGoldTop)"
          filter="url(#ygNavGlow)"
          transform="translate(-4, 12)"
        />

        {/* 6. Y Body, Left Lower Arm & Vertical Stem */}
        <path 
          d="M 98 214 L 180 348 L 180 465 L 152 465 L 152 360 L 68 260 L 98 214 Z"
          fill="#FFFFFF"
          transform="translate(-4, 12)"
        />

        {/* Vertical Stem Right Arm */}
        <path 
          d="M 180 348 L 240 252 L 272 272 L 206 375 L 206 465 L 180 465 Z"
          fill="#FFFFFF"
          transform="translate(-4, 12)"
        />

        {/* ==================== Light Glints & Flares ==================== */}
        <ellipse cx="359" cy="106" rx="42" ry="10" fill="url(#ygNavTopFlare)" />
        <ellipse cx="359" cy="106" rx="10" ry="42" fill="url(#ygNavTopFlare)" />
        <circle cx="359" cy="106" r="7" fill="#FFFFFF" />

        <ellipse cx="356" cy="405" rx="35" ry="9" fill="url(#ygNavBottomFlare)" />
        <ellipse cx="356" cy="405" rx="9" ry="35" fill="url(#ygNavBottomFlare)" />
        <circle cx="356" cy="405" r="4.5" fill="#FFFFFF" />
      </g>
    </svg>
  );
}
