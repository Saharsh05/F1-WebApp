console.log("Teams script loading...");

const button = document.getElementById("fetch-teams-btn");
if (button) {
    console.log("Found button!");
    button.addEventListener("click", async () => {
        const teams = await fetchTeams();
        renderTeams(teams);
    });
} else {
    console.warn("Fetch Teams button not found");
}

const API_BASE = "http://localhost:8787";

// --- Fetch teams ---
async function fetchTeams() {
    try {
        const res = await fetch(`${API_BASE}/v1/teams`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        return data.data || [];
    } catch (err) {
        console.error("Failed to fetch teams:", err);
        return [];
    }
}

// --- Render teams ---
function renderTeams(teams) {
    const container = document.getElementById("teams-list");
    if (!container) {
        console.error("Container #teams-list not found in DOM");
        return;
    }

    container.innerHTML = ""; // Clear before rendering

    if (!teams.length) {
        container.innerHTML = "<p>No teams available.</p>";
        return;
    }

    teams.forEach(t => {
        const card = document.createElement("div");
        card.className = "team-card";
        card.innerHTML = `
            <div class="team-logo"></div>
            <h4>${t.team_name || "Unknown Team"}</h4>
            <div class="drivers">
                Drivers: Driver #${t.driver1} · Driver #${t.driver2}
            </div>
            <p>Constructors Titles: ${t.constructors_titles_count ? t.constructors_titles_count.join(", ") : "None"}</p>
        `;
        container.appendChild(card);
    });
}
