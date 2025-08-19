// sendal.id — interactivity: slider, cart, checkout, animations
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

// Simple state
const state = {
  cart: JSON.parse(localStorage.getItem('sendal_cart') || '[]'),
};

function saveCart() {
  localStorage.setItem('sendal_cart', JSON.stringify(state.cart));
  renderCart();
  updateCartCount();
}

function formatIDR(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

// Slider
function initSlider() {
  const slides = $$('.slide');
  const dots = $$('.dot');
  let i = 0;
  function show(idx) {
    slides.forEach((s, k) => s.classList.toggle('active', k === idx));
    dots.forEach((d, k) => d.classList.toggle('active', k === idx));
    i = idx;
  }
  dots.forEach((d, idx) => d.addEventListener('click', () => show(idx)));
  show(0);
  setInterval(() => show((i + 1) % slides.length), 4500);

  // basic swipe
  let startX = 0;
  const ctn = $('.slides');
  ctn.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
  ctn.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(dx < 0 ? (i + 1) % slides.length : (i - 1 + slides.length) % slides.length);
  });
}

// Products (demo catalog)
const products = [
  { id: 's1', name: 'Pastel Slide Pink', price: 159000, img: 'assets/images/product1.svg', tag: 'new' },
  { id: 's2', name: 'Pastel Slide Blue', price: 159000, img: 'assets/images/product2.svg' },
  { id: 's3', name: 'Everyday Sandal', price: 179000, img: 'assets/images/product3.svg' },
  { id: 's4', name: 'Soft Strap Duo', price: 199000, img: 'assets/images/product4.svg' },
  { id: 's5', name: 'Cloudy Flip', price: 99000,  img: 'assets/images/product5.svg' },
  { id: 's6', name: 'Weekend Mule',  price: 219000, img: 'assets/images/product6.svg' },
];

function renderProducts() {
  const grid = $('#products');
  if (!grid) return;
  grid.innerHTML = products.map(p => `
    <article class="card fade-up">
      <span class="badge-new" ${p.tag ? '' : 'style="display:none"'}>${p.tag || ''}</span>
      <div class="thumb"><img src="${p.img}" alt="${p.name}"></div>
      <div class="info">
        <div class="row" style="justify-content:space-between;">
          <h3 style="margin:0;font-size:16px">${p.name}</h3>
          <span class="price">${formatIDR(p.price)}</span>
        </div>
        <button class="btn add" data-id="${p.id}">Tambah ke Keranjang</button>
      </div>
    </article>
  `).join('');

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.add');
    if (!btn) return;
    const id = btn.dataset.id;
    const item = products.find(p => p.id === id);
    const cartItem = state.cart.find(i => i.id === id);
    if (cartItem) cartItem.qty += 1;
    else state.cart.push({ id, name: item.name, price: item.price, img: item.img, qty: 1 });
    saveCart();
    openCart();
  });
}

// Cart UI
function renderCart() {
  const list = $('#cart-items');
  if (!list) return;
  list.innerHTML = state.cart.map(i => `
    <div class="cart-item">
      <img src="${i.img}" alt="" width="60" height="60" style="border-radius:12px;object-fit:cover"/>
      <div>
        <div style="font-weight:600">${i.name}</div>
        <div class="small">${formatIDR(i.price)}</div>
        <div class="qty">
          <button data-act="dec" data-id="${i.id}">–</button>
          <span>${i.qty}</span>
          <button data-act="inc" data-id="${i.id}">+</button>
          <button data-act="rm" data-id="${i.id}" style="margin-left:8px">hapus</button>
        </div>
      </div>
      <div style="font-weight:700">${formatIDR(i.price * i.qty)}</div>
    </div>
  `).join('');

  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  $('#cart-total').textContent = formatIDR(total);
  $('#checkout-btn')?.classList.toggle('outline', total === 0);
  $('#checkout-btn')?.setAttribute('aria-disabled', total === 0 ? 'true' : 'false');
}

function openCart() { $('.cart-drawer')?.classList.add('open'); }
function closeCart() { $('.cart-drawer')?.classList.remove('open'); }

function bindCartControls() {
  $('#open-cart')?.addEventListener('click', openCart);
  $('#close-cart')?.addEventListener('click', closeCart);
  $('#cart-items')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    const item = state.cart.find(i => i.id === id);
    if (!item) return;
    if (act === 'inc') item.qty++;
    if (act === 'dec') item.qty = Math.max(0, item.qty - 1);
    if (act === 'rm' || item.qty === 0) {
      const idx = state.cart.findIndex(i => i.id === id);
      state.cart.splice(idx, 1);
    }
    saveCart();
  });
  $('#checkout-btn')?.addEventListener('click', () => {
    if (state.cart.length === 0) return;
    location.href = 'checkout.html';
  });
}

function updateCartCount() {
  const count = state.cart.reduce((s,i) => s + i.qty, 0);
  $('#cart-count')?.replaceChildren(document.createTextNode(count));
}

// Pinterest Masonry images
const pins = Array.from({length: 8}, (_,i) => `assets/images/pin${i+1}.svg`);
function renderMasonry() {
  const wrap = $('#masonry');
  if (!wrap) return;
  wrap.innerHTML = pins.map(src => `<img class="pin fade-up" src="${src}" alt="gallery">`).join('');
}

// Intersection animations
function initInView() {
  const ob = new IntersectionObserver((entries) => {
    entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
  }, { threshold: .08 });
  $$('.fade-up').forEach(el => ob.observe(el));
}

// Checkout page
function renderCheckout() {
  if (!$('#checkout-items')) return;
  const list = $('#checkout-items');
  list.innerHTML = state.cart.map(i => `
    <div class="row" style="justify-content:space-between">
      <div class="row"><img src="${i.img}" width="42" height="42" style="border-radius:10px"/><div>${i.name} × ${i.qty}</div></div>
      <div>${formatIDR(i.price * i.qty)}</div>
    </div>
  `).join('');
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  $('#checkout-total').textContent = formatIDR(total);
  $('#pay').addEventListener('click', (e) => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const address = $('#address').value.trim();
    if (!name || !email || !address) { alert('Lengkapi data checkout ya 🙂'); return; }
    const orderId = 'SD' + Math.random().toString(36).slice(2,8).toUpperCase();
    localStorage.removeItem('sendal_cart');
    state.cart = [];
    alert(`Terima kasih ${name}! Pesanan kamu ${orderId} berhasil dibuat.`);
    location.href = 'index.html#thanks';
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initSlider();
  renderProducts();
  renderMasonry();
  bindCartControls();
  renderCart();
  renderCheckout();
  initInView();
  updateCartCount();
});
