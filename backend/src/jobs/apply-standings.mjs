import dotenv from "dotenv";
import path from "path";

import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env")});

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {auth: { persistSession: false }}
);

//assigning race points from p1-10 (race) and p1-8(sprint)
const RACE_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];

function typeOfPoints(raceType, position){
    if (position == null || position <= 0) return 0;
    if(sessionType === "Sprint") return SPRINT_POINTS[position -1] ?? 0;
    return RACE_POINTS[position -1] ?? 0; //defaults to Race
}

