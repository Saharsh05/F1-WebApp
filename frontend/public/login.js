document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const messageDiv = document.getElementById("login-message");

  if (!form) return console.warn("Login form not found!");

  form.addEventListener("submit", async (e) => {  
    e.preventDefault();

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    
    if (!emailInput || !passwordInput) {
      console.error("Login inputs missing!");
      return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
      messageDiv.textContent = "Please enter email and password";
      return;
    }

    try {
      const res = await fetch("http://localhost:8787/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || "Login failed");

      console.log('data is:',data)

      const token = data?.session?.access_token;
      const userId = data?.user?.id;
      const userEmail = data?.user?.email;

      if (!token) throw new Error("No session token returned");

      localStorage.setItem("session", JSON.stringify({ token, userId, userEmail }));

      messageDiv.textContent = "Login successful!";
      messageDiv.classList.add("success");

      window.location.href = "dashboard.html";

    } catch (err) {
      console.error("[LOGIN] error", err);
      messageDiv.textContent = err.message || "Failed to login";
    }
  });
});
