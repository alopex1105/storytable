// Draws the placeholder demo photo (an illustration of a fictional couple) in
// two versions: aged, and clean. Run: node scripts/make-demo-photo.cjs
// Swap public/demo/*.jpg for a real consented or generated photo any time.

const path = require("node:path");
const { chromium } = require("playwright");

const W = 768;
const H = 1024;

function scene() {
  return `
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cfe0e6"/><stop offset="1" stop-color="#e9dcc0"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9a7550"/><stop offset="1" stop-color="#6f5137"/>
    </linearGradient>
    <linearGradient id="gown" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f3ede4"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#e6ddd0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  <!-- painted studio backdrop: hills behind a round moon gate -->
  <circle cx="384" cy="420" r="300" fill="#f4ecd8"/>
  <path d="M96 520 Q220 380 330 470 T560 440 T680 520 V720 H96Z" fill="#a9c3a4"/>
  <path d="M96 590 Q250 500 400 570 T680 560 V720 H96Z" fill="#7fa283"/>
  <circle cx="384" cy="420" r="300" fill="none" stroke="#b9a37c" stroke-width="18"/>
  <!-- curtain -->
  <path d="M0 0 H150 Q120 300 160 620 Q110 700 0 760Z" fill="#8c2f2b"/>
  <path d="M40 0 Q20 320 60 700 M95 0 Q80 300 120 650" stroke="#6d211f" stroke-width="10" fill="none" opacity=".7"/>
  <!-- floor -->
  <rect y="760" width="${W}" height="${H - 760}" fill="url(#floor)"/>
  <path d="M0 830 H${W} M0 910 H${W}" stroke="#5c4330" stroke-width="3" opacity=".5"/>
  <!-- double happiness -->
  <circle cx="384" cy="118" r="62" fill="#c23a2c"/>
  <text x="384" y="146" font-size="78" text-anchor="middle" fill="#f6d27a" font-family="'Noto Serif CJK TC','Noto Sans CJK TC',serif" font-weight="700">囍</text>

  <!-- table with the family dish -->
  <path d="M560 668 H768 V1024 H590Z" fill="#b5362b"/>
  <path d="M590 720 V1024 M650 700 V1024 M715 690 V1024" stroke="#8f2a22" stroke-width="6" opacity=".6"/>
  <ellipse cx="672" cy="668" rx="118" ry="26" fill="#cf4a3c"/>
  <path d="M612 630 Q672 598 732 630 L724 664 Q672 684 620 664Z" fill="#6b4226"/>
  <ellipse cx="672" cy="630" rx="60" ry="14" fill="#3d2414"/>
  <ellipse cx="672" cy="628" rx="46" ry="9" fill="#7a3d1c"/>
  <path d="M650 600 q-12 -22 4 -44 M690 598 q14 -24 -2 -48" stroke="#ffffff" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
  <ellipse cx="596" cy="672" rx="26" ry="9" fill="#f4f1ea"/>
  <ellipse cx="752" cy="676" rx="26" ry="9" fill="#f4f1ea"/>

  <!-- groom -->
  <path d="M236 900 V640 H356 V900 H306 V690 H286 V900Z" fill="#1f2835"/>
  <path d="M226 900 h64 v22 h-74 q0 -16 10 -22Z M302 900 h64 q10 6 10 22 h-74Z" fill="#15110e"/>
  <path d="M210 470 Q214 410 296 404 Q378 410 382 470 V690 H210Z" fill="#273447"/>
  <path d="M262 406 L296 500 L330 406Z" fill="#f7f4ee"/>
  <path d="M288 430 h16 l6 62 -14 16 -14 -16Z" fill="#b5362b"/>
  <path d="M262 406 L296 500 L250 560 V430Z M330 406 L296 500 L342 560 V430Z" fill="#1f2a3a"/>
  <circle cx="246" cy="486" r="12" fill="#d8443a"/><circle cx="246" cy="486" r="5" fill="#f6d27a"/>
  <path d="M210 470 q-26 120 -6 220 h34 V480Z M382 470 q26 110 20 190 l-34 12 V480Z" fill="#273447"/>
  <rect x="278" y="372" width="36" height="40" fill="#dba77c"/>
  <ellipse cx="296" cy="330" rx="50" ry="58" fill="#e8b98f"/>
  <path d="M246 322 Q244 262 300 262 Q352 264 346 326 Q332 290 296 292 Q262 292 246 322Z" fill="#231a14"/>
  <circle cx="278" cy="334" r="5" fill="#2a1d15"/><circle cx="316" cy="334" r="5" fill="#2a1d15"/>
  <path d="M280 356 Q297 370 314 356" stroke="#8a4a35" stroke-width="4" fill="none" stroke-linecap="round"/>

  <!-- bride -->
  <path d="M410 470 Q372 720 340 930 H640 Q590 700 540 470Z" fill="url(#gown)"/>
  <path d="M412 470 Q416 420 476 414 Q536 420 540 470 L548 600 H404Z" fill="#ffffff"/>
  <path d="M404 560 Q470 600 548 560" stroke="#e3d9c9" stroke-width="5" fill="none"/>
  <path d="M370 760 Q480 800 610 760 M356 850 Q480 890 624 850" stroke="#e3d9c9" stroke-width="5" fill="none"/>
  <rect x="460" y="384" width="32" height="38" fill="#e2b08a"/>
  <ellipse cx="476" cy="346" rx="45" ry="52" fill="#efc39c"/>
  <path d="M430 344 Q426 286 478 284 Q528 286 522 346 Q508 312 476 314 Q446 314 430 344Z" fill="#231a14"/>
  <circle cx="476" cy="276" r="24" fill="#231a14"/>
  <circle cx="460" cy="350" r="5" fill="#2a1d15"/><circle cx="494" cy="350" r="5" fill="#2a1d15"/>
  <path d="M462 370 Q477 382 492 370" stroke="#b1493c" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M452 270 Q380 420 372 640 Q420 560 430 440Z M500 270 Q574 420 586 640 Q536 560 524 440Z" fill="#ffffff" opacity=".6"/>
  <!-- bouquet -->
  <path d="M430 640 l20 60 M442 640 l10 62" stroke="#3f6b57" stroke-width="7" stroke-linecap="round"/>
  <circle cx="414" cy="592" r="24" fill="#d8443a"/><circle cx="448" cy="578" r="24" fill="#e97a6b"/>
  <circle cx="452" cy="614" r="24" fill="#d8443a"/><circle cx="420" cy="626" r="22" fill="#f1a79b"/>
  <circle cx="392" cy="616" r="14" fill="#5d8f6d"/><circle cx="476" cy="598" r="14" fill="#5d8f6d"/>
  <path d="M404 470 q-22 60 -4 110 l30 6 V480Z" fill="#f6f1e8"/>
  `;
}

function aged() {
  const scratches = [
    "M120 0 L170 1024", "M505 40 L470 720", "M640 300 L690 1024", "M300 620 L330 1024",
    "M60 420 L330 380", "M410 880 L760 940",
  ]
    .map((d, i) => `<path d="${d}" stroke="#fff8e8" stroke-width="${i % 2 ? 1.5 : 2.5}" opacity=".55" fill="none"/>`)
    .join("");
  let dust = "";
  for (let i = 0; i < 90; i++) {
    const x = (i * 197 + 31) % W;
    const y = (i * 389 + 77) % H;
    const r = 1 + ((i * 7) % 4);
    dust += `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 3 ? "#fff8e8" : "#3a2a1c"}" opacity="${i % 3 ? 0.6 : 0.35}"/>`;
  }
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <filter id="sepia" x="0" y="0" width="100%" height="100%">
        <feGaussianBlur stdDeviation="1.3"/>
        <feColorMatrix type="matrix" values="
          .36 .64 .16 0 .10
          .31 .57 .14 0 .07
          .23 .43 .11 0 .03
          0 0 0 1 0"/>
        <feComponentTransfer>
          <feFuncR type="linear" slope=".72" intercept=".2"/>
          <feFuncG type="linear" slope=".72" intercept=".17"/>
          <feFuncB type="linear" slope=".72" intercept=".12"/>
        </feComponentTransfer>
      </filter>
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/>
        <feColorMatrix type="matrix" values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .14  0 0 0 .5 0"/>
      </filter>
      <filter id="blot"><feGaussianBlur stdDeviation="26"/></filter>
      <radialGradient id="vig" cx=".5" cy=".5" r=".75">
        <stop offset=".55" stop-color="#2a1a0c" stop-opacity="0"/>
        <stop offset="1" stop-color="#2a1a0c" stop-opacity=".6"/>
      </radialGradient>
    </defs>
    <g filter="url(#sepia)">${scene()}</g>
    <rect width="${W}" height="${H}" filter="url(#grain)"/>
    <g filter="url(#blot)" opacity=".5">
      <ellipse cx="620" cy="170" rx="120" ry="80" fill="#f3e3c0"/>
      <ellipse cx="130" cy="860" rx="140" ry="90" fill="#6b4a2a"/>
      <ellipse cx="420" cy="520" rx="90" ry="200" fill="#f6ead0" opacity=".5"/>
    </g>
    <path d="M0 610 L768 520" stroke="#fff8e8" stroke-width="5" opacity=".6"/>
    <path d="M0 616 L768 526" stroke="#3a2a1c" stroke-width="3" opacity=".3"/>
    ${scratches}${dust}
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
    <path d="M768 0 L768 120 Q720 70 650 0Z" fill="#efe6d2"/>
    <rect x="9" y="9" width="${W - 18}" height="${H - 18}" fill="none" stroke="#efe6d2" stroke-width="18"/>
  </svg>`;
}

function clean() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="vig" cx=".5" cy=".5" r=".8">
        <stop offset=".7" stop-color="#2a1a0c" stop-opacity="0"/>
        <stop offset="1" stop-color="#2a1a0c" stop-opacity=".18"/>
      </radialGradient>
    </defs>
    ${scene()}
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
  </svg>`;
}

(async () => {
  const out = path.join(__dirname, "..", "public", "demo");
  require("node:fs").mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  for (const [name, svg] of [
    ["old-photo.jpg", aged()],
    ["old-photo-restored.jpg", clean()],
  ]) {
    await page.setContent(
      `<body style="margin:0;background:#fff">${svg}</body>`,
    );
    await page.screenshot({
      path: path.join(out, name),
      type: "jpeg",
      quality: 88,
    });
  }
  await browser.close();
})();
