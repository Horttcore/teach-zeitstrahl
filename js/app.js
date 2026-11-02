import {
  formatNumber,
  valueToPosition,
  positionToValue,
  snapValue,
  randomRound,
  tickValues,
  isPlacementCorrect,
  keyboardStep,
  randomStartPlacement,
} from "./scale.js";
import { fireConfetti } from "./confetti.js";

let round = { min: 0, max: 100, target: 47 };
let placement = 0.5;
let checked = false;
let drag = { active: false };

const track = () => document.getElementById("numberline-track");
const marker = () => document.getElementById("numberline-marker");

function renderRound() {
  document.getElementById("task-target").textContent = formatNumber(round.target);
  document.getElementById("bound-lower-value").textContent = formatNumber(round.min);
  document.getElementById("bound-upper-value").textContent = formatNumber(round.max);
  document.getElementById("task-hint").textContent =
    "Schiebe den blauen Punkt auf die Stelle, die zur gesuchten Zahl passt.";

  const ticksEl = document.getElementById("numberline-ticks");
  ticksEl.replaceChildren();
  tickValues(round.min, round.max).forEach((v) => {
    const tick = document.createElement("div");
    tick.className = "nl-tick";
    tick.style.left = `${valueToPosition(v, round.min, round.max) * 100}%`;
    tick.innerHTML = `<span class="nl-tick-line"></span>`;
    ticksEl.appendChild(tick);
  });

  const t = track();
  t.setAttribute("aria-valuemin", String(round.min));
  t.setAttribute("aria-valuemax", String(round.max));
  updateMarkerVisual();
}

function currentGuess() {
  return snapValue(positionToValue(placement, round.min, round.max), round.min, round.max);
}

function updateMarkerVisual() {
  const pct = placement * 100;
  marker().style.left = `${pct}%`;
  track().setAttribute("aria-valuenow", String(currentGuess()));
}

function setPlacementFromClientX(clientX) {
  if (checked) return;
  const rect = track().getBoundingClientRect();
  const t = (clientX - rect.left) / rect.width;
  const raw = positionToValue(Math.min(Math.max(t, 0), 1), round.min, round.max);
  const snapped = snapValue(raw, round.min, round.max);
  placement = valueToPosition(snapped, round.min, round.max);
  updateMarkerVisual();
}

function startRound() {
  round = randomRound();
  placement = randomStartPlacement(round.min, round.max, round.target);
  checked = false;
  document.getElementById("feedback").textContent = "";
  document.getElementById("feedback").className = "feedback";
  document.getElementById("btn-next").hidden = true;
  document.getElementById("btn-check").hidden = false;
  marker().classList.remove("is-correct", "is-wrong");
  track().classList.remove("show-solution");
  track().style.removeProperty("--solution-pct");
  renderRound();
}

function checkAnswer() {
  if (checked) return;
  checked = true;
  const guess = currentGuess();
  const ok = isPlacementCorrect(guess, round.target, round.min, round.max);
  const fb = document.getElementById("feedback");

  marker().classList.add(ok ? "is-correct" : "is-wrong");

  if (ok) {
    placement = valueToPosition(round.target, round.min, round.max);
    updateMarkerVisual();
    fb.textContent = "Super! Das ist die richtige Stelle.";
    fb.className = "feedback is-success";
    fireConfetti();
  } else {
    const correctPct = valueToPosition(round.target, round.min, round.max) * 100;
    track().classList.add("show-solution");
    track().style.setProperty("--solution-pct", `${correctPct}%`);
    fb.textContent = `Noch nicht ganz. Gesucht ist ${formatNumber(round.target)} — der grüne Strich zeigt die richtige Stelle.`;
    fb.className = "feedback is-error";
  }

  document.getElementById("btn-check").hidden = true;
  document.getElementById("btn-next").hidden = false;
}

function setupInteraction() {
  const t = track();
  const m = marker();

  t.addEventListener("click", (e) => {
    if (checked) return;
    if (e.target.closest(".numberline-marker")) return;
    setPlacementFromClientX(e.clientX);
  });

  t.addEventListener("keydown", (e) => {
    if (checked) return;
    const step = keyboardStep(round.min, round.max);
    let g = currentGuess();
    if (e.key === "ArrowLeft") g -= step;
    if (e.key === "ArrowRight") g += step;
    else return;
    e.preventDefault();
    placement = valueToPosition(snapValue(g, round.min, round.max), round.min, round.max);
    updateMarkerVisual();
  });

  const onPointerMove = (e) => {
    if (!drag.active || checked) return;
    setPlacementFromClientX(e.clientX);
  };

  const endDrag = () => {
    drag.active = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
  };

  m.addEventListener("pointerdown", (e) => {
    if (checked) return;
    e.preventDefault();
    drag.active = true;
    m.setPointerCapture(e.pointerId);
    setPlacementFromClientX(e.clientX);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
  });

  t.addEventListener("pointerdown", (e) => {
    if (checked) return;
    if (e.target.closest(".numberline-marker")) return;
    setPlacementFromClientX(e.clientX);
  });

  document.getElementById("btn-check").addEventListener("click", checkAnswer);
  document.getElementById("btn-next").addEventListener("click", startRound);
}

startRound();
setupInteraction();
