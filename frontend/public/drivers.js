// --- Backend API base ---
const API_BASE = "http://localhost:8787";

// --- Fetch drivers ---
async function fetchDrivers() {
  try {
    const res = await fetch(`http://localhost:8787/v1/drivers`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data || [];
  } catch (err) {
    console.error("Failed to fetch drivers:", err);
    return []; // Return empty array so rendering doesn't break
  }
}

// --- Render drivers ---
function renderDrivers(drivers) {
  const container = document.getElementById("drivers-list");
  if (!container) {
    console.error("Container #drivers-list not found in DOM");
    return;
  }

  container.innerHTML = ""; // Clear previous content

  if (!drivers.length) {
    container.innerHTML = "<p>No drivers available.</p>";
    return;
  }

  drivers.forEach(d => {
    const card = document.createElement("div");
    card.className = "driver-card";
    card.innerHTML = `
      <h4>${d.driver_name || "Unknown"}</h4>
      <p>Number: ${d.driver_number ?? "N/A"}</p>
      <p>Team: ${d.driver_team ?? "Unknown Team"}</p>
    `;
    container.appendChild(card);
  });
}

// --- Page load ---
(async () => {
  const drivers = await fetchDrivers();
  renderDrivers(drivers);
})();
