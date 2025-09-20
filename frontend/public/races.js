import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

<<<<<<< HEAD
// --- Backend API base ---
const API_BASE = "http://localhost:8787";

// --- Supabase setup for highlights ---
const SUPABASE_URL = 'https://gvlhtpyfjrstlvarzchl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bGh0cHlmanJzdGx2Y2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjM0MTgsImV4cCI6MjA3MDk5OTQxOH0.Pco8ziMMBl78eShonOcjZIl4mxCeMANiH42XmWHdNCQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Fetch races ---
async function fetchRaces(season = "") {
  let url = `${API_BASE}/v1/races`;
=======
let driversMap = new Map();
let teamsMap = new Map();

// --- Supabase setup for highlights ---
const SUPABASE_URL = 'https://gvlhtpyfjrstlvarzchl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bGh0cHlmanJzdGx2YXJ6Y2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjM0MTgsImV4cCI6MjA3MDk5OTQxOH0.Pco8ziMMBl78eShonOcjZIl4mxCeMANiH42XmWHdNCQ'; // frontend anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Fetch drivers ---
async function fetchDrivers() {
  try {
    const res = await fetch("/v1/drivers");
    const result = await res.json();
    (result.data || []).forEach(d => {
      driversMap.set(d.driver_id, d.driver_name);
    });
  } catch (err) {
    console.error("Failed to fetch drivers:", err);
  }
}

// --- Fetch teams ---
async function fetchTeams() {
  try {
    const res = await fetch("/v1/teams");
    const result = await res.json();
    (result.data || []).forEach(t => {
      teamsMap.set(t.id, t.team_name);
    });
  } catch (err) {
    console.error("Failed to fetch teams:", err);
  }
}

// --- Fetch races ---
async function fetchRaces(season = "") {
  let url = "/v1/races";
>>>>>>> 823bfab (created driver and races tab)
  if (season) url += `?season=${encodeURIComponent(season)}`;

  try {
    const res = await fetch(url);
    const result = await res.json();
<<<<<<< HEAD
    console.log("Fetched races:", result);
=======
>>>>>>> 823bfab (created driver and races tab)
    return result.data || [];
  } catch (err) {
    console.error("Failed to fetch races:", err);
    return [];
  }
}

// --- Render races ---
function renderRaces(races) {
  const container = document.getElementById("races-list");
<<<<<<< HEAD
  if (!container) {
    console.error("Races container not found in DOM");
    return;
  }

=======
>>>>>>> 823bfab (created driver and races tab)
  container.innerHTML = "";

  if (!races.length) {
    container.innerHTML = "<p>No races available.</p>";
    return;
  }

  races.forEach(r => {
<<<<<<< HEAD
=======
    const driverName = driversMap.get(r.first_place_driver) || "Unknown Driver";
    const teamName = teamsMap.get(r.first_place_team) || "Unknown Team";

>>>>>>> 823bfab (created driver and races tab)
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-body">
        <h3>${r.race_type || "Race"} — ${r.season || ""}</h3>
        <p>Date: ${r.date ? new Date(r.date).toLocaleDateString() : "TBA"}</p>
<<<<<<< HEAD
        <p><strong>Winner ID:</strong> ${r.first_place_driver || "Unknown"}</p>
        <p><strong>Team ID:</strong> ${r.first_place_team || "Unknown"}</p>
=======
        <p><strong>Winner:</strong> ${driverName}</p>
        <p><strong>Team:</strong> ${teamName}</p>
>>>>>>> 823bfab (created driver and races tab)
      </div>
    `;
    container.appendChild(card);
  });
}

// --- Fetch and render highlights ---
async function loadHighlights() {
  const { data, error } = await supabase
    .from('race_highlights')
    .select(`
      session_key,
      youtube_video_id,
      races!inner(meeting_key, season)
    `)
    .order('session_key', { ascending: false });

  if (error) {
    console.error("Failed to fetch highlights:", error);
    return;
  }

  const grid = document.getElementById('highlights-grid');
  if (!grid) return;
  grid.innerHTML = '';

  data.forEach(item => {
    const videoId = item.youtube_video_id;
<<<<<<< HEAD
    const raceName = item.races.meeting_key || "Race";
    const season = item.races.season || "";
=======
    const raceName = item.races.meeting_key; // replace with proper race name if available
    const season = item.races.season;
>>>>>>> 823bfab (created driver and races tab)

    const card = document.createElement('div');
    card.className = 'highlight-card';
    card.innerHTML = `
      <h3>${raceName} - ${season}</h3>
      <iframe 
        src="https://www.youtube.com/embed/${videoId}" 
        frameborder="0" 
        allowfullscreen
      ></iframe>
    `;
    grid.appendChild(card);
  });
}

// --- Page load ---
(async () => {
<<<<<<< HEAD
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

=======
  await fetchDrivers();
  await fetchTeams();

  const races = await fetchRaces();
  renderRaces(races);

  document.getElementById("filter-season").addEventListener("change", async (e) => {
    const season = e.target.value;
    const filtered = await fetchRaces(season);
    renderRaces(filtered);
  });

  // Load highlights after races
>>>>>>> 823bfab (created driver and races tab)
  await loadHighlights();
})();
