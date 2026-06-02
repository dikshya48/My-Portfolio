/**
 * Dikshya Giri — Portfolio interactions
 */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Hero intro: typewriter ---- */
  const hero = document.querySelector(".hero");
  const eyebrowText = document.querySelector(".hero__eyebrow-text");
  const eyebrowCaret = document.querySelector(".hero__eyebrow-caret");
  const rolesText = document.querySelector(".hero__roles-text");
  const rolesCaret = document.querySelector(".hero__roles-caret");

  const ROLES = [
    "machine learning",
    "software engineering",
    "data analytics",
    "project management",
  ];

  const capitalizeRole = (phrase) =>
    phrase.charAt(0).toUpperCase() + phrase.slice(1);

  const renderRoleText = (phrase, length) => {
    if (length <= 0) return "";
    const visible = phrase.slice(0, length);
    const first = visible.charAt(0);
    const rest = visible.slice(1);
    return rest
      ? `<span class="hero__roles-cap">${first}</span>${rest}`
      : `<span class="hero__roles-cap">${first}</span>`;
  };

  const startRolesTypewriter = () => {
    if (!rolesText) return;

    if (reduceMotion || typeof window.gsap === "undefined") {
      rolesText.innerHTML = renderRoleText(capitalizeRole(ROLES[0]), ROLES[0].length);
      if (rolesCaret) rolesCaret.style.opacity = "0";
      return;
    }

    const gsap = window.gsap;
    let index = 0;

    const blinkRolesCaretOnce = () => {
      if (!rolesCaret) return;
      rolesCaret.classList.remove("is-blink-once");
      void rolesCaret.offsetWidth;
      rolesCaret.classList.add("is-blink-once");
    };

    const runCycle = () => {
      const phrase = capitalizeRole(ROLES[index]);

      gsap.timeline({
        onComplete() {
          index = (index + 1) % ROLES.length;
          runCycle();
        },
      })
        .to({}, {
          duration: phrase.length * 0.07,
          ease: "none",
          onStart() {
            if (rolesCaret) {
              rolesCaret.classList.remove("is-blink-once");
              rolesCaret.style.opacity = "0.75";
            }
          },
          onUpdate() {
            const length = Math.ceil(this.progress() * phrase.length);
            rolesText.innerHTML = renderRoleText(phrase, length);
          },
        })
        .to({}, {
          duration: 0.75,
          onStart: blinkRolesCaretOnce,
        })
        .to({}, {
          duration: phrase.length * 0.045,
          ease: "none",
          onStart() {
            if (rolesCaret) rolesCaret.classList.remove("is-blink-once");
          },
          onUpdate() {
            const remaining = Math.max(0, Math.floor((1 - this.progress()) * phrase.length));
            rolesText.innerHTML = renderRoleText(phrase, remaining);
          },
        })
        .to({}, { duration: 0.35 });
    };

    runCycle();
  };

  const finishHeroIntro = () => {
    if (!hero) return;
    hero.classList.remove("is-intro");
    hero.classList.add("is-ready");
    if (eyebrowText?.dataset.text) eyebrowText.textContent = eyebrowText.dataset.text;
    if (eyebrowCaret) eyebrowCaret.classList.remove("is-blink");
    startRolesTypewriter();
  };

  if (hero && !reduceMotion && typeof window.gsap !== "undefined") {
    const gsap = window.gsap;
    const word = eyebrowText?.dataset.text || "Portfolio";
    if (eyebrowText) eyebrowText.textContent = "";
    if (eyebrowCaret) eyebrowCaret.classList.add("is-blink");

    gsap.timeline({ onComplete: finishHeroIntro }).to({}, {
      duration: word.length * 0.1,
      ease: "none",
      onUpdate() {
        if (!eyebrowText) return;
        eyebrowText.textContent = word.slice(0, Math.ceil(this.progress() * word.length));
      },
      onComplete() {
        if (eyebrowText) eyebrowText.textContent = word;
        if (eyebrowCaret) eyebrowCaret.classList.remove("is-blink");
      },
    });
  } else {
    finishHeroIntro();
  }

  /* ---- Scroll reveal ---- */
  const sections = document.querySelectorAll(".section");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
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
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
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
