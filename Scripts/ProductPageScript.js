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

import { loadProducts } from "../Scripts/AuraHomeServices.js";

const productsRow = document.getElementById("products-row");
const priceRange = document.getElementById("price-range");
const priceValue = document.getElementById("price-value");
const productCount = document.getElementById("product-count");
const resetBtn = document.getElementById("reset-filters");
const categoryChecks = document.querySelectorAll(".category-check");
const quickPriceBtns = document.querySelectorAll(".quick-price");

let allProducts = [];

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

    const cardHTML = `
            <div class="col-lg-4 col-md-6">
                <div class="card custom-card shadow-sm h-100" data-url="${detailsLink}" style="cursor: pointer;">
                    <div class="img-wrapper">
                        <img src="${imageUrl || "https://via.placeholder.com/300"}" class="card-img-top" alt="${product.Product_Name}">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.Product_Name}</h5>
                        <p class="price">
                            $${product.Price} 
                            ${product.Discount_Price ? `<span class="old-price">$${product.Discount_Price}</span>` : ""}
                        </p>
                        <p class="card-text text-truncate-custom">${product.Description || ""}</p>
                        <button class="btn btn-outline-brown mt-auto buy-now-btn">BUY NOW</button>
                    </div>
                </div>
            </div>
        `;
    productsRow.innerHTML += cardHTML;
  });
}

productsRow.addEventListener("click", (e) => {
  if (e.target.classList.contains("buy-now-btn")) {
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

initShop();