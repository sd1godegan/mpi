# 📚 MPI SD Negeri 1 Godegan

Wadah online untuk **Multimedia Pembelajaran Interaktif (MPI)** HTML buatan guru-guru SD Negeri 1 Godegan.

**Katalog**: https://USERNAME.github.io/NAMA-REPO/

---

## ✨ Fitur

| Fitur | Status |
|---|---|
| Katalog dinamis dari Google Sheet | ✅ |
| Pencarian & filter (kelas, mapel, guru) | ✅ |
| Viewer dengan tombol Home + footer | ✅ |
| Upload MPI + thumbnail | ✅ |
| Auto-generate link dari nama file | ✅ |
| Login guru dengan ID + PIN | ✅ |
| Share ke WhatsApp | ✅ |
| Dark mode | ✅ |
| Auto-compress thumbnail | ✅ |
| **Differential sync** (hemat bandwidth 99%) | ✅ |
| **Multi-layer cache** (respons ~50ms) | ✅ |
| **Anti race condition** (LockService) | ✅ |
| **Anti double-upload** (Idempotency) | ✅ |
| **Rate limiting** (20 upload/jam/guru) | ✅ |

---

## 🏗️ Arsitektur

```
                        ┌──────────────────┐
                        │  Guru / Siswa    │
                        │  (Browser)       │
                        └────────┬─────────┘
                                 │ HTTPS
                                 ↓
                    ┌────────────────────────┐
                    │  Google Apps Script    │
                    │  (API v3.0)            │
                    │  ├─ Auth (ID + PIN)    │
                    │  ├─ Cache 3 layer      │
                    │  ├─ LockService        │
                    │  ├─ Idempotency        │
                    │  └─ Upload ke GitHub   │
                    └──────┬──────────┬──────┘
                           │          │
                GitHub API │          │ Sheet API
                           ↓          ↓
                    ┌──────────┐  ┌──────────────┐
                    │  GitHub  │  │ Google Sheet │
                    │  - HTML  │  │ - MPI        │
                    │  - Thumb │  │ - Users      │
                    └────┬─────┘  └──────────────┘
                         │
                  GitHub Pages (CDN)
                         ↓
                    🌐 Website publik
```

### 3 Layer Caching

```
Request → [Memory Cache] → [CacheService] → [Google Sheet]
          ~1ms              ~50ms              ~800ms
          (per execution)   (shared)           (database)
```

---

## 📋 Prasyarat

- ✅ Akun Google (Sheet & Apps Script)
- ✅ Akun GitHub (gratis)
- ✅ Waktu setup: **30–45 menit**

---

## 🚀 Setup Step-by-Step

### STEP 1 — Buat Google Sheet

1. Buka [sheets.new](https://sheets.new)
2. Rename: **`Database MPI SDN 1 Godegan`**
3. Rename tab default → **`MPI`**
4. Isi header baris pertama (copy-paste):

   | A | B | C | D | E | F | G | H |
   |---|---|---|---|---|---|---|---|
   | Kelas | Mata Pelajaran | Judul MPI | Guru | Link | Deskripsi | Timestamp | Thumbnail |

> Tab `Users` akan dibuat otomatis oleh Apps Script.

---

### STEP 2 — Buat GitHub Repo

1. Buka [github.com/new](https://github.com/new)
2. Isi:
   - **Repository name**: `sdn1godegan-mpi`
   - **Visibility**: ✅ **Public** (wajib untuk GitHub Pages gratis)
   - ✅ **Add a README file**
3. Klik **Create repository**
4. Buat 6 folder kelas:
   - Klik **Add file → Create new file**
   - Nama: `kelas1/.gitkeep` → Commit
   - Ulangi untuk `kelas2/.gitkeep` s.d. `kelas6/.gitkeep`
5. Aktifkan GitHub Pages:
   - **Settings → Pages**
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / `root`
   - **Save**
   - URL muncul: `https://USERNAME.github.io/sdn1godegan-mpi/`

---

### STEP 3 — Buat GitHub Personal Access Token

1. Buka [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. Isi:
   - **Token name**: `SDN1-Godegan-MPI-Upload`
   - **Expiration**: 1 tahun
   - **Repository access**: ✅ **Only select repositories** → pilih `sdn1godegan-mpi`
3. **Permissions → Repository permissions**:
   - **Contents**: `Read and write` ⭐
   - **Metadata**: `Read-only` (otomatis)
4. Klik **Generate token**
5. **COPY TOKEN** — bentuknya `github_pat_xxxxx...`

> ⚠️ **Simpan token ini!** Tidak akan ditampilkan lagi.

---

### STEP 4 — Setup Apps Script

1. Buka Google Sheet dari Step 1
2. Menu **Extensions → Apps Script**
3. Hapus kode default
4. **Tempel `Code.gs` v3.0** (ada di repo ini)
5. Klik 💾 **Save** (Ctrl+S)
6. Rename project: klik "Untitled project" → `MPI SDN1 Godegan`

---

### STEP 5 — Isi Script Properties

1. Editor Apps Script → ikon ⚙️ **Project Settings** (sidebar kiri)
2. Scroll ke **Script Properties** → **Add script property** 3x:

   | Property | Value | Contoh |
   |---|---|---|
   | `GITHUB_TOKEN` | Token dari Step 3 | `github_pat_11ABC...` |
   | `GITHUB_OWNER` | Username GitHub | `budi-santoso` |
   | `GITHUB_REPO` | Nama repo | `sdn1godegan-mpi` |

3. Klik **Save script properties**

---

### STEP 6 — Jalankan Setup

1. Di editor, dropdown fungsi → pilih **`setup`**
2. Klik ▶ **Run**
3. Muncul permintaan izin:
   - **Review permissions** → pilih akun Google
   - **Advanced** → **Go to (nama project) (unsafe)**
   - **Allow**
4. Lihat **Execution log**:
   ```
   ✅ Admin: admin / admin123
   === SETUP SELESAI ===
   ```
5. Cek Sheet → tab **`Users`** muncul dengan 1 baris admin.

---

### STEP 7 — Test Koneksi GitHub

1. Dropdown fungsi → pilih **`testGitHubConnection`**
2. Klik ▶ **Run**
3. Log harusnya:
   ```
   ✅ GitHub OK
      Repo   : USERNAME/sdn1godegan-mpi
      Branch : main
   ```

---

### STEP 8 — Deploy Web App

1. Klik **Deploy → New deployment**
2. Ikon ⚙️ → **Web app**
3. Isi:
   - **Description**: `API MPI v3.0`
   - **Execute as**: ✅ **Me**
   - **Who has access**: ✅ **Anyone**
4. Klik **Deploy**
5. **COPY URL Web App** — bentuknya:
   ```
   https://script.google.com/macros/s/AKfyc.../exec
   ```
6. **SIMPAN URL INI**

> ⚠️ Setiap edit `Code.gs`:
> **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**

---

### STEP 9 — Set Trigger Warm Cache (Recommended) 🔥

Biar katalog selalu cepat, pasang trigger yang memanaskan cache tiap 10 menit:

1. Editor Apps Script → ikon ⏰ **Triggers** (sidebar kiri)
2. **Add Trigger**:
   - Function: `warmCache`
   - Event source: `Time-driven`
   - Type: `Minutes timer` → `Every 10 minutes`
3. Save

**Efek**: cache selalu panas → user selalu dapat respons cepat (~50ms).

**Biaya**: ~3.6 menit/hari dari kuota 90 menit. Aman.

---

### STEP 10 — Upload File HTML ke Repo

Download semua file HTML dari repo ini:
- `index.html`
- `viewer.html`
- `login.html`
- `upload.html`
- `ganti-pin.html`

**⚠️ Sebelum upload**: ganti URL GAS di setiap file HTML:

```javascript
// Cari baris ini di semua file HTML
const API_URL = "https://script.google.com/macros/s/AKfyc.../exec";
```

Ganti dengan URL dari Step 8.

Upload ke GitHub:
1. Buka repo
2. **Add file → Upload files**
3. Drag & drop semua file
4. Commit

---

### STEP 11 — Test End-to-End

**1. Test katalog:**
```
https://USERNAME.github.io/NAMA-REPO/
```
Harus tampil katalog kosong.

**2. Test API:**
```
https://script.google.com/.../exec?action=ping
https://script.google.com/.../exec?action=ver
https://script.google.com/.../exec?action=list
```

**3. Test login admin:**
- Klik **Masuk**
- Username: `admin`, PIN: `admin123`

**4. Test upload MPI:**
- Klik **Tambah MPI**
- Pilih file HTML → isi form → Upload
- Cek Sheet `MPI` → ada baris baru
- Cek GitHub `kelasX/` → ada file baru

**5. Test viewer:**
- Refresh katalog → kartu MPI muncul
- Klik kartu → viewer terbuka dengan Home + footer

---

## 👥 Cara Tambah Guru Baru

Di editor Apps Script, tambahkan fungsi sementara:

```javascript
function tambahBuSiti() {
  addUser('Bu Siti Rahayu', 3);
}

function tambahPakBudi() {
  addUser('Pak Budi Santoso', 3, '5678');  // PIN custom
}
```

1. Save (Ctrl+S)
2. Pilih fungsi `tambahBuSiti` → ▶ Run
3. Lihat log — muncul ID & PIN
4. **Hapus fungsi sementara** → Save

**Hasil di Sheet `Users`:**

| Username | PIN | Nama | Role | Kelas | Aktif |
|---|---|---|---|---|---|
| G001 | 1234 | Bu Siti Rahayu | guru | 3 | TRUE |

**Kirim ke guru via WA:**
> Bu Siti, ini akun untuk upload MPI:
> 🔗 https://USERNAME.github.io/NAMA-REPO/login.html
> 👤 ID: **G001**
> 🔑 PIN: **1234**

---

## 🔧 Pemeliharaan Rutin

### Ganti PIN Guru
1. Sheet tab `Users` → edit kolom **PIN**
2. Selesai (cache user lama expire dalam 5 menit, atau refresh via login baru)

### Nonaktifkan Guru
1. Tab `Users` → ubah **Aktif** jadi `FALSE`
2. Guru tidak bisa login lagi

### Edit MPI
1. Tab `MPI` → edit cell yang salah
2. Ctrl+S
3. Katalog update (cache refresh otomatis dalam 15 menit, atau tunggu warmCache trigger)

### Hapus MPI
1. Tab `MPI` → klik kanan nomor baris → **Delete row**
2. (Opsional) Hapus file di GitHub
3. Katalog update otomatis

### Bersihkan Cache Manual (kalau perlu)
Di editor Apps Script, jalankan fungsi `clearAllCache`.

### Backup Sheet (bulanan)
1. Google Sheet → **File → Make a copy**
2. Rename: `Backup MPI YYYY-MM-DD`

---

## 🧪 Test API Cepat

Buka di browser (ganti `URL` dengan URL Web App):

| Test | URL | Ekspektasi |
|---|---|---|
| Ping | `URL?action=ping` | `{ok:true}` |
| Versi | `URL?action=ver` | `{version:N}` |
| List semua | `URL?action=list` | Array MPI |
| List unchanged | `URL?action=list&version=N` | `{unchanged:true}` |
| Filter mapel | `URL?action=list&mapel=Matematika` | Filtered |
| Field minimal | `URL?action=list&fields=k,m,j` | Data ringkas |
| Filters | `URL?action=filters` | `{kelas:[...],mapel:[...],guru:[...]}` |
| Stats | `URL?action=stats` | `{total:N, byKelas:{...}}` |

**Perhatikan field `_ms`** — waktu proses server (ms). Harusnya:
- Request pertama: ~500–800ms
- Request kedua: ~30–80ms (dari cache)

---

## 🐛 Troubleshooting

### ❌ "Gagal memuat data" di katalog
- Cek URL GAS di `index.html`
- Buka `URL?action=ping` — harus `{ok:true}`
- Cek Console browser (F12) untuk error detail

### ❌ Upload gagal: "Gagal koneksi GitHub"
- Cek Script Properties
- Jalankan `testGitHubConnection`
- Pastikan token belum expired + permission **Contents: Read and write**

### ❌ Upload gagal: "Sistem sedang sibuk"
- Artinya ada upload lain sedang proses → tunggu 30 detik → coba lagi
- Normal, ini fitur anti race condition

### ❌ Upload gagal: "Terlalu banyak upload (max 20/jam)"
- Rate limit kena → tunggu 1 jam → coba lagi
- Kalau ini tidak diinginkan, ubah `CFG.RATE_MAX_UPLOAD` di `Code.gs`

### ❌ MPI tampil blank di viewer
- MPI bukan **1 file HTML mandiri**
- Pastikan semua CSS/JS/gambar ada di dalam file HTML
- Saran: minta AI bikin MPI jadi 1 file utuh

### ❌ File MPI tertimpa
- Tidak akan terjadi — sistem auto-rename `nama-2.html`, `nama-3.html`
- Cek kolom `Link` di Sheet untuk nama final

### ❌ Cache tidak refresh setelah edit Sheet
- Tunggu warmCache trigger (max 10 menit)
- Atau jalankan manual: editor GAS → pilih `clearAllCache` → Run
- Atau bump version: jalankan fungsi `warmCache`

---

## 📁 Struktur Repo

```
sdn1godegan-mpi/
├── index.html           # Katalog publik
├── viewer.html          # Pembungkus MPI
├── login.html           # Login guru
├── upload.html          # Upload MPI (protected)
├── ganti-pin.html       # Ganti PIN guru
├── README.md            # File ini
│
├── kelas1/              # MPI Kelas 1 (.html + -thumb.jpg)
├── kelas2/
├── kelas3/
├── kelas4/
├── kelas5/
└── kelas6/
```

---

## 📊 Kuota & Performa

### Estimasi Kuota (per sekolah, ~500 request/hari)

| Layanan | Limit Gratis | Pemakaian | Status |
|---|---|---|---|
| URL Fetch | 20.000/hari | ~10 | ✅ 0.05% |
| Runtime execution | 90 menit/hari | ~5 menit | ✅ 5% |
| CacheService | Unlimited | ~200/hari | ✅ |
| PropertiesService | 500 KB | <1 KB | ✅ |

**Aman bertahun-tahun tanpa biaya.** 💰

### Respons Time

| Skenario | Respons |
|---|---|
| Client cache valid | **0ms** (localStorage) |
| Server cache + no change | **~50ms** |
| Server cache + diff kecil | **~80ms** |
| Cold start (sheet read) | **~800ms** |
| Upload MPI | **~2000ms** |

---

## 🔒 Keamanan

| Aspek | Status |
|---|---|
| Password plain text di Sheet | ⚠️ Ya (by design, simpel) |
| HTTPS | ✅ GitHub + GAS |
| Anti brute force | ⚠️ Belum (bisa ditambah) |
| Anti double-upload | ✅ Idempotency |
| Anti race condition | ✅ LockService |
| Rate limit | ✅ 20/jam/guru |
| Token GitHub di client | ❌ Tidak ada (aman) |

**Skala aman**: Cocok untuk sekolah dengan ~20 guru, ~100 MPI, ~500 request/hari.

---

## 📞 Kontak

**Admin**: [Nama Admin]  
**Email**: [email@example.com]

---

*Sistem MPI SD Negeri 1 Godegan — v3.0*  
*Terakhir diupdate: [tanggal]*
