import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const ordersTable = document.getElementById("ordersTable");
const searchInput = document.getElementById("searchInput");

let allOrders = [];

/* ================= LOAD ORDERS ================= */
async function loadOrders() {
  ordersTable.innerHTML = "";
  allOrders = [];

  const snapshot = await getDocs(collection(db, "orders"));

  snapshot.forEach(docSnap => {
    allOrders.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderOrders(allOrders);
}

/* ================= RENDER ================= */
function renderOrders(orders) {
  ordersTable.innerHTML = "";

  orders.forEach(order => {
    ordersTable.innerHTML += `
      <tr>
        <td>#${order.id.slice(0,6)}</td>
        <td>${order.createdAt?.toDate().toLocaleDateString()}</td>
        <td>${order.userEmail}</td>
        <td>
          <span class="status ${order.status}">
            ${order.status}
          </span>
        </td>
        <td>$${order.total}</td>
        <td class="actions">
          <button class="btn-edit" data-id="${order.id}">
            <i class="fa fa-pen"></i>
          </button>
          <button class="btn-delete" data-id="${order.id}">
            <i class="fa fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  attachEvents();
}

/* ================= ACTIONS ================= */
function attachEvents() {

  // DELETE
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.onclick = async () => {
      if (confirm("Delete this order?")) {
        await deleteDoc(doc(db, "orders", btn.dataset.id));
        loadOrders();
      }
    };
  });

  // EDIT STATUS
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.onclick = async () => {
      const status = prompt("Enter status: completed / pending / canceled");
      if (!status) return;

      await updateDoc(doc(db, "orders", btn.dataset.id), {
        status: status.toLowerCase()
      });

      loadOrders();
    };
  });
}

/* ================= SEARCH ================= */
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();

  const filtered = allOrders.filter(o =>
    o.userEmail?.toLowerCase().includes(value) ||
    o.status?.toLowerCase().includes(value) ||
    o.id.includes(value)
  );

  renderOrders(filtered);
});

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", loadOrders);
