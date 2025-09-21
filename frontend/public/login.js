document.addEventListener("DOMContentLoaded", () => {
    console.log("Login page loaded, checking button...");
  
    const loginBtn = document.getElementById("login-btn");
  
    if (!loginBtn) {
      console.log("Login button not found!");
      return;
    } else {
      console.log("Login button found!");
    }
  
    loginBtn.addEventListener("click", async (e) => {
      e.preventDefault();
  
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const messageDiv = document.getElementById("login-message");
  
      try {
        const res = await fetch("http://localhost:8787/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
  
        if (!res.ok) {
          const err = await res.json();
          messageDiv.textContent = err.error?.message || "Login failed";
          messageDiv.classList.remove("success");
          return;
        }
  
        messageDiv.textContent = "Login successful!";
        messageDiv.classList.add("success");
  
        // Redirect to home page
        window.location.href = "index.html";
      } catch (err) {
        console.error("Login error:", err);
        messageDiv.textContent = "Failed to fetch";
        messageDiv.classList.remove("success");
      }
    });
  });
  