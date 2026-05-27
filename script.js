/* ===================================================
   MAISON LUXE — script.js
   =================================================== */

'use strict';

// ===================================================
// STATE
// ===================================================

const state = {
  cart: [], // { id, name, price, category, img, qty }
  cartOpen: false,
  mobileMenuOpen: false,
};

// ===================================================
// CUSTOM CURSOR
// ===================================================

const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

// Cursor grow on interactive elements
const interactiveEls = document.querySelectorAll('a, button, .product-card, .swatch, input');
interactiveEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1.8)';
    cursorFollower.style.opacity = '0.5';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorFollower.style.opacity = '1';
  });
});

// ===================================================
// NAVBAR SCROLL EFFECT
// ===================================================

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===================================================
// MOBILE MENU
// ===================================================

const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const navOverlay = document.getElementById('nav-overlay');

menuToggle.addEventListener('click', toggleMobileMenu);
navOverlay.addEventListener('click', closeMobileMenu);

function toggleMobileMenu() {
  state.mobileMenuOpen = !state.mobileMenuOpen;
  menuToggle.classList.toggle('active');
  mobileMenu.classList.toggle('open');
}

function closeMobileMenu() {
  state.mobileMenuOpen = false;
  menuToggle.classList.remove('active');
  mobileMenu.classList.remove('open');
}

// ===================================================
// SMOOTH SCROLL HELPERS
// ===================================================

function scrollToCollection() {
  document.getElementById('collection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToEditorial() {
  document.getElementById('editorial').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===================================================
// CART — CORE LOGIC
// ===================================================

function generateId(name) {
  return name.replace(/\s+/g, '-').toLowerCase();
}

function addToCart(name, price, category, img) {
  const id = generateId(name);
  const existingIndex = state.cart.findIndex(item => item.id === id);

  if (existingIndex > -1) {
    state.cart[existingIndex].qty += 1;
  } else {
    state.cart.push({ id, name, price, category, img, qty: 1 });
  }

  renderCart();
  showNotification(`${name} added to your selection`);
  bumpCartBadge();

  // Auto-open cart on add
  if (!state.cartOpen) {
    openCart();
  }
}

function removeFromCart(id) {
  state.cart = state.cart.filter(item => item.id !== id);
  renderCart();
}

function updateQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) {
    removeFromCart(id);
    return;
  }
  renderCart();
}

// ===================================================
// CART — RENDER
// ===================================================

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const emptyEl = document.getElementById('cart-empty');
  const footerEl = document.getElementById('cart-footer');
  const countBadge = document.getElementById('cart-count');
  const countDrawer = document.getElementById('cart-count-drawer');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const shippingEl = document.getElementById('cart-shipping-text');

  const totalItems = state.cart.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal >= 85 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  // Badge
  countBadge.textContent = totalItems;
  countDrawer.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

  if (state.cart.length === 0) {
    // Clear existing items except empty state
    [...container.children].forEach(child => {
      if (!child.classList.contains('cart-empty')) child.remove();
    });
    emptyEl.style.display = 'flex';
    footerEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  footerEl.style.display = 'block';

  // Clear cart items (not empty state)
  [...container.children].forEach(child => {
    if (!child.classList.contains('cart-empty')) child.remove();
  });

  // Render each item
  state.cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.innerHTML = `
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" loading="lazy"/>
      <div class="cart-item-details">
        <div class="cart-item-category">${item.category}</div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;gap:12px;">
        <button class="remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove ${item.name}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
        <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
      </div>
    `;
    container.appendChild(row);
  });

  // Update totals
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  shippingEl.textContent = shipping === 0 ? (subtotal > 0 ? 'FREE' : 'Free over $85') : `$${shipping.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;
}

// ===================================================
// CART — OPEN / CLOSE
// ===================================================

const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggleBtn = document.getElementById('cart-toggle');

cartToggleBtn.addEventListener('click', toggleCart);

function toggleCart() {
  state.cartOpen ? closeCart() : openCart();
}

function openCart() {
  state.cartOpen = true;
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  state.cartOpen = false;
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close cart on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state.cartOpen) closeCart();
    if (state.mobileMenuOpen) closeMobileMenu();
  }
});

// ===================================================
// CART BADGE BUMP ANIMATION
// ===================================================

function bumpCartBadge() {
  const badge = document.getElementById('cart-count');
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 300);
}

// ===================================================
// NOTIFICATION TOAST
// ===================================================

let notifTimeout;

function showNotification(message) {
  const notif = document.getElementById('notification');
  notif.textContent = message;
  notif.classList.add('show');

  clearTimeout(notifTimeout);
  notifTimeout = setTimeout(() => {
    notif.classList.remove('show');
  }, 2800);
}

// ===================================================
// PRODUCT FILTER
// ===================================================

const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    // Update active state
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter cards
    productCards.forEach(card => {
      const cat = card.dataset.category;
      if (filter === 'all' || cat === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'none';
        requestAnimationFrame(() => {
          card.style.animation = 'fadeInCard 0.4s ease forwards';
        });
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// Inject filter card animation
const filterStyle = document.createElement('style');
filterStyle.textContent = `
  @keyframes fadeInCard {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(filterStyle);

// ===================================================
// SCROLL REVEAL
// ===================================================

const reveals = document.querySelectorAll(
  '.product-card, .section-header, .editorial-text, .editorial-images, .about-visual, .about-text, .testimonial-card, .newsletter-inner, .footer-brand, .footer-col'
);

reveals.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => revealObserver.observe(el));

// ===================================================
// NEWSLETTER
// ===================================================

function handleNewsletter(e) {
  e.preventDefault();
  const input = document.getElementById('newsletter-email');
  if (input.value) {
    showNotification(`Welcome! You've joined the Maison Luxe edit.`);
    input.value = '';
  }
}

// ===================================================
// CHECKOUT (Simulated)
// ===================================================

function handleCheckout() {
  if (state.cart.length === 0) return;
  closeCart();
  setTimeout(() => {
    showNotification('Thank you! Your order has been received. ✦');
    state.cart = [];
    renderCart();
  }, 400);
}

// ===================================================
// SWATCH CLICK — SELECT ACTIVE
// ===================================================

document.querySelectorAll('.swatch').forEach(swatch => {
  swatch.addEventListener('click', function() {
    const swatches = this.closest('.product-swatches').querySelectorAll('.swatch');
    swatches.forEach(s => s.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.15)');
    this.style.boxShadow = `0 0 0 3px var(--white), 0 0 0 5px var(--gold)`;
  });
});

// ===================================================
// SMOOTH ANCHOR NAV LINKS
// ===================================================

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===================================================
// INIT
// ===================================================

renderCart();
