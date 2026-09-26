export interface SampleMap {
  id: string;
  name: string;
  category: string;
  description: string;
  width: number;
  height: number;
  dataUrl: string;
}

// Procedural high-resolution SVG battlemaps encoded as Data URLs
function createVerdantWildernessSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000">
    <defs>
      <linearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2d5a27"/>
        <stop offset="50%" stop-color="#3c6e3b"/>
        <stop offset="100%" stop-color="#244920"/>
      </linearGradient>
      <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1e5f74"/>
        <stop offset="45%" stop-color="#2d82b7"/>
        <stop offset="80%" stop-color="#1e5f74"/>
      </linearGradient>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
        <feColorMatrix type="matrix" values="0.1 0 0 0 0.1  0 0.15 0 0 0.2  0 0 0.1 0 0.1  0 0 0 0.25 0" in="noise" result="coloredNoise"/>
        <feBlend mode="overlay" in="SourceGraphic" in2="coloredNoise"/>
      </filter>
    </defs>
    <!-- Background Grassland -->
    <rect width="1600" height="1000" fill="url(#grassGrad)"/>
    
    <!-- Dirt Road -->
    <path d="M 0 320 C 350 300, 480 480, 800 520 C 1150 560, 1300 750, 1600 820" fill="none" stroke="#795548" stroke-width="52" stroke-linecap="round" opacity="0.85"/>
    <path d="M 0 320 C 350 300, 480 480, 800 520 C 1150 560, 1300 750, 1600 820" fill="none" stroke="#a1887f" stroke-width="40" stroke-linecap="round" opacity="0.6"/>

    <!-- Winding River -->
    <path d="M 380 0 C 450 320, 200 480, 420 720 C 560 880, 680 940, 720 1000" fill="none" stroke="#1d4e89" stroke-width="110" stroke-linecap="round"/>
    <path d="M 380 0 C 450 320, 200 480, 420 720 C 560 880, 680 940, 720 1000" fill="none" stroke="url(#riverGrad)" stroke-width="85" stroke-linecap="round"/>
    
    <!-- Wooden Bridge -->
    <rect x="365" y="440" width="85" height="50" rx="4" transform="rotate(-15 407 465)" fill="#5d4037" stroke="#3e2723" stroke-width="4"/>
    <line x1="375" y1="445" x2="445" y2="445" stroke="#8d6e63" stroke-width="3" transform="rotate(-15 407 465)"/>
    <line x1="375" y1="465" x2="445" y2="465" stroke="#8d6e63" stroke-width="3" transform="rotate(-15 407 465)"/>
    <line x1="375" y1="485" x2="445" y2="485" stroke="#8d6e63" stroke-width="3" transform="rotate(-15 407 465)"/>

    <!-- Forest Clump 1 (North-East) -->
    <g fill="#1b4332" opacity="0.9">
      <circle cx="1200" cy="180" r="110"/>
      <circle cx="1320" cy="220" r="130"/>
      <circle cx="1100" cy="260" r="95"/>
      <circle cx="1260" cy="310" r="115"/>
      <circle cx="1400" cy="160" r="80"/>
      <circle cx="1180" cy="230" r="70" fill="#2d6a4f"/>
      <circle cx="1300" cy="270" r="85" fill="#40916c"/>
    </g>

    <!-- Forest Clump 2 (South-West) -->
    <g fill="#1b4332" opacity="0.9">
      <circle cx="160" cy="780" r="120"/>
      <circle cx="240" cy="880" r="110"/>
      <circle cx="100" cy="900" r="95"/>
      <circle cx="190" cy="820" r="75" fill="#2d6a4f"/>
    </g>

    <!-- Mountain Ridge (North-West) -->
    <polygon points="120,40 220,180 20,180" fill="#525252" stroke="#333" stroke-width="2"/>
    <polygon points="120,40 160,180 20,180" fill="#737373"/>
    <polygon points="260,70 360,210 160,210" fill="#525252" stroke="#333" stroke-width="2"/>
    <polygon points="260,70 300,210 160,210" fill="#737373"/>
    <polygon points="50,110 140,240 -40,240" fill="#525252" stroke="#333" stroke-width="2"/>

    <!-- Stone Ruins Landmark (South-East) -->
    <rect x="1100" y="660" width="180" height="120" fill="none" stroke="#9e9e9e" stroke-width="12" stroke-dasharray="35,15,40,10"/>
    <rect x="1140" y="700" width="100" height="40" fill="#616161" opacity="0.8"/>
    <circle cx="1080" cy="650" r="12" fill="#757575"/>
    <circle cx="1300" cy="650" r="12" fill="#757575"/>
    <circle cx="1080" cy="790" r="12" fill="#757575"/>
    <circle cx="1300" cy="790" r="12" fill="#757575"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function createDungeonVaultSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1000" width="1400" height="1000">
    <defs>
      <linearGradient id="floorGrad" x1="0" y1="0" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1f2421"/>
        <stop offset="50%" stop-color="#2b302c"/>
        <stop offset="100%" stop-color="#171918"/>
      </linearGradient>
      <radialGradient id="torchGlow1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffb703" stop-opacity="0.8"/>
        <stop offset="40%" stop-color="#fb8500" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="torchGlow2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#48cae4" stop-opacity="0.8"/>
        <stop offset="40%" stop-color="#0077b6" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <!-- Dark Void Boundary -->
    <rect width="1400" height="1000" fill="#0d0e0d"/>
    
    <!-- Chamber 1: Main Hall -->
    <rect x="150" y="150" width="550" height="400" fill="url(#floorGrad)" stroke="#495057" stroke-width="16"/>
    <!-- Chamber 2: Ritual Sanctuary -->
    <circle cx="1020" cy="350" r="230" fill="url(#floorGrad)" stroke="#495057" stroke-width="16"/>
    <!-- Connecting Corridor -->
    <rect x="680" y="300" width="140" height="100" fill="url(#floorGrad)" stroke="#495057" stroke-width="12"/>
    <line x1="680" y1="300" x2="820" y2="300" stroke="#495057" stroke-width="16"/>
    <line x1="680" y1="400" x2="820" y2="400" stroke="#495057" stroke-width="16"/>

    <!-- South Armory -->
    <rect x="250" y="630" width="400" height="280" fill="url(#floorGrad)" stroke="#495057" stroke-width="16"/>
    <!-- South Corridor -->
    <rect x="390" y="535" width="120" height="110" fill="url(#floorGrad)" stroke="#495057" stroke-width="12"/>
    <line x1="390" y1="540" x2="390" y2="640" stroke="#495057" stroke-width="16"/>
    <line x1="510" y1="540" x2="510" y2="640" stroke="#495057" stroke-width="16"/>

    <!-- Stone Pillars in Main Hall -->
    <circle cx="280" cy="270" r="24" fill="#6c757d" stroke="#212529" stroke-width="5"/>
    <circle cx="560" cy="270" r="24" fill="#6c757d" stroke="#212529" stroke-width="5"/>
    <circle cx="280" cy="430" r="24" fill="#6c757d" stroke="#212529" stroke-width="5"/>
    <circle cx="560" cy="430" r="24" fill="#6c757d" stroke="#212529" stroke-width="5"/>

    <!-- Central Altar in Sanctuary -->
    <polygon points="1020,290 1070,350 1020,410 970,350" fill="#343a40" stroke="#ced4da" stroke-width="4"/>
    <circle cx="1020" cy="350" r="18" fill="#00b4d8"/>

    <!-- Torch Light Effects -->
    <circle cx="280" cy="270" r="180" fill="url(#torchGlow1)"/>
    <circle cx="560" cy="270" r="180" fill="url(#torchGlow1)"/>
    <circle cx="1020" cy="350" r="260" fill="url(#torchGlow2)"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function createDeepSpaceSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000">
    <defs>
      <radialGradient id="nebulaPurple" cx="30%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#7209b7" stop-opacity="0.6"/>
        <stop offset="45%" stop-color="#3a0ca3" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#050510" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="nebulaCyan" cx="75%" cy="65%" r="45%">
        <stop offset="0%" stop-color="#4cc9f0" stop-opacity="0.5"/>
        <stop offset="40%" stop-color="#4361ee" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#050510" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="30%" stop-color="#f72585" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <!-- Deep Space Base -->
    <rect width="1600" height="1000" fill="#060713"/>
    
    <!-- Nebula Clouds -->
    <rect width="1600" height="1000" fill="url(#nebulaPurple)"/>
    <rect width="1600" height="1000" fill="url(#nebulaCyan)"/>

    <!-- Distant Star Clusters -->
    <g fill="#ffffff">
      <circle cx="80" cy="120" r="1.5" opacity="0.8"/>
      <circle cx="240" cy="90" r="2" opacity="0.9"/>
      <circle cx="450" cy="180" r="1" opacity="0.6"/>
      <circle cx="680" cy="70" r="2.5" opacity="0.9"/>
      <circle cx="920" cy="140" r="1.5" opacity="0.7"/>
      <circle cx="1150" cy="80" r="2" opacity="0.85"/>
      <circle cx="1400" cy="190" r="1.5" opacity="0.6"/>
      <circle cx="1520" cy="70" r="2" opacity="0.8"/>
      <circle cx="130" cy="420" r="1.5" opacity="0.7"/>
      <circle cx="500" cy="650" r="2" opacity="0.9"/>
      <circle cx="750" cy="850" r="1.5" opacity="0.65"/>
      <circle cx="1280" cy="890" r="2" opacity="0.8"/>
      <circle cx="1450" cy="580" r="1.5" opacity="0.75"/>
    </g>

    <!-- Giant Gas Planet with Ring -->
    <circle cx="1250" cy="300" r="140" fill="#f72585" opacity="0.85"/>
    <!-- Planet Ring -->
    <ellipse cx="1250" cy="300" rx="220" ry="45" fill="none" stroke="#fee440" stroke-width="12" opacity="0.75" transform="rotate(-25 1250 300)"/>

    <!-- Asteroid Field -->
    <g fill="#6c757d" stroke="#343a40" stroke-width="2">
      <polygon points="400,420 425,410 440,435 415,450 395,435"/>
      <polygon points="480,480 500,470 515,495 490,510 470,490"/>
      <polygon points="350,510 380,495 390,530 365,540 340,525"/>
      <polygon points="560,420 590,415 605,445 580,465 545,440"/>
    </g>

    <!-- Navigational Beacon -->
    <circle cx="780" cy="480" r="12" fill="#00f5d4"/>
    <circle cx="780" cy="480" r="45" fill="none" stroke="#00f5d4" stroke-width="2" stroke-dasharray="6,6" opacity="0.7"/>
    <circle cx="780" cy="480" r="85" fill="none" stroke="#00f5d4" stroke-width="1" stroke-dasharray="10,8" opacity="0.4"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function createParchmentTacticalSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1000" width="1500" height="1000">
    <defs>
      <linearGradient id="parchment" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e9d8a6"/>
        <stop offset="50%" stop-color="#ee9b00" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#d4a373"/>
      </linearGradient>
    </defs>
    <!-- Aged Parchment Background -->
    <rect width="1500" height="1000" fill="#e9d8a6"/>
    <rect width="1500" height="1000" fill="url(#parchment)"/>

    <!-- Vintage Border -->
    <rect x="40" y="40" width="1420" height="920" fill="none" stroke="#6f4e37" stroke-width="6"/>
    <rect x="52" y="52" width="1396" height="896" fill="none" stroke="#6f4e37" stroke-width="2" stroke-dasharray="12,6"/>

    <!-- Cartography Coastline -->
    <path d="M 200 40 C 250 250, 480 300, 520 500 C 560 700, 380 820, 450 960" fill="none" stroke="#005f73" stroke-width="7"/>
    <path d="M 215 40 C 265 250, 495 300, 535 500 C 575 700, 395 820, 465 960" fill="none" stroke="#0a9396" stroke-width="2" stroke-dasharray="6,6" opacity="0.6"/>

    <!-- Compass Rose -->
    <g transform="translate(1250, 220)">
      <circle cx="0" cy="0" r="90" fill="none" stroke="#6f4e37" stroke-width="2"/>
      <circle cx="0" cy="0" r="75" fill="none" stroke="#6f4e37" stroke-width="1" stroke-dasharray="4,4"/>
      <polygon points="0,-110 16,0 0,20 -16,0" fill="#ae2012"/>
      <polygon points="0,110 16,0 0,-20 -16,0" fill="#9b2226"/>
      <polygon points="110,0 0,16 -20,0 0,-16" fill="#bb3e03"/>
      <polygon points="-110,0 0,16 20,0 0,-16" fill="#ca6702"/>
      <text x="-6" y="-120" font-family="serif" font-size="24" font-weight="bold" fill="#ae2012">N</text>
    </g>

    <!-- Mountain Hand-Drawn Icons -->
    <g fill="none" stroke="#582f0e" stroke-width="4">
      <path d="M 700 450 L 760 330 L 820 450 Z"/>
      <path d="M 780 470 L 850 310 L 920 470 Z"/>
      <path d="M 870 460 L 940 340 L 1010 460 Z"/>
      <path d="M 760 330 L 780 450"/>
      <path d="M 850 310 L 870 470"/>
      <path d="M 940 340 L 960 460"/>
    </g>

    <!-- Fortress Marker -->
    <rect x="880" y="650" width="80" height="60" fill="#9c6644" stroke="#4a2810" stroke-width="4"/>
    <polygon points="880,650 920,610 960,650" fill="#7f4f24" stroke="#4a2810" stroke-width="4"/>
    <text x="850" y="745" font-family="serif" font-size="18" font-style="italic" fill="#4a2810">Stronghold Valen</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export const SAMPLE_MAPS: SampleMap[] = [
  {
    id: 'wilderness',
    name: 'Wilderness Riverlands',
    category: 'Tabletop RPG',
    description: 'Overland river, crossroads, ancient ruins, and dense woodlands.',
    width: 1600,
    height: 1000,
    dataUrl: createVerdantWildernessSvg(),
  },
  {
    id: 'dungeon',
    name: 'Stone Crypt & Vault',
    category: 'Battlemap',
    description: 'Subterranean dungeon complex with pillared hall and ritual altar.',
    width: 1400,
    height: 1000,
    dataUrl: createDungeonVaultSvg(),
  },
  {
    id: 'deep-space',
    name: 'Nebula Sector 9',
    category: 'Sci-Fi / Space',
    description: 'Cosmic dogfight zone with gas giant, asteroid field, and beacon.',
    width: 1600,
    height: 1000,
    dataUrl: createDeepSpaceSvg(),
  },
  {
    id: 'parchment',
    name: 'Antique Cartography',
    category: 'Vintage / Wargame',
    description: 'Aged parchment chart with compass rose, coastline, and stronghold.',
    width: 1500,
    height: 1000,
    dataUrl: createParchmentTacticalSvg(),
  },
];
