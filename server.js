// server.js — backend Express para Railway
// La API key vive aquí en el servidor, nunca llega al navegador.
// Railway la lee de la variable de entorno FOOTBALL_DATA_KEY.

import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const API_BASE = "https://api.football-data.org/v4";
const WC = "WC";

// ── Helper para llamar a football-data.org ──
async function footballData(path, params = {}) {
  const apiKey = process.env.FOOTBALL_DATA_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta la variable de entorno FOOTBALL_DATA_KEY. " +
      "Añádela en Railway: Variables → FOOTBALL_DATA_KEY → tu_api_key"
    );
  }
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    headers: { "X-Auth-Token": apiKey },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`football-data.org ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Endpoints del backend ──

// Partidos en directo
app.get("/api/live", async (req, res) => {
  try {
    const data = await footballData(`/competitions/${WC}/matches`, { status: "IN_PROGRESS" });
    res.set("Cache-Control", "public, max-age=15, stale-while-revalidate=5");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Todos los partidos (resultados + próximos)
app.get("/api/fixtures", async (req, res) => {
  try {
    const data = await footballData(`/competitions/${WC}/matches`);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Clasificaciones de grupo
app.get("/api/standings", async (req, res) => {
  try {
    const data = await footballData(`/competitions/${WC}/standings`);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Goleadores
app.get("/api/scorers", async (req, res) => {
  try {
    const data = await footballData(`/competitions/${WC}/scorers`, { limit: 20 });
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check para Railway
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasKey: !!process.env.FOOTBALL_DATA_KEY,
    time: new Date().toISOString(),
  });
});

// ── Servir el frontend (React build) ──
// En producción Railway sirve los archivos del build de Vite
app.use(express.static(join(__dirname, "dist")));

// Cualquier ruta que no sea /api/* devuelve el index.html (SPA)
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(join(__dirname, "dist", "index.html"));
  }
});

app.listen(PORT, () => {
  console.log(`✅ MATCHDAY corriendo en puerto ${PORT}`);
  console.log(`   API key configurada: ${!!process.env.FOOTBALL_DATA_KEY}`);
});
