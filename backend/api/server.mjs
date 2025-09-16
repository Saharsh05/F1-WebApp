import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"]}));
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth: { persistSession: false}});

const sendError = (result, code, message, detail) =>
    result.status(code).json({error: { code, message, detail }});

app.get("/v1/races", async (request, result) => {
    const { year, q, limit = 50, offset = 0} = request.query;
    let query = supa.from("api_v1_races").select("*").order("round" , { ascending: true})
        .range(Number(offset), Number(offset) + Number(limit) -1);
    if (year) query = query.eq("year ", Number(year));
    if (q) query = query.ilike("grand_prix_name", `%${q}%`);

    const { data, error } = await query;
    if (error) return sendError(result, 500, "Database error", error.message);
    result.json({ data });
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));