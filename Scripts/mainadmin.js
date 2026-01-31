import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { auth, db } from "./firebase.js";

async function addAdmin(email, password) {
  try {
   
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    
    await setDoc(doc(db, "users", userCred.user.uid), {
      email: email,
      role: "admin",
      createdAt: Date.now(),
    });

    console.log("Admin added:", email);
    return true;
  } catch (error) {
    console.error("Error adding admin:", error.message);
    return false;
  }
}
