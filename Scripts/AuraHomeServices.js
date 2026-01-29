import { db } from "../Scripts/firebase.js";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function loadProducts() {
  const querySnapshot = await getDocs(collection(db, "Product"));

  querySnapshot.forEach((doc) => {
    console.log(doc.id, doc.data());
  });

  return querySnapshot;
}
loadProducts();

export async function getProductById(productId) {
  try {
    const docRef = doc(db, "Product", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Product:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("No such product!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function createProduct(product) {
  try {
    const docRef = await addDoc(collection(db, "Product"), {
      Product_Name: product.Product_Name,
      Description: product.Description ?? "No Discription",
      Category: product.Category ?? "Uncategorized",
      Image_URL: product.Image_URL ?? "",
      Price: Number(product.Price),
      Discount_Price: Number(product.Discount_Price) || null,
      Stock_Quantity: Number(product.Stock_Quantity) || 0,
      CreatedAt: Date.now(),
    });
    return true;
  } catch (e) {
    console.error("Error adding document: ", e);
    return false;
  }
}

export async function updateProduct(productId, updates) {
  try {
    const productRef = doc(db, "Product", productId);

    await updateDoc(productRef, updates);

    console.log("Product updated:", productId);
    return true;
  } catch (error) {
    console.error("Update failed:", error);
    return false;
  }
}

export async function deleteProduct(productId) {
  try {
    await deleteDoc(doc(db, "Product", productId));
    console.log("Product deleted:", productId);
    return true;
  } catch (e) {
    console.error("Error deleting product:", e);
    return false;
  }
}
