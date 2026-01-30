
import { db, auth } from "../Scripts/firebase.js";
import { collection, doc, addDoc, getDocs, deleteDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";



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
      Image_URLs: Array.isArray(product.Image_URLs) ? product.Image_URLs: [],
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



export async function laodCategories() {
    const querySnapshot = await getDocs(collection(db, "Category"));

    querySnapshot.forEach((doc) => {
        console.log(doc.id, doc.data());
    });

    return querySnapshot;
}


export async function crateCategory(category) {
    try {
        const docRef = await addDoc(collection(db, "Category"), {
            Name: category.Name
        });
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        return false;
    }
}



export async function updateCategory(categoryId, updates) {
    try {
        const categoryRef = doc(db, "Category", categoryId);

        await updateDoc(categoryRef, updates);

        console.log("Category updated:", categoryId);
        return true;

    } catch (error) {
        console.error("Update failed:", error);
        return false;
    }
}


export async function deleteCategory(categoryId) {
    try {
        await deleteDoc(doc(db, "Category", categoryId));
        console.log("Category deleted:", categoryId);
        return true;
    } catch (e) {
        console.error("Error deleting category:", e);
        return false;
    }
}



export async function registerUser(email, password) {
    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);

        
        await setDoc(doc(db, "users", userCred.user.uid), {
            email: email,
            role: "customer",
            createdAt: Date.now()
        });

        console.log("User registered + Firestore profile created");
        return userCred.user;

    } catch (error) {
        console.error("Register failed:", error.message);
        return null;
    }
}


export async function loginUser(email, password) {
    try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCred.user.uid);
        return userCred.user;
    } catch (error) {
        console.log("Login failed:", error.message);
        return null;
    }
}


export async function logoutUser() {
    await signOut(auth);
    console.log("User logged out");
}

export async function forgotPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log("Password reset email sent");
        return true;
    } catch (error) {
        console.error("Reset failed:", error.message);
        return false;
    }
}





export async function createOrder(cartItems, total) {
    const user = auth.currentUser;

    if (!user) {
        console.error("User not logged in");
        return false;
    }

    try {
        await addDoc(collection(db, "orders"), {
            userId: user.uid,
            items: cartItems,
            total: total,
            status: "pending",
            createdAt: serverTimestamp()
        });

        console.log("Order created");
        return true;

    } catch (error) {
        console.error("Order failed:", error);
        return false;
    }
}






export async function getMyOrders() {
    const user = auth.currentUser;

    if (!user) return [];

    const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}


export async function getAllOrders() {
    const user = auth.currentUser;
    if (!user) return [];

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.data().role !== "admin") {
        console.error("Not authorized");
        return [];
    }

    const snapshot = await getDocs(collection(db, "orders"));

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}


export async function promoteToAdmin(targetUserId) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        console.error("Not logged in");
        return false;
    }

    try {
        
        const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (currentUserDoc.data().role !== "admin") {
            console.error("Only admins can promote");
            return false;
        }

        
        await updateDoc(doc(db, "users", targetUserId), {
            role: "admin"
        });

        console.log("User promoted to admin");
        return true;

    } catch (error) {
        console.error("Promotion failed:", error);
        return false;
    }
}


export async function updateOrderStatus(orderId, newStatus) {
    const user = auth.currentUser;
    if (!user) return false;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.data().role !== "admin") {
        console.error("Only admin can update orders");
        return false;
    }

    try {
        await updateDoc(doc(db, "orders", orderId), {
            status: newStatus
        });

        console.log("Order status updated:", newStatus);
        return true;

    } catch (error) {
        console.error("Status update failed:", error);
        return false;
    }
}




