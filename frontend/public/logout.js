document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
  
    if (!logoutBtn) return;
  
    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("http://localhost:8787/auth/logout", {
          method: "POST",
          credentials: "include",
        });
  
        if (!res.ok) throw new Error("Failed to logout");
  
        alert("Logged out!");
        // Optionally redirect to login page
        //window.location.href = "login.html";
      } catch (err) {
        console.error(err);
        alert("Error logging out");
      }
    });
  });
  