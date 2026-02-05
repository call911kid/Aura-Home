import{load, setupEvents} from "./StaticScript.js"



await load();
await setupEvents();
var nav=document.getElementById("navbar");
nav.style.position = "sticky";
nav.style.top = "0";
nav.style.zIndex = "2000";


import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* ================= ELEMENTS ================= */
const totalOrdersEl = document.getElementById("totalOrders");
const totalCustomersEl = document.getElementById("totalCustomers");
const ordersThisMonthEl = document.getElementById("ordersThisMonth");

/* ================= CHARTS ================= */
const orderStatusChart = new Chart(document.getElementById("orderStatus"), {
  type: "doughnut",
  data: {
    labels: ["Completed", "Pending", "Canceled"],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
    }],
  },
  options: { cutout: "70%" },
});

const ordersByMonthChart = new Chart(document.getElementById("ordersByMonth"), {
  type: "bar",
  data: {
    labels: [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ],
    datasets: [{
      label: "Orders",
      data: new Array(12).fill(0),
      backgroundColor: "#22c55e",
    }],
  },
  options: {
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  },
});

/* ================= LOAD DASHBOARD DATA ================= */
async function loadDashboardData() {
  try {
    // كل الأوردرز
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    const ordersData = [];
    const customersSet = new Set(); // لتخزين العملاء اللي عاملين أوردر

    let completed = 0;
    let pending = 0;
    let canceled = 0;
    let ordersPerMonth = new Array(12).fill(0);
    let ordersThisMonth = 0;
    const currentMonth = new Date().getMonth();

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      order.id = doc.id;

      // حساب status
      if (order.status === "completed") completed++;
      else if (order.status === "pending") pending++;
      else if (order.status === "canceled") canceled++;

      // حساب month
      let month = null;
      if (order.createdAt?.toDate) month = order.createdAt.toDate().getMonth();
      else if (order.createdAt) month = new Date(order.createdAt).getMonth();

      if (month !== null) {
        ordersPerMonth[month]++;
        if (month === currentMonth) ordersThisMonth++;
      }

      // إضافة userId إذا موجود للـ Set
      if (order.userId) customersSet.add(order.userId);

      ordersData.push(order);
    });

    /* ==== UPDATE COUNTS ==== */
    totalOrdersEl.textContent = ordersData.length;          // كل الأوردرز
    totalCustomersEl.textContent = customersSet.size;       // العملاء اللي عملوا أوردر
    ordersThisMonthEl.textContent = ordersThisMonth;

    /* ==== UPDATE CHARTS ==== */
    orderStatusChart.data.datasets[0].data = [completed, pending, canceled];
    orderStatusChart.update();

    ordersByMonthChart.data.datasets[0].data = ordersPerMonth;
    ordersByMonthChart.update();

  } catch (error) {
    console.error("Dashboard error:", error);
  }
}

/* ================= LOGOUT ================= */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "Login.html";
  });
}

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", loadDashboardData);

