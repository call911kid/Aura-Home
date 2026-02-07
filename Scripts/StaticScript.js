
import {
  createOrder as firebaseCreateOrder,
  getProductById,
  updateProduct,
  logoutUser,
} from "../Scripts/AuraHomeServices.js";
import { auth } from "../Scripts/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export async function load() {
    const res = await fetch("Static.html");
    const html = await res.text();

    const footer=await fetch("footer.html");
    const footerHtml=await footer.text();
    
    
    document.getElementById("navbar").innerHTML = html;
    let f=document.getElementById("footer");
    if(f){
        f.innerHTML=footerHtml;
    }
 setTimeout(() => {
   if (typeof window.updateCartIconCount === "function")
     window.updateCartIconCount();
   if (typeof window.renderCart === "function") window.renderCart();
   if (typeof window.updateWishlistIconCount === "function")
     window.updateWishlistIconCount();
   if (typeof window.renderWishlist === "function") window.renderWishlist();
 }, 100);
}

export async function setupEvents() {
  const sofaIcon = document.getElementById("sofa-icon");

  sofaIcon.addEventListener("mouseenter", () => {
    if (sofaIcon.bouncing != true) {
      sofaIcon.classList.add("fa-bounce");
      sofaIcon.bouncing = true;
    }
  });

  sofaIcon.addEventListener("mouseleave", () => {
    sofaIcon.classList.remove("fa-bounce");
    sofaIcon.bouncing = false;
  });

  document.querySelectorAll(".navbar-icon").forEach((icon) => {
    icon.addEventListener("mouseenter", () => {
      icon.classList.add("navbar-icon-hover");
    });

    icon.addEventListener("mouseleave", () => {
      icon.classList.remove("navbar-icon-hover");
    });
  });

  document.getElementById("navbar-brand").addEventListener("click", ()=>{
    window,location.href="/Pages/Home.html";
    console.log("dklfjgfdg");
  });






  const cartKey = "aura_cart";

  function showCustomPopup(title, message, type = "alert") {
    const popupId = "aura-custom-popup";
    if (document.getElementById(popupId))
      document.getElementById(popupId).remove();

    const isAuth = type === "auth";

    const popupHtml = `
        <div id="${popupId}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
            <div style="background: white; padding: 40px; border-radius: 0; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.2); border: 1px solid #eee; animation: fadeInScale 0.3s ease;">
                <div style="color: #025048; font-size: 3.5rem; margin-bottom: 20px;">
                    <i class="fas ${isAuth ? "fa-user-lock" : "fa-exclamation-circle"}"></i>
                </div>
                <h3 style="font-family: 'Poppins', sans-serif; color: #025048; margin-bottom: 15px; font-weight: 600;">${title}</h3>
                <p style="font-family: 'workSans', sans-serif; color: #8E8E93; margin-bottom: 30px; line-height: 1.6;">${message}</p>
                <div style="display: flex; gap: 10px;">
                    ${
                      isAuth
                        ? `
                        <button id="popup-main-btn" style="background: #025048; color: white; border: none; padding: 12px 20px; border-radius: 50px; font-family: 'workSans', sans-serif; font-weight: bold; cursor: pointer; flex: 1;">
                            Sign in Now
                        </button>
                        <button onclick="document.getElementById('${popupId}').remove()" style="background: transparent; color: #8E8E93; border: 1px solid #ddd; padding: 12px 20px; border-radius: 50px; font-family: 'workSans', sans-serif; font-weight: bold; cursor: pointer; flex: 1;">
                            Cancel
                        </button>
                    `
                        : `
                        <button onclick="document.getElementById('${popupId}').remove()" style="background: #025048; color: white; border: none; padding: 12px 20px; border-radius: 50px; font-family: 'workSans', sans-serif; font-weight: bold; cursor: pointer; width: 100%;">
                            Got it
                        </button>
                    `
                    }
                </div>
            </div>
        </div>
        <style>
            @keyframes fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        </style>
    `;

    document.body.insertAdjacentHTML("beforeend", popupHtml);

    if (isAuth) {
      document.getElementById("popup-main-btn").onclick = () => {
        window.location.href = "login.html";
      };
    }
  }

  function getCart() {
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    return [...cart].reverse();
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

  async function addToCartFromPage(btn) {
    const card = btn.closest(".card");
    const id = card.getAttribute("data-id");
    const name = card.getAttribute("data-name");
    const price = parseFloat(card.getAttribute("data-price"));
    const img = card.getAttribute("data-img");

    if (!id) return;

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    try {
      const productData = await getProductById(id);

      if (!productData) {
        showCustomPopup("Error", "Product details could not be retrieved.");
        return;
      }

      const stock = parseInt(productData.Stock_Quantity) || 0;
      let cart = getCart();
      const existingItemIndex = cart.findIndex((item) => item.id === id);
      const currentQtyInCart =
        existingItemIndex > -1 ? cart[existingItemIndex].quantity : 0;

      if (currentQtyInCart + 1 > stock) {
        showCustomPopup(
          "Out of Stock",
          `Sorry, only ${stock} units are available in stock.`,
        );
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
        showCustomPopup(
          "Limit Reached",
          `You cannot add more than ${stock} units of this item.`,
        );
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
      showCustomPopup(
        "Empty Cart",
        "Please add items to your cart before checking out.",
      );
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showCustomPopup(
        "Sign in Required",
        "Please Sign in or log in to complete your order.",
        "auth",
      );
      sessionStorage.setItem("redirectAfterLogin", window.location.href);
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML =
        '<span class="spinner-border spinner-border-sm"></span> Processing...';
    }

    try {
      const total = cart
        .reduce((t, i) => t + i.price * i.quantity, 0)
        .toFixed(2);
      const success = await firebaseCreateOrder(cart, total);

      if (success) {
        for (const item of cart) {
          const productData = await getProductById(item.id);
          if (productData) {
            const newStock =
              (parseInt(productData.Stock_Quantity) || 0) - item.quantity;
            await updateProduct(item.id, {
              Stock_Quantity: newStock >= 0 ? newStock : 0,
            });
          }
        }

        localStorage.removeItem(cartKey);
        updateCartIconCount();
        renderCart();
        showCustomPopup(
          "Success!",
          "Your order has been placed successfully!",
          "alert",
        );
      } else {
        showCustomPopup("Error", "Failed to place order. Please try again.");
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = "Try Again";
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showCustomPopup(
        "Error",
        "Something went wrong during checkout. Please try again.",
      );
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
      container.innerHTML =
        '<div class="text-center text-muted mt-5"><i class="fa-solid fa-cart-shopping fa-3x mb-3"></i><p>Your cart is empty.</p></div>';
      if (totalElement) totalElement.innerText = "$0.00";
      return;
    }

   container.innerHTML = cart
  .map(
    (item) => `
      <div class="cart-item d-flex align-items-center">

        <!-- Image -->
        <img 
          src="${item.img}" 
          alt="${item.name}" 
          class="cart-item-img"
        >

        <!-- Details -->
        <div class="cart-item-details ms-3 flex-grow-1">

          <h6 class="cart-item-title mb-1">
            ${item.name}
          </h6>

          <div class="cart-item-meta text-muted">
            $${item.price} × ${item.quantity}
          </div>

          <!-- ONE LINE: qty + delete + price -->
          <div class="cart-item-controls mt-2">

            <div class="cart-qty">
              <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">
                −
              </button>

              <span class="qty-value">
                ${item.quantity}
              </span>

              <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">
                +
              </button>
            </div>

            

            <div class="cart-price">
              $${(item.price * item.quantity).toFixed(2)}
            </div>

          </div>
        </div>
      </div>
    `
  )
  .join("");



    if (totalElement)
      totalElement.innerText =
        "$" + cart.reduce((t, i) => t + i.price * i.quantity, 0).toFixed(2);
  }

  function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter((item) => item.id !== id);
    saveCart(cart);
  }

  function updateCartIconCount() {
    const cart = getCart();
    const totalItems = cart.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
    const badge = document.getElementById("cart-count");
    if (badge) {
      badge.innerText = totalItems;
      badge.style.display = totalItems > 0 ? "flex" : "none";
    }
  }

  onAuthStateChanged(auth, (user) => {
    const userIconContainer = document.getElementById("UserIcon");
    if (!userIconContainer) return;

    if (user) {
      userIconContainer.innerHTML = `
      <div class="dropdown">
        <lord-icon 
          src="https://cdn.lordicon.com/spzqjmbt.json" 
          trigger="hover" 
          colors="primary:#ffffff" 
          style="height:50px; cursor:pointer;"
          id="userDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false">
        </lord-icon>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
        </ul>
      </div>
    `;

      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.onclick = async (e) => {
          e.preventDefault();
          const success = await logoutUser();
          if (success) window.location.reload();
        };
      }
    } else {
      userIconContainer.innerHTML = `
      <a href="login.html" class="nav-link text-white fw-bold" style="font-family: 'workSans';">Login</a>
    `;
    }
  });

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

  /* 
   ==========================================================================
   1. Modified Navbar HTML (Add this to your HTML file)
   ==========================================================================
   Replace the navbar-right div with this code to show the badges:

    <div class="navbar-right d-flex align-items-center">
        <div class="position-relative me-3" onclick="toggleWishlist()" style="cursor: pointer;">
            <lord-icon src="https://cdn.lordicon.com/hsabxdnr.json" trigger="hover" colors="primary:#ffffff" style="height:50px"></lord-icon>
            <span id="wishlist-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="display: none; font-size: 0.7rem; z-index: 10;">0</span>
        </div>

        <lord-icon src="https://cdn.lordicon.com/spzqjmbt.json" trigger="hover" colors="primary:#ffffff" style="height:50px"></lord-icon>

        <div class="position-relative" onclick="toggleCart()" style="cursor: pointer;">
            <lord-icon src="https://cdn.lordicon.com/fmsilsqx.json" trigger="hover" state="hover-slide" colors="primary:#ffffff" style="height:50px"></lord-icon>
            <span id="cart-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="display: none; font-size: 0.7rem; z-index: 10;">0</span>
        </div>
    </div>
*/

  const wishlistKey = "aura_wishlist";

  function getWishlist() {
    return JSON.parse(localStorage.getItem(wishlistKey)) || [];
  }

  function saveWishlist(wishlist) {
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    updateWishlistIconCount();
    renderWishlist();
  }

  function toggleWishlist() {
    const sidebarElement = document.getElementById("wishlistSidebar");
    if (sidebarElement) {
      let bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarElement);
      if (!bsOffcanvas) {
        bsOffcanvas = new bootstrap.Offcanvas(sidebarElement);
      }
      bsOffcanvas.show();
    }
  }

  function addToWishlist(btn) {
    const card = btn.closest(".card");
    const id = card.getAttribute("data-id");
    const name = card.getAttribute("data-name");
    const price = parseFloat(card.getAttribute("data-price"));
    const img = card.getAttribute("data-img");

    let wishlist = getWishlist();
    if (!wishlist.find((item) => item.id === id)) {
      wishlist.push({ id, name, price, img });
      saveWishlist(wishlist);
      alert(`${name} added to wishlist! ❤️`);
    } else {
      alert("Product already in wishlist!");
    }
  }

  window.removeFromWishlist = function (id) {
    let wishlist = JSON.parse(localStorage.getItem("aura_wishlist")) || [];
    wishlist = wishlist.filter((item) => item.id !== id);

    localStorage.setItem("aura_wishlist", JSON.stringify(wishlist));

    if (window.updateWishlistIconCount) window.updateWishlistIconCount();
    if (window.renderWishlist) window.renderWishlist();

    const productCard = document.querySelector(`.card[data-id="${id}"]`);
    if (productCard) {
      const heartIcon = productCard.querySelector(".wishlist-btn-overlay i");
      if (heartIcon) {
        heartIcon.classList.replace("fa-solid", "fa-regular");
      }
    }
  };

  function moveToCart(id) {
    let wishlist = getWishlist();
    const item = wishlist.find((i) => i.id === id);
    if (item) {
      let cart = JSON.parse(localStorage.getItem("aura_cart")) || [];
      const existing = cart.find((c) => c.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }
      localStorage.setItem("aura_cart", JSON.stringify(cart));

      removeFromWishlist(id);
      if (typeof updateCartIconCount === "function") updateCartIconCount();
      if (typeof renderCart === "function") renderCart();
      alert("Moved to cart! 🛒");
    }
  }

  window.renderWishlist = function () {
    const container = document.getElementById("wishlist-items-container");
    const wishlist = JSON.parse(localStorage.getItem("aura_wishlist")) || [];

    if (!container) return;

    if (wishlist.length === 0) {
      container.innerHTML =
        '<div class="text-center text-muted mt-5"><i class="fa-regular fa-heart fa-3x mb-3"></i><p>Your wishlist is empty.</p></div>';
      return;
    }

    container.innerHTML = wishlist
      .map(
        (item) => `
        <div class="d-flex align-items-center border-bottom py-3">
            <img src="${item.img}" alt="${item.name}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px;">
            <div class="ms-3 flex-grow-1">
                <h6 class="mb-1 fw-bold" style="font-size: 0.95rem;">${item.name}</h6>
                <div class="text-muted" style="font-size: 0.85rem;">$${item.price}</div>
                <button class="btn btn-sm btn-success mt-2 py-1 px-2" onclick="moveToCart('${item.id}')">Add to Cart 🛒</button>
            </div>
            <div class="text-end ms-2">
                <button class="btn btn-sm text-danger p-0" onclick="removeFromWishlist('${item.id}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `,
      )
      .join("");
  };

  window.updateWishlistIconCount = function () {
    const wishlist = JSON.parse(localStorage.getItem("aura_wishlist")) || [];
    const badge = document.getElementById("wishlist-count");
    if (badge) {
      badge.innerText = wishlist.length;
      badge.style.display = wishlist.length > 0 ? "block" : "none";
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    updateWishlistIconCount();
    renderWishlist();
  });

  window.toggleWishlist = toggleWishlist;
  window.addToWishlist = addToWishlist;
  window.removeFromWishlist = removeFromWishlist;
  window.moveToCart = moveToCart;
}

