console.log("Script loading");

const button = document.getElementById("fetch-btn");
if (button) {
  console.log("found button!");
  button.addEventListener("click", async () => {
    const drivers = await fetchDrivers();
    console.log("fetch-btn:", drivers);
    renderDrivers(drivers); // <--- now it actually shows on the page
  });
} else {
  console.log("Button not found?! - maybe DOM not fully loaded???");
}

// --- Backend API base ---
const API_BASE = "http://localhost:8787";

// --- Fetch drivers ---
async function fetchDrivers() {
  try {
    const res = await fetch(`${API_BASE}/v1/drivers?q=hamilton&limit=50`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    console.log("Fetched drivers:", data);
    return data.data || [];   // <--- return the array of drivers
  } catch (err) {
    console.error("Failed to fetch drivers:", err);
    return []; // return empty array on error
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
