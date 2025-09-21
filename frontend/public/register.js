document.addEventListener("DOMContentLoaded", () => {
    console.log("Register page loaded, checking button...");
  
    const registerBtn = document.getElementById("register-btn");
  
    if (!registerBtn) {
      console.log("Register button not found!");
      return;
    } else {
      console.log("Register button found!");
    }
  
    registerBtn.addEventListener("click", async (e) => {
      e.preventDefault();
  
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const messageDiv = document.getElementById("register-message");
  
      try {
        const res = await fetch("http://localhost:8787/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
  
        if (!res.ok) {
          const err = await res.json();
          messageDiv.textContent = err.error?.message || "Registration failed";
          messageDiv.classList.remove("success");
          return;
        }
  
        messageDiv.textContent = "Registration successful!";
        messageDiv.classList.add("success");
  
        // Redirect to home page
        window.location.href = "index.html";
      } catch (err) {
        console.error("Register error:", err);
        messageDiv.textContent = "Failed to fetch";
        messageDiv.classList.remove("success");
      }
    });
  });
  