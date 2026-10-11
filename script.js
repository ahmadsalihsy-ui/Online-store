const PRODUCTS = [
  { id: 1, name: "سماعات لاسلكية", category: "إلكترونيات", price: 129, emoji: "🎧", bg: "#e2eee9", tag: "الأكثر طلبًا", description: "صوت واضح وتصميم مريح للاستخدام اليومي." },
  { id: 2, name: "ساعة عصرية", category: "إكسسوارات", price: 189, emoji: "⌚", bg: "#f4e9d8", tag: "جديد", description: "تصميم أنيق يناسب مختلف الإطلالات." },
  { id: 3, name: "حقيبة يومية", category: "حقائب", price: 149, emoji: "🎒", bg: "#e8e7f4", tag: "", description: "حقيبة عملية للأغراض اليومية والتنقل." },
  { id: 4, name: "كوب حراري", category: "المنزل", price: 59, emoji: "☕", bg: "#f3e5e0", tag: "", description: "يحافظ على حرارة مشروبك لفترة أطول." },
  { id: 5, name: "مصباح مكتبي", category: "المنزل", price: 99, emoji: "💡", bg: "#f5efcf", tag: "اختيارنا", description: "إضاءة مريحة لمساحة عمل مرتبة." },
  { id: 6, name: "كاميرا صغيرة", category: "إلكترونيات", price: 249, emoji: "📷", bg: "#dceaf5", tag: "", description: "التقط لحظاتك بتصميم صغير وسهل الحمل." }
];
const CART_KEY = "matjar_demo_cart";

function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function formatPrice(price) {
  return `${new Intl.NumberFormat("ar").format(price)} ر.س`;
}
function updateCartCount() {
  const total = readCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = total);
}
function productCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.innerHTML = `
    <div class="product-visual" style="--product-bg:${product.bg}">
      ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ""}
      <span class="product-emoji" aria-hidden="true">${product.emoji}</span>
    </div>
    <div class="product-info">
      <span class="product-category">${product.category}</span>
      <h3>${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <div class="product-bottom">
        <span class="price">${formatPrice(product.price)}</span>
        <button class="add-btn" type="button" data-add="${product.id}">+ أضف للسلة</button>
      </div>
    </div>`;
  return card;
}
function renderProducts(target, list) {
  if (!target) return;
  target.replaceChildren(...list.map(productCard));
  target.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.add)));
  });
}
function addToCart(id) {
  const product = PRODUCTS.find(item => item.id === id);
  if (!product) return;
  const cart = readCart();
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart(cart);
  showToast(`تمت إضافة «${product.name}» إلى السلة`);
}
function showToast(message) {
  document.querySelector(".toast")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2400);
}
function renderHome() {
  renderProducts(document.getElementById("featuredProducts"), PRODUCTS.slice(0, 3));
}
function renderAllProducts() {
  const target = document.getElementById("allProducts");
  if (!target) return;
  const search = document.getElementById("productSearch");
  const sort = document.getElementById("sortProducts");
  const count = document.getElementById("resultsCount");
  const empty = document.getElementById("noProducts");
  function update() {
    const term = (search?.value || "").trim().toLocaleLowerCase("ar");
    let list = PRODUCTS.filter(p => `${p.name} ${p.category} ${p.description}`.toLocaleLowerCase("ar").includes(term));
    if (sort?.value === "low") list.sort((a, b) => a.price - b.price);
    if (sort?.value === "high") list.sort((a, b) => b.price - a.price);
    renderProducts(target, list);
    if (count) count.textContent = `عدد المنتجات: ${list.length}`;
    empty?.classList.toggle("hidden", list.length > 0);
  }
  search?.addEventListener("input", update);
  sort?.addEventListener("change", update);
  update();
}
function renderCart() {
  const root = document.getElementById("cartContent");
  if (!root) return;
  const cart = readCart().filter(item => PRODUCTS.some(p => p.id === item.id) && item.quantity > 0);
  saveCart(cart);
  if (!cart.length) {
    root.innerHTML = `<div class="empty-cart"><div class="empty-icon">🛍️</div><h2>سلتك فارغة حاليًا</h2><p>تصفح المنتجات وأضف ما يعجبك إلى سلتك.</p><a class="btn btn-primary" href="products.html">تصفح المنتجات</a></div>`;
    return;
  }
  const items = cart.map(item => {
    const p = PRODUCTS.find(product => product.id === item.id);
    return `<article class="cart-item">
      <div class="cart-item-visual" style="--product-bg:${p.bg}" aria-hidden="true">${p.emoji}</div>
      <div><h3>${p.name}</h3><p>${formatPrice(p.price)} للقطعة</p>
        <div class="cart-item-actions">
          <button class="qty-btn" type="button" data-change="${p.id}" data-delta="-1" aria-label="تقليل الكمية">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" type="button" data-change="${p.id}" data-delta="1" aria-label="زيادة الكمية">+</button>
          <button class="remove-btn" type="button" data-remove="${p.id}">حذف</button>
        </div>
      </div>
      <strong class="price">${formatPrice(p.price * item.quantity)}</strong>
    </article>`;
  }).join("");
  const total = cart.reduce((sum, item) => sum + PRODUCTS.find(p => p.id === item.id).price * item.quantity, 0);
  root.innerHTML = `<div class="cart-items">${items}</div>
    <aside class="cart-summary"><h2>ملخص الطلب</h2>
      <div class="summary-row"><span>عدد القطع</span><strong>${cart.reduce((sum, i) => sum + i.quantity, 0)}</strong></div>
      <div class="summary-row"><span>التوصيل</span><strong>مجاني</strong></div>
      <div class="summary-row summary-total"><span>الإجمالي</span><strong>${formatPrice(total)}</strong></div>
      <button class="btn btn-primary full-width" type="button" id="demoCheckout">متابعة تجريبية</button>
      <p class="small-note">لا تتم أي عملية دفع حقيقية في هذا النموذج.</p>
    </aside>`;
  root.querySelectorAll("[data-change]").forEach(button => button.addEventListener("click", () => {
    const id = Number(button.dataset.change), delta = Number(button.dataset.delta);
    const current = readCart(), item = current.find(i => i.id === id);
    if (item) item.quantity += delta;
    saveCart(current.filter(i => i.quantity > 0));
    renderCart();
  }));
  root.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
    saveCart(readCart().filter(i => i.id !== Number(button.dataset.remove)));
    renderCart();
    showToast("تم حذف المنتج من السلة");
  }));
  document.getElementById("demoCheckout")?.addEventListener("click", () => showToast("هذه نسخة تجريبية؛ لم يتم إرسال طلب أو تنفيذ دفع."));
}
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
  renderHome();
  renderAllProducts();
  renderCart();
});
