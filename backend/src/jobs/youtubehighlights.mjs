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
const CHANNEL_HINT = (process.env.YOUTUBE_CHANNEL_HINT || "").toLowerCase();
const LIMIT = parseInt(process.env.LIMIT_SESSIONS || "10", 10);

if(!SUPABASE_URL || !SERVICE_KEY) throw new Error("Missing Supabase env vars");
if(!YT_KEY) throw new Error("Missing YOUTUBE_API_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {auth: {persistSession: false}});
/** Look up race session
 * search for "(year), (location) highlights"
 * choose best match
 * upsert into race_highlights table
 */

function buildQuery(session, meeting) {
    // Try a few variants to help search relevance
    const year = session.season || (new Date(session.date)).getFullYear();
    const name = meeting.meeting_name || "";
    const country = meeting.country_name || "";
    const circuit = meeting.circuit_short_name || "";
    const q0 = `"Race Highlights |" ${year} ${name}`.trim();
    const q1 = `"Race Highlights" ${year} ${country}`.trim();
    const q2 = `"Race Highlights" ${year} ${circuit}`.trim();
    const q3 = `${year} ${name} highlights`;
    const q4 = `${year} ${country} Grand Prix highlights`;
    const q5 = `${year} F1 race highlights`;
    const q6 = `${year} Formula 1 highlights`;
    return [...new Set([q0, q1, q2, q3, q4, q5, q6].filter(Boolean))];
 }

function publishedWindow(date) {
    // Narrow search to a 14-day window around the race start to avoid old compilations
    try {
        const start = new Date(date);
        const from = new Date(start); from.setDate(from.getDate() - 14);
        const to = new Date(start);   to.setDate(to.getDate() + 21);
        return { publishedAfter: from.toISOString(), publishedBefore: to.toISOString() };
    } catch { return {}; }
}

function pickBestVideo(items, query) {
    // prefer titles that contain "highlights" and the year/location terms,
    // and (optionally) the official channel name hint.
    const queryStr = Array.isArray(query) ? query.join (" ") : String(query || "");

    const request = {
      highlights: /highlight/i,
      year: (queryStr.match(/\b(19|20)\d{2}\b/) || [])[0],
    };
    const terms = queryStr.toLowerCase().split(/\s+/).filter(x => x.length > 2 && x !== "grand" && x !== "prix")

    //temporary to check if api is returning videos
    /*console.log("search results for" , query);
    (data.items || []).forEach(it => {
        console.log("-", it.snippet?.title, "(", it.snippet?.channelTitle, ")");
    });
  */
    let best = null, bestScore = -1;
    for (const it of items) {
      const { title = "", channelTitle = "" } = it.snippet || {};
      const t = (title).toLowerCase();
      const c = (channelTitle).toLowerCase();
  
      let score = 0;
      if (request.highlights.test(t)) score += 5
      if (request.year && t.includes(request.year)) score += 3
      for (const term of terms) if (t.includes(term)) score += 1
      if (CHANNEL_HINT && c.includes(CHANNEL_HINT)) score += 3
  
      // disencourage shorts or “compilation” style
      if (t.includes("shorts")) score -= 3;
  
      if (score > bestScore) { best = it; bestScore = score; }
    }
    return best ? best.id.videoId : null;
  }
  

async function searchYouTube(queries, window) {
    // try 3 query variants from the bundle
    const base = "https://www.googleapis.com/youtube/v3/search";
    for (const q of queries) {
      const url = new URL(base);
      url.searchParams.set("key", YT_KEY);
      url.searchParams.set("part", "snippet");
      url.searchParams.set("maxResults", "5")
      url.searchParams.set("type", "video");
      url.searchParams.set("order", "relevance");
      url.searchParams.set("safeSearch", "strict")
      url.searchParams.set("q", q);
      if (window.publishedAfter) url.searchParams.set("publishedAfter", window.publishedAfter);
      if (window.publishedBefore) url.searchParams.set("publishedBefore", window.publishedBefore);
  
      const results = await fetch(url);
      if (!results.ok) { 
        const body = await results.text();
        console.error("YouTube error", body);
        if (results.status === 403 && /quota/i.test(body)) {
            console.error("Stopping: YouTube API quota exceeded.");
            return null;
        }
        continue;
      }

    const data = await results.json();

    const pick = pickBestVideo(data.items || [], q);
    if (pick) return pick;
    }
    return null;
}


 // fetch meeting metadata from OpenF1 using meeting_key
async function getLocation(meeting_key) {
    try {
        const url = new URL("https://api.openf1.org/v1/meetings");
        url.searchParams.set("meeting_key", String(meeting_key));
        const result = await fetch(url);
        if (!result.ok) return {};
        const rows = await result.json();
        const m = rows?.[0] || {};
            return {
                meeting_name: m.meeting_name,
                country_name: m.country_name,
                circuit_short_name: m.circuit_short_name
            };
    } catch { return {}; }
}


async function main (){
    const {data: races, error } = await supabase
        .from("races")
        .select("session_key, race_type, meeting_key, date, season")
        .eq("race_type", "Race"); // only the main race

    if (error) throw error
    if (!races?.length) {
        console.log("No race sessions found.");
        return
    }

    const { data: existingHighlights } = await supabase.from("race_highlights").select("session_key");
    const done = new Set((existingHighlights || []).map(r => r.session_key));
  
    let processed = 0, inserted = 0, skipped = 0, failed = 0;
  
    for (const r of races) {
        if (processed >= LIMIT) { console.log("Hit LIMIT"); break;}
        if (done.has(r.session_key)) { skipped++; continue; }
  
        const location = await getLocation(r.meeting_key);
        const queries = buildQuery(r, location);  // e.g., "2025 Bahrain Grand Prix highlights"   
        const window = publishedWindow(r.date);
        const videoId = await searchYouTube(queries, window)
    
        if (!videoId) {
            console.log(`No good match: ${queries}`);
            failed++;
            continue;
        }    
        
        const { error: upsertErr } = await supabase
            .from("race_highlights")
            .upsert({ session_key: s.session_key, youtube_video_id: videoId }, { onConflict: "session_key" });

        if (upsertErr) { console.error(upsertErr); failed++; }
        else { inserted++; console.log(`Saved ${queries[0]} -> ${videoId}`); }
        processed++;
    }

    console.log({ inserted, skipped, failed });
}
  
main().catch(err => { console.error(err); process.exit(1); });