import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase setup for highlights ---
const SUPABASE_URL = 'https://gvlhtpyfjrstlvarzchl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bGh0cHlmanJzdGx2YXJ6Y2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjM0MTgsImV4cCI6MjA3MDk5OTQxOH0.Pco8ziMMBl78eShonOcjZIl4mxCeMANiH42XmWHdNCQ'; // frontend anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Supabase setup for highlights ---
const SUPABASE_URL = 'https://gvlhtpyfjrstlvarzchl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bGh0cHlmanJzdGx2Y2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjM0MTgsImV4cCI6MjA3MDk5OTQxOH0.Pco8ziMMBl78eShonOcjZIl4mxCeMANiH42XmWHdNCQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Fetch drivers ---
async function fetchDrivers() {
  try {
    const res = await fetch(`${API_BASE}/v1/drivers`);
    const result = await res.json();
    console.log("Fetched drivers:", result);

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
    const res = await fetch(`${API_BASE}/v1/teams`);
    const result = await res.json();
    console.log("Fetched teams:", result);

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
    console.log("Fetched races:", result);
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
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-body">
        <h3>${r.race_type || "Race"} — ${r.season || ""}</h3>
        <p>Date: ${r.date ? new Date(r.date).toLocaleDateString() : "TBA"}</p>
        <p><strong>Winner ID:</strong> ${r.first_place_driver || "Unknown"}</p>
        <p><strong>Team ID:</strong> ${r.first_place_team || "Unknown"}</p>
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
    const raceName = item.races.meeting_key;
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

  // Load highlights after races
  await loadHighlights();
})();
