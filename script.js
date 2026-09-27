// Point this at your deployed backend. GitHub Pages only serves static
// files, so the Node/Express API from /backend must run somewhere else
// (Render, Railway, a VM, etc.) and be reachable from this origin.
const API_BASE_URL = "http://localhost:5000";

const form = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");
const formAlert = document.getElementById("formAlert");

const PATTERNS = {
  username: /^[a-zA-Z0-9_.]{3,20}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneNumber: /^[0-9+\-\s()]{7,20}$/,
};

function setFieldError(name, message) {
  const input = form.elements[name];
  const errorEl = form.querySelector(`[data-error-for="${name}"]`);
  if (input) input.classList.toggle("invalid", Boolean(message));
  if (errorEl) errorEl.textContent = message || "";
}

function clearAllErrors() {
  ["fullName", "username", "email", "phoneNumber", "password", "confirmPassword"].forEach((name) =>
    setFieldError(name, "")
  );
}

function showAlert(message, type = "error") {
  formAlert.textContent = message;
  formAlert.className = `alert ${type === "success" ? "success" : ""}`.trim();
  formAlert.hidden = false;
}

function hideAlert() {
  formAlert.hidden = true;
}

function validateClientSide(values) {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }
  if (!PATTERNS.username.test(values.username)) {
    errors.username = "3-20 characters: letters, numbers, dot or underscore.";
  }
  if (!PATTERNS.email.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!PATTERNS.phoneNumber.test(values.phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }
  if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideAlert();
  clearAllErrors();

  const values = Object.fromEntries(new FormData(form).entries());
  const errors = validateClientSide(values);

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([name, message]) => setFieldError(name, message));
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account…";

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors) {
        Object.entries(result.errors).forEach(([name, message]) => setFieldError(name, message));
      }
      showAlert(result.message || "Please fix the highlighted fields.");
      return;
    }

    showAlert("Account created. You can sign in now.", "success");
    form.reset();
  } catch (err) {
    showAlert(
      "Couldn't reach the registration server. Confirm the API is running and API_BASE_URL in script.js is correct."
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create account";
  }
});

// Password show/hide toggles
document.querySelectorAll(".toggle-visibility").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    const isHidden = target.type === "password";
    target.type = isHidden ? "text" : "password";
    btn.textContent = isHidden ? "Hide" : "Show";
    btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  });
});
