import { Router } from "express";
import { supabaseAnon, setAuthCookies, clearAuthCookies, RT} from "../auth.mjs";

const router = Router();

// Signup: email and password (or use OAuth with supabase auth urls separately)
router.post("/signup", async (req, res) => {
  const { email, password, metadata } = req.body || {};
  const { data, error } = await supabaseAnon.auth.signUp({
    email, password,
    options: { data: metadata || {} },
  });
  if (error) return res.status(400).json({ error });
  // If email confirmation is on, there may be no session yet
  if (data.session) setAuthCookies(res, data.session);
  res.status(201).json({ user: data.user, needs_confirmation: !data.session });
});

// Login: email andpassword, set cookies
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error });
  setAuthCookies(res, data.session);
  res.json({ user: data.user });
});

// Refresh: rotate tokens using refresh_token cookie
router.post("/refresh", async (req, res) => {
  const refresh_token = req.cookies?.[RT];
  if (!refresh_token) return res.status(401).json({ error: { message: "Missing refresh token" } });
  const { data, error } = await supabaseAnon.auth.refreshSession({ refresh_token });
  if (error || !data?.session) return res.status(401).json({ error: error || { message: "Refresh failed" } });
  setAuthCookies(res, data.session);
  res.json({ ok: true });
});

// Logout: clear cookies 
router.post("/logout", async (_req, res) => {
  clearAuthCookies(res);
  res.json({ ok: true });
});

export default router;
