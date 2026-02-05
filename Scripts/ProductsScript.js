import{load, setupEvents} from "./StaticScript.js"



await load();
await setupEvents();
var nav=document.getElementById("navbar");
nav.style.position = "sticky";
nav.style.top = "0";
nav.style.zIndex = "2000";

import {
  loadProducts,
  createProduct,
  updateProduct,
  deleteProduct as firebaseDeleteProduct,
  loadCategories,
} from "../Scripts/AuraHomeServices.js";

const productForm = document.getElementById("product-form");
const productsList = document.getElementById("products-list");
const submitBtn = document.getElementById("submit-btn");
const formTitle = document.getElementById("form-title");
const cancelEditBtn = document.getElementById("cancel-edit");

const firebaseDocIdInput = document.getElementById("firebase-doc-id");
const productNameInput = document.getElementById("product-name");
const productCategorySelect = document.getElementById("product-category");
const productPriceInput = document.getElementById("product-price");
const oldPriceInput = document.getElementById("old-price");
const productStockInput = document.getElementById("product-stock");
const productImageInput = document.getElementById("product-image");
const productDescInput = document.getElementById("product-desc");

let allProducts = [];

async function fetchAndRenderProducts() {
  productsList.innerHTML =
    '<tr><td colspan="8" class="text-center">Loading products...</td></tr>';
  try {
    const querySnapshot = await loadProducts();
    productsList.innerHTML = "";
    allProducts = [];

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const docId = doc.id;
      allProducts.push({ docId, ...product });

      productsList.innerHTML += `
                <tr>
                    <td><small class="text-muted">${docId.substring(0, 8).toUpperCase()}</small></td>
                    <td><img src="${Array.isArray(product.Image_URLs) ? product.Image_URLs[0] : product.Image_URLs}" alt="${product.Product_Name}" class="product-img-td"></td>
                    <td><strong>${product.Product_Name}</strong></td>
                    <td><span class="badge bg-light text-dark border">${product.Category}</span></td>
                    <td>$${product.Price}</td>
                    <td class="old-price-td">${product.Discount_Price ? "$" + product.Discount_Price : "-"}</td>
                    <td>${product.Stock_Quantity || 0}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${docId}"><i class="fa fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${docId}"><i class="fa fa-trash"></i></button>
                    </td>
                </tr>
            `;
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        editProduct(btn.getAttribute("data-id")),
      );
    });
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        deleteProduct(btn.getAttribute("data-id")),
      );
    });
  } catch (error) {
    console.error("Error loading products:", error);
    productsList.innerHTML =
      '<tr><td colspan="8" class="text-center text-danger">Error loading products.</td></tr>';
  }
}

async function fetchAndRenderCategories() {
  if (!productCategorySelect) return;
  try {
    const categoriesSnapshot = await loadCategories();

    productCategorySelect.innerHTML =
      '<option value="">Select Category</option>';

    categoriesSnapshot.forEach((doc) => {
      const categoryData = doc.data();
      const categoryName = categoryData.Name;

      if (categoryName) {
        const option = document.createElement("option");
        option.value = categoryName;
        option.textContent = categoryName;
        option.style.color = "#000";
        productCategorySelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const docId = firebaseDocIdInput.value;
  const productData = {
    Product_Name: productNameInput.value,
    Category: productCategorySelect.value,
    Price: Number(productPriceInput.value),
    Discount_Price: Number(oldPriceInput.value) || null,
    Stock_Quantity: Number(productStockInput.value),
    Image_URLs: [productImageInput.value],
    Description: productDescInput.value,
  };

  submitBtn.disabled = true;
  submitBtn.innerText = "Processing...";

  try {
    if (docId) {
      const success = await updateProduct(docId, productData);
      if (success) alert("Product updated successfully!");
    } else {
      const success = await createProduct(productData);
      if (success) alert("Product added successfully!");
    }

    resetForm();
    await fetchAndRenderProducts();
  } catch (error) {
    console.error("Operation failed:", error);
    alert("An error occurred. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = docId ? "Update Product" : "Add Product";
  }
});

async function deleteProduct(docId) {
  if (confirm("Are you sure you want to delete this product?")) {
    const success = await firebaseDeleteProduct(docId);
    if (success) {
      alert("Product deleted!");
      await fetchAndRenderProducts();
    } else {
      alert("Failed to delete product.");
    }
  }
}

function editProduct(docId) {
  const product = allProducts.find((p) => p.docId === docId);
  if (product) {
    firebaseDocIdInput.value = docId;
    productNameInput.value = product.Product_Name || "";
    productCategorySelect.value = product.Category || "";
    productPriceInput.value = product.Price || "";
    oldPriceInput.value = product.Discount_Price || "";
    productStockInput.value = product.Stock_Quantity || 0;
    productImageInput.value = Array.isArray(product.Image_URLs)
      ? product.Image_URLs[0]
      : product.Image_URLs;
    productDescInput.value = product.Description || "";

    formTitle.innerText = "Edit Product";
    submitBtn.innerText = "Update Product";
    cancelEditBtn.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function resetForm() {
  productForm.reset();
  firebaseDocIdInput.value = "";
  formTitle.innerText = "Add New Product";
  submitBtn.innerText = "Add Product";
  cancelEditBtn.style.display = "none";
}

cancelEditBtn.addEventListener("click", resetForm);

fetchAndRenderProducts();
fetchAndRenderCategories();
