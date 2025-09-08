// Run:  cd backend && node src/jobs/seed-teams.mjs
// Needs backend/.env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DRIVERS_SOURCE_URL, DRIVERS_SESSION_KEYS

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env")});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEAMS_SOURCE_URL = process.env.TEAMS_SOURCE_URL

if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the .env file");
}

if (!TEAMS_SOURCE_URL){
    throw new Error("Missing TEAMS_SOURCE_URL in the .env file");
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {auth: {persistSession: false}})

async function fetchData(url, retries = 3) {
    let finalError;
    for (let i = 0; i < retries; i++){
        try {
            const check = await fetch(url, { headers: { "accept": "application/json"} });
            if (!check.ok) throw new Error( `${check.status} ${check.statusText}`);
            return await check.json();
        } catch (err) {
            finalError = err;
            const waitTime = 500 * (i +1);
            console.warn(`fetch attempt ${i +1} failed: ${err}. Retrying in ${waitTime} ms`)
            await new Promise(r => setTimeout(r, waitTime));
        }
    }
    throw finalError
}

function normaliseTeams(apiArray){
    if (!Array.isArray(apiArray)) throw new Error ("OpenF1 API did not return an array")

    const output = [];
    const recieved = new Set();

    for (const item of apiArray) {
        const name = item?.team_name;

        if (!name) continue;
        const team_name = String(name).trim();

        if (!team_name || recieved.has(team_name.toLowerCase())) continue;
        recieved.add(team_name.toLowerCase());
        output.push({team_name});
    }
    
    return output;
}

(async () => {
    console.log("Fetching teams from: ", TEAMS_SOURCE_URL);
    const raw_teams = await fetchData(TEAMS_SOURCE_URL);
    const teams = normaliseTeams(raw_teams);

    if (!teams.length) {
        console.warn("No teams found")
        process.exit(0);
    }

    console.log(`Upserting ${teams.length} teams`);
    const { data, error } = await supabase
    .from("teams")
    .upsert(teams, { onConflict: "team_name"})
    .select("id, team_name");

    if (error) {
        console.error("Seeding failed: ", error);
        process.exit(1);
    }

    console.log(`Seeded/updated ${data.length} teams.`)
    for(const row of data) console.log(`${row.id} ${row.team_name}`);
    process.exit(0);
})().catch((err) => {
    console.error("Unhandled error:" , err);
    process.exit(1);
});