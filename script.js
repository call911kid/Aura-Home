// var container = document.getElementById("container");
// var registerBtn = document.getElementById("register");
// var loginBtn = document.getElementById("login");

// registerBtn.addEventListener("click", () => {
//   container.classList.add("active"); ///قاىمه الكلاسات  اللي موجوده ف العنصر دا
// });

// loginBtn.addEventListener("click", () => {
//   container.classList.remove("active");
// });
// document.getElementById("ch").addEventListener("change", function () {
//   var pas = document.getElementById("pas");

//   if (this.checked) {
//     pas.type = "text";
//   } else {
//     pas.type = "password";
//   }
// });
// document.getElementById("che").addEventListener("change", function () {
//   var sh = document.getElementById("shpas");
//   if (this.checked) {
//     sh.type = "text";
//   } else {
//     sh.type = "password";
//   }
// });
/* ================= SHOW / HIDE PASSWORD ================= */
function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

/* ================= MAIN CODE ================= */
document.addEventListener("DOMContentLoaded", function () {
  // CONTAINER & TOGGLE BUTTONS
  const container = document.getElementById("container");
  const registerBtn = document.getElementById("register");
  const loginBtn = document.getElementById("login");

  // SIGN UP elements
  const suUsername = document.getElementById("suUsername");
  const suEmail = document.getElementById("suEmail");
  const suPassword = document.getElementById("suPassword");
  const signUpForm = document.getElementById("signUpForm");

  // SIGN IN elements
  const siUsername = document.getElementById("siUsername");
  const siPassword = document.getElementById("siPassword");
  const rememberMe = document.getElementById("rememberMe");
  const signInForm = document.getElementById("signInForm");

  // ===================== TOGGLE PANELS =====================
  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      container.classList.add("active");
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      container.classList.remove("active");
    });
  }

  // ===================== HELPERS =====================
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

  // ===================== LOCAL STORAGE =====================
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Load saved username/password if rememberMe was checked
  if (localStorage.getItem("rememberMe") === "true") {
    if (siUsername)
      siUsername.value = localStorage.getItem("savedUsername") || "";
    if (siPassword)
      siPassword.value = localStorage.getItem("savedPassword") || "";
    if (rememberMe) rememberMe.checked = true;
  }

  // ===================== SIGN UP =====================
  if (signUpForm && suUsername && suEmail && suPassword) {
    signUpForm.addEventListener("submit", function (e) {
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

      users.push({ username, email, password, role: "customer" });
      localStorage.setItem("users", JSON.stringify(users));

      alert("Registration successful ✅");

      this.reset();
      if (container) container.classList.remove("active");
    });
  }

  // ===================== SIGN IN =====================
  if (signInForm && siUsername && siPassword) {
    signInForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = siUsername.value.trim();
      const password = siPassword.value.trim();

      if (username === "") {
        showError("siUsernameError", "Username is required");
        return;
      } else hideError("siUsernameError");

      if (password === "") {
        showError("siPasswordError", "Password is required");
        return;
      } else hideError("siPasswordError");

      
      const user = users.find((u) => u.username === username);

      
      if (!user) {
        alert("This account does not exist. Please create an account first.");
        return;
      }

      
      if (user.password !== password) {
        alert("Incorrect password. Please try again.");
        return;
      }

      // Remember me
      if (rememberMe && rememberMe.checked) {
        localStorage.setItem("savedUsername", username);
        localStorage.setItem("savedPassword", password);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("savedUsername");
        localStorage.removeItem("savedPassword");
        localStorage.setItem("rememberMe", "false");
      }

      alert("Login successful 🎉");
      this.reset();
    });
  }
});
