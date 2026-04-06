import { supabase } from "./supabase";

/**
 * Records a single page view in the `page_views` table.
 *
 * Best-effort and silent: any failure (network, RLS, missing env) is logged
 * to the console in dev and swallowed otherwise. Analytics must never break
 * the user-facing app.
 *
 * Uses sessionStorage to dedupe so that React StrictMode double-mounts (and
 * client-side route changes that resolve to the same path) don't double-count.
 */
export async function trackPageView(): Promise<void> {
  if (typeof window === "undefined") return;

  const path = window.location.pathname + window.location.search;

  try {
    const dedupeKey = `pv:${path}`;
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, "1");
  } catch {
    // sessionStorage may be unavailable (private mode, etc) — proceed anyway.
  }

  const { error } = await supabase.from("page_views").insert({
    path,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent || null,
  });

  if (error && import.meta.env.DEV) {
    console.warn("[analytics] page_view insert failed:", error.message);
  }
}
