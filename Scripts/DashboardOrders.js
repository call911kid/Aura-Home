// // //

// // import { db } from "./firebase.js";
// // import {
// //   collection,
// //   getDocs,
// //   deleteDoc,
// //   updateDoc,
// //   doc
// // } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// // const ordersTable = document.getElementById("ordersTable");
// // const searchInput = document.getElementById("searchInput");
// // //

// // let allOrders = [];

// // /* ================= LOAD ORDERS ================= */
// // async function loadOrders() {
// //   ordersTable.innerHTML = "";
// //   allOrders = [];

// //   const snapshot = await getDocs(collection(db, "orders"));

// //   snapshot.forEach(docSnap => {
// //     allOrders.push({
// //       id: docSnap.id,
// //       ...docSnap.data()
// //     });
// //   });

// //   renderOrders(allOrders);
// // }

// // /* ================= RENDER ================= */
// // function renderOrders(orders) {
// //   ordersTable.innerHTML = "";

// //   orders.forEach(order => {
// //     ordersTable.innerHTML += `
// //       <tr>
// //         <td>#${order.id.slice(0,6)}</td>
// //         <td>${order.createdAt?.toDate().toLocaleDateString()}</td>
// //         <td>${order.userEmail}</td>
// //         <td>
// //           <span class="status ${order.status}">
// //             ${order.status}
// //           </span>
// //         </td>
// //         <td>$${order.total}</td>
// //         <td class="actions">
// //           <button class="btn-edit" data-id="${order.id}">
// //             <i class="fa fa-pen"></i>
// //           </button>
// //
// //         </td>
// //       </tr>
// //     `;
// //   });

// //   attachEvents();
// // }

// // /* ================= ACTIONS ================= */
// // function attachEvents() {

// //   // DELETE
// //   // document.querySelectorAll(".btn-delete").forEach(btn => {
// //   //   btn.onclick = async () => {
// //   //     if (confirm("Delete this order?")) {
// //   //       await deleteDoc(doc(db, "orders", btn.dataset.id));
// //   //       loadOrders();
// //   //     }
// //   //   };
// //   // });

// // EDIT STATUS
// // document.querySelectorAll(".btn-edit").forEach(btn => {
// //   btn.onclick = async () => {
// //     const status = prompt("Enter status: completed / pending / canceled");
// //     if (!status) return;

// //     await updateDoc(doc(db, "orders", btn.dataset.id), {
// //       status: status.toLowerCase()
// //     });

// //     loadOrders();
// //   };
// // });
// //}

// /* ================= SEARCH ================= */
// // searchInput.addEventListener("input", () => {
// //   const value = searchInput.value.toLowerCase();

// //   const filtered = allOrders.filter(o =>
// //     o.userEmail?.toLowerCase().includes(value) ||
// //     o.status?.toLowerCase().includes(value) ||
// //     o.id.includes(value)
// //   );

// //   renderOrders(filtered);
// // });

// // /* ================= INIT ================= */
// // window.addEventListener("DOMContentLoaded", loadOrders);
// import { db } from "./firebase.js";
// import {
//   collection,
//   getDocs,
//   doc,
//   getDoc,
//   updateDoc
// } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// const ordersTable = document.getElementById("ordersTable");
// const searchInput = document.getElementById("searchInput");

// let allOrders = [];

// /* ================= LOAD ORDERS ================= */
// async function loadOrders() {
//   ordersTable.innerHTML = "";
//   allOrders = [];

//   const snapshot = await getDocs(collection(db, "orders"));

//   for (let docSnap of snapshot.docs) {
//     let order = docSnap.data();
//     order.id = docSnap.id;

//     // جلب ايميل المستخدم
//     try {
//       if (order.userId) {
//         const userDoc = await getDoc(doc(db, "users", order.userId));
//         order.userEmail = userDoc.exists()
//           ? userDoc.data().email
//           : "N/A";
//       } else {
//         order.userEmail = "N/A";
//       }
//     } catch (e) {
//       order.userEmail = "N/A";
//     }

//     allOrders.push(order);
//   }

//   renderOrders(allOrders);
// }

// /* ================= RENDER ================= */
// function renderOrders(orders) {
//   if (!ordersTable) return;
//   ordersTable.innerHTML = "";

//   if (orders.length === 0) {
//     ordersTable.innerHTML = `
//       <tr>
//         <td colspan="6" class="text-center py-5">
//           <i class="fas fa-box-open fs-2 mb-2"></i>
//           <p class="text-muted">No orders found.</p>
//         </td>
//       </tr>`;
//     return;
//   }

//   orders.forEach(order => {
//     const dateStr = order.createdAt?.toDate
//       ? order.createdAt.toDate().toLocaleDateString()
//       : "N/A";

//     ordersTable.innerHTML += `
//       <tr>
//         <td>#${order.id.slice(0, 6)}</td>
//         <td>${dateStr}</td>
//         <td>${order.userEmail}</td>
//         <td>
//           <span class="status ${order.status || "pending"}">
//             ${order.status || "pending"}
//           </span>
//         </td>
//         <td>$${order.total || 0}</td>
//         <td class="actions">
//           <button class="btn-edit" data-id="${order.id}">
//             <i class="fa fa-pen"></i>
//           </button>
//         </td>
//       </tr>
//     `;
//   });

//   attachEditEvents();
// }

// /* ================= EDIT STATUS ================= */
// function attachEditEvents() {
//   document.querySelectorAll(".btn-edit").forEach(btn => {
//     btn.onclick = async () => {
//       const newStatus = prompt(
//         "Enter new status: pending / completed / canceled"
//       );

//       if (!newStatus) return;

//       try {
//         await updateDoc(doc(db, "orders", btn.dataset.id), {
//           status: newStatus.toLowerCase()
//         });

//         loadOrders();
//       } catch (err) {
//         alert("Error updating order");
//         console.error(err);
//       }
//     };
//   });
// }

// /* ================= SEARCH ================= */
// searchInput.addEventListener("input", () => {
//   const value = searchInput.value.toLowerCase();

//   const filtered = allOrders.filter(order =>
//     order.userEmail?.toLowerCase().includes(value) ||
//     order.status?.toLowerCase().includes(value) ||
//     order.id.toLowerCase().includes(value)
//   );

//   renderOrders(filtered);
// });

// /* ================= INIT ================= */
// window.addEventListener("DOMContentLoaded", loadOrders);

// ../Scripts/DashboardOrders.js
import { db } from "./firebase.js";
import { collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const ordersTable = document.getElementById("ordersTable");
const searchInput = document.getElementById("searchInput");

let allOrders = [];

/* ================= LOAD ORDERS ================= */
async function loadOrders() {
  ordersTable.innerHTML = "";
  allOrders = [];

  const snapshot = await getDocs(collection(db, "orders"));

  for (let docSnap of snapshot.docs) {
    let order = docSnap.data();
    order.id = docSnap.id;

    // جلب ايميل المستخدم الحقيقي
    if (order.userId) {
      try {
        const userDoc = await getDoc(doc(db, "users", order.userId));
        if (userDoc.exists() && userDoc.data().role !== "deleted") {
          order.userEmail = userDoc.data().email; // إيميل حقيقي
          allOrders.push(order); // نضيف فقط الأوردرات المرتبطة بحساب موجود
        }
      } catch (e) {
        console.error("Error fetching user email:", e);
      }
    }
  }

  renderOrders(allOrders);
}

/* ================= RENDER ================= */
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

  orders.forEach(order => {
    const dateStr = order.createdAt?.toDate
      ? order.createdAt.toDate().toLocaleDateString()
      : "N/A";

    ordersTable.innerHTML += `
      <tr>
        <td>#${order.id.slice(0, 6)}</td>
        <td>${dateStr}</td>
        <td>${order.userEmail}</td>
        <td>
          <span class="status ${order.status || "pending"}">
            ${order.status || "pending"}
          </span>
        </td>
        <td>$${order.total || 0}</td>
        <td class="actions">
          <button class="btn-edit" data-id="${order.id}">
            <i class="fa fa-pen"></i>
          </button>
        </td>
      </tr>
    `;
  });

  attachEditEvents();
}

/* ================= EDIT STATUS ================= */
function attachEditEvents() {
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.onclick = async () => {
      const newStatus = prompt(
        "Enter new status: pending / completed / canceled"
      );
      if (!newStatus) return;

      try {
        await updateDoc(doc(db, "orders", btn.dataset.id), {
          status: newStatus.toLowerCase()
        });
        loadOrders();
      } catch (err) {
        alert("Error updating order");
        console.error(err);
      }
    };
  });
}

/* ================= SEARCH ================= */
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();

  const filtered = allOrders.filter(order =>
    order.userEmail.toLowerCase().includes(value) ||
    order.status?.toLowerCase().includes(value) ||
    order.id.toLowerCase().includes(value)
  );

  renderOrders(filtered);
});

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", loadOrders);
