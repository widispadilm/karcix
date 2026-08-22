/**
 * Poster placeholder lokal.
 *
 * Sebelumnya semua gambar memakai URL sementara `lh3.googleusercontent.com/aida-public/...`
 * yang akan kedaluwarsa. Modul ini membangkitkan SVG data-URI secara deterministik dari
 * sebuah seed, jadi tidak ada request keluar dan tampilannya konsisten antar halaman.
 */

const PALETTES = [
  ['#1173d4', '#0b3f7a'],
  ['#a855f7', '#4c1d95'],
  ['#f97316', '#7c2d12'],
  ['#22c55e', '#14532d'],
  ['#ec4899', '#831843'],
  ['#0ea5e9', '#0c4a6e'],
];

function hashSeed(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string} seed  penentu warna — judul event, id, dsb.
 * @param {object} [opts]
 * @param {string} [opts.label] teks yang dicetak di tengah poster
 * @param {number} [opts.width]
 * @param {number} [opts.height]
 */
export function poster(seed, { label = '', width = 800, height = 800 } = {}) {
  const hash = hashSeed(seed || 'karcix');
  const [from, to] = PALETTES[hash % PALETTES.length];
  const angle = hash % 90;
  const initials = escapeXml(
    (label || seed || 'Karcix')
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <circle cx="${width * 0.78}" cy="${height * 0.22}" r="${width * 0.28}" fill="#ffffff" opacity="0.10"/>
  <circle cx="${width * 0.18}" cy="${height * 0.82}" r="${width * 0.34}" fill="#000000" opacity="0.12"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Inter, -apple-system, Segoe UI, sans-serif"
        font-size="${Math.round(width * 0.26)}" font-weight="800"
        fill="#ffffff" opacity="0.9">${initials}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Poster landscape untuk hero banner. */
export function heroPoster(seed, label) {
  return poster(seed, { label, width: 1600, height: 900 });
}

/** Avatar bulat sederhana. */
export function avatar(name) {
  return poster(name, { label: name, width: 200, height: 200 });
}
