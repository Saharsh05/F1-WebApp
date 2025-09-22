console.log("Dashboard script loading");

import { getSession } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const session = getSession();
  const dashboardContent = document.querySelector("main.content");
  const logoutBtn = document.getElementById("logout-btn");

  if (!session) {
    console.warn("No session found, redirecting to login...");
    window.location.href = "login.html";
    return;
  }
  if (dashboardContent) dashboardContent.style.display = "block";
  if (logoutBtn) logoutBtn.style.display = "inline-block";

  logoutBtn?.addEventListener("click", async () => {
    await fetch("http://localhost:8787/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("session");
    window.location.href = "login.html";
  });

  // --- Load reviews ---
  async function loadUserReviews() {
    if (!reviewsContainer) return;
    try {
      const res = await fetch(`${API_BASE}/v1/driver/ratings`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const { data } = await res.json();

      reviewsContainer.innerHTML = "";
      if (!data?.length) {
        reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
        return;
      }

      data.forEach(r => {
        const card = document.createElement("li");
        card.className = "review-card";
        card.innerHTML = `
          <strong>Driver ID: ${r.driver_id}</strong>
          <p>Rating: ${r.rating}/10</p>
          <p>Comment: ${r.comment || "<em>No comment</em>"}</p>
          <small>Submitted: ${new Date(r.created_at).toLocaleString()}</small>
        `;
        reviewsContainer.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      reviewsContainer.innerHTML = "<p>Error loading reviews</p>";
    }
  }

  // --- Logout ---
  logoutBtn?.addEventListener("click", async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "login.html";
  });
});
