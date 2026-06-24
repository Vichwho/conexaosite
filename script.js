/* ============================================
   Café CONEXÃO — Vanilla JS
   ============================================ */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header sticky shrink ---------- */
  const header = document.getElementById("site-header");
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    mobileNav.hidden = open;
    mobileNav.dataset.open = String(!open);
  });
  mobileNav?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      mobileNav.hidden = true;
      mobileNav.dataset.open = "false";
    })
  );

  /* ---------- Reveal on scroll + counter ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll(".count");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...(el.parentElement?.children ?? [])].filter((s) =>
          s.classList.contains("reveal")
        );
        const localIdx = siblings.indexOf(el);
        el.style.transitionDelay = `${Math.max(0, localIdx) * 80}ms`;
        el.classList.add("in-view");
        io.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  const counterIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count || "0", 10);
        const duration = 1200;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * target).toString();
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toString();
        };
        requestAnimationFrame(tick);
        counterIo.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterIo.observe(el));

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".btn-magnetic").forEach((btn) => {
      const strength = 10;
      let raf = 0;
      let tx = 0,
        ty = 0,
        cx = 0,
        cy = 0;
      const lerp = () => {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        btn.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
        if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
          raf = requestAnimationFrame(lerp);
        } else raf = 0;
      };
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        tx = (x / rect.width) * strength * 2;
        ty = (y / rect.height) * strength * 2;
        if (!raf) raf = requestAnimationFrame(lerp);
      });
      btn.addEventListener("mouseleave", () => {
        tx = 0;
        ty = 0;
        if (!raf) raf = requestAnimationFrame(lerp);
      });
    });
  }

  /* ---------- Parallax ---------- */
  if (!reduceMotion) {
    const parallaxEls = document.querySelectorAll("[data-parallax]");
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const centerOffset = rect.top + rect.height / 2 - vh / 2;
        const speed = parseFloat(el.dataset.parallax || "0.2");
        const ty = -centerOffset * speed;
        el.style.setProperty("--parallax-y", `${ty.toFixed(1)}px`);
        el.style.transform = `translate(-50%, calc(-50% + ${ty.toFixed(1)}px))`;
      });
      ticking = false;
    };
    document.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
  }

  /* ---------- Countdown ---------- */
  const target = new Date("2026-07-14T09:00:00-03:00").getTime();
  const cdEls = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    minutes: document.querySelector('[data-cd="minutes"]'),
    seconds: document.querySelector('[data-cd="seconds"]'),
  };
  const pad = (n) => String(Math.max(0, n)).padStart(2, "0");
  const tickCd = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      Object.values(cdEls).forEach((el) => el && (el.textContent = "00"));
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const map = { days, hours, minutes, seconds };
    Object.entries(map).forEach(([k, v]) => {
      const el = cdEls[k];
      if (!el) return;
      const next = pad(v);
      if (el.textContent !== next) {
        el.textContent = next;
        if (!reduceMotion) {
          el.classList.remove("flip");
          void el.offsetWidth;
          el.classList.add("flip");
        }
      }
    });
  };
  tickCd();
  setInterval(tickCd, 1000);

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    const panel = item.querySelector(".faq-a");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      } else {
        panel.style.maxHeight = "0px";
      }
    });
  });

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById("contactForm");
  if (form) {
    const status = form.querySelector(".form-status");
    const submitBtn = form.querySelector(".btn-submit");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setError = (name, msg) => {
      const field = form.querySelector(`[name="${name}"]`)?.closest(".field");
      const errEl = form.querySelector(`[data-err="${name}"]`);
      if (!field || !errEl) return;
      if (msg) {
        field.classList.add("invalid");
        errEl.textContent = msg;
      } else {
        field.classList.remove("invalid");
        errEl.textContent = "";
      }
    };

    form.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () => setError(el.name, ""));
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const errors = {};
      if (!String(data.name).trim()) errors.name = "Informe seu nome.";
      if (!String(data.email).trim()) errors.email = "Informe seu e-mail.";
      else if (!emailRe.test(String(data.email).trim()))
        errors.email = "E-mail inválido.";
      if (!String(data.subject).trim()) errors.subject = "Informe o assunto.";
      if (!String(data.message).trim()) errors.message = "Escreva sua mensagem.";

      ["name", "email", "subject", "message"].forEach((k) =>
        setError(k, errors[k] || "")
      );

      if (Object.keys(errors).length) {
        status.classList.remove("success");
        status.textContent = "Verifique os campos destacados.";
        const firstInvalid = form.querySelector(".field.invalid input, .field.invalid textarea");
        firstInvalid?.focus();
        return;
      }

      // success
      submitBtn.classList.add("success");
      status.classList.add("success");
      status.textContent = "Mensagem enviada! Em breve entraremos em contato.";
      form.reset();
      setTimeout(() => {
        submitBtn.classList.remove("success");
      }, 3200);
    });
  }
})();

/* ============================================
   Preloader
   ============================================ */
(() => {
  const pre = document.getElementById("preloader");
  const vid = document.getElementById("preloaderVideo");
  if (!pre) return;

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    pre.classList.add("is-gone");
    document.body.classList.remove("is-loading");
    setTimeout(() => pre.remove(), 900);
  };

  // dismiss on video end
  vid?.addEventListener("ended", dismiss);
  // dismiss on any click/tap/key
  pre.addEventListener("click", dismiss);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") dismiss();
  });
  // safety: if video fails to load
  vid?.addEventListener("error", dismiss);
  // hard cap: 12s
  setTimeout(dismiss, 12000);

  // try autoplay (some browsers block until interaction)
  vid?.play?.().catch(() => {});
})();
