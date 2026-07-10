/**
 * Dikshya Giri — Portfolio interactions
 */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Hero: static content, no intro animation ---- */
  const hero = document.querySelector(".hero");
  if (hero) {
    hero.classList.remove("is-intro");
    hero.classList.add("is-ready");
  }

  /* ---- Scroll reveal ---- */
  const sections = document.querySelectorAll(".section");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.classList.add("is-visible");
            /* drop the sketch mask once the sweep is done */
            setTimeout(() => el.classList.add("is-inked"), 1000);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );

    sections.forEach((section) => {
      section.classList.add("reveal");
      observer.observe(section);
    });
  }

  /* ---- Mobile nav toggle ---- */
  const toggle = document.querySelector(".site-nav__toggle");
  const menu = document.querySelector(".site-nav__menu");

  if (toggle && menu) {
    const setMenuOpen = (open) => {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    };

    toggle.addEventListener("click", () => {
      setMenuOpen(!menu.classList.contains("is-open"));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setMenuOpen(false);
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1023) setMenuOpen(false);
    });
  }

  /* ---- Experiences: sketchbook scraps unfolding on scroll ---- */
  const scraps = document.querySelectorAll(".exp-scrap");

  if (scraps.length) {
    const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

    if (hasGsap && !reduceMotion) {
      const gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);

      scraps.forEach((scrap) => {
        const finalRot = parseFloat(scrap.dataset.rotate || "0");
        const fromLeft = scrap.classList.contains("exp-scrap--left");

        gsap.set(scrap, { transformOrigin: fromLeft ? "12% 0%" : "88% 0%" });

        gsap.fromTo(
          scrap,
          {
            opacity: 0,
            y: 70,
            rotation: finalRot,
            rotationX: -30,
            transformPerspective: 1000,
          },
          {
            opacity: 1,
            y: 0,
            rotation: finalRot,
            rotationX: 0,
            duration: 1.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scrap,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    } else {
      /* Fallback: just settle the resting rotation, fully visible */
      scraps.forEach((scrap) => {
        const finalRot = parseFloat(scrap.dataset.rotate || "0");
        scrap.style.transform = `rotate(${finalRot}deg)`;
      });
    }
  }

  /* ---- Projects: pinned cards discovered while scrolling ---- */
  const pins = document.querySelectorAll(".proj-pin");

  if (pins.length) {
    const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
    const restRot = (el) => parseFloat(el.dataset.rotate || "0");

    if (hasGsap && !reduceMotion) {
      const gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);

      /* hidden, folded + over-rotated starting state */
      gsap.set(pins, {
        opacity: 0,
        y: 60,
        rotationX: -22,
        transformPerspective: 900,
        transformOrigin: "center top",
        rotation: (i, el) => restRot(el),
      });

      window.ScrollTrigger.batch(pins, {
        start: "top 90%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            rotation: (i, el) => restRot(el),
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.14,
            overwrite: true,
          }),
      });
    } else {
      pins.forEach((pin) => {
        pin.style.transform = `rotate(${restRot(pin)}deg)`;
      });
    }
  }

  /* ---- Skills as torn washi-tape labels ---- */
  const techLists = document.querySelectorAll(".proj-pin__tech");
  techLists.forEach((list) => {
    list.classList.add("is-taped");
    Array.from(list.querySelectorAll("li")).forEach((li, i) => {
      /* alternating hand-placed tilt so each strip sits differently */
      li.style.setProperty("--tilt", (((i * 53) % 7) - 3) + "deg");
    });
  });

  /* ---- Archive: typewriter notes revealed on hover/focus ---- */
  const artifacts = document.querySelectorAll(".artifact");
  if (artifacts.length) {
    const noHover = window.matchMedia("(hover: none), (max-width: 760px)").matches;

    artifacts.forEach((art) => {
      const note = art.querySelector(".artifact__note");
      if (!note) return;
      const text = note.getAttribute("data-note") || "";

      /* on touch / small screens: show the full note immediately, no typing */
      if (noHover || reduceMotion) {
        note.textContent = text;
        return;
      }

      let timer = null;
      const type = () => {
        clearInterval(timer);
        note.textContent = "";
        note.classList.add("is-typing");
        let i = 0;
        timer = setInterval(() => {
          note.textContent = text.slice(0, (i += 1));
          if (i >= text.length) {
            clearInterval(timer);
            note.classList.remove("is-typing");
          }
        }, 28);
      };
      const clear = () => {
        clearInterval(timer);
        note.classList.remove("is-typing");
        note.textContent = "";
      };

      art.addEventListener("mouseenter", type);
      art.addEventListener("focus", type);
      art.addEventListener("mouseleave", clear);
      art.addEventListener("blur", clear);
    });
  }

  /* ---- Hero portrait: pencil-sketch reveal ---- */
  const sketchpad = document.getElementById("sketchpad");
  let sketchDraw = null;

  if (sketchpad && !reduceMotion) {
    const NS = "http://www.w3.org/2000/svg";

    /* deterministic pseudo-random so every redraw looks hand-done but identical */
    const rand = (n) => {
      const s = Math.sin(n * 127.1) * 43758.5453;
      return s - Math.floor(s);
    };

    /* fill a reveal mask with hand-length shading strokes: each row is broken
       into 2-3 overlapping back-and-forth segments with uneven width and tilt */
    const buildHatch = (maskSel, strokeW, dur, stagger, delay) => {
      const mask = sketchpad.querySelector(maskSel);
      if (!mask) return;
      mask.querySelectorAll(".hatch-fallback, .hatch-g").forEach((n) => n.remove());

      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "hatch-g");
      g.setAttribute("transform", "rotate(-24 363 456)");

      /* just large enough to cover the rotated 726x912 image, no more */
      const span = 1100;
      const x0 = 363 - span / 2;
      const step = strokeW * 0.85;
      const rows = Math.ceil(1200 / step);
      const yTop = 456 - 600;

      for (let i = 0; i < rows; i++) {
        const y = yTop + step * i + step / 2;
        const parts = 2 + Math.floor(rand(i) * 2);
        const cuts = [0];
        for (let p = 1; p < parts; p++) {
          cuts.push((p + (rand(i * 7 + p) - 0.5) * 0.5) / parts);
        }
        cuts.push(1);

        const rowDelay = delay + i * stagger;
        let acc = 0;

        for (let p = 0; p < parts; p++) {
          const a = x0 + span * cuts[p] - (p > 0 ? 40 : 0);
          const b = x0 + span * cuts[p + 1] + (p < parts - 1 ? 40 : 0);
          const rev = (i + p) % 2 === 1;
          const segDur = dur * (cuts[p + 1] - cuts[p]) + 0.06;

          const line = document.createElementNS(NS, "line");
          line.setAttribute("x1", rev ? b : a);
          line.setAttribute("x2", rev ? a : b);
          line.setAttribute("y1", (y + (rand(i * 13 + p) - 0.5) * strokeW * 0.1).toFixed(1));
          line.setAttribute("y2", (y + (rand(i * 29 + p) - 0.5) * strokeW * 0.16).toFixed(1));
          line.setAttribute("stroke", "#fff");
          line.setAttribute("stroke-width", (strokeW * (1.12 + rand(i * 3 + p) * 0.14)).toFixed(1));
          line.setAttribute("stroke-linecap", "round");
          line.setAttribute("pathLength", "1");
          line.setAttribute("class", "hatch-line");
          line.style.setProperty("--hd", (rowDelay + acc).toFixed(2) + "s");
          line.style.setProperty("--hdur", segDur.toFixed(2) + "s");
          acc += segDur * 0.85;
          g.appendChild(line);
        }
      }

      mask.appendChild(g);
    };

    const motion = sketchpad.querySelector(".sketchpad__motion");

    sketchDraw = () => {
      sketchpad.classList.remove("is-drawing");
      void sketchpad.offsetWidth; /* restart CSS animations */
      sketchpad.classList.add("is-drawing");
      if (motion && typeof motion.beginElement === "function") {
        try { motion.beginElement(); } catch (e) { /* SMIL unavailable */ }
      }
    };

    buildHatch("#hatch-sketch", 200, 0.35, 0.1, 0.4);
    buildHatch("#hatch-final", 78, 0.45, 0.085, 1.25);
    sketchDraw(); /* the portrait sketches itself on every visit */
    sketchpad.addEventListener("click", sketchDraw);
  }

  /* ---- Pencil effects: click dust & paper ripple ---- */
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (finePointer && !reduceMotion) {
    const canvas = document.createElement("canvas");
    canvas.className = "pencil-fx";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const dust = [];
    const rings = [];
    let raf = null;
    let lastFrame = 0;

    const kick = () => {
      if (!raf) {
        lastFrame = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(now - lastFrame, 48);
      lastFrame = now;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";

      /* graphite dust */
      for (let i = dust.length - 1; i >= 0; i--) {
        const p = dust[i];
        p.l += dt;
        if (p.l >= p.L) { dust.splice(i, 1); continue; }
        p.vy += 0.05 * (dt / 16);
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        ctx.fillStyle = "rgba(33, 28, 20, " + (0.45 * (1 - p.l / p.L)).toFixed(3) + ")";
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }

      /* paper indentation ripple */
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.l += dt;
        if (r.l >= 450) { rings.splice(i, 1); continue; }
        const t = r.l / 450;
        const rad = 3 + t * 24;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(33, 28, 20, " + (0.12 * (1 - t)).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(r.x, r.y, rad, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 253, 248, " + (0.22 * (1 - t)).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(r.x + 0.8, r.y + 0.8, rad, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (dust.length || rings.length) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
        ctx.clearRect(0, 0, w, h);
      }
    };

    /* white spotlight that follows the cursor across the page */
    const light = document.createElement("div");
    light.className = "cursor-light";
    light.setAttribute("aria-hidden", "true");
    document.body.appendChild(light);
    let lightRaf = null;

    let lx = 0;
    let ly = 0;

    document.addEventListener("pointermove", (e) => {
      lx = e.clientX;
      ly = e.clientY;
      if (lightRaf) return;
      lightRaf = requestAnimationFrame(() => {
        lightRaf = null;
        light.style.transform = "translate3d(" + lx + "px, " + ly + "px, 0)";
        light.classList.add("is-on");
      });
    }, { passive: true });

    document.documentElement.addEventListener("pointerleave", () => {
      light.classList.remove("is-on");
    });

    document.addEventListener("pointerdown", (e) => {
      for (let i = 0; i < 9; i++) {
        dust.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2.4,
          vy: -Math.random() * 1.8 - 0.3,
          s: 0.7 + Math.random() * 0.9,
          l: 0,
          L: 380 + Math.random() * 180,
        });
      }
      rings.push({ x: e.clientX, y: e.clientY, l: 0 });
      kick();
    }, { passive: true });
  }

  /* ---- Project cards: pencil outline drawn on hover ---- */
  if (finePointer) {
    const SVGNS = "http://www.w3.org/2000/svg";
    document.querySelectorAll(".proj-pin__card").forEach((card) => {
      const svg = document.createElementNS(SVGNS, "svg");
      svg.setAttribute("class", "proj-pin__ink");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");
      svg.setAttribute("aria-hidden", "true");
      const rect = document.createElementNS(SVGNS, "rect");
      rect.setAttribute("x", "1.2");
      rect.setAttribute("y", "1.2");
      rect.setAttribute("width", "97.6");
      rect.setAttribute("height", "97.6");
      rect.setAttribute("rx", "1.5");
      rect.setAttribute("pathLength", "1");
      svg.appendChild(rect);
      card.appendChild(svg);
    });
  }

  /* ---- Portrait proximity: strokes wake up near the cursor ---- */
  if (sketchpad && finePointer && !reduceMotion) {
    const artSvg = sketchpad.querySelector(".sketchpad__art");
    const spot = sketchpad.querySelector(".sketchpad__spot");
    const hoverLines = sketchpad.querySelector(".sketchpad__hover-lines");

    if (artSvg && spot && hoverLines) {
      let queued = false;
      let lastX = 0;
      let lastY = 0;

      sketchpad.addEventListener("pointermove", (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          const m = artSvg.getScreenCTM();
          if (!m) return;
          const inv = m.inverse();
          const x = inv.a * lastX + inv.c * lastY + inv.e;
          const y = inv.b * lastX + inv.d * lastY + inv.f;
          spot.setAttribute("cx", x.toFixed(1));
          spot.setAttribute("cy", y.toFixed(1));
          sketchpad.classList.add("is-alive");
        });
      }, { passive: true });

      sketchpad.addEventListener("pointerleave", () => {
        sketchpad.classList.remove("is-alive");
      });
    }
  }

  /* ---- Active nav link ---- */
  const navLinks = document.querySelectorAll(".site-nav__menu a");
  const ids = ["home", "experiences", "projects", "gallery", "contact"];

  if ("IntersectionObserver" in window && navLinks.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: "-30% 0px -55% 0px" }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) navObserver.observe(el);
    });
  }
})();
