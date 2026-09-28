/* ============================================
   SDN 1 Godegan — Shared App Helpers
   v3.0 · Cache-aware API wrapper
   ============================================ */

/* ⚠️ GANTI INI dengan URL Web App GAS kamu */
const API_URL = "https://script.google.com/macros/s/AKfycbxQ7Ve-VLGJIYqJqxHJEfJnnpeq_rw3cGs-LlmRqD81md_GMtPx4H44r6QptEkfF2QGRg/exec";

/* ---------- Auth (localStorage) ---------- */
const Auth = {
  KEY: 'mpi_auth_v3',
  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || 'null'); }
    catch { return null; }
  },
  set(data) { localStorage.setItem(this.KEY, JSON.stringify(data)); },
  clear() { localStorage.removeItem(this.KEY); },
  isValid() {
    const a = this.get();
    return !!(a && a.username && a.pin);
  }
};

/* ---------- API Wrapper ---------- */
const API = {
  /** GET — return JSON, throw kalau error */
  async get(params) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}?${qs}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
  },

  /** POST — kirim JSON sebagai text/plain (GAS quirk) */
  async post(body) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
  },

  /** POST dengan auth otomatis (username + pin) */
  async postAuth(action, data) {
    const a = Auth.get();
    if (!a) throw new Error('Silakan login terlebih dahulu');
    return this.post({ action, username: a.username, pin: a.pin, ...data });
  }
};

/* ---------- Toast ---------- */
let _toastTimer;
function toast(msg, ms = 2500) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/* ---------- Client Cache (localStorage, TTL) ---------- */
const ClientCache = {
  PREFIX: 'mpi_c_',
  get(key, ttlSec) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      if (!raw) return null;
      const { t, d } = JSON.parse(raw);
      if (Date.now() - t > ttlSec * 1000) {
        localStorage.removeItem(this.PREFIX + key);
        return null;
      }
      return d;
    } catch { return null; }
  },
  set(key, data) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify({ t: Date.now(), d: data }));
    } catch {}
  },
  remove(key) { localStorage.removeItem(this.PREFIX + key); },
  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
};

/* ---------- Escape HTML ---------- */
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}

/* ---------- Debounce ---------- */
function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* ---------- Ikon Mapel ---------- */
function mapelIcon(m) {
  const x = (m || '').toLowerCase();
  if (x.includes('agama')) return '🕌';
  if (x.includes('pancasila')) return '🇮🇩';
  if (x.includes('indonesia')) return '📖';
  if (x.includes('inggris')) return '🌐';
  if (x.includes('matematika')) return '🔢';
  if (x.includes('seni')) return '🎨';
  if (x.includes('pjok') || x.includes('jasmani')) return '⚽';
  if (x.includes('ipas') || x.includes('alam')) return '🔬';
  if (x.includes('tik') || x.includes('informasi')) return '💻';
  if (x.includes('jawa')) return '🗣️';
  if (x.includes('membatik') || x.includes('batik')) return '🎭';
  return '📚';
}

/* ---------- Mapel Singkat (untuk badge) ---------- */
function mapelShort(m) {
  const x = (m || '').toLowerCase();
  if (x.includes('agama')) return 'Agama';
  if (x.includes('pancasila')) return 'Pancasila';
  if (x.includes('bahasa indonesia')) return 'B. Indonesia';
  if (x.includes('bahasa inggris')) return 'B. Inggris';
  if (x.includes('matematika')) return 'Matematika';
  if (x.includes('seni')) return 'Seni Budaya';
  if (x.includes('pjok') || x.includes('jasmani')) return 'PJOK';
  if (x.includes('ipas') || x.includes('alam')) return 'IPAS';
  if (x.includes('tik') || x.includes('informasi')) return 'TIK';
  if (x.includes('jawa')) return 'B. Jawa';
  if (x.includes('membatik') || x.includes('batik')) return 'Membatik';
  return m;
}

/* ---------- Daftar Mapel Tetap ---------- */
const DAFTAR_MAPEL = [
  'Pendidikan Agama dan Budi Pekerti',
  'Pendidikan Pancasila',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Matematika',
  'Seni Budaya',
  'Pendidikan Jasmani Olahraga dan Kesehatan (PJOK)',
  'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
  'Teknologi Informasi dan Komunikasi (TIK)',
  'Bahasa Jawa',
  'Membatik'
];

/* ---------- Theme Toggle ---------- */
const Theme = {
  KEY: 'mpi_theme',
  init() {
    const saved = localStorage.getItem(this.KEY) ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.apply(saved);
    return saved;
  },
  toggle() {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    this.apply(next);
    return next;
  },
  apply(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(this.KEY, t);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = t === 'dark' ? '☀️' : '🌙';
  }
};

/* ---------- Image Compress (thumbnail) ---------- */
async function compressImage(file, maxW = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => img.src = e.target.result;
    reader.onerror = reject;
    img.onload = () => {
      const c = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxW) {
        height = Math.round(height * (maxW / width));
        width = maxW;
      }
      c.width = width; c.height = height;
      c.getContext('2d').drawImage(img, 0, 0, width, height);
      c.toBlob(blob => {
        if (!blob) return reject(new Error('Kompres gagal'));
        const r2 = new FileReader();
        r2.onload = () => resolve({
          base64: r2.result.split(',')[1],
          size: blob.size,
          blob
        });
        r2.readAsDataURL(blob);
      }, 'image/jpeg', quality);
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- Sanitize Filename ---------- */
function sanitizeFilename(name) {
  let base = name.replace(/\.html?$/i, '').toLowerCase();
  base = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  base = base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (base.length > 60) base = base.substring(0, 60).replace(/-+$/, '');
  if (!base) base = 'mpi-' + Math.floor(Date.now() / 1000);
  return base + '.html';
}

/* ---------- Share (WA / native) ---------- */
async function shareMPI(link, judul, guru) {
  const viewerUrl = new URL('viewer.html', location.href);
  viewerUrl.searchParams.set('file', link);
  viewerUrl.searchParams.set('title', judul);
  viewerUrl.searchParams.set('guru', guru || '');
  const url = viewerUrl.href;

  const text = `Coba MPI ini: ${judul}\n✍️ ${guru || '-'} — SD Negeri 1 Godegan\n${url}`;

  // Coba native share dulu
  if (navigator.share) {
    try {
      await navigator.share({ title: judul, text, url });
      return;
    } catch (e) { if (e.name === 'AbortError') return; }
  }

  // Fallback: WhatsApp
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

/* ---------- Logout ---------- */
function logout() {
  Auth.clear();
  ClientCache.clearAll();
  toast('👋 Berhasil keluar');
  setTimeout(() => location.href = 'index.html', 600);
}

/* ---------- Init theme otomatis ---------- */
Theme.init();
