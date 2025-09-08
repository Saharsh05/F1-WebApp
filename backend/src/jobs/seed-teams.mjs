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
if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Misssing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the .env file");

}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {auth: {persistSession: false}})