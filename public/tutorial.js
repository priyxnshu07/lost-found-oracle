// Modern Guided Tour for Lost & Found
const tourSteps = [
  { el: "#runMatch", title: "AutoMatch", text: "Click to run AutoMatch and let the system find lost/found item pairs for you.", pos: "bottom" },
  { el: "#lostForm", title: "Report Lost", text: "Fill out this form to report something you lost. Complete all fields for better matching!", pos: "right" },
  { el: "#foundForm", title: "Report Found", text: "Found something? Enter the details here so the right person can find it.", pos: "right" },
  { el: "#matches", title: "Matches", text: "This panel shows pairings made by AutoMatch. You can view details, Confirm, or Reject.", pos: "left" },
  { el: "#resetDb", title: "Reset Demo", text: "Clear all demo and test data. Use this to start fresh.", pos: "bottom" }
];

let tourIdx = 0;

function tourPauseUI(on) {
  document.body.style.pointerEvents = on ? 'none' : '';
  ["tourOverlay", "tourSpot", "tourTooltip"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.pointerEvents = on ? 'auto' : '';
  });
}

function showOverlay() {
  const overlay = document.getElementById("tourOverlay");
  overlay.style.display = "block";
  overlay.style.opacity = 0;
  overlay.style.animation = "fadeTourBg 0.4s forwards";
}
function hideOverlay() {
  const overlay = document.getElementById("tourOverlay");
  overlay.style.display = "none";
  overlay.style.opacity = 0;
  overlay.style.animation = "";
}

function showTourStep(idx) {
  tourPauseUI(true);
  showOverlay();
  const step = tourSteps[idx];
  const target = document.querySelector(step.el);
  const spot = document.getElementById("tourSpot");
  const tip = document.getElementById("tourTooltip");
  const arrowSvg = document.getElementById("tourArrow");
  const arrowLine = document.getElementById("tourLine");

  // If selector not found
  if (!target) { 
    spot.style.display = 'none'; 
    arrowSvg.style.display='none'; 
    tip.style.display = 'block';
    tip.style.left = '30px';
    tip.style.top = '120px';
    tip.innerHTML = `<h4>${step.title}</h4><p>${step.text}</p><div class="tour-controls"><button class="tour-btn secondary" id="tourPrev">Back</button><button class="tour-btn" id="tourNext">Next</button><button class="tour-btn secondary" id="tourClose">Close</button></div>`;
    return;
  }
  
  target.scrollIntoView({ behavior: "smooth", block: "center" }); // Force in view!

  const r = target.getBoundingClientRect();
  spot.style.display = "block";
  spot.style.left = `${window.scrollX + r.left - 8}px`;
  spot.style.top = `${window.scrollY + r.top - 8}px`;
  spot.style.width = `${r.width + 16}px`;
  spot.style.height = `${r.height + 16}px`;

  // POSITION TOOLTIP (always reset style)
  tip.style.display = "block";
  tip.style.position = "fixed";
  let tipX = r.left, tipY = r.top + r.height + 16;
  if (step.pos === "bottom") {
    tipX = r.left;
    tipY = r.top + r.height + 24;
  } else if (step.pos === "top") {
    tipX = r.left;
    tipY = Math.max(10, r.top - 140);
  } else if (step.pos === "right") {
    tipX = r.right + 24;
    tipY = r.top;
  } else if (step.pos === "left") {
    tipX = Math.max(10, r.left - 310);
    tipY = r.top;
  }
  tip.style.left = `${window.scrollX + tipX}px`;
  tip.style.top = `${window.scrollY + tipY}px`;
  tip.innerHTML = `
    <h4 class="text-indigo-800 font-bold mb-1">${step.title}</h4>
    <p>${step.text}</p>
    <div class="tour-controls" style="margin-top: 10px;">
      <button class="tour-btn secondary" id="tourPrev" ${idx===0?"disabled":""}>&larr; Prev</button>
      <button class="tour-btn" id="tourNext">${idx===tourSteps.length-1?"Finish":"Next &rarr;"}</button>
      <button class="tour-btn secondary" id="tourClose">Close</button>
    </div>
    <div class="tour-step-indicator">${idx+1}/${tourSteps.length}</div>
  `;

  // Draw the ARROW from tooltip to spot
  const tipRect = tip.getBoundingClientRect();
  const fromX = tipRect.left + tipRect.width / 2, fromY = tipRect.top + tipRect.height / 2;
  const toX = r.left + r.width / 2, toY = r.top + r.height / 2;
  const minX = Math.min(fromX, toX), minY = Math.min(fromY, toY);
  const w = Math.abs(toX - fromX) + 30, h = Math.abs(toY - fromY) + 30;
  arrowSvg.style.display = "block";
  arrowSvg.style.left = `${window.scrollX + minX - 15}px`;
  arrowSvg.style.top = `${window.scrollY + minY - 15}px`;
  arrowSvg.setAttribute("width", w);
  arrowSvg.setAttribute("height", h);
  arrowLine.setAttribute("x1", fromX - minX + 15);
  arrowLine.setAttribute("y1", fromY - minY + 15);
  arrowLine.setAttribute("x2", toX - minX + 15);
  arrowLine.setAttribute("y2", toY - minY + 15);

  setTimeout(() => {
    document.getElementById("tourPrev").onclick = () => { if (tourIdx > 0) { tourIdx--; showTourStep(tourIdx); } };
    document.getElementById("tourNext").onclick = () => { if (tourIdx < tourSteps.length-1) { tourIdx++; showTourStep(tourIdx); } else { endTour(); } };
    document.getElementById("tourClose").onclick = endTour;
  }, 10);
}

function startTour() {
  tourIdx = 0;
  showTourStep(tourIdx);
}

function endTour() {
  document.getElementById("tourSpot").style.display = "none";
  document.getElementById("tourTooltip").style.display = "none";
  document.getElementById("tourArrow").style.display = "none";
  hideOverlay();
  tourPauseUI(false);
}

document.getElementById("showTour").onclick = () => startTour();

if (!localStorage.getItem("lf_seen_tour")) {
  setTimeout(() => { startTour(); localStorage.setItem("lf_seen_tour", "1"); }, 700);
}

// Add perfect tooltip BOX styling dynamically for the tour
const style = document.createElement("style");
style.textContent = `
@keyframes fadeTourBg { from{opacity:0;} to{opacity:.65;} }
.tour-overlay { position:fixed;inset:0;z-index:100;pointer-events:all; background:rgba(60,67,123,.65);transition:opacity .3s;}
.tour-spot {border:4px solid #6366f1;z-index:120; box-shadow:0 0 0 9999px rgba(0,0,0,0.45);}
.tour-tooltip {z-index:130;position:fixed;background:#fff;color:#222;padding:14px 18px;border-radius:10px;max-width:360px;box-shadow:0 10px 30px rgba(2,6,23,0.18);font-size:15px;line-height:1.45}
.tour-arrow {z-index:125;position:fixed;}
.tour-active * {user-select:none !important;}
.tour-btn {background:#6366f1;color:#fff;border:none;padding:8px 13px 8px 12px;border-radius:8px;margin-left:5px;font-weight:600;cursor:pointer;font-size:14px;}
.tour-btn.secondary {background:#e5e7eb;color:#373737;}
.tour-step-indicator{margin-top:5px;color:#6366f1;font-weight:bold;}
`;
document.head.appendChild(style);
document.addEventListener("DOMContentLoaded", function() {
  const tourSteps = [
    { el: "#runMatch", title: "AutoMatch", text: "Click to run AutoMatch and let the system find lost/found item pairs for you.", pos: "bottom" },
    { el: "#lostForm", title: "Report Lost", text: "Fill out this form to report something you lost. Complete all fields for better matching!", pos: "right" },
    { el: "#foundForm", title: "Report Found", text: "Found something? Enter the details here so the right person can find it.", pos: "right" },
    { el: "#matches", title: "Matches", text: "This panel shows pairings made by AutoMatch. You can view details, Confirm, or Reject.", pos: "left" },
    { el: "#resetDb", title: "Reset Demo", text: "Clear all demo and test data. Use this to start fresh.", pos: "bottom" }
  ];

  let tourIdx = 0;

  function tourPauseUI(on) {
    document.body.style.pointerEvents = on ? 'none' : '';
    ["tourOverlay", "tourSpot", "tourTooltip"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.pointerEvents = on ? 'auto' : '';
    });
  }

  function showOverlay() {
    const overlay = document.getElementById("tourOverlay");
    overlay.style.display = "block";
    overlay.style.opacity = 0;
    overlay.style.animation = "fadeTourBg 0.4s forwards";
  }
  function hideOverlay() {
    const overlay = document.getElementById("tourOverlay");
    overlay.style.display = "none";
    overlay.style.opacity = 0;
    overlay.style.animation = "";
  }

  function showTourStep(idx) {
    tourPauseUI(true);
    showOverlay();
    const step = tourSteps[idx];
    const target = document.querySelector(step.el);
    const spot = document.getElementById("tourSpot");
    const tip = document.getElementById("tourTooltip");
    const arrowSvg = document.getElementById("tourArrow");
    const arrowLine = document.getElementById("tourLine");

    if (!target) { 
      spot.style.display = 'none'; 
      arrowSvg.style.display='none'; 
      tip.style.display = 'block';
      tip.style.left = '30px';
      tip.style.top = '120px';
      tip.innerHTML = `<h4>${step.title}</h4><p>${step.text}</p><div class="tour-controls"><button class="tour-btn secondary" id="tourPrev">Back</button><button class="tour-btn" id="tourNext">Next</button><button class="tour-btn secondary" id="tourClose">Close</button></div>`;
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    const r = target.getBoundingClientRect();
    spot.style.display = "block";
    spot.style.left = `${window.scrollX + r.left - 8}px`;
    spot.style.top = `${window.scrollY + r.top - 8}px`;
    spot.style.width = `${r.width + 16}px`;
    spot.style.height = `${r.height + 16}px`;
    tip.style.display = "block";
    tip.style.position = "fixed";
    let tipX = r.left, tipY = r.top + r.height + 16;
    if (step.pos === "bottom") { tipX = r.left; tipY = r.top + r.height + 24; }
    else if (step.pos === "top") { tipX = r.left; tipY = Math.max(10, r.top - 140); }
    else if (step.pos === "right") { tipX = r.right + 24; tipY = r.top; }
    else if (step.pos === "left") { tipX = Math.max(10, r.left - 310); tipY = r.top; }
    tip.style.left = `${window.scrollX + tipX}px`;
    tip.style.top = `${window.scrollY + tipY}px`;
    tip.innerHTML = `
      <h4 class="text-indigo-800 font-bold mb-1">${step.title}</h4>
      <p>${step.text}</p>
      <div class="tour-controls" style="margin-top: 10px;">
        <button class="tour-btn secondary" id="tourPrev" ${idx===0?"disabled":""}>&larr; Prev</button>
        <button class="tour-btn" id="tourNext">${idx===tourSteps.length-1?"Finish":"Next &rarr;"}</button>
        <button class="tour-btn secondary" id="tourClose">Close</button>
      </div>
      <div class="tour-step-indicator">${idx+1}/${tourSteps.length}</div>
    `;
    // Draw arrow
    const tipRect = tip.getBoundingClientRect();
    const fromX = tipRect.left + tipRect.width / 2, fromY = tipRect.top + tipRect.height / 2;
    const toX = r.left + r.width / 2, toY = r.top + r.height / 2;
    const minX = Math.min(fromX, toX), minY = Math.min(fromY, toY);
    const w = Math.abs(toX - fromX) + 30, h = Math.abs(toY - fromY) + 30;
    arrowSvg.style.display = "block";
    arrowSvg.style.left = `${window.scrollX + minX - 15}px`;
    arrowSvg.style.top = `${window.scrollY + minY - 15}px`;
    arrowSvg.setAttribute("width", w);
    arrowSvg.setAttribute("height", h);
    arrowLine.setAttribute("x1", fromX - minX + 15);
    arrowLine.setAttribute("y1", fromY - minY + 15);
    arrowLine.setAttribute("x2", toX - minX + 15);
    arrowLine.setAttribute("y2", toY - minY + 15);

    setTimeout(() => {
      document.getElementById("tourPrev").onclick = () => { if (tourIdx > 0) { tourIdx--; showTourStep(tourIdx); } };
      document.getElementById("tourNext").onclick = () => { if (tourIdx < tourSteps.length-1) { tourIdx++; showTourStep(tourIdx); } else { endTour(); } };
      document.getElementById("tourClose").onclick = endTour;
    }, 10);
  }

  function startTour() { tourIdx = 0; showTourStep(tourIdx); }
  function endTour() {
    document.getElementById("tourSpot").style.display = "none";
    document.getElementById("tourTooltip").style.display = "none";
    document.getElementById("tourArrow").style.display = "none";
    hideOverlay();
    tourPauseUI(false);
  }

  const btn = document.getElementById("showTour");
  if (btn) btn.onclick = () => startTour();

  if (!localStorage.getItem("lf_seen_tour")) {
    setTimeout(() => { startTour(); localStorage.setItem("lf_seen_tour", "1"); }, 800);
  }
});
