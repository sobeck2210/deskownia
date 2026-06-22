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

  /* ---- Koszyk (demo, stan w pamięci) ---- */
  const FREE_SHIP = 250; // próg darmowej wysyłki [zł]
  let cart = [];

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
          <button data-remove="${idx}" style="background:none;border:none;color:var(--clay);font-size:.78rem;cursor:pointer;padding:.2rem 0;text-decoration:underline">Usuń</button>
        </div>
        <div class="ci-price">${fmt(i.price * i.qty)}</div>
      </div>`).join("");

    cartItemsEl.querySelectorAll("[data-remove]").forEach(b =>
      b.addEventListener("click", () => { cart.splice(+b.dataset.remove, 1); renderCart(); }));
  }

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      cart.push({ name: btn.dataset.name || "Deska", price: +btn.dataset.price || 0, qty: 1 });
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
