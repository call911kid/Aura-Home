// import { auth } from "../Scripts/firebase.js";
// import {
//   onAuthStateChanged,
//   signOut,
// } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// /**
//  * وظيفة لحقن الناف بار في أي صفحة تلقائياً
//  */
// export function initNavbar() {
//   const navbarHtml = `
//     <nav class="navbar navbar-expand-lg">
//         <div class="container-fluid d-flex align-items-center justify-content-between">
//             <a class="navbar-brand" href="Home.html">
//                 <i id="sofa-icon" class="fa-solid fa-couch"></i> Aura Home
//             </a>

//             <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
//                 <i class="fa-solid fa-bars" style="color: #ffffff;"></i>
//             </button>

//             <div class="collapse navbar-collapse" id="mainNav">
//                 <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-4 navbar-center">
//                     <li class="nav-item"><a class="nav-link" href="Home.html">Home</a></li>
//                     <li class="nav-item"><a class="nav-link" href="Products-Page.html">Shop</a></li>
//                     <li class="nav-item"><a class="nav-link" href="#">About</a></li>
//                     <li class="nav-item"><a class="nav-link" href="contactUs.html">Contact</a></li>
//                     <li class="nav-item" id="my-orders-link" style="display: none;"><a class="nav-link" href="MyOrders.html">My Orders</a></li>
//                 </ul>

//                 <div class="navbar-right d-flex align-items-center gap-2">
//                     <!-- Cart Icon -->
//                     <div class="icon-wrapper position-relative" onclick="toggleCart()" style="cursor: pointer;">
//                         <lord-icon src="https://cdn.lordicon.com/fmsilsqx.json" trigger="hover" state="hover-slide" colors="primary:#ffffff" style="width:40px;height:40px"></lord-icon>
//                         <span id="cart-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="display: none; font-size: 10px;">0</span>
//                     </div>

//                     <!-- User Profile / Login -->
//                     <div id="auth-section" class="d-flex align-items-center">
//                         <a href="login.html" id="login-btn" class="nav-link text-white">Login</a>
//                         <div id="user-dropdown" class="dropdown" style="display: none;">
//                             <button class="btn dropdown-toggle text-white border-0" type="button" data-bs-toggle="dropdown">
//                                 <lord-icon src="https://cdn.lordicon.com/hrjifpbq.json" trigger="hover" colors="primary:#ffffff" style="width:40px;height:40px"></lord-icon>
//                             </button>
//                             <ul class="dropdown-menu dropdown-menu-end">
//                                 <li><a class="dropdown-item" href="MyOrders.html">My Orders</a></li>
//                                 <li><hr class="dropdown-divider"></li>
//                                 <li><a class="dropdown-item text-danger" href="#" id="logout-btn">Logout</a></li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </nav>
//     `;

//   // حقن الكود في بداية الـ body أو في عنصر مخصص
//   const navContainer =
//     document.getElementById("navbar-container") || document.body;
//   if (navContainer === document.body) {
//     document.body.insertAdjacentHTML("afterbegin", navbarHtml);
//   } else {
//     navContainer.innerHTML = navbarHtml;
//   }

//   // مراقبة حالة المستخدم لتحديث أزرار الناف بار
//   onAuthStateChanged(auth, (user) => {
//     const loginBtn = document.getElementById("login-btn");
//     const userDropdown = document.getElementById("user-dropdown");
//     const myOrdersLink = document.getElementById("my-orders-link");

//     if (user) {
//       if (loginBtn) loginBtn.style.display = "none";
//       if (userDropdown) userDropdown.style.display = "block";
//       if (myOrdersLink) myOrdersLink.style.display = "block";
//     } else {
//       if (loginBtn) loginBtn.style.display = "block";
//       if (userDropdown) userDropdown.style.display = "none";
//       if (myOrdersLink) myOrdersLink.style.display = "none";
//     }
//   });

//   // تفعيل زر تسجيل الخروج
//   document.addEventListener("click", (e) => {
//     if (e.target && e.target.id === "logout-btn") {
//       e.preventDefault();
//       signOut(auth).then(() => {
//         window.location.href = "Home.html";
//       });
//     }
//   });
// }

// // تشغيل الوظيفة تلقائياً عند تحميل الملف
// document.addEventListener("DOMContentLoaded", initNavbar);
