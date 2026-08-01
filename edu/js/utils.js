// ── LearnAI shared utilities ──────────────────────────────────────────────────

export function $(sel, ctx = document) { return ctx.querySelector(sel); }
export function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

// ── Model status UI ──────────────────────────────────────────────────────────
export function setStatus(el, state, msg) {
  if (!el) return;
  const dot = el.querySelector('.status-dot');
  const txt = el.querySelector('.status-text');
  if (dot) { dot.className = `status-dot ${state}`; }
  if (txt) txt.textContent = msg;
}

export function setProgress(el, pct) {
  if (!el) return;
  el.style.width = `${Math.round(pct)}%`;
}

// ── Progress callback for Transformers.js ────────────────────────────────────
export function makeProgressCb(statusEl, barEl, labelEl) {
  return (p) => {
    if (p.status === 'progress') {
      const pct = p.loaded && p.total ? (p.loaded / p.total) * 100 : 0;
      setProgress(barEl, pct);
      if (labelEl) labelEl.textContent = `Downloading ${p.file || 'model'} … ${Math.round(pct)}%`;
    }
    if (p.status === 'done') {
      setStatus(statusEl, 'ready', 'Model ready');
      setProgress(barEl, 100);
    }
    if (p.status === 'initiate') {
      setStatus(statusEl, 'loading', `Loading ${p.name || 'model'} …`);
    }
  };
}

// ── Format confidence score ──────────────────────────────────────────────────
export function fmtScore(score) {
  return `${(score * 100).toFixed(1)}%`;
}

// ── Render labelled score bar ────────────────────────────────────────────────
export function scoreBar(label, score, color = '#3b82f6') {
  const pct = Math.round(score * 100);
  return `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;color:var(--muted)">
        <span>${label}</span><span style="color:var(--text);font-family:var(--mono)">${pct}%</span>
      </div>
      <div style="background:var(--bg);border-radius:4px;height:6px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width .4s"></div>
      </div>
    </div>`;
}

// ── Colour palette for labels ────────────────────────────────────────────────
const PALETTE = [
  '#3b82f6','#14b8a6','#f59e0b','#f43f5e','#a855f7','#22c55e','#fb923c','#06b6d4'
];
export function labelColor(i) { return PALETTE[i % PALETTE.length]; }

// ── Draw bounding boxes on canvas ────────────────────────────────────────────
export function drawBoxes(canvas, boxes, imgW, imgH) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scaleX = canvas.width  / imgW;
  const scaleY = canvas.height / imgH;

  boxes.forEach((box, i) => {
    const color = labelColor(i);
    const { xmin, ymin, xmax, ymax } = box.box || box;
    const label = box.label || box.class || '';
    const score = box.score != null ? ` ${fmtScore(box.score)}` : '';

    const x = xmin * scaleX, y = ymin * scaleY;
    const w = (xmax - xmin) * scaleX, h = (ymax - ymin) * scaleY;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = color;
    const textH = 18;
    ctx.fillRect(x, y - textH, w, textH);
    ctx.fillStyle = '#fff';
    ctx.font = '600 11px Inter,sans-serif';
    ctx.fillText(`${label}${score}`, x + 4, y - 4);
  });
}

// ── Debounce ─────────────────────────────────────────────────────────────────
export function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── Format seconds ────────────────────────────────────────────────────────────
export function fmtSecs(s) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

// ── Simple HTML escape ────────────────────────────────────────────────────────
export function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
