// Run:  cd backend && node src/jobs/seed-drivers.mjs
// Needs backend/.env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RACES_SOURCE_URL, RACES_YEARS

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env")});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RACES_SOURCE_URL = process.env.RACES_SOURCE_URL;
const RACE_RESULTS_URL = process.env.RACE_RESULTS_URL;
const RACES_YEARS = (process.env.RACES_YEARS || "")
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the .env file");
}

if (!RACES_SOURCE_URL){
    throw new Error("Missing RACES_SOURCE_URL in the .env file");
}

if (!RACES_YEARS){
    throw new Error("Missing RACES_YEARS in the .env fille");
}

if(!RACES_YEARS.length){
    throw new Error("Missing RACES_YEARS in the .env file (comma-separated list expected)");
}

if (!RACE_RESULTS_URL){
    throw new Error("Missing RACE_RESULTS_URL in the .env fille");
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

async function getAllRaces(baseUrl, year){
    const all = [];
    for (const key of year){
        const url = `${baseUrl}?year=${encodeURIComponent(key)}`;
        console.log("Fetching:", url);
        const races = await fetchData(url);
        if (Array.isArray(races)) all.push(...races);
    }
    return all;
}

async function getRaceWin(baseUrl, sessionKey){
    const all = [];
    const url = `${baseUrl}?session_key=${encodeURIComponent(sessionKey)}`;
    console.log("Fetching:", url);
    const raceWin = await fetchData(url);
    if (Array.isArray(raceWin)) all.push(...raceWin);
    return all;
}

async function getTeamId(supabase){
    const {data, error} = await supabase.from("teams").select("id, team_name");
    if (error) throw error;
    const map = new Map();
    for (const i of data || []) {
        if (!i.team_name) continue;
        map.set(String(i.team_name).trim().toLowerCase(), i.id);
    }
    return map;
}

async function getDriverId(supabase){
    const {data, error} = await supabase.from("drivers").select("driver_id, driver_number");
    if (error) throw error;
    const map = new Map();
    for (const i of data || []) {
        if (!i.driver_name) continue;
        map.set(i.driver_number, i.driver_id);
    }
    return map;
}

function normaliseRaces(apiRows,raceWinRows, teamMap, driversMap){
    //if (!Array.isArray(apiArray)) throw new Error ("OpenF1 API did not return an array")

    const output = [];
    const recieved = new Set();

    for (const row of apiRows) {
        const session = row?.session_key;
        if (!session_key) continue;
       // const session_key = String(session).trim();

        const meeting_key = row?.meeting_key;

        const season = row?.year;
    
    for(const row of raceWinRows){
        const rawDriver = row?.driver_number;
        const driver = rawDriver && driversMap.has(rawDriver) ? driversMap.get(rawDriver) : null;
        

    }

/*
        const rawTeam = row?.team_name;
        const teamKey = rawTeam ? String(rawTeam).trim().toLowerCase() : null;
        const team = teamKey && teamMap.has(teamKey) ? teamMap.get(teamKey) :null;
*/

        const duplicateChecker = `${driver_name.toLowerCase()} :: ${number ?? ""}`;
        if (recieved.has(duplicateChecker)) continue;
        recieved.add(duplicateChecker);
        output.push({driver_name, driver_number: number ?? null , driver_team: team ?? null });
    }
    
    return output;
}


async function upsertDrivers(supabase, rows){
    if (!rows.length) return {count : 0};

    //console.log(`Upserting ${teams.length} teams`);
    const { data, error } = await supabase
    .from("drivers")
    .upsert(rows, { onConflict: "driver_name"})
    .select("driver_name");

    if (error)  throw error;
    return {count: data?.length ?? 0};
}
/*
    console.log(`Seeded/updated ${data.length} teams.`)
    for(const row of data) console.log(`${row.id} ${row.team_name}`);
    process.exit(0);
})().catch((err) => {
    console.error("Unhandled error:" , err);
    process.exit(1);
});
*/


(async () => {
    try{
        console.log("Session keys: ", DRIVERS_SESSION_KEYS.join(","));
        const teamMap = await getTeamId(supabase);

        const raw_drivers = await getAllDriversFromSessions(DRIVERS_SOURCE_URL, DRIVERS_SESSION_KEYS);
        const drivers = normaliseDrivers(raw_drivers, teamMap);

        if (!drivers.length) {
            console.warn("No drivers found after normalisation.")
            process.exit(0);
        }
        const {count} = await upsertDrivers(supabase, drivers);
        console.log(`Upserted drivers: ${count}`);
    } catch (err) {
        console.error("Seeding drivers failed: ", err);
        process.exit(1);
    }
})();
    
