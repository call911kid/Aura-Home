import { load, setupEvents } from "./StaticScript.js";

import { getProductById } from "../Scripts/AuraHomeServices.js";

const sofaIcon = document.getElementById("sofa-icon");

if (sofaIcon) {
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
}

document.querySelectorAll(".navbar-icon").forEach((icon) => {
  icon.addEventListener("mouseenter", () => {
    icon.classList.add("navbar-icon-hover");
  });

  icon.addEventListener("mouseleave", () => {
    icon.classList.remove("navbar-icon-hover");
  });
});

window.updateMainImage = function (element) {
  const mainImg = document.getElementById("mainImg");
  if (!mainImg) return;

  mainImg.style.opacity = "0";
  setTimeout(() => {
    mainImg.src = element.src;
    mainImg.style.opacity = "1";
  }, 200);

  document
    .querySelectorAll(".thumb")
    .forEach((t) => t.classList.remove("active"));
  element.classList.add("active");
};

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  const container = document.getElementById("details-container");

  if (!productId) {
    container.innerHTML =
      "<div class='container mt-5'><p class='alert alert-danger'>Product ID is missing.</p></div>";
    return;
  }

  container.innerHTML =
    "<div class='container mt-5 text-center'><div class='spinner-border text-brown' role='status'></div><p>Loading product details...</p></div>";

  try {
    const productData = await getProductById(productId);

    if (!productData) {
      container.innerHTML =
        "<div class='container mt-5'><p class='alert alert-warning'>Product not found.</p></div>";
      return;
    }

    document.title = `${productData.Product_Name} - Aura Home`;

    const product = {
      id: productId,
      name: productData.Product_Name || "Product Name",
      price: productData.Price || "0",
      oldPrice: productData.Discount_Price || "",
      desc: productData.Description || "No description available.",
      stock: productData.Stock_Quantity || "0",
      imgs: Array.isArray(productData.Image_URLs)
        ? productData.Image_URLs
        : [productData.Image_URLs],
    };

    const imagesHtml = product.imgs
      .map(
        (img, index) =>
          `<img src="${img}" class="thumb ${index === 0 ? "active" : ""}" onclick="updateMainImage(this)">`,
      )
      .join("");

    const wishlist = JSON.parse(localStorage.getItem("aura_wishlist")) || [];
    const isFavorite = wishlist.some((item) => item.id === product.id);
    const heartIconClass = isFavorite ? "fa-solid" : "fa-regular";

    const detailsTemplate = `
      <div class="main-wrapper">
        <div class="gallery-section">
          <div class="main-image">
            <img src="${product.imgs[0] || "../Resources/Images/default.jpg"}" alt="${product.name}" id="mainImg">
          </div>
          <div class="thumbnails">
            ${imagesHtml}
          </div>
        </div>

        <div class="info-section">
          <div class="info-content">
            <h1 class="product-name">${product.name}</h1>

            <div class="pricing">
              <span class="price-now">${product.price}$</span>
              ${product.oldPrice ? `<span class="price-before">${product.oldPrice}$</span>` : ""}
            </div>

            <div class="stock-status">
              <i class="fa-solid fa-layer-group"></i>
              <span>Availability: </span>
              <span class="stock-count">${product.stock} Items in Stock</span>
            </div>

            <p class="short-desc">${product.desc}</p>

            <ul class="specs-list">
              <li><i class="fa-solid fa-circle-check"></i> Premium Quality Material</li>
              <li><i class="fa-solid fa-circle-check"></i> Modern Architectural Design</li>
              <li><i class="fa-solid fa-circle-check"></i> Aura Home Certified</li>
            </ul>

            <div class="purchase-zone">
              <div class="qty-field">
                <span class="label">Select Quantity</span>
                <div class="qty-selector">
                  <button type="button" id="minus-btn">-</button>
                  <input type="number" value="1" id="qty-input" readonly>
                  <button type="button" id="plus-btn">+</button>
                </div>
              </div>

              <div class="btns-group">
                <button class="btn-action btn-add button-y" id="add-to-cart-btn">ADD TO CART</button>
                <button class="btn-wish" id="wishlist-btn">
                    <i class="${heartIconClass} fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = detailsTemplate;
    setupInteractions(product.stock, product);
  } catch (error) {
    console.error("Error loading product:", error);
    container.innerHTML =
      "<div class='container mt-5'><p class='alert alert-danger'>Error loading product details.</p></div>";
  }
});

function setupInteractions(maxStock, product) {
  const qtyInput = document.getElementById("qty-input");
  const minusBtn = document.getElementById("minus-btn");
  const plusBtn = document.getElementById("plus-btn");
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  const wishlistBtn = document.getElementById("wishlist-btn");
  const stockLimit = parseInt(maxStock) || 1;

  if (plusBtn && minusBtn && qtyInput) {
    plusBtn.onclick = () => {
      if (parseInt(qtyInput.value) < stockLimit) {
        qtyInput.value = parseInt(qtyInput.value) + 1;
      }
    };

    minusBtn.onclick = () => {
      if (parseInt(qtyInput.value) > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
      }
    };
  }

  if (addToCartBtn) {
    addToCartBtn.onclick = function () {
      if (typeof window.addToCartFromPage === "function") {
        const mockBtn = {
          closest: () => ({
            getAttribute: (attr) => {
              if (attr === "data-id") return product.id;
              if (attr === "data-name") return product.name;
              if (attr === "data-price") return product.price;
              if (attr === "data-img") return product.imgs[0];
            },
          }),
        };

        window.addToCartFromPage(mockBtn);

        const quantity = parseInt(qtyInput.value);
        if (quantity > 1) {
          setTimeout(() => {
            let cart = JSON.parse(localStorage.getItem("aura_cart")) || [];
            const itemIndex = cart.findIndex((item) => item.id === product.id);
            if (itemIndex > -1) {
              cart[itemIndex].quantity = quantity;
              localStorage.setItem("aura_cart", JSON.stringify(cart));
              if (typeof window.updateCartIconCount === "function")
                window.updateCartIconCount();
              if (typeof window.renderCart === "function") window.renderCart();
            }
          }, 150);
        }
      }
    };
  }

  if (wishlistBtn) {
    wishlistBtn.onclick = function (e) {
      if (typeof window.addToWishlist === "function") {
        const icon = this.querySelector("i");

        const mockBtn = {
          closest: () => ({
            getAttribute: (attr) => {
              if (attr === "data-id") return product.id;
              if (attr === "data-name") return product.name;
              if (attr === "data-price") return product.price;
              if (attr === "data-img") return product.imgs[0];
            },
          }),
          querySelector: (sel) => this.querySelector(sel),
        };

        window.addToWishlist(mockBtn);

        if (icon.classList.contains("fa-regular")) {
          icon.classList.replace("fa-regular", "fa-solid");
        } else {
          icon.classList.replace("fa-solid", "fa-regular");
        }
      } else {
        console.error("addToWishlist function is not defined in window scope.");
      }
    };
  }
}
await load();
await setupEvents();
