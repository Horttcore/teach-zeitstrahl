export const deNumber = new Intl.NumberFormat("de-DE");

export function formatNumber(n) {
  return deNumber.format(n);
}

export function valueToPosition(value, min, max) {
  if (max === min) return 0;
  const v = Math.min(Math.max(value, min), max);
  return (v - min) / (max - min);
}

export function positionToValue(t, min, max) {
  const p = Math.min(Math.max(t, 0), 1);
  return min + p * (max - min);
}

/**
 * Zahlenraum nach Obergrenze des Strahls.
 * Zehner → 1 · Hunderter → 10 · Tausender → 100 · … · Million → 100 000
 */
export function zahlenraum(max) {
  if (max <= 100) return "zehner";
  if (max < 1_000) return "hunderter";
  if (max < 10_000) return "tausender";
  if (max < 100_000) return "zehntausender";
  if (max < 1_000_000) return "hunderttausender";
  return "million";
}

export function stepSize(min, max) {
  const span = max - min;
  if (span <= 0) return 1;

  switch (zahlenraum(max)) {
    case "zehner":
      return 1;
    case "hunderter":
      return 10;
    case "tausender":
      return 100;
    case "zehntausender":
      return 1_000;
    case "hunderttausender":
      return 10_000;
    case "million":
      return 100_000;
    default:
      return 1;
  }
}

export function snapValue(raw, min, max) {
  const step = stepSize(min, max);
  const clamped = Math.min(Math.max(raw, min), max);
  const snapped = min + Math.round((clamped - min) / step) * step;
  return Math.round(Math.min(Math.max(snapped, min), max));
}

const SPANS = [
  { min: 0, max: 100 },
  { min: 100, max: 200 },
  { min: 200, max: 300 },
  { min: 500, max: 600 },
  { min: 0, max: 1000 },
  { min: 1000, max: 2000 },
  { min: 0, max: 10000 },
  { min: 0, max: 100000 },
  { min: 0, max: 1000000 },
];

export function randomRound() {
  const { min, max } = SPANS[Math.floor(Math.random() * SPANS.length)];
  const step = stepSize(min, max);
  const candidates = [];

  for (let v = min; v <= max; v += step) {
    const snapped = snapValue(v, min, max);
    if (snapped > min && snapped < max && !candidates.includes(snapped)) {
      candidates.push(snapped);
    }
  }

  if (candidates.length === 0) {
    candidates.push(snapValue(min + spanSafe(min, max) / 2, min, max));
  }

  const target = candidates[Math.floor(Math.random() * candidates.length)];
  return { min, max, target, step };
}

function spanSafe(min, max) {
  return max - min;
}

/** Startposition auf Snap-Raster, aber nicht die Lösung. */
export function randomStartPlacement(min, max, target) {
  const step = stepSize(min, max);
  const options = [];

  for (let v = min; v <= max; v += step) {
    const snapped = snapValue(v, min, max);
    if (snapped !== target && !options.includes(snapped)) {
      options.push(snapped);
    }
  }

  const value =
    options[Math.floor(Math.random() * options.length)] ??
    snapValue(min, min, max);

  return valueToPosition(value, min, max);
}

/** Hilfsstriche ohne Labels — im Zehner-Raum alle 10, sonst wie Snap-Schritt. */
export function tickStep(min, max) {
  if (max <= 100) return 10;
  return stepSize(min, max);
}

export function tickValues(min, max) {
  const step = tickStep(min, max);
  const values = new Set([min]);

  let v = Math.ceil(min / step) * step;
  if (v <= min) v += step;

  for (; v < max; v += step) {
    values.add(Math.round(v));
  }

  values.add(max);
  return [...values].sort((a, b) => a - b);
}

export function isPlacementCorrect(guess, target, min, max) {
  return snapValue(guess, min, max) === snapValue(target, min, max);
}

export function keyboardStep(min, max) {
  return stepSize(min, max);
}
