// Rug sizes are stored in whole inches and shown in feet and inches.

// 91 -> 7'7"   96 -> 8'   30 -> 2'6"
export function feet(inches) {
  const n = Math.round(Number(inches));
  if (!Number.isFinite(n) || n <= 0) return "";
  const ft = Math.floor(n / 12);
  const inch = n % 12;
  if (!ft) return `${inch}"`;
  return inch ? `${ft}'${inch}"` : `${ft}'`;
}

// "7' 7\" × 10'" with the shorter side first.
export function sizeLabel(w, l) {
  const [a, b] = [Number(w) || 0, Number(l) || 0].sort((x, y) => x - y);
  if (!a || !b) return "";
  return `${feet(a)} × ${feet(b)}`;
}

export const CATEGORIES = [
  { key: "runner", label: "Runners", hint: "Hallways and kitchens" },
  { key: "small", label: "Small", hint: "Under 5' × 8'" },
  { key: "medium", label: "Medium", hint: "5' × 8' to 7' × 10'" },
  { key: "large", label: "Large", hint: "8' × 10' and up" },
];

// Long and narrow is a runner; otherwise sorted by floor area.
export function category(w, l) {
  const [a, b] = [Number(w) || 0, Number(l) || 0].sort((x, y) => x - y);
  if (!a || !b) return "medium";
  if (a <= 42 && b >= a * 2.5) return "runner";
  const sqft = (a * b) / 144;
  if (sqft < 40) return "small";
  if (sqft < 76) return "medium";
  return "large";
}

// Accepts feet and inches from the admin form; returns whole inches or null.
export function toInches(ft, inch) {
  const f = Number(ft || 0);
  const i = Number(inch || 0);
  if (!Number.isFinite(f) || !Number.isFinite(i) || f < 0 || i < 0 || i >= 12) return null;
  const total = Math.round(f * 12 + i);
  return total > 0 && total <= 50 * 12 ? total : null;
}
