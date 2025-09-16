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
        const types = Strong(race_type).split(",").map(s => s.trim()).filter(Boolean);
        query = types.length === 1
            ? query.eq("race_type", types[0])
            : query.in("race_type" , types);
    }

    const { data, error } = await query;
    if (error) return sendError(result, 500, "Database error", error.message);
    result.json({ data, pagination: { limit: Number(limit), offset: Number(offset) } });
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));