// Needs backend/.env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, YOUTUBE_API_KEY, YOUTUBE_CHANNEL_HINT

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {createClient} from "@supabase/supabase-js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path:path.join(__dirname, "..", "..", ".env")});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const YT_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_CHANNEL_HINT = (process.env.YOUTUBE_CHANNEL_HINT || "").toLowerCase();

if(!SUPABASE_URL || !SERVICE_KEY) throw new Error("Missing Supabase env vars");
if(!YT_KEY) throw new Error("Missing YOUTUBE_API_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {auth: {persistSession: false}});
/** Look up race session
 * search for "(year), (location) highlights"
 * choose best match
 * upsert into race_highlights table
 */