// Pie Chart

      const orderStatusChart = new Chart(
        document.getElementById("orderStatus"),
        {
          type: "doughnut",
          data: {
            labels: ["Completed", "In Progress", "Canceled"],
            datasets: [
              {
                data: [],
                backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: true,
              },
            },
            cutout: "70%",
          },
        },
      );

      // Bar Chart - Orders by Month (initially empty)
      const ordersByMonthChart = new Chart(
        document.getElementById("ordersByMonth"),
        {
          type: "bar",
          data: {
            labels: ["January", "February", "March", "April", "May", "June"],
            datasets: [
              {
                label: "Number of Orders",
                data: [],
                backgroundColor: "#3b82f6",
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          },
        },
      );

      // Sign Out
      const logoutBtn = document.getElementById("logoutBtn");

      if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
          localStorage.removeItem("currentUser");
          window.location.href = "Login.html";
        });
      }


       import { db } from "./firebase.js";
  import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

  // العنصر اللي هيعرض عدد اليوزرز
  const totalCustomersEl = document.querySelector(".stat-card:nth-child(2) h2");

  async function loadTotalCustomers() {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));

      // عدد المستخدمين
      const totalUsers = usersSnapshot.size;

      // عرض العدد
      totalCustomersEl.textContent = totalUsers;
    } catch (error) {
      console.error("Error loading total customers:", error);
    }
  }

  // تحميل العدد عند فتح الداشبورد
  window.addEventListener("DOMContentLoaded", loadTotalCustomers);