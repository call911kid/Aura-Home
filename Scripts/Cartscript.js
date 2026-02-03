import { createOrder as firebaseCreateOrder } from "../Scripts/AuraHomeServices.js";
import { auth } from "../Scripts/firebase.js";

const cartKey = "aura_cart";

function getCart() {
  return JSON.parse(localStorage.getItem(cartKey)) || [];
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartIconCount();
  renderCart();
}

function toggleCart() {
  const sidebarElement = document.getElementById("cartSidebar");
  if (sidebarElement) {
    let bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarElement);
    if (!bsOffcanvas) {
      bsOffcanvas = new bootstrap.Offcanvas(sidebarElement);
    }
    bsOffcanvas.show();
  } else {
    console.error("Sidebar element #cartSidebar not found!");
  }
}

function addToCartFromPage(btn) {
  const card = btn.closest(".card");
  const id = card.getAttribute("data-id");
  const name = card.getAttribute("data-name");
  const price = parseFloat(card.getAttribute("data-price"));
  const img = card.getAttribute("data-img");

  if (!id) {
    console.error("Product ID is missing from HTML attributes!");
    return;
  }

  let cart = getCart();
  const existingItemIndex = cart.findIndex((item) => item.id === id);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({ id, name, price, img, quantity: 1 });
  }

  saveCart(cart);
  toggleCart();

  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.classList.add("animate__animated", "animate__bounceIn");
    setTimeout(
      () => badge.classList.remove("animate__animated", "animate__bounceIn"),
      1000,
    );
  }
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== id);
  saveCart(cart);
}

function updateQuantity(id, change) {
  let cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === id);

  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
  }
  saveCart(cart);
}

function calculateTotal(cart) {
  return cart
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(2);
}

function renderCart() {
  const container = document.getElementById("cart-items-container");
  const totalElement = document.getElementById("cart-total-price");
  let cart = getCart();

  cart = cart.filter((item) => item && item.id !== null);

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML =
      '<div class="text-center text-muted mt-5"><i class="fa-solid fa-cart-shopping fa-3x mb-3"></i><p>Your cart is empty.</p></div>';
    if (totalElement) totalElement.innerText = "$0.00";
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
        <div class="d-flex align-items-center border-bottom py-3">
            <img src="${item.img}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px;">
            <div class="ms-3 flex-grow-1">
                <h6 class="mb-1 fw-bold" style="font-size: 0.95rem;">${item.name}</h6>
                <div class="text-muted" style="font-size: 0.85rem;">$${item.price} x ${item.quantity}</div>
                <div class="d-flex align-items-center mt-2">
                    <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="mx-2" style="font-size: 0.9rem;">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
            <div class="text-end ms-2">
                <div class="fw-bold mb-2">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="btn btn-sm text-danger p-0" onclick="removeFromCart('${item.id}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `,
    )
    .join("");

  if (totalElement) {
    totalElement.innerText = "$" + calculateTotal(cart);
  }
}

function updateCartIconCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.innerText = totalItems;
    badge.style.display = totalItems > 0 ? "block" : "none";
  }
}

async function handleCheckout() {
  const cart = getCart();
  const btn = document.querySelector(".checkout-btn-main");

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Please login first to complete your order.");
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.href = "login.html";
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Processing Order...';
  }

  const total = calculateTotal(cart);

  const success = await firebaseCreateOrder(cart, total);

  if (success) {
    localStorage.removeItem(cartKey);
    updateCartIconCount();
    renderCart();
    alert("Order placed successfully!");
  } else {
    alert("Failed to place order. Please try again.");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "Try Again";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartIconCount();
  if (document.getElementById("cart-items-container")) {
    renderCart();
  }
});

window.addToCartFromPage = addToCartFromPage;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.handleCheckout = handleCheckout;
window.toggleCart = toggleCart;
window.renderCart = renderCart;
window.updateCartIconCount = updateCartIconCount;
