document.addEventListener("DOMContentLoaded", async () => {
  console.log("Navbar script loaded");

  const loginLink = document.getElementById("login-nav");
  const dashboardLink = document.getElementById("dashboard-nav");
  const logoutBtn = document.getElementById("logout-btn");

  // Only run auth check if navbar links exist (prevents errors on login page if some are missing)
  if (!loginLink && !dashboardLink && !logoutBtn) return;

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
    if (loginLink) loginLink.style.display = "none";
    if (dashboardLink) dashboardLink.style.display = "inline";
    if (logoutBtn) logoutBtn.style.display = "inline";

    // Only attach logout listener if logout button exists
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          await fetch("http://localhost:8787/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          console.log("Logged out successfully");
          // Update navbar links without reloading the page
          if (loginLink) loginLink.style.display = "inline";
          if (dashboardLink) dashboardLink.style.display = "none";
          if (logoutBtn) logoutBtn.style.display = "none";
        } catch (err) {
          console.error("Logout failed", err);
        }
      });
    }

  } else {
    console.log("User not logged in");
    if (loginLink) loginLink.style.display = "inline";
    if (dashboardLink) dashboardLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
});
