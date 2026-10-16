const LONG_PRESS_MS = 550;
let pressTimer = null;
let activeTooltip = null;
let suppressNextClick = false;
let suppressClickTarget = null;
let suppressTimer = null;
let pressOrigin = null;

function removeTooltip() {
  if (activeTooltip) activeTooltip.remove();
  activeTooltip = null;
}

function showTooltip(target, message) {
  removeTooltip();
  const tip = document.createElement("div");
  tip.className = "touch-tooltip";
  tip.setAttribute("role", "status");
  tip.textContent = message;
  document.body.appendChild(tip);
  activeTooltip = tip;

  const rect = target.getBoundingClientRect();
  const margin = 12;
  const width = Math.min(window.innerWidth - margin * 2, Math.max(160, tip.offsetWidth));
  tip.style.maxWidth = width + "px";
  const measured = tip.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - measured.width / 2;
  left = Math.max(margin, Math.min(window.innerWidth - measured.width - margin, left));
  let top = rect.top - measured.height - 10;
  if (top < margin) top = Math.min(window.innerHeight - measured.height - margin, rect.bottom + 10);
  tip.style.left = left + "px";
  tip.style.top = Math.max(margin, top) + "px";
  activeTooltip = tip;
}

document.addEventListener("pointerdown", event => {
  const target = event.target.closest?.("button, [role='button']");
  if (!target || target.disabled || event.pointerType === "mouse") return;
  const message = target.dataset.tooltip || target.getAttribute("title") || target.getAttribute("aria-label");
  if (!message) return;

  clearTimeout(pressTimer);
  pressOrigin = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  pressTimer = setTimeout(() => {
    showTooltip(target, message);
    suppressNextClick = true;
    suppressClickTarget = target;
    clearTimeout(suppressTimer);
    suppressTimer = setTimeout(() => { suppressNextClick = false; suppressClickTarget = null; }, 900);
  }, LONG_PRESS_MS);
});

function cancelPress() {
  clearTimeout(pressTimer);
  pressTimer = null;
  pressOrigin = null;
}
document.addEventListener("pointerup", cancelPress, true);
document.addEventListener("pointercancel", cancelPress, true);
document.addEventListener("pointermove", event => {
  if (event.pointerType !== "mouse" && pressOrigin && event.pointerId === pressOrigin.pointerId &&
      Math.hypot(event.clientX - pressOrigin.x, event.clientY - pressOrigin.y) > 12) cancelPress();
}, true);

document.addEventListener("click", event => {
  const clickedControl = event.target.closest?.("button, [role='button']");
  if (suppressNextClick && clickedControl === suppressClickTarget) {
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressNextClick = false;
    suppressClickTarget = null;
    clearTimeout(suppressTimer);
    return;
  }
  if (activeTooltip && !event.target.closest?.(".touch-tooltip")) removeTooltip();
}, true);

document.addEventListener("contextmenu", event => {
  if (event.target.closest?.("button, [role='button']")) event.preventDefault();
});

window.addEventListener("resize", removeTooltip);
window.addEventListener("scroll", removeTooltip, true);
