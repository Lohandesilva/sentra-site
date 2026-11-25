/* ==========================================================
   Workflow diagram (home page). Built as SVG so it can switch
   between a horizontal pipeline (desktop) and a vertical flow (mobile).
   - Dashed connectors drift forward (CSS)
   - A small dot travels each connector (SVG animateMotion)
   - Click / tap / hover / keyboard on a node shows its detail
   - Animation pauses off-screen and is disabled for reduced-motion
   ========================================================== */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var host = document.getElementById("flow");
  if (!host) return;
  var dTitle = document.getElementById("d-title");
  var dWhat = document.getElementById("d-what");
  var dEx = document.getElementById("d-ex");
  var mqWide = window.matchMedia("(min-width: 900px)");
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var active = "n1";
  var svgRef = null;
  var visible = true;

  /* ---- Stage copy. Edit text here. Examples are illustrative, not client data. ---- */
  var STAGES = {
    n1: {
      badge: "1", lines: ["ERP Active Jobs", "Sync"],
      title: "Stage 1: ERP Active Jobs Sync",
      what: "Each morning the system reads your active jobs from your ERP or job management system: job number, site, the assigned foreman or leading hand, the builder's super, contract value and the VOs already approved.",
      ex: "Active today: the L4 fitout, a plant room HVAC install and a FIP upgrade. Each has a foreman on record and a call window set for knock-off."
    },
    n2: {
      badge: "2", lines: ["Outbound Foreman", "Check-In Call"],
      title: "Stage 2: Outbound Foreman Check-In Call",
      what: "Sentra phones the assigned foreman at an agreed time, at knock-off or on the drive home. A plain voice call with a few fixed questions: anything outside scope, extra hours, materials, and who gave the instruction. No app, no forms.",
      ex: "3:45 pm. \"Anything on L4 today that wasn't in the original scope?\" The foreman answers from the ute. The call runs a couple of minutes."
    },
    n3: {
      badge: "3", lines: ["Scope & Variation", "Extraction"],
      title: "Stage 3: Scope & Variation Extraction",
      what: "The answers become a structured record: the extra work, hours and labour split, materials, who instructed it, whether an SI or email followed, and any access, delay or out-of-sequence issues worth an EOT flag.",
      ex: "Six extra data outlets in the meeting room. Leading hand plus one sparky, three hours each, about 60 m of Cat6A. Verbal instruction from the builder's super. No SI issued."
    },
    n4a: {
      badge: "4A", lines: ["ERP Auto-Update"],
      title: "Stage 4A: ERP Auto-Update",
      what: "The structured notes are written to the job record in your ERP as a draft variation, tagged with the call time as the source. Nothing is priced, approved or claimed automatically. How it connects depends on your system and is mapped in the written scope.",
      ex: "Draft VO notes added to the job: description, labour, materials, instructed by, call time as source. Ready for the estimator to price."
    },
    n4b: {
      badge: "4B", lines: ["Management &", "Office Summary"],
      title: "Stage 4B: Management & Office Summary",
      what: "A short summary goes to the PM, estimator or office the same day, so variations get priced and lodged while the details are fresh and well before claim cut-off. Missing paperwork gets flagged.",
      ex: "End-of-day message: one possible variation on L4, verbal from the builder's super, six labour hours plus cable. Flag: no SI on file, chase before the month-end claim."
    }
  };

  /* ---- Layouts. Node rect = [x, y, width, height] inside each viewBox. ---- */
  var LAYOUT = {
    wide: {
      vb: [1100, 375],
      nodes: { n1: [20, 130, 200, 100], n2: [290, 130, 200, 100], n3: [560, 130, 200, 100], n4a: [860, 30, 200, 100], n4b: [860, 230, 200, 100] },
      conns: [
        "M220 180 H288",
        "M490 180 H558",
        "M760 180 C810 180 810 80 858 80",
        "M760 180 C810 180 810 280 858 280"
      ],
      loop: "M960 332 V355 H120 V234",
      loopLabel: [540, 346]
    },
    narrow: {
      vb: [360, 565],
      nodes: { n1: [30, 10, 300, 100], n2: [30, 150, 300, 100], n3: [30, 290, 300, 100], n4a: [10, 450, 165, 100], n4b: [185, 450, 165, 100] },
      conns: [
        "M180 112 V148",
        "M180 252 V288",
        "M180 392 C180 420 92 420 92 448",
        "M180 392 C180 420 268 420 268 448"
      ],
      loop: null
    }
  };

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) { if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e);
    return e;
  }

  function setDetail(id) {
    var s = STAGES[id];
    dTitle.textContent = s.title;
    dWhat.textContent = s.what;
    dEx.textContent = s.ex;
  }

  function select(id) {
    active = id;
    setDetail(id);
    var nodes = host.querySelectorAll(".node");
    for (var i = 0; i < nodes.length; i++) {
      var on = nodes[i].getAttribute("data-id") === id;
      nodes[i].classList.toggle("active", on);
      nodes[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function render() {
    var wide = mqWide.matches;
    var L = wide ? LAYOUT.wide : LAYOUT.narrow;
    host.classList.toggle("mobile", !wide);
    host.innerHTML = "";

    var svg = el("svg", { viewBox: "0 0 " + L.vb[0] + " " + L.vb[1], role: "img", "aria-label": "Workflow: ERP job sync, foreman check-in call, scope and variation extraction, then ERP update and office summary" }, host);
    svgRef = svg;

    var defs = el("defs", {}, svg);
    var marker = el("marker", { id: "arr", markerWidth: 9, markerHeight: 9, refX: 8, refY: 4.5, orient: "auto", markerUnits: "userSpaceOnUse" }, defs);
    el("path", { d: "M0 0 L9 4.5 L0 9 z", fill: "#8FB0D1" }, marker);
    var markerL = el("marker", { id: "arr-loop", markerWidth: 9, markerHeight: 9, refX: 8, refY: 4.5, orient: "auto", markerUnits: "userSpaceOnUse" }, defs);
    el("path", { d: "M0 0 L9 4.5 L0 9 z", fill: "#7F90A6" }, markerL);

    L.conns.forEach(function (d) {
      el("path", { d: d, "class": "conn", "marker-end": "url(#arr)" }, svg);
    });
    if (L.loop) {
      el("path", { d: L.loop, "class": "loop", "marker-end": "url(#arr-loop)" }, svg);
      var t = el("text", { x: L.loopLabel[0], y: L.loopLabel[1], "class": "loop-label" }, svg);
      t.textContent = "Updated ERP record feeds tomorrow's job sync";
    }

    if (!mqReduce.matches) {
      L.conns.forEach(function (d, i) {
        /* hidden until its animation begins, so no dot sits at the SVG origin during the start delay */
        var c = el("circle", { r: 4.5, "class": "dot", opacity: "0" }, svg);
        var begin = (i * 0.5) + "s";
        el("set", { attributeName: "opacity", to: "1", begin: begin }, c);
        el("animateMotion", { path: d, dur: "2.6s", begin: begin, repeatCount: "indefinite", calcMode: "linear" }, c);
      });
      if (L.loop) {
        var c2 = el("circle", { r: 3.5, "class": "dot-soft", opacity: "0" }, svg);
        el("set", { attributeName: "opacity", to: ".7", begin: "0s" }, c2);
        el("animateMotion", { path: L.loop, dur: "7s", begin: "0s", repeatCount: "indefinite", calcMode: "linear" }, c2);
      }
    }

    Object.keys(L.nodes).forEach(function (id) {
      var r = L.nodes[id], s = STAGES[id];
      var isOut = (id === "n4a" || id === "n4b");
      var g = el("g", {
        "class": "node" + (isOut ? " out" : ""),
        "data-id": id, tabindex: 0, role: "button", "aria-pressed": "false",
        "aria-label": s.title + ". Show details and example."
      }, svg);
      el("rect", { "class": "node-bg", x: r[0], y: r[1], width: r[2], height: r[3], rx: 8 }, g);
      el("rect", { "class": "focus-ring", x: r[0] - 4, y: r[1] - 4, width: r[2] + 8, height: r[3] + 8, rx: 11 }, g);
      el("circle", { "class": "badge", cx: r[0] + 28, cy: r[1] + 28, r: 14 }, g);
      var bt = el("text", { "class": "badge-t", x: r[0] + 28, y: r[1] + 28, dy: ".35em" }, g);
      bt.textContent = s.badge;
      s.lines.forEach(function (line, i) {
        var tx = el("text", { "class": "title", x: r[0] + 16, y: r[1] + 64 + i * 20 }, g);
        tx.textContent = line;
      });

      g.addEventListener("click", function () { select(id); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(id); }
      });
      g.addEventListener("focus", function () { select(id); });
      g.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") select(id); });
    });

    select(active);
    applyPause();
  }

  function applyPause() {
    host.classList.toggle("paused", !visible);
    if (svgRef && svgRef.pauseAnimations) {
      if (visible) svgRef.unpauseAnimations(); else svgRef.pauseAnimations();
    }
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      applyPause();
    }, { threshold: 0.05 }).observe(host);
  }

  function onChange() { render(); }
  [mqWide, mqReduce].forEach(function (mq) {
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  });

  render();
})();
