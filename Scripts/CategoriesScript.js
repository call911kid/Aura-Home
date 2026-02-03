import {
  loadCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../Scripts/AuraHomeServices.js";

const categoryForm = document.getElementById("category-form");
const categoriesList = document.getElementById("categories-list");
const categorySubmitBtn = document.getElementById("category-submit-btn");
const categoryFormTitle = document.getElementById("category-form-title");
const cancelEditBtn = document.getElementById("cancel-category-edit");

const firebaseIdInput = document.getElementById("category-firebase-id");
const categoryNameInput = document.getElementById("category-name");

let allCategories = [];

async function fetchAndRenderCategories() {
  categoriesList.innerHTML =
    '<tr><td colspan="2" class="text-center">Loading categories...</td></tr>';
  try {
    const querySnapshot = await loadCategories();
    categoriesList.innerHTML = "";
    allCategories = [];

    querySnapshot.forEach((doc) => {
      const category = doc.data();
      const docId = doc.id;
      allCategories.push({ docId, ...category });

      categoriesList.innerHTML += `
                <tr>
                    <td><strong>${category.Name}</strong></td>
                    <td class="text-center">
                        <button class="action-btn edit-btn" data-id="${docId}"><i class="fa fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${docId}"><i class="fa fa-trash"></i></button>
                    </td>
                </tr>
            `;
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        editCategory(btn.getAttribute("data-id")),
      );
    });
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        handleDeleteCategory(btn.getAttribute("data-id")),
      );
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    categoriesList.innerHTML =
      '<tr><td colspan="2" class="text-center text-danger">Error loading categories.</td></tr>';
  }
}

categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const docId = firebaseIdInput.value;
  const categoryData = {
    Name: categoryNameInput.value.trim(),
  };

  if (!categoryData.Name) return;

  categorySubmitBtn.disabled = true;
  categorySubmitBtn.innerText = "Processing...";

  try {
    if (docId) {
      const success = await updateCategory(docId, categoryData);
      if (success) alert("Category updated successfully!");
    } else {
      const success = await createCategory(categoryData);
      if (success) alert("Category added successfully!");
    }

    resetCategoryForm();
    await fetchAndRenderCategories();
  } catch (error) {
    console.error("Operation failed:", error);
    alert("An error occurred. Please try again.");
  } finally {
    categorySubmitBtn.disabled = false;
    categorySubmitBtn.innerText = docId ? "Update Category" : "Add Category";
  }
});

async function handleDeleteCategory(docId) {
  if (confirm("Are you sure you want to delete this category?")) {
    try {
      const success = await deleteCategory(docId);
      if (success) {
        alert("Category deleted!");
        await fetchAndRenderCategories();
      } else {
        alert("Failed to delete category.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }
}

function editCategory(docId) {
  const category = allCategories.find((c) => c.docId === docId);
  if (category) {
    firebaseIdInput.value = docId;
    categoryNameInput.value = category.Name;

    categoryFormTitle.innerText = "Edit Category";
    categorySubmitBtn.innerText = "Update Category";
    cancelEditBtn.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function resetCategoryForm() {
  categoryForm.reset();
  firebaseIdInput.value = "";
  categoryFormTitle.innerText = "Add New Category";
  categorySubmitBtn.innerText = "Add Category";
  cancelEditBtn.style.display = "none";
}

cancelEditBtn.addEventListener("click", resetCategoryForm);

fetchAndRenderCategories();
