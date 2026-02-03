import { registerUser, loginUser, forgotPassword } from "./AuraHomeServices.js";
import { auth } from "./firebase.js";
import {
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { db } from "./firebase.js";

/* ================= SHOW / HIDE PASSWORD ================= */
window.togglePassword = function (inputId, icon) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.replace("fa-eye-slash", "fa-eye");
  }
};

/* ================= MAIN CODE ================= */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");

  // Sign Up
  const suUsername = document.getElementById("suUsername");
  const suEmail = document.getElementById("suEmail");
  const suPassword = document.getElementById("suPassword");
  const signUpForm = document.getElementById("signUpForm");

  // Sign In
  const siUsername = document.getElementById("siUsername");
  const siPassword = document.getElementById("siPassword");
  const signInForm = document.getElementById("signInForm");

  /* ===== TOGGLE PANELS ===== */
  registerBtn?.addEventListener("click", () =>
    container.classList.add("active"),
  );

  loginBtn?.addEventListener("click", () =>
    container.classList.remove("active"),
  );

  /* ===== HELPERS ===== */
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = msg;
      el.style.display = "block";
    }
  }

  function hideError(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ===================== SIGN UP ===================== */
  signUpForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = suUsername.value.trim();
    const email = suEmail.value.trim();
    const password = suPassword.value.trim();

    let valid = true;

    if (username.length < 3) {
      showError("suUsernameError", "Username must be at least 3 characters");
      valid = false;
    } else hideError("suUsernameError");

    if (!isValidEmail(email)) {
      showError("suEmailError", "Invalid email format");
      valid = false;
    } else hideError("suEmailError");

    if (password.length < 6) {
      showError("suPasswordError", "Password must be at least 6 characters");
      valid = false;
    } else hideError("suPasswordError");

    if (!valid) return;

    const user = await registerUser(email, password);

    if (user) {
      alert("Account created successfully ");
      signUpForm.reset();
      container.classList.remove("active");
    } else {
      alert("Registration failed ");
    }
  });

  /* ===================== SIGN IN ===================== */
  signInForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = siUsername.value.trim();
    const password = siPassword.value.trim();

    if (!email) {
      showError("siUsernameError", "Email is required");
      return;
    } else hideError("siUsernameError");

    if (!password) {
      showError("siPasswordError", "Password is required");
      return;
    } else hideError("siPasswordError");

    const user = await loginUser(email, password);

    if (!user) {
      alert("Invalid email or password ");
      return;
    }


    // get role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.exists() ? userDoc.data().role : "customer";
      console.log("User role:", role);
    if (role === "admin") {


      window.location.href = "../Pages/Dashboard.html";
    } else {
      const redirectTo = sessionStorage.getItem('redirectAfterLogin');
      if (redirectTo) {
        sessionStorage.removeItem('redirectAfterLogin'); 
        window.location.href = redirectTo; 
      } else {
        window.location.href = "../Pages/Home.html"; 
      }
    }
  });

  /* ===================== FORGOT PASSWORD ===================== */
  const forgotLink = document.querySelector('a[href="#"]');

  forgotLink?.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = siUsername.value.trim();

    if (!email) {
      alert("Please enter your email first ✉️");
      return;
    }

    const success = await forgotPassword(email);

    if (success) {
      alert("Password reset email sent ");
    } else {
      alert("Failed to send reset email ");
    }
  });
});

async function adminLogin(email, password) {
  const user = await loginUser(email, password);

  if (!user) {
    alert("Email or password is incorrect ");
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists()) {
    alert("User data not found ");
    await auth.signOut();
    return;
  }

  if (userDoc.data().role === "admin") {
    window.location.href = "../Pages/Dashboard.html";
  } else {
    alert("Access denied Admin only");
    await auth.signOut();
  }
}
