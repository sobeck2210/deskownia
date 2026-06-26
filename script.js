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
