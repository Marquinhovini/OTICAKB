(function () {
  var CFG = window.KB_CONFIG;
  var PRODUTOS = window.KB_PRODUTOS || [];
  var root = document.documentElement;
  var picked = new Set();
  var state = { filter: "todos", onlyStock: true, q: "" };

  var $ = function (s) { return document.querySelector(s); };
  var grid = $("#grid"), empty = $("#empty");

  /* ---------- WhatsApp ---------- */
  function wppLink(msg) {
    return "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(msg);
  }
  document.querySelectorAll("[data-wpp]").forEach(function (a) {
    a.href = wppLink(a.getAttribute("data-wpp"));
  });

  /* ---------- Tema ---------- */
  $("#themeBtn").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("kb-theme", next); } catch (e) {}
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = next === "dark" ? "#1a0d1f" : "#fbf7fc";
  });

  /* ---------- Menu mobile ---------- */
  var links = $("#navLinks");
  $("#menuBtn").addEventListener("click", function () { links.classList.toggle("open"); });
  links.addEventListener("click", function (e) { if (e.target.tagName === "A") links.classList.remove("open"); });

  /* ---------- Catálogo ---------- */
  function glassesArt(c1, c2, id) {
    return '<svg class="art" viewBox="0 0 320 140" aria-hidden="true"><defs><linearGradient id="g' + id +
      '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 +
      '"/></linearGradient></defs><g fill="rgba(255,255,255,.18)" stroke="url(#g' + id + ')" stroke-width="9" stroke-linecap="round">' +
      '<path d="M20 40Q20 20 60 20H110Q150 20 150 60Q150 110 100 110H70Q20 110 20 60Z"/>' +
      '<path d="M300 40Q300 20 260 20H210Q170 20 170 60Q170 110 220 110H250Q300 110 300 60Z"/>' +
      '<path fill="none" d="M150 52Q160 42 170 52M20 42L2 34M300 42L318 34"/></g></svg>';
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(v) { return v == null ? "<small>Consulte o valor</small>" : "R$ " + v.toFixed(2).replace(".", ","); }

  function card(p, i) {
    var out = !p.estoque, on = picked.has(p.id);
    var el = document.createElement("article");
    el.className = "card" + (out ? " out" : "") + (on ? " picked" : "");
    el.style.animationDelay = (i * 60) + "ms";
    var msg = "Olá! Tenho interesse no modelo *" + p.nome + "* (" + p.cor + "). Ainda está disponível?";
    el.innerHTML =
      '<div class="thumb" style="background:linear-gradient(135deg,' + p.tom[0] + ',' + p.tom[1] + ')">' +
        glassesArt("#ffffff", "#ffffff", p.id) +
        '<img src="' + esc(p.imagem) + '" alt="' + esc(p.nome) + '" loading="lazy" onerror="this.remove()">' +
        '<div class="badges"><span class="badge b-cat">' + (p.categoria === "sol" ? "☀️ Sol" : "👓 Grau") + '</span>' +
        (out ? '<span class="badge b-out">Indisponível</span>' : (p.destaque ? '<span class="badge b-new">Novo</span>' : "")) + '</div>' +
      '</div>' +
      '<div class="info"><h3>' + esc(p.nome) + '</h3>' +
        '<div class="meta"><i class="swatch" style="background:' + p.tom[1] + '"></i>' + esc(p.cor) + '</div>' +
        '<div class="price">' + money(p.preco) + '</div>' +
        '<div class="actions">' +
          '<button class="btn btn-pick' + (on ? " on" : "") + '" type="button" data-id="' + p.id + '"' + (out ? ' aria-disabled="true"' : "") + '>' + (on ? "✓ Selecionado" : "Quero este") + '</button>' +
          '<a class="btn btn-wpp" target="_blank" rel="noopener" href="' + wppLink(msg) + '"' + (out ? ' aria-disabled="true"' : "") + '>WhatsApp</a>' +
        '</div></div>';
    return el;
  }

  function render() {
    var q = state.q.trim().toLowerCase();
    var list = PRODUTOS.filter(function (p) {
      return (state.filter === "todos" || p.categoria === state.filter) &&
        (!state.onlyStock || p.estoque) &&
        (!q || (p.nome + " " + p.cor).toLowerCase().indexOf(q) > -1);
    });
    grid.innerHTML = "";
    list.forEach(function (p, i) { grid.appendChild(card(p, i)); });
    empty.hidden = list.length > 0;
  }

  document.querySelectorAll("#filters .chip").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("#filters .chip").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active"); state.filter = b.dataset.filter; render();
    });
  });
  $("#onlyStock").addEventListener("change", function (e) { state.onlyStock = e.target.checked; render(); });
  $("#search").addEventListener("input", function (e) { state.q = e.target.value; render(); });

  /* ---------- Seleção ---------- */
  var bar = $("#pickbar");
  function updateBar() {
    var n = picked.size;
    bar.hidden = n === 0;
    $("#pickCount").textContent = n;
    $("#pickLabel").textContent = n === 1 ? "modelo selecionado" : "modelos selecionados";
    var lines = PRODUTOS.filter(function (p) { return picked.has(p.id); })
      .map(function (p) { return "• " + p.nome + " (" + p.cor + ")"; });
    $("#pickSend").href = wppLink("Olá! Vim pelo site da Ótica KB e quero receber estes modelos:\n" + lines.join("\n") + "\n\nPode me ajudar? 😊");
  }
  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".btn-pick");
    if (!b || b.getAttribute("aria-disabled") === "true") return;
    var id = Number(b.dataset.id);
    picked.has(id) ? picked.delete(id) : picked.add(id);
    var c = b.closest(".card");
    c.classList.toggle("picked", picked.has(id));
    b.classList.toggle("on", picked.has(id));
    b.textContent = picked.has(id) ? "✓ Selecionado" : "Quero este";
    updateBar();
  });
  $("#pickClear").addEventListener("click", function () { picked.clear(); updateBar(); render(); });

  /* ---------- Reveal ao rolar ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: .12 }) : null;
  document.querySelectorAll(".reveal").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); });

  $("#year").textContent = new Date().getFullYear();
  render(); updateBar();
})();
