# FotoRingan

**Premium Offline Photo Compressor**  
Privat • Cepat • Elegan

Versi Web App + PWA yang bisa di-install ke home screen HP.

---

## Fitur

- Kompres foto dengan kualitas terkontrol
- Preset siap pakai: WhatsApp, WhatsApp HD, Instagram Feed, Instagram Story
- 100% offline (semua proses di perangkat)
- Tidak ada data yang dikirim ke server
- Desain modern dark premium
- Bisa di-install sebagai aplikasi (PWA)
- Responsive & smooth

---

## Cara Pakai

### 1. Langsung di Browser
Buka file `index.html` di Chrome / Safari / Edge.

### 2. Local Server (direkomendasikan)
```bash
cd FotoRingan-Web
python -m http.server 8000
```
Lalu buka `http://localhost:8000` di HP atau komputer.

### 3. Install sebagai Aplikasi (PWA)
1. Buka di Chrome (Android) atau Safari (iOS)
2. Pilih **Add to Home Screen** / **Install App**
3. Aplikasi muncul seperti app native

### 4. Deploy Gratis
- Drag & drop folder ini ke Netlify Drop
- Atau upload ke Vercel / Cloudflare Pages / GitHub Pages

---

## Struktur File

```
FotoRingan-Web/
├── index.html          # Halaman utama
├── styles.css          # Design system premium
├── app.js              # Logika kompresi
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline)
├── icon.svg            # App icon
└── README.md
```

---

## Catatan Teknis

- Pure HTML + CSS + JavaScript (tanpa framework)
- Canvas API untuk kompresi berkualitas tinggi
- Service Worker untuk pengalaman offline penuh
- Safe-area support untuk notch HP modern

---

Dibuat dengan fokus pada kecepatan, privasi, dan keindahan.
