
import { db, auth } from "../Scripts/firebase.js";
import { collection, doc, addDoc, getDocs, getDoc, deleteDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import {serverTimestamp, query, where, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";



export async function loadProducts() {
  const querySnapshot = await getDocs(collection(db, "Product"));

  /*
  querySnapshot.forEach((doc) => {
    console.log(doc.id, doc.data());
  });
  */

  return querySnapshot;
}
//loadProducts();

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



export async function loadCategories() {
    const querySnapshot = await getDocs(collection(db, "Category"));

    querySnapshot.forEach((doc) => {
        //console.log(doc.id, doc.data());
    });

    return querySnapshot;
}


export async function createCategory(category) {

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
    if (!user) return false;
    console.log(cartItems);
    try {
    
    for (const item of cartItems) {
        const product = await getProductById(item.id);
       // console.log(item.Id);

        if (!product) throw "Product not found";

        if (product.Stock_Quantity < item.quantity)
            throw `Not enough stock for ${item.id}`;
    }

    
    for (const item of cartItems) {
            await updateDoc(doc(db, "Product", item.id), {
            Stock_Quantity: increment(-item.quantity)
        });
    }

    
    await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items: cartItems,
        total,
        status: "pending",
        createdAt: serverTimestamp()
    });

    return true;

    } catch (error) {
        console.error("Order failed:", error);
    return false;
    }
}


export async function returnOrder(orderId) {
    const user = auth.currentUser;
    if (!user) return false;

    try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) throw "Order not found";

    const orderData = orderSnap.data();

    if (orderData.status === "returned")
        throw "Order already returned";

    
    for (const item of orderData.items) {
        await updateDoc(doc(db, "Product", item.id), {
        Stock_Quantity: increment(item.quantity)
        });
    }

    
    await updateDoc(orderRef, { status: "returned" });

    return true;

    } catch (error) {
        console.error("Return failed:", error);
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


export async function downgradeAdmin(targetUserId) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        console.error("Not logged in");
        return false;
    }

    try {
        
        const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (currentUserDoc.data().role !== "admin") {
            console.error("Only admins can downgrade other admins");
            return false;
        }

        
        await updateDoc(doc(db, "users", targetUserId), {
            role: "customer"
        });

        console.log("User downgraded from admin");
        return true;

    } catch (error) {
        console.error("Downgrade failed:", error);
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
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) throw "Order not found";

        const orderData = orderSnap.data();

        if (newStatus === "canceled" && orderData.status !== "canceled") {
            for (const item of orderData.items) {
                await updateDoc(doc(db, "Product", item.id), {
                    Stock_Quantity: increment(item.quantity)
                });
            }
        }

        await updateDoc(orderRef, { status: newStatus });

        console.log("Order status updated:", newStatus);
        return true;

    } catch (error) {
        console.error("Status update failed:", error);
        return false;
    }
}




export async function loadUsers() {
    //console.log(auth.currentUser);
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot;
}





