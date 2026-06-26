/* =====================================================================
   MANUFAKTURA — interakcje
   ===================================================================== */
(function () {
  "use strict";

  /* ---- Menu mobilne ---- */
  const burger = document.querySelector("[data-burger]");
  const menu = document.querySelector("[data-mobile-menu]");
  const menuClose = document.querySelector("[data-menu-close]");
  const openMenu = () => { menu && menu.classList.add("open"); document.body.style.overflow = "hidden"; };
  const closeMenu = () => { menu && menu.classList.remove("open"); document.body.style.overflow = ""; };
  burger && burger.addEventListener("click", openMenu);
  menuClose && menuClose.addEventListener("click", closeMenu);
  menu && menu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

  /* ---- Koszyk (trwały, localStorage) ---- */
  const FREE_SHIP = 250; // próg darmowej wysyłki [zł]
  const CART_KEY = "deskownia_cart";

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const data = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) return [];
      return data
        .map(i => ({ name: String(i.name || "Deska"), price: +i.price || 0, qty: Math.max(1, +i.qty || 1) }))
        .filter(i => i.price >= 0);
    } catch (e) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  let cart = loadCart();

  const drawer = document.querySelector("[data-cart-drawer]");
  const overlay = document.querySelector("[data-overlay]");
  const cartCountEl = document.querySelector("[data-cart-count]");
  const cartItemsEl = document.querySelector("[data-cart-items]");
  const cartTotalEl = document.querySelector("[data-cart-total]");
  const cartFreeEl = document.querySelector("[data-cart-free]");

  const fmt = (n) => n.toLocaleString("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });

  function openCart() { drawer && drawer.classList.add("open"); overlay && overlay.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeCart() { drawer && drawer.classList.remove("open"); overlay && overlay.classList.remove("open"); document.body.style.overflow = ""; }

  function renderCart() {
    saveCart();
    if (!cartItemsEl) return;
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (cartCountEl) { cartCountEl.textContent = count; cartCountEl.style.display = count ? "grid" : "none"; }
    if (cartTotalEl) cartTotalEl.textContent = fmt(total);

    if (cartFreeEl) {
      if (total === 0) cartFreeEl.textContent = "Darmowa wysyłka od " + fmt(FREE_SHIP);
      else if (total >= FREE_SHIP) cartFreeEl.textContent = "✓ Masz darmową wysyłkę";
      else cartFreeEl.textContent = "Do darmowej wysyłki brakuje " + fmt(FREE_SHIP - total);
    }

    if (!cart.length) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Koszyk jest pusty.<br>Wybierz deskę z naszych kategorii.</p>';
      return;
    }
    cartItemsEl.innerHTML = cart.map((i, idx) => `
      <div class="cart-item">
        <div class="ci-img"></div>
        <div>
          <div class="ci-name">${i.name}</div>
          <div class="ci-qty">
            <button data-dec="${idx}" aria-label="Mniej">−</button>
            <span>${i.qty}</span>
            <button data-inc="${idx}" aria-label="Więcej">+</button>
            <button data-remove="${idx}" class="ci-remove">Usuń</button>
          </div>
        </div>
        <div class="ci-price">${fmt(i.price * i.qty)}</div>
      </div>`).join("");

    cartItemsEl.querySelectorAll("[data-remove]").forEach(b =>
      b.addEventListener("click", () => { cart.splice(+b.dataset.remove, 1); renderCart(); }));
    cartItemsEl.querySelectorAll("[data-inc]").forEach(b =>
      b.addEventListener("click", () => { cart[+b.dataset.inc].qty++; renderCart(); }));
    cartItemsEl.querySelectorAll("[data-dec]").forEach(b =>
      b.addEventListener("click", () => {
        const idx = +b.dataset.dec;
        if (cart[idx].qty > 1) cart[idx].qty--; else cart.splice(idx, 1);
        renderCart();
      }));
  }

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name || "Deska";
      const price = +btn.dataset.price || 0;
      const qty = +btn.dataset.qty || 1;
      const existing = cart.find(i => i.name === name && i.price === price);
      if (existing) existing.qty += qty;
      else cart.push({ name, price, qty });
      renderCart();
      openCart();
    });
  });

  document.querySelectorAll("[data-open-cart]").forEach(b => b.addEventListener("click", openCart));
  document.querySelectorAll("[data-close-cart]").forEach(b => b.addEventListener("click", closeCart));
  overlay && overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCart(); closeMenu(); } });

  renderCart();

  /* ---- Filtry mobilne ---- */
  const fToggle = document.querySelector("[data-filter-toggle]");
  const fPanel = document.querySelector("[data-filters]");
  if (fToggle && fPanel) {
    fToggle.addEventListener("click", () => {
      const hidden = fPanel.style.display === "none" || getComputedStyle(fPanel).display === "none";
      fPanel.style.display = hidden ? "block" : "none";
    });
  }

  /* ---- Wyszukiwarka (overlay) ---- */
  const searchOverlay = document.querySelector("[data-search-overlay]");
  const openSearch = () => { searchOverlay && searchOverlay.classList.add("open"); const i = searchOverlay && searchOverlay.querySelector("input"); i && setTimeout(() => i.focus(), 120); };
  const closeSearch = () => searchOverlay && searchOverlay.classList.remove("open");
  document.querySelectorAll("[data-open-search]").forEach(b => b.addEventListener("click", openSearch));
  searchOverlay && searchOverlay.addEventListener("click", e => { if (e.target === searchOverlay) closeSearch(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeSearch(); });

  /* indeks produktów (na sztywno) */
  const PRODUCTS = [
    {n:"Deska bukowa Klasyk 35×25",p:189,u:"produkt-deska-bukowa-klasyk-35x25.html",c:"Bukowe"},
    {n:"Deska bukowa Mini 28×20",p:129,u:"produkt-deska-bukowa-mini-28x20.html",c:"Bukowe"},
    {n:"Deska bukowa XL 50×35",p:279,u:"produkt-deska-bukowa-xl-50x35.html",c:"Bukowe"},
    {n:"Deska bukowa z rączką 38×24",p:209,u:"produkt-deska-bukowa-z-raczka-38x24.html",c:"Bukowe"},
    {n:"Deska bukowa do chleba 40×28",p:229,u:"produkt-deska-bukowa-do-chleba-40x28.html",c:"Bukowe"},
    {n:"Deska bukowa okrągła Ø35",p:199,u:"produkt-deska-bukowa-okragla-o35.html",c:"Bukowe"},
    {n:"Deska do sushi XL 45×15",p:199,u:"produkt-deska-do-sushi-xl-45x15.html",c:"Do sushi"},
    {n:"Deska do sushi prosta 30×12",p:149,u:"produkt-deska-do-sushi-prosta-30x12.html",c:"Do sushi"},
    {n:"Deska do sushi z rowkiem na sos",p:169,u:"produkt-deska-do-sushi-z-rowkiem-na-sos.html",c:"Do sushi"},
    {n:"Deska do sushi dwustronna 35×14",p:219,u:"produkt-deska-do-sushi-dwustronna-35x14.html",c:"Do sushi"},
    {n:"Deska do sushi wędzona 40×14",p:239,u:"produkt-deska-do-sushi-wedzona-40x14.html",c:"Do sushi"},
    {n:"Zestaw 2 desek do sushi",p:269,u:"produkt-zestaw-2-desek-do-sushi.html",c:"Do sushi"},
    {n:"Deska do przystawek z miseczką 30×20",p:159,u:"produkt-deska-do-przystawek-z-miseczka-30x20.html",c:"Do przystawek"},
    {n:"Deska do przystawek 25×18",p:119,u:"produkt-deska-do-przystawek-25x18.html",c:"Do przystawek"},
    {n:"Deska tapas wąska 50×16",p:179,u:"produkt-deska-tapas-waska-50x16.html",c:"Do przystawek"},
    {n:"Deska do przystawek okrągła Ø28",p:139,u:"produkt-deska-do-przystawek-okragla-o28.html",c:"Do przystawek"},
    {n:"Deska do przystawek z uchwytem 35×22",p:169,u:"produkt-deska-do-przystawek-z-uchwytem-35x22.html",c:"Do przystawek"},
    {n:"Zestaw mini-desek 3 szt",p:199,u:"produkt-zestaw-mini-desek-3-szt.html",c:"Do przystawek"}
  ];
  const norm = (s) => s.toLowerCase()
    .replace(/[ąàä]/g,"a").replace(/ć/g,"c").replace(/[ęè]/g,"e").replace(/ł/g,"l")
    .replace(/ń/g,"n").replace(/[óò]/g,"o").replace(/ś/g,"s").replace(/[źż]/g,"z")
    .replace(/×/g,"x").replace(/\s+/g," ").trim();

  if (searchOverlay) {
    const input = searchOverlay.querySelector("input");
    const sug = searchOverlay.querySelector(".search-sug");
    const panel = searchOverlay.querySelector(".search-panel");
    const results = document.createElement("div");
    results.className = "search-results";
    panel.appendChild(results);

    const render = (q) => {
      const nq = norm(q);
      if (!nq) { results.innerHTML = ""; results.classList.remove("show"); if (sug) sug.style.display = ""; return; }
      if (sug) sug.style.display = "none";
      results.classList.add("show");
      const terms = nq.split(" ").filter(Boolean);
      const hits = PRODUCTS.filter(p => { const hay = norm(p.n + " " + p.c); return terms.every(t => hay.includes(t)); }).slice(0, 8);
      if (!hits.length) { results.innerHTML = '<p class="sr-empty">Brak wyników dla \u201E' + q + '\u201D.</p>'; return; }
      results.innerHTML = hits.map(p =>
        '<a class="sr-item" href="' + p.u + '"><span class="sr-name">' + p.n + '</span><span class="sr-cat">' + p.c + '</span><span class="sr-price">' + p.p + ' zł</span></a>'
      ).join("");
    };
    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { const first = results.querySelector(".sr-item"); if (first) window.location.href = first.getAttribute("href"); }
    });
  }

  /* ---- Reveal przy scrollu ---- */
  const items = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && items.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add("in"));
  }
})();
