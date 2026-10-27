(function () {
  "use strict";
  var doc = document.documentElement;
  var lang = doc.lang && doc.lang.indexOf("en") === 0 ? "en" : "pt";
  var calmo = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* topo ganha sombra depois que a página rola */
  var topo = document.querySelector(".topo");
  if (topo) {
    var marcaTopo = function () { topo.classList.toggle("rolou", window.scrollY > 8); };
    marcaTopo();
    window.addEventListener("scroll", marcaTopo, { passive: true });
  }

  /* menu no celular e no tablet */
  var botaoMenu = document.querySelector(".abre-menu");
  var menu = document.getElementById("menu");
  if (botaoMenu && menu) {
    var fecha = function (devolveFoco) {
      botaoMenu.setAttribute("aria-expanded", "false");
      menu.classList.remove("aberto");
      if (devolveFoco) botaoMenu.focus();
    };
    botaoMenu.addEventListener("click", function () {
      var abrir = botaoMenu.getAttribute("aria-expanded") !== "true";
      botaoMenu.setAttribute("aria-expanded", String(abrir));
      menu.classList.toggle("aberto", abrir);
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) fecha(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("aberto")) fecha(true);
    });
    document.addEventListener("click", function (e) {
      if (menu.classList.contains("aberto") && !e.target.closest(".topo")) fecha(false);
    });
  }

  /* troca de idioma sem perder o lugar: leva para a mesma seção na outra língua */
  var secoes = Array.prototype.slice.call(document.querySelectorAll("[data-par]"));
  Array.prototype.forEach.call(document.querySelectorAll("a[data-idioma]"), function (link) {
    link.addEventListener("click", function () {
      var alvo = null;
      var linhaDeLeitura = window.innerHeight * 0.35;
      secoes.forEach(function (s) {
        if (!s.hidden && s.getBoundingClientRect().top <= linhaDeLeitura) alvo = s;
      });
      var base = link.getAttribute("href").split("#")[0];
      if (alvo && window.scrollY > 40) link.setAttribute("href", base + "#" + alvo.getAttribute("data-par"));
      else link.setAttribute("href", base);
    });
  });

  /* bilhete discreto para quem tem o navegador no outro idioma */
  var convite = document.querySelector(".convite");
  if (convite) {
    var guardado = null;
    try { guardado = localStorage.getItem("ng-convite-idioma"); } catch (e) {}
    var langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""]).map(function (l) { return String(l).toLowerCase(); });
    var falaPt = langs.some(function (l) { return l.indexOf("pt") === 0; });
    var falaEn = langs.some(function (l) { return l.indexOf("en") === 0; });
    var mostra = lang === "pt" ? (falaEn && !falaPt) : (falaPt && langs[0].indexOf("pt") === 0);
    if (mostra && !guardado) {
      setTimeout(function () { convite.hidden = false; }, 1600);
    }
    var fechaConvite = convite.querySelector("button");
    if (fechaConvite) fechaConvite.addEventListener("click", function () {
      convite.hidden = true;
      try { localStorage.setItem("ng-convite-idioma", "1"); } catch (e) {}
    });
  }

  /* o aviso de porta se acomoda na maçaneta, uma vez */
  var avisoAbertura = document.querySelector(".palco .aviso");
  if (avisoAbertura && !calmo) avisoAbertura.classList.add("balanca");

  /* bilhetes chegam por baixo da porta e o grifo se desenha quando a seção aparece */
  var observa = function (el, classe, limite) {
    if (!el) return;
    if (calmo || !("IntersectionObserver" in window)) { el.classList.add(classe); return; }
    var io = new IntersectionObserver(function (itens) {
      itens.forEach(function (it) {
        if (it.isIntersecting) { el.classList.add(classe); io.disconnect(); }
      });
    }, { threshold: limite });
    io.observe(el);
  };
  observa(document.querySelector(".bilhetes"), "chegou", 0.25);
  observa(document.querySelector(".jeito"), "visto", 0.35);

  /* aviso de café da manhã: a mensagem do WhatsApp se escreve com o que a pessoa marca */
  var form = document.querySelector("[data-recado]");
  if (form) {
    var caixas = Array.prototype.slice.call(form.querySelectorAll("input[type=checkbox]"));
    var texto = document.querySelector("[data-recado-texto]");
    var botao = form.querySelector("[data-recado-botao]");
    var numero = form.getAttribute("data-numero");
    var frases = lang === "en" ? {
      base: "Hi Nathália! I found your website and I'd like to talk about what I could hand over to you.",
      lista: "What takes up most of my time right now:"
    } : {
      base: "Oi, Nathália! Vi o seu site e quero conversar sobre a minha rotina.",
      lista: "O que mais toma o meu tempo hoje:"
    };
    var escreve = function () {
      var itens = [];
      caixas.forEach(function (c) { if (c.checked) itens.push(c.getAttribute("data-frase")); });
      var msg = frases.base;
      if (itens.length) msg += "\n\n" + frases.lista + "\n" + itens.map(function (i) { return "\u2022 " + i; }).join("\n");
      if (texto && texto.textContent !== msg) {
        texto.textContent = msg;
        var nota = texto.closest(".recado");
        if (nota && !calmo && iniciado) {
          nota.classList.remove("escreveu");
          void nota.offsetWidth;
          nota.classList.add("escreveu");
        }
      }
      if (botao) botao.setAttribute("href", "https://wa.me/" + numero + "?text=" + encodeURIComponent(msg));
    };
    var iniciado = false;
    caixas.forEach(function (c) { c.addEventListener("change", escreve); });
    escreve();
    iniciado = true;
  }
})();
