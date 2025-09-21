console.log("Dashboard script loading");

document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:8787";

  const favDriverBtn = document.getElementById("fav-driver-btn");
  const favTeamBtn = document.getElementById("fav-team-btn");
  const ratingBtn = document.getElementById("rating-btn");
  const reviewsContainer = document.getElementById("reviews-list");

  // --- Load all user reviews ---
  async function loadUserReviews() {
    if (!reviewsContainer) return;

    try {
      const res = await fetch(`${API_BASE}/v1/driver/ratings`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const { data } = await res.json();

      reviewsContainer.innerHTML = "";

      if (!data.length) {
        reviewsContainer.innerHTML = "<p>No reviews yet.</p>";
        return;
      }

      data.forEach(r => {
        const card = document.createElement("div");
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

  // Load reviews on dashboard load
  loadUserReviews();

  // --- Favourite Driver POST ---
  if (favDriverBtn) {
    favDriverBtn.addEventListener("click", async () => {
      const driverSelect = document.getElementById("drivers-select");
      const driverId = Number(driverSelect.value);
      const messageEl = document.getElementById("drivers-message");

      try {
        const res = await fetch(`${API_BASE}/v1/favourites/drivers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ driver_id: driverId })
        });
        if (!res.ok) throw new Error("Failed to save favourite driver");
        messageEl.textContent = "Favourite driver saved!";
        messageEl.style.color = "#0f0";
      } catch (err) {
        console.error(err);
        messageEl.textContent = "Error saving favourite driver";
        messageEl.style.color = "#f66";
      }
    });
  }

  // --- Favourite Team POST ---
  if (favTeamBtn) {
    favTeamBtn.addEventListener("click", async () => {
      const teamSelect = document.getElementById("teams-select");
      const teamId = Number(teamSelect.value);
      const messageEl = document.getElementById("teams-message");

      try {
        const res = await fetch(`${API_BASE}/v1/favourites/teams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ team_id: teamId })
        });
        if (!res.ok) throw new Error("Failed to save favourite team");
        messageEl.textContent = "Favourite team saved!";
        messageEl.style.color = "#0f0";
      } catch (err) {
        console.error(err);
        messageEl.textContent = "Error saving favourite team";
        messageEl.style.color = "#f66";
      }
    });
  }

  // --- Driver Rating POST ---
  if (ratingBtn) {
    ratingBtn.addEventListener("click", async () => {
      const driverSelect = document.getElementById("rating-driver-select");
      const driverId = Number(driverSelect.value);
      const rating = Number(document.getElementById("driver-rating").value);
      const comment = document.getElementById("driver-comment").value.trim();
      const messageEl = document.getElementById("rating-message");

      if (!driverId || isNaN(rating) || rating < 1 || rating > 10) {
        messageEl.textContent = "Select driver and rating 1-10";
        messageEl.style.color = "#f66";
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/v1/driver/ratings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ driver_id: driverId, session_key: 1, rating, comment })
        });
        if (!res.ok) throw new Error("Failed to submit rating");

        const { data } = await res.json();
        messageEl.textContent = "Rating submitted!";
        messageEl.style.color = "#0f0";

        // Immediately add the new review to the top of the list
        if (reviewsContainer) {
          const card = document.createElement("div");
          card.className = "review-card";
          card.innerHTML = `
            <strong>Driver ID: ${data.driver_id}</strong>
            <p>Rating: ${data.rating}/10</p>
            <p>Comment: ${data.comment || "<em>No comment</em>"}</p>
            <small>Submitted: ${new Date(data.created_at).toLocaleString()}</small>
          `;
          reviewsContainer.prepend(card); // Add on top
        }

      } catch (err) {
        console.error(err);
        messageEl.textContent = "Error submitting rating";
        messageEl.style.color = "#f66";
      }
    });
  }

});
