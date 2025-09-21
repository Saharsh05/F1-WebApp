document.addEventListener("DOMContentLoaded", async () => {
    console.log("Navbar script loaded");
  
    const loginLink = document.getElementById("login-nav");
    //const dashboardLink = document.getElementById("dashboard-nav");
    const logoutBtn = document.getElementById("logout-btn");
  
    // Check if user is logged in
    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:8787/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        return res.ok; // true if logged in
      } catch (err) {
        console.error("Auth check failed", err);
        return false;
      }
    }
  
    const isLoggedIn = await checkAuth();
  
    if (isLoggedIn) {
        console.log("User is logged in");
        loginLink.style.display = "none";
        dashboardLink.style.display = "inline";
        logoutBtn.style.display = "inline";
      
        // Redirect logged-in users away from login/register
        if (window.location.pathname.includes("login.html") || window.location.pathname.includes("register.html")) {
          window.location.href = "dashboard.html";
        }
  
      logoutBtn.addEventListener("click", async () => {
        try {
          await fetch("http://localhost:8787/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          window.location.reload(); // reload page after logout
        } catch (err) {
          console.error("Logout failed", err);
        }
      });
  
    } else {
      console.log("User not logged in");
      loginLink.style.display = "inline";        // show Login
      //dashboardLink.style.display = "none";      // hide My Dashboard
      logoutBtn.style.display = "none";          // hide Logout
    }
  });
  