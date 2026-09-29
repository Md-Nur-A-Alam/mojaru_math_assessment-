/* ==========================================================================
   Mojaru Admin Login JavaScript
   Dedicated Login Page Logic
   ========================================================================== */

const ADMIN_CREDENTIALS = {
  email: "mdnuralam@gmail.com",
  pass: "Mojaru.Nur@1"
};

// If already logged in, redirect straight to dashboard
if (sessionStorage.getItem("mojaru_admin_auth") === "true") {
  window.location.replace("admin.html");
}

const loginForm = document.getElementById("adminLoginForm");
const adminEmailInput = document.getElementById("adminEmail");
const adminPassInput = document.getElementById("adminPassword");
const btnTogglePass = document.getElementById("btnTogglePass");
const eyeIcon = document.getElementById("eyeIcon");
const loginError = document.getElementById("loginError");
const loginErrorMsg = document.getElementById("loginErrorMsg");

// Pre-fill email for convenience
if (adminEmailInput) {
  adminEmailInput.value = ADMIN_CREDENTIALS.email;
}

// Toggle Password Visibility
if (btnTogglePass && adminPassInput) {
  btnTogglePass.addEventListener("click", () => {
    const isPass = adminPassInput.type === "password";
    adminPassInput.type = isPass ? "text" : "password";
    if (eyeIcon) {
      eyeIcon.innerHTML = isPass
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    }
  });
}

// Handle Login Submission
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideLoginError();

    const inputEmail = (adminEmailInput ? adminEmailInput.value : "").trim().toLowerCase();
    const inputPass = (adminPassInput ? adminPassInput.value : "").trim();

    if (!inputEmail || !inputPass) {
      showLoginError("অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড উভয়ই দিন।");
      return;
    }

    if (
      inputEmail === ADMIN_CREDENTIALS.email.toLowerCase() &&
      inputPass === ADMIN_CREDENTIALS.pass
    ) {
      // Save session
      sessionStorage.setItem("mojaru_admin_auth", "true");
      sessionStorage.setItem("mojaru_admin_user", ADMIN_CREDENTIALS.email);
      // Redirect to Admin Dashboard
      window.location.replace("admin.html");
    } else {
      showLoginError("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে! অনুগ্রহ করে সঠিক তথ্য দিন।");
      if (adminPassInput) {
        adminPassInput.value = "";
        adminPassInput.focus();
      }
    }
  });
}

function showLoginError(msg) {
  if (loginErrorMsg) loginErrorMsg.textContent = msg;
  if (loginError) loginError.hidden = false;
}

function hideLoginError() {
  if (loginError) loginError.hidden = true;
  if (loginErrorMsg) loginErrorMsg.textContent = "";
}
