import { createOrder as firebaseCreateOrder, getProductById } from "../Scripts/AuraHomeServices.js";
import { auth } from "../Scripts/firebase.js";

const cartKey = "aura_cart";

/**
 * وظيفة لإظهار نافذة منبثقة (Pop-up) بتنسيق متوافق مع الهوية البصرية للموقع
 */
function showCustomPopup(title, message, type = 'alert') {
    const popupId = 'aura-custom-popup';
    if (document.getElementById(popupId)) document.getElementById(popupId).remove();

    const isAuth = type === 'auth';
    
    const popupHtml = `
        <div id="${popupId}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
            <div style="background: white; padding: 40px; border-radius: 0; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.2); border: 1px solid #eee; animation: fadeInScale 0.3s ease;">
                <div style="color: #025048; font-size: 3.5rem; margin-bottom: 20px;">
                    <i class="fas ${isAuth ? 'fa-user-lock' : 'fa-exclamation-circle'}"></i>
                </div>
                <h3 style="font-family: 'Poppins', sans-serif; color: #025048; margin-bottom: 15px; font-weight: 600;">${title}</h3>
                <p style="font-family: 'workSans', sans-serif; color: #8E8E93; margin-bottom: 30px; line-height: 1.6;">${message}</p>
                <div style="display: flex; gap: 10px;">
                    ${isAuth ? `
                        <button id="popup-main-btn" style="background: #025048; color: white; border: none; padding: 12px 20px; border-radius: 50px; font-family: 'workSans', sans-serif; font-weight: bold; cursor: pointer; flex: 1;">
                            Sign Up Now
                        </button>
                        <button onclick="document.getElementById('${popupId}').remove()" style="background: transparent; color: #8E8E93; border: 1px solid #ddd; padding: 12px 20px; border-radius: 50px; font-family: 'workSans', sans-serif; font-weight: bold; cursor: pointer; flex: 1;">
                            Cancel
                        </button>
                    ` : `
                        <button onclick="document.getElementById('${popupId}').remove()" style="background: #025048; color: white; border: none; padding: 12px 20px; border-radius: 50px; font-family: 'workSans', sans-serif; font-weight: bold; cursor: pointer; width: 100%;">
                            Got it
                        </button>
                    `}
                </div>
            </div>
        </div>
        <style>
            @keyframes fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHtml);

    if (isAuth) {
        document.getElementById('popup-main-btn').onclick = () => {
            window.location.href = "login.html";
        };
    }
}

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
    if (!bsOffcanvas) bsOffcanvas = new bootstrap.Offcanvas(sidebarElement);
    bsOffcanvas.show();
  }
}

/**
 * إضافة للمنتج مع التحقق من المخزون من Firebase
 */
async function addToCartFromPage(btn) {
  const card = btn.closest(".card");
  const id = card.getAttribute("data-id");
  const name = card.getAttribute("data-name");
  const price = parseFloat(card.getAttribute("data-price"));
  const img = card.getAttribute("data-img");

  if (!id) return;

  // إظهار حالة تحميل بسيطة على الزر
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

  try {
    // جلب بيانات المنتج الحقيقية من Firebase للتأكد من المخزون
    const productData = await getProductById(id);
    
    if (!productData) {
        showCustomPopup("Error", "Product details could not be retrieved.");
        return;
    }

    const stock = parseInt(productData.Stock_Quantity) || 0;
    let cart = getCart();
    const existingItemIndex = cart.findIndex((item) => item.id === id);
    const currentQtyInCart = existingItemIndex > -1 ? cart[existingItemIndex].quantity : 0;

    if (currentQtyInCart + 1 > stock) {
        showCustomPopup("Out of Stock", `Sorry, only ${stock} units are available in stock.`);
        return;
    }

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ id, name, price, img, quantity: 1, stock: stock });
    }

    saveCart(cart);
    toggleCart();
  } catch (error) {
    console.error("Cart error:", error);
    showCustomPopup("Error", "Something went wrong. Please try again.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

function updateQuantity(id, change) {
  let cart = getCart();
  const itemIndex = cart.findIndex((item) => item.id === id);

  if (itemIndex > -1) {
    const item = cart[itemIndex];
    const newQty = item.quantity + change;
    const stock = item.stock || 0;

    if (newQty > stock) {
      showCustomPopup("Limit Reached", `You cannot add more than ${stock} units of this item.`);
      return;
    }

    if (newQty <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = newQty;
    }
  }
  saveCart(cart);
}

async function handleCheckout() {
  const cart = getCart();
  const btn = document.querySelector(".checkout-btn-main");

  if (cart.length === 0) {
    showCustomPopup("Empty Cart", "Please add items to your cart before checking out.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    showCustomPopup("Sign Up Required", "Please sign up or log in to complete your order.", "auth");
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';
  }

  const total = cart.reduce((t, i) => t + i.price * i.quantity, 0).toFixed(2);
  const success = await firebaseCreateOrder(cart, total);

  if (success) {
    localStorage.removeItem(cartKey);
    updateCartIconCount();
    renderCart();
    showCustomPopup("Success!", "Your order has been placed successfully!", "alert");
  } else {
    showCustomPopup("Error", "Failed to place order. Please try again.");
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "Try Again";
    }
  }
}

function renderCart() {
  const container = document.getElementById("cart-items-container");
  const totalElement = document.getElementById("cart-total-price");
  let cart = getCart();

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<div class="text-center text-muted mt-5"><i class="fa-solid fa-cart-shopping fa-3x mb-3"></i><p>Your cart is empty.</p></div>';
    if (totalElement) totalElement.innerText = "$0.00";
    return;
  }

  container.innerHTML = cart.map(item => `
        <div class="d-flex align-items-center border-bottom py-3">
            <img src="${item.img}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 0;">
            <div class="ms-3 flex-grow-1">
                <h6 class="mb-1 fw-bold" style="font-family: 'Poppins'; font-size: 0.9rem; color: #025048;">${item.name}</h6>
                <div class="text-muted" style="font-size: 0.8rem;">$${item.price} x ${item.quantity}</div>
                <div class="d-flex align-items-center mt-2">
                    <button class="btn btn-sm border-0 p-0" onclick="updateQuantity('${item.id}', -1)"><i class="fas fa-minus-circle text-muted"></i></button>
                    <span class="mx-2 fw-bold" style="font-size: 0.85rem;">${item.quantity}</span>
                    <button class="btn btn-sm border-0 p-0" onclick="updateQuantity('${item.id}', 1)"><i class="fas fa-plus-circle text-muted"></i></button>
                </div>
            </div>
            <div class="text-end ms-2">
                <div class="fw-bold mb-2" style="color: #025048;">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="btn btn-sm text-danger p-0" onclick="removeFromCart('${item.id}')"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        </div>
    `).join("");

  if (totalElement) totalElement.innerText = "$" + cart.reduce((t, i) => t + i.price * i.quantity, 0).toFixed(2);
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== id);
  saveCart(cart);
}

function updateCartIconCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.innerText = totalItems;
    badge.style.display = totalItems > 0 ? "flex" : "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartIconCount();
  if (document.getElementById("cart-items-container")) renderCart();
});

window.addToCartFromPage = addToCartFromPage;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.handleCheckout = handleCheckout;
window.toggleCart = toggleCart;
window.renderCart = renderCart;
window.updateCartIconCount = updateCartIconCount;
