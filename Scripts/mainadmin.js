// mainadmin.js
import { db, auth } from "./firebase.js";
import { collection, doc, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// DOM Elements
const usersDropdown = document.getElementById("usersDropdown");
const makeAdminBtn = document.getElementById("makeAdminBtn");
const deleteUserBtn = document.getElementById("deleteUserBtn");
const actionMsg = document.getElementById("actionMsg");

// Load users into dropdown
async function loadUsers() {
  try {
    const snapshot = await getDocs(collection(db, "users"));

    // Clear previous options
    usersDropdown.innerHTML = "<option value=''> -- Select a user -- </option>";

    snapshot.forEach(docSnap => {
      const user = docSnap.data();
      const userId = docSnap.id;

      const option = document.createElement("option");
      option.value = userId;
      option.textContent = `${user.email} (${user.role})`;
      usersDropdown.appendChild(option);
    });

    actionMsg.textContent = "";
  } catch (error) {
    console.error("Error loading users:", error);
    actionMsg.textContent = "Failed to load users. Check Firestore rules.";
    actionMsg.style.color = "red";
  }
}

// Make selected user an admin
makeAdminBtn.addEventListener("click", async () => {
  const selectedId = usersDropdown.value;
  if (!selectedId) {
    actionMsg.textContent = "Please select a user!";
    actionMsg.style.color = "red";
    return;
  }

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("You must be logged in as admin");

    const currentUserDoc = await getDocs(collection(db, "users"));
    // يمكن هنا نضيف check للدور لو قواعد Firestore محسوبة
    await updateDoc(doc(db, "users", selectedId), { role: "admin" });

    actionMsg.textContent = "User promoted to Admin!";
    actionMsg.style.color = "green";
    loadUsers();
  } catch (error) {
    console.error("Error promoting user:", error);
    actionMsg.textContent = "Failed to promote user.";
    actionMsg.style.color = "red";
  }
});

// Delete selected user
deleteUserBtn.addEventListener("click", async () => {
  const selectedId = usersDropdown.value;
  if (!selectedId) {
    actionMsg.textContent = "Please select a user!";
    actionMsg.style.color = "red";
    return;
  }

  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    await deleteDoc(doc(db, "users", selectedId));
    actionMsg.textContent = "User deleted successfully!";
    actionMsg.style.color = "green";
    loadUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
    actionMsg.textContent = "Failed to delete user.";
    actionMsg.style.color = "red";
  }
});

// Initial load
window.addEventListener("DOMContentLoaded", loadUsers);
