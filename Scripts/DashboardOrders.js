




import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const ordersTable = document.getElementById("ordersTable");
const searchInput = document.getElementById("searchInput");

let allOrders = [];

async function loadOrders() {
  ordersTable.innerHTML = `<tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p>Loading orders...</p></td></tr>`;
  allOrders = [];

  try {
    const snapshot = await getDocs(collection(db, "orders"));

    for (let docSnap of snapshot.docs) {
      let order = docSnap.data();
      order.id = docSnap.id;

      if (order.userId) {
        try {
          const userDoc = await getDoc(doc(db, "users", order.userId));
          if (userDoc.exists() && userDoc.data().role !== "deleted") {
            order.userEmail = userDoc.data().email;
            allOrders.push(order); 
          }
        } catch (e) {
          console.error("Error fetching user email:", e);
        }
      }
    }

    allOrders.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB - dateA;
    });

    renderOrders(allOrders);
  } catch (error) {
    console.error("Error loading orders:", error);
    ordersTable.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-danger">Error loading orders.</td></tr>`;
  }
}

function renderOrders(orders) {
  if (!ordersTable) return;
  ordersTable.innerHTML = "";

  if (orders.length === 0) {
    ordersTable.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5">
          <i class="fas fa-box-open fs-2 mb-2"></i>
          <p class="text-muted">No orders found.</p>
        </td>
      </tr>`;
    return;
  }

  orders.forEach((order) => {
    const dateStr = order.createdAt?.toDate
      ? order.createdAt.toDate().toLocaleDateString()
      : "N/A";

    const status = order.status || "pending";

    ordersTable.innerHTML += `
      <tr>
        <td>#${order.id.slice(0, 6)}</td>
        <td>${dateStr}</td>
        <td>${order.userEmail}</td>
        <td>
          <span class="status ${status}">
            ${status}
          </span>
        </td>
        <td>$${order.total || 0}</td>
        <td class="actions">
          <div class="dropdown">
            <button class="btn btn-sm btn-light border dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa fa-pen me-1"></i> Status
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item status-link" href="#" data-id="${order.id}" data-status="pending">Pending</a></li>
              <li><a class="dropdown-item status-link" href="#" data-id="${order.id}" data-status="completed">Completed</a></li>
              <li><a class="dropdown-item status-link" href="#" data-id="${order.id}" data-status="canceled">Canceled</a></li>
            </ul>
          </div>
        </td>
      </tr>
    `;
  });

  attachStatusEvents();
}

function attachStatusEvents() {
  document.querySelectorAll(".status-link").forEach((link) => {
    link.onclick = async (e) => {
      e.preventDefault();
      const orderId = link.dataset.id;
      const newStatus = link.dataset.status;

      try {
        const originalText = link.innerHTML;
        link.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...`;
        link.classList.add("disabled");

        await updateDoc(doc(db, "orders", orderId), {
          status: newStatus,
        });

        loadOrders();
      } catch (err) {
        alert("Error updating order status");
        console.error(err);
        link.innerHTML = originalText;
        link.classList.remove("disabled");
      }
    };
  });
}

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();

  const filtered = allOrders.filter(
    (order) =>
      (order.userEmail && order.userEmail.toLowerCase().includes(value)) ||
      (order.status && order.status.toLowerCase().includes(value)) ||
      (order.id && order.id.toLowerCase().includes(value)),
  );

  renderOrders(filtered);
});

window.addEventListener("DOMContentLoaded", loadOrders);
