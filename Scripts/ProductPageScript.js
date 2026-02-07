// // import { loadProducts } from "../Scripts/AuraHomeServices.js";
// // await loadProducts();
// // const productsRow = document.getElementById("products-row");

// // async function renderAllProducts() {
// //   try {
// //     const querySnapshot = await loadProducts();

// //     productsRow.innerHTML = "";

// //     querySnapshot.forEach((doc) => {
// //       const product = doc.data();
// //       const productId = doc.id;

// //       const productCard = `
// //         <div class="col-lg-4 col-md-6 mb-4">
// //           <div class="card custom-card shadow-sm">
// //             <div class="img-wrapper">
// //               <img src="${product.Image_URL || "default-image.jpg"}" class="card-img-top" alt="${product.Product_Name}">
// //             </div>
// //             <div class="card-body">
// //               <h5 class="card-title">${product.Product_Name}</h5>
// //               <p class="price">
// //                 ${product.Price}$
// //                 ${product.Discount_Price ? `<span class="old-price">${product.Discount_Price}$</span>` : ""}
// //               </p>
// //               <p class="card-text">${product.Description}</p>
// //               <button class="btn btn-outline-brown" onclick="handleBuy('${productId}')">BUY NOW</button>
// //             </div>
// //           </div>
// //         </div>
// //       `;

// //       productsRow.innerHTML += productCard;
// //     });
// //   } catch (error) {
// //     console.error("Error displaying products:", error);
// //     productsRow.innerHTML = "<p>عفواً، حدث خطأ أثناء تحميل المنتجات.</p>";
// //   }
// // }

// // renderAllProducts();

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

// const productsRow = document.getElementById("products-row");

// function getWishlist() {
//   return JSON.parse(localStorage.getItem("wishlist")) || [];
// }

// function toggleWishlist(id) {
//   let wishlist = getWishlist();
//   if (wishlist.includes(id)) {
//     wishlist = wishlist.filter((itemId) => itemId !== id);
//   } else {
//     wishlist.push(id);
//   }
//   localStorage.setItem("wishlist", JSON.stringify(wishlist));
// }

// productsRow.addEventListener("click", function (e) {
//   const btn = e.target.closest(".wishlist-btn");
//   if (btn) {
//     e.preventDefault();

//     const productId = btn.getAttribute("data-id");
//     btn.classList.toggle("active");

//     const icon = btn.querySelector("i");
//     if (btn.classList.contains("active")) {
//       icon.classList.replace("fa-regular", "fa-solid");
//     } else {
//       icon.classList.replace("fa-solid", "fa-regular");
//     }

//     toggleWishlist(productId);
//     console.log("Current Wishlist IDs:", getWishlist());
//   }
// });

// async function fetchAndDisplayProducts() {
//   try {
//     const response = await fetch("https://dummyjson.com/products");
//     const data = await response.json();
//     const products = data.products;
//     const wishlist = getWishlist();

//     productsRow.innerHTML = "";

//     products.forEach((product) => {
//       const oldPrice = (
//         product.price /
//         (1 - product.discountPercentage / 100)
//       ).toFixed(2);

//       const isFavorite = wishlist.includes(product.id.toString());
//       const heartClass = isFavorite ? "fa-solid active" : "fa-regular";
//       const activeClass = isFavorite ? "active" : "";

//       const productCard = `
//                 <div class="col-lg-4 col-md-6 mb-4">
//                     <div class="card custom-card shadow-sm h-100">
//                         <div class="img-wrapper">
//                             <button class="wishlist-btn ${activeClass}" data-id="${product.id}">
//                                 <i class="${heartClass} fa-heart"></i>
//                             </button>
//                             <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}">
//                         </div>
//                         <div class="card-body d-flex flex-column">
//                             <h5 class="card-title">${product.title}</h5>
//                             <p class="price">
//                                 ${product.price}$
//                                 <span class="old-price">${oldPrice}$</span>
//                             </p>
//                             <p class="card-text">${product.description}</p>
//                             <button class="btn btn-outline-brown mt-auto">BUY NOW</button>
//                         </div>
//                     </div>
//                 </div>
//             `;
//       productsRow.innerHTML += productCard;
//     });
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// fetchAndDisplayProducts();

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

/*import { loadProducts } from "../Scripts/AuraHomeServices.js";

const productsRow = document.getElementById("products-row");
const priceRange = document.getElementById("price-range");
const priceValue = document.getElementById("price-value");
const productCount = document.getElementById("product-count");
const resetBtn = document.getElementById("reset-filters");
const categoryChecks = document.querySelectorAll(".category-check");
const quickPriceBtns = document.querySelectorAll(".quick-price");

let allProducts = [];
window.handleWishlistClick = function(e, btn) {
    e.stopPropagation(); 
    const card = btn.closest('.card');
    const productId = card.getAttribute('data-id');
    const icon = btn.querySelector('i');
    
    let wishlist = JSON.parse(localStorage.getItem('aura_wishlist')) || [];
    const isExisting = wishlist.find(item => item.id === productId);

    if (isExisting) {
        wishlist = wishlist.filter(item => item.id !== productId);
        icon.classList.replace('fa-solid', 'fa-regular');
    } else {
        
        const productData = {
            id: productId,
            name: card.getAttribute('data-name'),
            price: card.getAttribute('data-price'),
            img: card.getAttribute('data-img')
        };
        wishlist.push(productData);
        icon.classList.replace('fa-regular', 'fa-solid');
    }
    
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
    if (typeof updateWishlistIconCount === "function") updateWishlistIconCount();
    if (typeof renderWishlist === "function") renderWishlist();
};

async function initShop() {
  try {
    const querySnapshot = await loadProducts();
    allProducts = [];
    querySnapshot.forEach((doc) => {
      allProducts.push({ id: doc.id, ...doc.data() });
    });
    renderFilteredProducts();
  } catch (error) {
    console.error("Error loading shop:", error);
    productCount.innerText = "Error loading products.";
  }
}

function renderFilteredProducts() {
  const maxPrice = parseInt(priceRange.value);
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

  productsRow.innerHTML = "";
  productCount.innerText = `Showing ${filtered.length} products`;

  filtered.forEach((product) => {
    const detailsLink = `ProductDetails.html?id=${product.id}`;
    const imageUrl = Array.isArray(product.Image_URLs)
      ? product.Image_URLs[0]
      : product.Image_URLs;
      const isFavorite = wishlist.some(item => item.id === product.id);
      const heartIcon = isFavorite ? 'fa-solid' : 'fa-regular';

const cardHTML = `
    <div class="col-lg-4 col-md-6">
        <div class="card custom-card shadow-sm h-100" 
             data-id="${product.id}" 
             data-name="${product.Product_Name}" 
             data-price="${product.Price}" 
             data-img="${imageUrl || 'https://via.placeholder.com/300'}"
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
        onclick="event.stopPropagation(); addToCartFromPage(this)"> 
    BUY NOW
</button>   
            </div>
        </div>
    </div>
`;
    productsRow.innerHTML += cardHTML;
  });
}

productsRow.addEventListener("click", (e) => {
  if (e.target.classList.contains("buy-now-btn")||e.target.closest(".wishlist-btn-overlay")) {
    e.stopPropagation();
    return;
  }

  const card = e.target.closest(".custom-card");
  if (card) {
    const url = card.getAttribute("data-url");
    if (url) window.location.href = url;
  }
});

priceRange.addEventListener("input", () => {
  priceValue.innerText = `$${priceRange.value}`;
  renderFilteredProducts();
});

categoryChecks.forEach((check) => {
  check.addEventListener("change", renderFilteredProducts);
});

quickPriceBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const min = btn.getAttribute("data-min");
    const max = btn.getAttribute("data-max");

    if (max) {
      priceRange.value = max;
      priceValue.innerText = `$${max}`;
    } else if (min) {
      priceRange.value = priceRange.max;
      priceValue.innerText = `$${priceRange.max}`;
    }
    renderFilteredProducts();
  });
});

resetBtn.addEventListener("click", () => {
  priceRange.value = priceRange.max;
  priceValue.innerText = `$${priceRange.max}`;
  categoryChecks.forEach((c) => (c.checked = false));
  renderFilteredProducts();
});

initShop();*/


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
