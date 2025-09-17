import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"]}));
app.use(express.json());
app.get("/health" , (request, result) => result.json({ok:true}));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth: { persistSession: false}});

const sendError = (result, code, message, detail) =>
    result.status(code).json({error: { code, message, detail }});

app.get("/v1/races", async (request, result) => {
    const { race_type, limit = 50, offset = 0} = request.query;
    const season = request.query.season ?? request.query.year;
    
    let query = supabase.from("api_v1_races").select("*").order("date" , { ascending: true})
        .range(Number(offset), Number(offset) + Number(limit) -1);

    if (season !== undefined) query = query.eq("season", Number(season));
    if (race_type) {
        const types = String(race_type).split(",").map(s => s.trim()).filter(Boolean);
        query = types.length === 1
            ? query.eq("race_type", types[0])
            : query.in("race_type" , types);
    }

    const { data, error } = await query;
    if (error) return sendError(result, 500, "Database error", error.message);
    result.json({ data, pagination: { limit: Number(limit), offset: Number(offset) } });
});

app.get("/v1/drivers", async (request, result) => {
    const { driver_team, limit = 50, offset = 0} = request.query;
    const driver_id = request.query.driver_id;
    const driver_number = request.query.driver_number;
    const driver_name = request.query.driver_name?.toString().trim();
    const teamIdList = request.query.team_id?.toString();
    
    let query = supabase.from("api_v1_drivers").select("*").order("driver_id" , { ascending: true})
        .range(Number(offset), Number(offset) + Number(limit) -1);

    if (driver_team !== undefined) query = query.eq("driver_team", String(driver_team))

    if (driver_id) {
        const ids = driver_id.split(",").map(n => Number(n)).filter(Number.isFinite);
        query = ids.length > 1 ? query.in("driver_id", ids) : query.eq("driver_id", ids[0]);
        }
    if (driver_number) {
        const nums = driver_number.split(",").map(n => Number(n)).filter(Number.isFinite);
        query = nums.length > 1 ? query.in("driver_number", nums) : query.eq("driver_number", nums[0]);
    }
    if (teamIdList) {
        const teamIds = teamIdList.split(",").map(n => Number(n)).filter(Number.isFinite);
        query = teamIds.length > 1 ? query.in("team_id", teamIds) : query.eq("team_id", teamIds[0]);
    }

    if (driver_name) {
        query = query.or(`driver_name.ilike.%${driver_name}%`);
    }

    const { data, error } = await query;
    if (error) return sendError(result, 500, "Database error", error.message);
    result.json({ data, pagination: { limit: Number(limit), offset: Number(offset) } });
});


const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));