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
    throw new Error("Missing RACES_YEARS in the .env file");
}

if(!RACES_YEARS.length){
    throw new Error("Missing RACES_YEARS in the .env file (comma-separated list expected)");
}

if (!RACE_RESULTS_URL){
    throw new Error("Missing RACE_RESULTS_URL in the .env file");
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

function getField(obj, ...keys){
    for (const k of keys){
        if (obj && obj[k] != null) return obj[k];
    }
    return null;
}

//fetches driver_id and team when given driver number
async function getWinner(number){
    if (number == null) return {winner_driver_id: null, winner_team_id: null};

    const {data, error} = await supabase.from("drivers").select("driver_id, driver_team")
        .eq("driver_number", number)
        .maybeSingle();
    if (error) throw error;

    return {
        winner_driver_id: data.driver_id ?? null,
        winner_team_id: data.driver_team ?? null,
    };
}

  /*  const map = new Map();
    for (const i of data || []) {
        if (!i.team_name) continue;
        map.set(String(i.team_name).trim().toLowerCase(), i.id);
    }
    return map;
} */

//all sessions in a given year (all races since 2023)

async function getAllSessions(baseUrl, year){
    const all = [];
    for (const i of year){
        const url = `${baseUrl}?year=${encodeURIComponent(i)}`;
        console.log("Fetching sessions:", url);
        const sessions = await fetchData(url);
        if (Array.isArray(sessions)) {
            for (const s of sessions){
                const x = (s.session_type ?? s.type ?? s.session_name ?? s.name ?? "").toString().toLowerCase();
                if (x.includes("race")) all.push(s);
            
            }
        }
    }
    return all;
}

//find P1 placer
async function getWinnerNumber(session_key){
    const url = `${RACE_RESULTS_URL}?session_key=${encodeURIComponent(session_key)}`;
    console.log("Fetching:", url);
    const results = await fetchData(url);
    if (Array.isArray(results) || results.length === 0) return null;

    const p1 = results.find((r) => Number(r.position) === 1);
    const num = p1?.driver_number ?? null;
    return num = null ? null : Number(num);
}

//drivers by number map
async function makeDriversByNumberMap(){
    const { data, error } = await supabase
    .from("drivers")
    .select("driver_number, driver_id, driver_team");
    if (error) throw error;

    const drivers = new Map();
    for (const r of data || []) {
        if (r.driver_number == null) continue;
        drivers.set(Number(r.driver_number), {driver_id: r.driver_id, team_id: r.driver_team ?? null});
    }
    return drivers;
}

async function normaliseRaces(sessions, driversMap){
    const output = [];

    for(const i of sessions){
        const session_key = getField(i, "session_key");
        if (!session_key) continue;

        const year = getField(i, "year");
        const raceType = getField(i, "session_name");
        const meeting_key = getField(i, "meeting_key");
        const date = getField(i, "date_start");

        const winner_number = await getWinnerNumber(session_key);
        if (winner_number == null){
            console.warn(`Skipping session ${session_key}: no P1 driver_number`);
            continue;
        }

        const mapEntry = driversMap.get(winner_number);
        if(!mapEntry || !mapEntry.driver_id){
            console.warn(`Skipping session ${session_key}: driver_number ${winner_number} not in DB`)
            continue;
        }

        const row = {
            session_key: session_key,
            meeting_key: meeting_key ?? null,
            season: year ?? null,
            first_place_driver: mapEntry.driver_id,
            first_place_team: mapEntry.team_id ?? null,
            race_type: raceType ?? null,
            date: date ?? null
        };

        //trimming
        for (const k of Object.keys(row)){
            if (typeof row[k] === "string") row[k] = row[k].trim();
        }

        output.push(row);
    }

    return output;

/*
        const rawTeam = row?.team_name;
        const teamKey = rawTeam ? String(rawTeam).trim().toLowerCase() : null;
        const team = teamKey && teamMap.has(teamKey) ? teamMap.get(teamKey) :null;


        const duplicateChecker = `${driver_name.toLowerCase()} :: ${number ?? ""}`;
        if (recieved.has(duplicateChecker)) continue;
        recieved.add(duplicateChecker);
        output.push({driver_name, driver_number: number ?? null , driver_team: team ?? null });
    }
    
    return output;
    */
}

/*
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
*/

async function upsertRaces(rows){
    if (!rows.length) return {count : 0};

    console.log(`Upserting ${rows.length} races`);
    const { data, error } = await supabase
    .from("races")
    .upsert(rows, { onConflict: "session_key"})
    .select("session_key");

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
        console.log("Years: ", RACES_YEARS.join(","));
        const raw_races = await getAllSessions(RACES_SOURCE_URL, RACES_YEARS);

        if (!raw_races.length){
            console.warn("No race sessions found for the requested years.");
            process.exit(0);
        }

        const driversMap = await makeDriversByNumberMap();
        const rows = await normaliseRaces(raw_races, driversMap)
        const filtered = rows.filter((r) => r.session_key);

        if (!filtered.length) {
            console.warn("No rows found after normalisation.")
            process.exit(0);
        }
        const {count} = await upsertRaces(filtered);
        console.log(`Upserted races: ${count}`);
        process.exit(0);
    } catch (err) {
        console.error("Seeding races failed: ", err);
        process.exit(1);
    }
})();
