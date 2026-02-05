import { db, auth } from "./firebase.js";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import{load, setupEvents} from "./StaticScript.js"



await load();
await setupEvents();


/* ================= ELEMENTS ================= */
const usersDropdown = document.getElementById("usersDropdown");
const makeAdminBtn = document.getElementById("makeAdminBtn");
const deleteUserBtn = document.getElementById("deleteUserBtn");
const actionMsg = document.getElementById("actionMsg");

/* ================= LOAD USERS ================= */
async function loadUsers() {
  try {
    const snapshot = await getDocs(collection(db, "users"));

    usersDropdown.innerHTML =
      "<option value=''> -- Select a user -- </option>";

    snapshot.forEach((docSnap) => {
      const user = docSnap.data();

      // ❌ متظهرش المستخدمين المحذوفين
      if (user.role === "deleted") return;

      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = `${user.email} (${user.role})`;
      usersDropdown.appendChild(option);
    });

    actionMsg.textContent = "";
  } catch (error) {
    console.error(error);
    actionMsg.textContent = "Failed to load users.";
    actionMsg.style.color = "red";
  }
}

/* ================= MAKE ADMIN ================= */
makeAdminBtn.addEventListener("click", async () => {
  const selectedId = usersDropdown.value;
  if (!selectedId) {
    actionMsg.textContent = "Please select a user!";
    actionMsg.style.color = "red";
    return;
  }

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not logged in");

    const currentUserDoc = await getDoc(
      doc(db, "users", currentUser.uid)
    );

    if (currentUserDoc.data().role !== "admin") {
      actionMsg.textContent = "Only admins can do this!";
      actionMsg.style.color = "red";
      return;
    }

    await updateDoc(doc(db, "users", selectedId), {
      role: "admin",
    });

    actionMsg.textContent = "User promoted to admin!";
    actionMsg.style.color = "green";
    loadUsers();
  } catch (error) {
    console.error(error);
    actionMsg.textContent = "Promotion failed.";
    actionMsg.style.color = "red";
  }
});

/* ================= DELETE USER (SOFT DELETE) ================= */
deleteUserBtn.addEventListener("click", async () => {
  const selectedId = usersDropdown.value;
  if (!selectedId) {
    actionMsg.textContent = "Please select a user!";
    actionMsg.style.color = "red";
    return;
  }

  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not logged in");

    const currentUserDoc = await getDoc(
      doc(db, "users", currentUser.uid)
    );

    if (currentUserDoc.data().role !== "admin") {
      actionMsg.textContent = "Only admins can delete users!";
      actionMsg.style.color = "red";
      return;
    }

    // ✅ Soft delete
    await updateDoc(doc(db, "users", selectedId), {
      role: "deleted",
      deletedAt: new Date(),
    });

    actionMsg.textContent = "User deleted successfully!";
    actionMsg.style.color = "green";
    loadUsers();
  } catch (error) {
    console.error(error);
    actionMsg.textContent = "Delete failed.";
    actionMsg.style.color = "red";
  }
});

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", loadUsers);
