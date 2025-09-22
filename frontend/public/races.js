console.log("Races script loaded");

const API_BASE = "http://localhost:8787";
let driversMap = new Map();
let teamsMap = new Map();

// --- Fetch drivers ---
async function fetchDrivers() {
  try {
    const res = await fetch(`${API_BASE}/v1/drivers`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    (result.data || []).forEach(d => {
      driversMap.set(d.driver_id, d.driver_name);
    });
    return result.data || [];
  } catch (err) {
    console.error("Failed to fetch drivers:", err);
    return [];
  }
}

// --- Fetch teams ---
async function fetchTeams() {
  try {
    const res = await fetch(`${API_BASE}/v1/teams`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    (result.data || []).forEach(t => {
      teamsMap.set(t.id, t.team_name);
    });
    return result.data || [];
  } catch (err) {
    console.error("Failed to fetch teams:", err);
    return [];
  }
}

// --- Fetch races ---
async function fetchRaces(season = "") {
  let url = `${API_BASE}/v1/races`;
  if (season && season !== "All Seasons") {
    url += `?season=${encodeURIComponent(season)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data || [];
  } catch (err) {
    console.error("Failed to fetch races:", err);
    return [];
  }
}

// --- Render races ---
function renderRaces(races) {
  const container = document.getElementById("races-list");
  if (!container) {
    console.error("Races container not found in DOM");
    return;
  }

  container.innerHTML = "";
  if (!races.length) {
    container.innerHTML = "<p>No races available.</p>";
    return;
  }

  races.forEach(r => {
    const driverName = driversMap.get(r.first_place_driver) || "Unknown Driver";
    const teamName = teamsMap.get(r.first_place_team) || "Unknown Team";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-body">
        <h3>${r.race_type || "Race"} — ${r.season || ""}</h3>
        <p>Date: ${r.date ? new Date(r.date).toLocaleDateString() : "TBA"}</p>
        <p><strong>Winner:</strong> ${driverName}</p>
        <p><strong>Team:</strong> ${teamName}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- Page load ---
(async () => {
  await fetchDrivers();
  await fetchTeams();

  const races = await fetchRaces();
  renderRaces(races);

  const seasonFilter = document.getElementById("filter-season");
  if (seasonFilter) {
    seasonFilter.addEventListener("change", async (e) => {
      const season = e.target.value;
      const filtered = await fetchRaces(season);
      renderRaces(filtered);
    });
  }
})();
