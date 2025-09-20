import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//import dotenv from "dotenv";
//dotenv.config();

import authRoutes from "../src/routes/authRoutes.mjs";
import { requireAuth } from "../src/auth.mjs";
import { createClient } from "@supabase/supabase-js";

const app = express();

//app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"],
            credentials: true,
        //}));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//Public
app.get("/health" , (request, result) => result.json({ok:true}));

app.use("/auth", authRoutes)
;
//const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {auth: { persistSession: false}});
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


const sendError = (result, code, message, detail) =>
    result.status(code).json({error: { code, message, detail }});

// GET /v1/drivers
app.get("/v1/drivers", async (req, res) => {
  const { data, error } = await supabase.from("drivers").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// GET /v1/races
app.get("/v1/races", async (req, res) => {
  const { data, error } = await supabase.from("races").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

/*app.get("/v1/races", async (request, result) => {
    const { race_type, limit = 50, offset = 0} = request.query;
    const season = request.query.season ?? request.query.year;
    const session_key = request.query.session_key;
    const meeting_key = request.query.meeting_key;
    const first_place_driver = request.query.first_place_driver;
    const first_place_team = request.query.first_place_team;
    const date = request.query.date;
    
    let query = supabase.from("api_v1_races").select("*").order("date" , { ascending: true})
        .range(Number(offset), Number(offset) + Number(limit) -1);

    if (season !== undefined) query = query.eq("season", Number(season));
    if (session_key !== undefined) query = query.eq("session_key", Number(session_key));
    if (meeting_key !== undefined) query = query.eq("meeting_key", String(meeting_key));
    if (first_place_driver !== undefined) query = query.eq("first_place_driver", Number(first_place_driver));
    if (first_place_team !== undefined) query = query.eq("first_place_team", Number(first_place_team));
    if (date !== undefined) query = query.eq("date", (date));
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

/*app.get("/v1/drivers", async (request, result) => {
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
});*/

/*app.get("/v1/teams", async (request, result) => {
    const { id, limit = 50, offset = 0} = request.query;
    const team_name = request.query.team_name;

    let query = supabase.from("api_v1_teams").select("*").order("id" , { ascending: true})
        .range(Number(offset), Number(offset) + Number(limit) -1);

    if (id !== undefined) query = query.eq("id", Number(id))

    if (team_name) {
        query = query.or(`team_name.ilike.%${team_name}%`);
    }

    const { data, error } = await query;
    if (error) return sendError(result, 500, "Database error", error.message);
    result.json({ data, pagination: { limit: Number(limit), offset: Number(offset) } });
});*/

// Body: { driver_id: number, season?: number } - this is actually commented out

app.post("/v1/favourites/drivers", requireAuth, async (req, res) => {
  const driver_id = Number(req.body?.driver_id);
  const season = req.body?.season === undefined ? null : Number(req.body.season);

  if (!Number.isFinite(driver_id)) {
    return res.status(400).json({ error: { message: "driver_id (number) is required" } });
  }
  if (season !== null && !Number.isFinite(season)) {
    return res.status(400).json({ error: { message: "season must be a number if provided" } });
  }

  const payload = {
    user_id: req.user.id,     
    driver_id,
    season,                  
  };

  const { data, error } = await req.supabase
    .from("user_favourite_drivers")
    .insert(payload)
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  res.status(201).json({ data });
});

// Body: { team_id: number, season?: number }
app.post("/v1/favourites/teams", requireAuth, async (req, res) => {
  const team_id = Number(req.body?.team_id);
  const season = req.body?.season === undefined ? null : Number(req.body.season);

  if (!Number.isFinite(team_id)) {
    return res.status(400).json({ error: { message: "team_id (number) is required" } });
  }
  if (season !== null && !Number.isFinite(season)) {
    return res.status(400).json({ error: { message: "season must be a number if provided" } });
  }

  const payload = {
    user_id: req.user.id,     
    team_id,
    season,              
  };

  const { data, error } = await req.supabase
    .from("user_favourite_teams")
    .insert(payload)
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  res.status(201).json({ data });
});

/**
 * POST /v1/driver/ratings
 * Body: { driver_id: number, session_key: number, rating: number, comment?: string }
 */
app.post("/v1/driver/ratings", requireAuth, async (req, res) => {
    const driver_id = Number(req.body?.driver_id);
    const session_key = Number(req.body?.session_key);
    const rating = Number(req.body?.rating);
    const comment = (req.body?.comment ?? "").toString().trim();
  
    // Basic validation
    if (!Number.isFinite(driver_id)) {
      return res.status(400).json({ error: { message: "driver_id (number) is required" } });
    }
    if (!Number.isFinite(session_key)) {
      return res.status(400).json({ error: { message: "session_key (number) is required" } });
    }
    if (!Number.isFinite(rating)) {
      return res.status(400).json({ error: { message: "rating (number) is required" } });
    }
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: { message: "rating must be between 1 and 10" } });
    }
    if (comment.length > 1000) {
      return res.status(400).json({ error: { message: "comment too long (max 1000 chars)" } });
    }
  
    const payload = {
      user_id: req.user.id,      // enforce owner
      driver_id,
      session_key,
      rating,
      comment: comment || null,  // allow null in DB
    };
  
    const { data, error } = await req.supabase
      .from("driver ratings")
      .insert(payload)
      .select()
      .single();
  
    if (error) return res.status(400).json({ error });
    res.status(201).json({ data });
  });

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));