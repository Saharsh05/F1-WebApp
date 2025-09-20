/* drivers.js
let teamsMap = new Map();

// --- Backend API base ---
const API_BASE = "http://localhost:8787";

// --- Fetch drivers ---
async function fetchDrivers() {
  try {
    const res = await fetch(`${API_BASE}/v1/drivers`);
    const result = await res.json();
    return result.data || [];
  } catch (err) {
    console.error("Failed to fetch drivers:", err);
    return [];
  }
}

// --- Render drivers ---
function renderDrivers(drivers) {
  const container = document.getElementById("drivers-list");
  container.innerHTML = "";

  if (!drivers.length) {
    container.innerHTML = "<p>No drivers available.</p>";
    return;
  }

  drivers.forEach(d => {
    const teamName = teamsMap.get(d.team_id) || "Unknown Team";

const container = document.querySelector(".drivers-grid");
    container.innerHTML = "";
    drivers.forEach(d => {
    const card = document.createElement("div");
  card.className = "driver-card";
  card.innerHTML = `
    <h4>${d.driver_name}</h4>
    <p>Number: ${d.driver_number}</p>
    <p>Team: ${d.driver_team}</p>
  `;
  container.appendChild(card);
});

  });
}

// --- Page load ---
(async () => {
  await fetchTeams();
  const drivers = await fetchDrivers();
  renderDrivers(drivers);
})(); */
