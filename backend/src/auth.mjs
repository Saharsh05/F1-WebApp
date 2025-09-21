import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, detectSessionInUrl: false },
});
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, detectSessionInUrl: false },
});

// cookie names
export const AT = "sb-access-token";
export const RT = "sb-refresh-token";

// set/clear cookies
export function setAuthCookies(res, session) {
  if (!session?.access_token || !session?.refresh_token) {
    return res.status(500).json({ error: { message: "Auth session missing tokens" } });
  }

  const common = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  };
  // Access tokens are short-lived; Refresh lasts longer
  res.cookie(AT, session.access_token, { ...common, maxAge: 60 * 60 * 1000 });         // ~1h
  res.cookie(RT, session.refresh_token, { ...common, maxAge: 7 * 24 * 60 * 60 * 1000 });// ~7d
}
export function clearAuthCookies(res) {
  res.clearCookie(AT, { path: "/"});
  res.clearCookie(RT, { path: "/"});
}

// Extract bearer or cookie token
export function getAccessToken(req) {
  const h = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m?.[1] || req.cookies?.[AT] || null;
}

// Per-request client acting AS THE USER (lets RLS run as that user)
export function supabaseAsUser(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

// Middleware: require valid user
export async function requireAuth(req, res, next) {
  try {
    const token = getAccessToken(req);
    if (!token) return res.status(401).json({ error: { message: "Not authenticated" } });

    // Validate & get user
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: { message: "Invalid/expired token" } });

    req.user = data.user;
    req.supabase = supabaseAsUser(token);
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: { message: "Auth error" } });
  }
}
