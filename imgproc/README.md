# imgproc

**Private Image Processing Suite**  
Offline · Fast · Modular

## Tools

| Tool | File | Status |
|------|------|--------|
| Launcher | `index.html` | Ready |
| Resize | `resize.html` | Ready |
| Convert | `convert.html` | Ready |
| Edit | `edit.html` | Ready |
| Watermark | `watermark.html` | Ready |

## How to run (important)

### Recommended — local server
```bash
cd imgproc
python -m http.server 8000
```
Then open: `http://localhost:8000`

On phone (same Wi‑Fi): `http://YOUR_PC_IP:8000`

### Alternative
Open `index.html` directly in Chrome.  
If navigation fails on some browsers with `file://`, use the local server method above.

## Features

- **Resize** — compress / presets (WhatsApp, IG) / quality control
- **Convert** — JPG, PNG, WebP, PDF
- **Edit** — brightness, contrast, saturation, auto enhance
- **Watermark** — text or logo, free drag position, opacity, rotation

All processing is 100% client-side. Nothing is uploaded.

## Structure

```
imgproc/
├── index.html       # Card launcher + popups
├── resize.html
├── convert.html
├── edit.html
├── watermark.html
└── README.md
```

Each tool is a separate HTML file for easy maintenance.
Back buttons use real links (`./index.html`) for reliable navigation.
