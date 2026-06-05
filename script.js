/* ============================================================
   RAFAEL DICKEL — LP CAPTAÇÃO SOLAR
   JavaScript puro (sem frameworks/bibliotecas externas)
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     CONFIGURAÇÕES
     ============================================================ */
  // Número e mensagem do WhatsApp (todos os CTAs usam o mesmo link)
  const WHATSAPP_URL =
    "https://wa.me/5547991795018?text=Rafael%2C%20tenho%20uma%20empresa%20de%20energia%20solar%20e%20quero%20ter%20a%20sua%20estrutura%20de%20capta%C3%A7%C3%A3o%20completa%21";

  // Data-alvo do cronômetro regressivo (ano/mês-1/dia, hora, min, seg)
  // OBS: mês é 0-indexado no JS -> 5 = junho.
  var COUNTDOWN_TARGET = new Date(2026, 5, 30, 23, 59, 59);

  /* ============================================================
     META PIXEL — RASTREAMENTO DO CLIQUE NO WHATSAPP
     A cada clique REAL em um botão de WhatsApp dispara:
       fbq('track', 'Contact')             -> evento padrão
       fbq('trackCustom', 'WhatsAppClick') -> evento personalizado
     Regras:
       - Nada dispara no carregamento da página (só no clique).
       - Todos os botões [data-wpp] disparam.
       - Uma vez por clique: uma guarda de tempo curta ignora apenas
         o disparo duplicado do MESMO toque (ghost click no mobile),
         sem bloquear cliques reais posteriores.
       - PageView e init permanecem no <head> (não são tocados aqui).
     ============================================================ */
  const DEDUPE_WINDOW_MS = 600;
  let lastTrackedAt = 0;

  function trackWhatsAppClick() {
    const now = Date.now();
    // Evita duplicidade do mesmo clique/toque (mobile dispara 2x às vezes)
    if (now - lastTrackedAt < DEDUPE_WINDOW_MS) return;
    lastTrackedAt = now;

    // Compatível com o Pixel já existente; só dispara se o fbq carregou
    if (typeof window.fbq === "function") {
      window.fbq("track", "Contact");
      window.fbq("trackCustom", "WhatsAppClick");
    }
  }

  function handleWhatsAppClick(event) {
    if (event) event.preventDefault();

    // 1) dispara os eventos ANTES de navegar, para não perdê-los
    trackWhatsAppClick();

    // 2) abre o WhatsApp (funciona em desktop e mobile)
    window.open(WHATSAPP_URL, "_blank", "noopener");
  }

  // Liga TODOS os botões de WhatsApp ([data-wpp]) ao mesmo handler.
  function bindWhatsAppButtons() {
    const buttons = document.querySelectorAll("[data-wpp]");
    buttons.forEach((btn) => btn.addEventListener("click", handleWhatsAppClick));
  }

  /* ============================================================
     CRONÔMETRO REGRESSIVO
     ============================================================ */
  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function initCountdown() {
    var grid = document.getElementById("countdown");
    var ended = document.getElementById("countdownEnded");
    var elDays = document.getElementById("cd-days");
    var elHours = document.getElementById("cd-hours");
    var elMinutes = document.getElementById("cd-minutes");
    var elSeconds = document.getElementById("cd-seconds");

    if (!grid || !elDays) return;

    function update() {
      var diff = COUNTDOWN_TARGET.getTime() - Date.now();

      // Quando zerar: esconde os blocos e mostra "Promoção encerrada"
      if (diff <= 0) {
        grid.style.display = "none";
        if (ended) ended.hidden = false;
        clearInterval(timer);
        return;
      }

      var totalSeconds = Math.floor(diff / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      elDays.textContent = pad(days);
      elHours.textContent = pad(hours);
      elMinutes.textContent = pad(minutes);
      elSeconds.textContent = pad(seconds);
    }

    update();
    var timer = setInterval(update, 1000);
  }

  /* ============================================================
     SMOOTH SCROLL NOS LINKS DE NAVEGAÇÃO
     ============================================================ */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (targetId === "#" || targetId.length < 2) return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        // Fecha o menu mobile, se estiver aberto
        closeMobileMenu();
      });
    }
  }

  /* ============================================================
     ANIMAÇÕES DE ENTRADA (Intersection Observer)
     ============================================================ */
  function initReveal() {
    var elements = document.querySelectorAll(".reveal");

    // Fallback: navegadores sem IntersectionObserver mostram tudo
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add("is-visible");
      }
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    for (var j = 0; j < elements.length; j++) {
      observer.observe(elements[j]);
    }
  }

  /* ============================================================
     NAVBAR — menu mobile + efeito ao rolar
     ============================================================ */
  var navMenu, navToggle;

  function closeMobileMenu() {
    if (navMenu) navMenu.classList.remove("is-open");
    if (navToggle) navToggle.classList.remove("is-open");
  }

  function initNavbar() {
    var navbar = document.getElementById("navbar");
    navMenu = document.getElementById("navMenu");
    navToggle = document.getElementById("navToggle");

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", function () {
        navMenu.classList.toggle("is-open");
        navToggle.classList.toggle("is-open");
      });
    }

    // Sombra/escurecimento extra ao rolar a página
    if (navbar) {
      window.addEventListener(
        "scroll",
        function () {
          if (window.scrollY > 20) {
            navbar.classList.add("navbar--scrolled");
          } else {
            navbar.classList.remove("navbar--scrolled");
          }
        },
        { passive: true }
      );
    }
  }

  /* ============================================================
     INICIALIZAÇÃO
     ============================================================ */
  function init() {
    bindWhatsAppButtons();
    initCountdown();
    initSmoothScroll();
    initReveal();
    initNavbar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
