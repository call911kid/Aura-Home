import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* ===================== ELEMENTS ===================== */
const totalOrdersEl = document.querySelector(".stat-card:nth-child(1) h2");
const totalCustomersEl = document.querySelector(".stat-card:nth-child(2) h2");
const ordersThisMonthEl = document.querySelector(".stat-card:nth-child(3) h2");

/* ===================== CHARTS ===================== */

// ===== Order Status Pie =====
const orderStatusChart = new Chart(
  document.getElementById("orderStatus"),
  {
    type: "doughnut",
    data: {
      labels: ["Completed", "Pending", "Canceled"],
      datasets: [
        {
          data: [0, 0, 0],
          backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  }
);

// ===== Orders by Month =====
const ordersByMonthChart = new Chart(
  document.getElementById("ordersByMonth"),
  {
    type: "bar",
    data: {
      labels: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
      datasets: [
        {
          label: "Orders",
          data: new Array(12).fill(0),
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
      },
    },
  }
);

/* ===================== LOAD DASHBOARD DATA ===================== */
async function loadDashboardData() {
  try {
    const snapshot = await getDocs(collection(db, "orders"));

    let completed = 0;
    let pending = 0;
    let canceled = 0;

    let customers = new Set();
    let ordersPerMonth = new Array(12).fill(0);

    const currentMonth = new Date().getMonth();
    let ordersThisMonth = 0;

    snapshot.forEach((doc) => {
      const order = doc.data();

      /* ===== CUSTOMER ===== */
      if (order.userEmail) {
        customers.add(order.userEmail);
      }

      /* ===== STATUS ===== */
      if (order.status === "completed") completed++;
      else if (order.status === "pending") pending++;
      else if (order.status === "canceled") canceled++;

      /* ===== DATE ===== */
      if (order.createdAt?.toDate) {
        const date = order.createdAt.toDate();
        const monthIndex = date.getMonth();

        ordersPerMonth[monthIndex]++;

        if (monthIndex === currentMonth) {
          ordersThisMonth++;
        }
      }
    });

    /* ================= UPDATE CARDS ================= */
    totalOrdersEl.textContent = snapshot.size;
    totalCustomersEl.textContent = customers.size;
    ordersThisMonthEl.textContent = ordersThisMonth;

    /* ================= UPDATE PIE ================= */
    orderStatusChart.data.datasets[0].data = [
      completed,
      pending,
      canceled,
    ];
    orderStatusChart.update();

    /* ================= UPDATE BAR ================= */
    ordersByMonthChart.data.datasets[0].data = ordersPerMonth;
    ordersByMonthChart.update();

  } catch (error) {
    console.error("Dashboard Error:", error);
  }
}

/* ===================== LOGOUT ===================== */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "Login.html";
  });
}

/* ===================== INIT ===================== */
window.addEventListener("DOMContentLoaded", loadDashboardData);
