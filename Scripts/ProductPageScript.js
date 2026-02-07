import{load, setupEvents} from "./StaticScript.js";



await load();
await setupEvents();
import { loadProducts, loadCategories } from "../Scripts/AuraHomeServices.js";

const productsRow = document.getElementById("products-row");
const priceRange = document.getElementById("price-range");
const priceValue = document.getElementById("price-value");
const productCount = document.getElementById("product-count");
const resetBtn = document.getElementById("reset-filters");
const categoryListContainer = document.querySelector(".category-list");
const quickPriceBtns = document.querySelectorAll(".quick-price");

let allProducts = [];

function getWishlist() {
  return JSON.parse(localStorage.getItem("aura_wishlist")) || [];
}

export function toggleWishlist() {
  const sidebarElement = document.getElementById("wishlistSidebar");
  if (sidebarElement) {
    let bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarElement);
    if (!bsOffcanvas) {
      bsOffcanvas = new bootstrap.Offcanvas(sidebarElement);
    }
    bsOffcanvas.show();
  }
}

window.handleWishlistClick = function (e, btn) {
  e.stopPropagation();
  const card = btn.closest(".card");
  const productId = card.getAttribute("data-id");
  const icon = btn.querySelector("i");

  let wishlist = JSON.parse(localStorage.getItem("aura_wishlist")) || [];
  const existingIndex = wishlist.findIndex((item) => item.id === productId);

  if (existingIndex > -1) {
    wishlist.splice(existingIndex, 1);
    icon.classList.replace("fa-solid", "fa-regular");
  } else {
    wishlist.push({
      id: productId,
      name: card.getAttribute("data-name"),
      price: card.getAttribute("data-price"),
      img: card.getAttribute("data-img"),
    });
    icon.classList.replace("fa-regular", "fa-solid");
  }

  localStorage.setItem("aura_wishlist", JSON.stringify(wishlist));

  if (typeof window.updateWishlistIconCount === "function") {
    window.updateWishlistIconCount();
  }
  if (typeof window.renderWishlist === "function") {
    window.renderWishlist();
  }
};

window.toggleWishlist = toggleWishlist;
window.handleWishlistClick = handleWishlistClick;

async function initShop() {
  try {
    await initCategories();

    const querySnapshot = await loadProducts();
    allProducts = [];
    querySnapshot.forEach((doc) => {
      allProducts.push({ id: doc.id, ...doc.data() });
    });
    renderFilteredProducts();
  } catch (error) {
    console.error("Error loading shop:", error);
    if (productCount) productCount.innerText = "Error loading products.";
  }
}

async function initCategories() {
  try {
    const categoriesSnapshot = await loadCategories();
    if (categoryListContainer) {
      categoryListContainer.innerHTML = ""; 
      categoriesSnapshot.forEach((doc) => {
        const categoryData = doc.data();
        const categoryName = categoryData.Name;

        const categoryHTML = `
                    <div class="form-check mb-3">
                        <input class="form-check-input category-check" type="checkbox" value="${categoryName}"
                            id="cat-${doc.id}">
                        <label class="form-check-label ms-2" for="cat-${doc.id}">${categoryName}</label>
                    </div>
                `;
        categoryListContainer.innerHTML += categoryHTML;
      });

      const categoryChecks = document.querySelectorAll(".category-check");
      categoryChecks.forEach((check) => {
        check.addEventListener("change", renderFilteredProducts);
      });
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

function renderFilteredProducts() {
  const maxPrice = parseInt(priceRange.value);
  const categoryChecks = document.querySelectorAll(".category-check");
  const selectedCategories = Array.from(categoryChecks)
    .filter((check) => check.checked)
    .map((check) => check.value);

  const filtered = allProducts.filter((p) => {
    const matchesPrice = p.Price <= maxPrice;
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.Category);
    return matchesPrice && matchesCategory;
  });

  if (productsRow) productsRow.innerHTML = "";
  if (productCount)
    productCount.innerText = `Showing ${filtered.length} products`;

  const wishlist = getWishlist();

  filtered.forEach((product) => {
    const detailsLink = `ProductDetails.html?id=${product.id}`;
    const imageUrl = Array.isArray(product.Image_URLs)
      ? product.Image_URLs[0]
      : product.Image_URLs;

    const isFavorite = wishlist.some((item) => item.id === product.id);
    const heartIcon = isFavorite ? "fa-solid" : "fa-regular";

    const cardHTML = `
    <div class="col-lg-4 col-md-6 mb-4">
        <div class="card custom-card shadow-sm h-100" 
             data-id="${product.id}" 
             data-name="${product.Product_Name}" 
             data-price="${product.Price}" 
             data-img="${imageUrl || "https://via.placeholder.com/300"}"
             data-url="${detailsLink}" style="cursor: pointer;">
             
            <div class="img-wrapper position-relative">
                <button class="wishlist-btn-overlay" onclick="handleWishlistClick(event, this )" 
                        style="position: absolute; top: 10px; right: 10px; background: white; border-radius: 50%; border: none; width: 35px; height: 35px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); z-index: 10;">
                    <i class="${heartIcon} fa-heart text-danger"></i>
                </button>
                <img src="${imageUrl || "https://via.placeholder.com/300"}" class="card-img-top" alt="${product.Product_Name}">
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.Product_Name}</h5>
                <p class="price">
                    $${product.Price} 
                    ${product.Discount_Price ? `<span class="old-price">$${product.Discount_Price}</span>` : ""}
                </p>
                <p class="card-text text-truncate-custom">${product.Description || ""}</p>
                <button class="btn btn-outline-brown mt-auto buy-now-btn" 
                        onclick="event.stopPropagation( ); addToCartFromPage(this)"> 
                    BUY NOW
                </button>   
            </div>
        </div>
    </div>
`;
    if (productsRow) productsRow.innerHTML += cardHTML;
  });
}

if (productsRow) {
  productsRow.addEventListener("click", (e) => {
    if (
      e.target.closest(".buy-now-btn") ||
      e.target.closest(".wishlist-btn-overlay")
    ) {
      return;
    }
    const card = e.target.closest(".custom-card");
    if (card) {
      const url = card.getAttribute("data-url");
      if (url) window.location.href = url;
    }
  });
}

if (priceRange) {
  priceRange.addEventListener("input", () => {
    if (priceValue) priceValue.innerText = `$${priceRange.value}`;
    renderFilteredProducts();
  });
}


quickPriceBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const min = btn.getAttribute("data-min");
    const max = btn.getAttribute("data-max");
    if (max) {
      priceRange.value = max;
      if (priceValue) priceValue.innerText = `$${max}`;
    } else if (min) {
      priceRange.value = priceRange.max;
      if (priceValue) priceValue.innerText = `$${priceRange.max}`;
    }
    renderFilteredProducts();
  });
});

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    priceRange.value = priceRange.max;
    if (priceValue) priceValue.innerText = `$${priceRange.max}`;
    const categoryChecks = document.querySelectorAll(".category-check");
    categoryChecks.forEach((c) => (c.checked = false));
    renderFilteredProducts();
  });
}

initShop();
