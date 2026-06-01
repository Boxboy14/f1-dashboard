// Maps OpenF1 team_name values → TheSportsDB badge URLs (r2.thesportsdb.com CDN).
// Covers all team names across 2023, 2024, and 2025 seasons including sponsor rebrands.
// Append /tiny for 100px version — sufficient at the 24px grid display size.
// Williams has no entry in TheSportsDB; rows without a match render without an icon.
const BASE = "https://r2.thesportsdb.com/images/media/team/badge";

const TEAM_LOGO_MAP = {
  // ── 2023 / 2024 / 2025 ──────────────────────────────────────────────────
  "Red Bull Racing": `${BASE}/nhlev81679826274.png/tiny`,
  McLaren: `${BASE}/kzqi7v1743602056.png/tiny`,
  Ferrari: `${BASE}/rxwsqv1420417429.png/tiny`,
  Mercedes: `${BASE}/6caw0r1744037679.png/tiny`,
  "Aston Martin": `${BASE}/ez5rlk1740774066.png/tiny`,
  Alpine: `${BASE}/ozhoj31740774899.png/tiny`,
  "Haas F1 Team": `${BASE}/9yp3s51740773680.png/tiny`,

  // ── RB lineage (Alpha Tauri → AlphaTauri → RB / VCARB) ──────────────────
  RB: `${BASE}/ot7pjx1740775883.png/tiny`,
  AlphaTauri: `${BASE}/ot7pjx1740775883.png/tiny`,
  "Scuderia AlphaTauri": `${BASE}/ot7pjx1740775883.png/tiny`,

  // ── Sauber lineage (Alfa Romeo → Kick Sauber → Audi) ────────────────────
  "Kick Sauber": `${BASE}/3uce6h1773158180.png/tiny`,
  "Alfa Romeo": `${BASE}/3uce6h1773158180.png/tiny`,
};

export default TEAM_LOGO_MAP;
