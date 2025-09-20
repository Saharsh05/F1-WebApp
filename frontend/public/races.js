import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

let driversMap = new Map();
let teamsMap = new Map();

// --- Supabase setup for highlights ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // frontend anon key
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
  if (season) url += `?season=${encodeURIComponent(season)}`;

  try {
    const res = await fetch(url);
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
    const raceName = item.races.meeting_key; // replace with proper race name if available
    const season = item.races.season;

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
  await loadHighlights();
})();
