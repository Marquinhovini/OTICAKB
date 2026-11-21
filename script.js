(function () {
  var CFG = window.KB_CONFIG;
  var PRODUTOS = window.KB_PRODUTOS || [];
  var root = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };

  /* ---------- WhatsApp (todas as páginas) ---------- */
  function wppLink(msg) {
    return "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(msg);
  }
  document.querySelectorAll("[data-wpp]").forEach(function (a) {
    a.href = wppLink(a.getAttribute("data-wpp"));
  });

  /* ---------- Tema (todas as páginas) ---------- */
  var themeBtn = $("#themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("kb-theme", next); } catch (e) {}
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = next === "dark" ? "#1a0d1f" : "#fbf7fc";
  });

  /* ---------- Menu mobile ---------- */
  var links = $("#navLinks"), menuBtn = $("#menuBtn");
  if (links && menuBtn) {
    menuBtn.addEventListener("click", function () { links.classList.toggle("open"); });
    links.addEventListener("click", function (e) { if (e.target.tagName === "A") links.classList.remove("open"); });
  }

  /* ---------- Reveal ao rolar ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: .12 }) : null;
  document.querySelectorAll(".reveal").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); });

  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Catálogo (só na página principal) ---------- */
  var grid = $("#grid");
  if (!grid) return;

  var PRODUTOS = window.KB_PRODUTOS || [];
  var empty = $("#empty"), bar = $("#pickbar"), grauNote = $("#grauNote");
  var picked = new Set();               /* guarda o NOME do modelo */
  var state = { filter: "todos", onlyStock: true, q: "", animate: true };
  try { JSON.parse(sessionStorage.getItem("kb-pick") || "[]").forEach(function (n) { picked.add(n); }); } catch (e) {}
  function savePick() { try { sessionStorage.setItem("kb-pick", JSON.stringify(Array.from(picked))); } catch (e) {} }

  function glassesArt(c1, c2, id) {
    return '<svg class="art" viewBox="0 0 320 140" aria-hidden="true"><defs><linearGradient id="g' + id +
      '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 +
      '"/></linearGradient></defs><g fill="rgba(255,255,255,.18)" stroke="url(#g' + id + ')" stroke-width="9" stroke-linecap="round">' +
      '<path d="M20 40Q20 20 60 20H110Q150 20 150 60Q150 110 100 110H70Q20 110 20 60Z"/>' +
      '<path d="M300 40Q300 20 260 20H210Q170 20 170 60Q170 110 220 110H250Q300 110 300 60Z"/>' +
      '<path fill="none" d="M150 52Q160 42 170 52M20 42L2 34M300 42L318 34"/></g></svg>';
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(v) { return "R$ " + v.toFixed(2).replace(".", ","); }

  /* ---------- Planilha do Google (opcional) ---------- */
  function parseCSV(t) {
    var out = [], row = [], cur = "", q = false, i, ch;
    for (i = 0; i < t.length; i++) {
      ch = t[i];
      if (q) { if (ch === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
      else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && t[i + 1] === "\n") i++; row.push(cur); out.push(row); row = []; cur = ""; }
      else cur += ch;
    }
    if (cur || row.length) { row.push(cur); out.push(row); }
    return out;
  }
  function norm(s) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase(); }
  function sim(v, padrao) { v = norm(v || ""); if (!v) return padrao; return ["sim", "s", "1", "true", "x", "disponivel"].indexOf(v) > -1; }
  function num(v) {
    if (v == null || v === "") return null;
    var s = String(v).replace(/[^\d,.]/g, "");
    if (s.indexOf(",") > -1) s = s.replace(/\./g, "").replace(",", ".");
    var n = parseFloat(s); return isNaN(n) ? null : n;
  }
  function fromSheet(csv) {
    var t = parseCSV(csv); if (t.length < 2) return [];
    var cols = t[0].map(norm);
    return t.slice(1).map(function (r, i) {
      var o = {}; cols.forEach(function (c, k) { o[c] = (r[k] || "").trim(); });
      var cat = norm(o.categoria || "grau").indexOf("sol") > -1 ? "sol" : "grau";
      return {
        id: i + 1, nome: o.nome || o.modelo || "", categoria: cat, cor: o.cor || "",
        preco: num(o.preco || o.valor), estoque: sim(o.estoque || o.disponivel, true), destaque: sim(o.destaque, false),
        imagem: o.imagem || o.foto || "", medidas: o.medidas || "",
        tom: cat === "sol" ? ["#f1d9a0", "#c8963e"] : ["#e9cfc9", "#b98f92"]
      };
    }).filter(function (p) { return p.nome; });
  }
  function carregarPlanilha() {
    if (!CFG.planilha) return Promise.resolve();
    var ctl = "AbortController" in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 4000);
    return fetch(CFG.planilha + (CFG.planilha.indexOf("?") > -1 ? "&" : "?") + "t=" + Date.now(), ctl ? { signal: ctl.signal } : {})
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (txt) { var l = fromSheet(txt); if (l.length) PRODUTOS = l; })
      .catch(function () {})
      .then(function () { clearTimeout(timer); });
  }

  /* ---------- Cartões ---------- */
  function lista(p) {
    var s = "• " + p.nome + (p.cor ? " (" + p.cor + ")" : "");
    return p.preco != null ? s + " — " + money(p.preco) : s;
  }
  function card(p, i) {
    var out = !p.estoque, on = picked.has(p.nome);
    var el = document.createElement("article");
    el.className = "card" + (out ? " out" : "") + (on ? " picked" : "") + (state.animate ? " anim" : "");
    if (state.animate) el.style.animationDelay = Math.min(i, 8) * 50 + "ms";
    var tom = p.tom || ["#d9c3dd", "#8b4fb3"];
    var msg = "Olá! Tenho interesse no modelo *" + p.nome + "*" + (p.cor ? " (" + p.cor + ")" : "") + ". Ainda está disponível?";
    el.innerHTML =
      '<button type="button" class="thumb" aria-label="Ampliar foto: ' + esc(p.nome) + '" style="background:linear-gradient(135deg,' + tom[0] + ',' + tom[1] + ');--img:url(\'' + esc(p.imagem) + '\')">' +
        glassesArt("#ffffff", "#ffffff", i) +
        '<img src="' + esc(p.imagem) + '" alt="' + esc(p.nome) + '" loading="lazy" decoding="async">' +
        '<span class="badges"><span class="badge b-cat">' + (p.categoria === "sol" ? "☀️ Sol" : "👓 Grau") + '</span>' +
        (out ? '<span class="badge b-out">Indisponível</span>' : (p.destaque ? '<span class="badge b-new">Novo</span>' : "")) + '</span>' +
      '</button>' +
      '<div class="info"><h3>' + esc(p.nome) + '</h3>' +
        '<div class="meta"><i class="swatch" style="background:' + tom[1] + '"></i>' + esc(p.cor) + (p.medidas ? '<span class="med">' + esc(p.medidas) + '</span>' : "") + '</div>' +
        (p.preco != null ? '<div class="price">' + money(p.preco) + '</div>' : "") +
        '<div class="actions">' +
          '<button class="btn btn-pick' + (on ? " on" : "") + '" type="button"' + (out ? ' aria-disabled="true"' : "") + '>' + (on ? "✓ Selecionado" : "Quero este") + '</button>' +
          '<a class="btn btn-wpp btn-ico" target="_blank" rel="noopener" aria-label="Perguntar sobre ' + esc(p.nome) + ' no WhatsApp" href="' + wppLink(msg) + '"' + (out ? ' aria-disabled="true"' : "") + '>' +
            '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12 0 12 12 0 0 0 1.6 17.9L0 24l6.3-1.6A12 12 0 0 0 24 12a11.8 11.8 0 0 0-3.5-8.5zM12 21.9a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.9 9.9 0 1 1 12 21.9zm5.4-7.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.8-1.6a.6.6 0 0 0 0-.6c-.1-.1-.7-1.6-.9-2.2s-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.3 3.4 14.7 14.7 0 0 0 5.7 5c2.1.9 2.9.8 3.4.7a2.9 2.9 0 0 0 1.9-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z"/></svg>' +
          '</a>' +
        '</div></div>';
    el.dataset.nome = p.nome;
    /* foto muito larga (panorâmica) usa "contain"; foto normal preenche o cartão */
    var img = el.querySelector("img"), thumb = el.querySelector(".thumb");
    function ok() { thumb.classList.add("has-img"); if (img.naturalWidth / img.naturalHeight > 1.8) thumb.classList.add("wide"); }
    img.addEventListener("load", ok); img.addEventListener("error", function () { img.remove(); });
    if (img.complete && img.naturalWidth) ok();
    return el;
  }

  function render() {
    var q = norm(state.q);
    var list = PRODUTOS.filter(function (p) {
      return (state.filter === "todos" || p.categoria === state.filter) &&
        (!state.onlyStock || p.estoque) &&
        (!q || norm(p.nome + " " + p.cor).indexOf(q) > -1);
    });
    grid.innerHTML = "";
    list.forEach(function (p, i) { grid.appendChild(card(p, i)); });
    state.animate = false;
    if (empty) empty.hidden = list.length > 0;
  }

  /* ---------- Filtros ---------- */
  function setupToolbar() {
    var tools = $("#tools"), filters = $("#filters");
    if (tools && PRODUTOS.length < 9) tools.hidden = true;      /* poucos modelos: sem busca */
    var cats = {}; PRODUTOS.forEach(function (p) { cats[p.categoria] = 1; });
    if (filters && Object.keys(cats).length < 2) filters.hidden = true;
  }
  document.querySelectorAll("#filters .chip").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("#filters .chip").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active"); state.filter = b.dataset.filter; render();
    });
  });
  var onlyStock = $("#onlyStock"), search = $("#search"), tm;
  if (onlyStock) onlyStock.addEventListener("change", function (e) { state.onlyStock = e.target.checked; render(); });
  if (search) search.addEventListener("input", function (e) { clearTimeout(tm); tm = setTimeout(function () { state.q = e.target.value; render(); }, 150); });

  /* ---------- Seleção ---------- */
  function updateBar() {
    if (!bar) return;
    var n = picked.size, escolhidos = PRODUTOS.filter(function (p) { return picked.has(p.nome); });
    bar.hidden = n === 0;
    document.body.classList.toggle("has-pick", n > 0);
    $("#pickCount").textContent = n;
    $("#pickLabel").textContent = n === 1 ? "modelo selecionado" : "modelos selecionados";
    var total = 0, comPreco = 0;
    escolhidos.forEach(function (p) { if (p.preco != null) { total += p.preco; comPreco++; } });
    var msg = "Olá! Vim pelo site da Ótica KB e quero receber estes modelos:\n" + escolhidos.map(lista).join("\n") +
      (comPreco === escolhidos.length && n > 0 && comPreco > 0 ? "\n\n*Total: " + money(total) + "*" : "") + "\n\nPode me ajudar? 😊";
    $("#pickSend").href = wppLink(msg);
    if (grauNote) grauNote.hidden = !escolhidos.some(function (p) { return p.categoria === "grau"; });
  }
  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".card"); if (!card) return;
    var b = e.target.closest(".btn-pick");
    if (b) {
      if (b.getAttribute("aria-disabled") === "true") return;
      var nome = card.dataset.nome;
      picked.has(nome) ? picked.delete(nome) : picked.add(nome);
      card.classList.toggle("picked", picked.has(nome));
      b.classList.toggle("on", picked.has(nome));
      b.textContent = picked.has(nome) ? "✓ Selecionado" : "Quero este";
      savePick(); updateBar(); return;
    }
    var th = e.target.closest(".thumb");
    if (th) openZoom(card.dataset.nome);
  });
  var clear = $("#pickClear");
  if (clear) clear.addEventListener("click", function () { picked.clear(); savePick(); updateBar(); render(); });

  /* ---------- Ampliar foto ---------- */
  var zoom = $("#zoom");
  function openZoom(nome) {
    var p = PRODUTOS.filter(function (x) { return x.nome === nome; })[0];
    if (!zoom || !p || !p.imagem) return;
    $("#zoomImg").src = p.imagem; $("#zoomImg").alt = p.nome;
    $("#zoomCap").textContent = p.nome + (p.cor ? " · " + p.cor : "") + (p.medidas ? " · " + p.medidas : "");
    if (zoom.showModal) zoom.showModal(); else zoom.setAttribute("open", "");
  }
  if (zoom) {
    var closeZoom = function () { if (zoom.close) zoom.close(); else zoom.removeAttribute("open"); };
    zoom.addEventListener("click", function (e) { if (e.target === zoom || e.target.closest("#zoomX")) closeZoom(); });
  }

  carregarPlanilha().then(function () {
    var nomes = PRODUTOS.map(function (p) { return p.nome; });
    Array.from(picked).forEach(function (n) { if (nomes.indexOf(n) < 0) picked.delete(n); });
    setupToolbar(); render(); updateBar();
  });
})();
