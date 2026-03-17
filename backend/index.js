import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from backend/.env
dotenv.config();

const {
  HSM_SUPABASE_URL,
  HSM_ANON_KEY,
  CIE_SUPABASE_URL,
  CIE_SERVICE_ROLE_KEY,
  PORT = 5000,
} = process.env;

// Basic startup checks so you immediately know if a key is missing.
const requiredEnv = [
  "HSM_SUPABASE_URL",
  "HSM_ANON_KEY",
  "CIE_SUPABASE_URL",
  "CIE_SERVICE_ROLE_KEY",
];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(
    `Missing required env vars in backend/.env: ${missing.join(", ")}`
  );
  process.exit(1);
}

/**
 * Supabase client for your HSM project (uses anon/public key).
 * - Safe to use server-side, but doesn't grant admin permissions.
 * - You can use this later if you want to write citizen data into YOUR HSM DB.
 */
const hsm = createClient(HSM_SUPABASE_URL, HSM_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Supabase client for your classmate’s CIE project (uses service-role key).
 * - IMPORTANT: Never put this key in the frontend.
 * - Keep all CIE access strictly inside this backend.
 */
const cie = createClient(CIE_SUPABASE_URL, CIE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const app = express();

// CORS allows your frontend (Vite on :5173) to call this backend (default :5000).
// If you deploy later, replace "*" with your real site URL(s).
app.use(
  cors({
    origin: true,
    credentials: false,
  })
);
app.use(express.json());

// Change this if your CIE table name is different.
const CITIZENS_TABLE = "citizen";

// Health check (quick way to verify server is running)
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/**
 * ============================================================
 * TEMPORARY DEBUG ROUTES
 * ------------------------------------------------------------
 * These routes help you inspect your classmate's CIE database
 * to discover the real table and column names.
 *
 * IMPORTANT:
 * - They use the CIE service-role key on the server ONLY.
 * - They NEVER return the key itself.
 * - REMOVE all of these routes once you know the correct names.
 * ============================================================
 */

/**
 * GET /api/debug/tables
 * (May not work on all Supabase setups; safe to ignore if it errors.)
 */
app.get("/api/debug/tables", async (_req, res) => {
  try {
    const { data, error } = await cie
      // Try querying Postgres catalog view for tables
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .order("table_name");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(data ?? []);
  } catch (e) {
    return res
      .status(500)
      .json({ error: e?.message ?? "Unexpected error fetching tables" });
  }
});

/**
 * GET /api/debug/columns/:table
 * (May not work on all Supabase setups; safe to ignore if it errors.)
 */
app.get("/api/debug/columns/:table", async (req, res) => {
  const { table } = req.params;

  if (!table) {
    return res
      .status(400)
      .json({ error: "Table name is required in the URL path." });
  }

  try {
    const { data, error } = await cie
      // Try querying Postgres catalog view for columns
      .from("information_schema.columns")
      .select("column_name,data_type")
      .eq("table_schema", "public")
      .eq("table_name", table)
      .order("ordinal_position");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(data ?? []);
  } catch (e) {
    return res
      .status(500)
      .json({ error: e?.message ?? "Unexpected error fetching columns" });
  }
});

/**
 * GET /api/debug/find-table
 *
 * TEMPORARY DEBUG ROUTE
 * ---------------------
 * This route tries a list of likely table names in your classmate's
 * CIE Supabase project and attempts to fetch a single row from each.
 *
 * - It uses the existing CIE Supabase client with the service-role key,
 *   but NEVER returns the key itself.
 * - It only returns the table name and column names (object keys).
 * - Once you know the correct table + columns, DELETE this route (and
 *   the other debug routes above) to keep your backend clean.
 */
app.get("/api/debug/find-table", async (_req, res) => {
  // List of likely table names to try. You can add/remove names if needed.
  const candidateTables = [
    "citizens",
    "citizen",
    "tbl_citizens",
    "users",
    "tbl_users",
    "people",
  ];

  try {
    for (const tableName of candidateTables) {
      // Try selecting a single row from the candidate table
      const { data, error } = await cie
        .from(tableName)
        .select("*")
        .limit(1);

      // If Supabase says the relation doesn't exist or other table error, skip to the next candidate
      if (error) {
        continue;
      }

      // If we got back at least one row, we consider this table "found"
      if (data && data.length > 0) {
        const row = data[0];

        // Get column names from the object keys
        const columns = Object.keys(row);

        return res.json({
          table: tableName,
          columns,
        });
      }
    }

    // If we reach here, none of the candidate tables worked
    return res.status(404).json({
      error: "No matching table found in candidate list. Try adding more names.",
    });
  } catch (e) {
    return res.status(500).json({
      error: e?.message ?? "Unexpected error while probing tables",
    });
  }
});

/**
 * ============================================================
 * CITIZEN API ROUTES
 * ------------------------------------------------------------
 * These are your main application routes that your frontend
 * will use. They stay in place even after you remove the
 * debug routes above.
 * ============================================================
 */

/**
 * GET /api/citizen/search?q=
 * Search citizens by first_name OR last_name.
 *
 * Notes:
 * - This assumes columns: first_name, last_name
 * - "ilike" is case-insensitive pattern matching in Postgres.
 */
app.get("/api/citizen/search", async (req, res) => {
  const qRaw = typeof req.query.q === "string" ? req.query.q : "";
  const q = qRaw.trim();

  if (!q) {
    return res.status(400).json({
      error: "Missing query param: q",
      example: "/api/citizen/search?q=juan",
    });
  }

  try {
    const { data, error } = await cie
      .from(CITIZENS_TABLE)
      .select("*")
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .limit(100);

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch (e) {
    return res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});

/**
 * GET /api/citizen
 * Return all citizens (capped to 1000 to avoid huge payloads).
 */
app.get("/api/citizen", async (_req, res) => {
  try {
    const { data, error } = await cie
      .from(CITIZENS_TABLE)
      .select("*")
      .limit(1000);

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch (e) {
    return res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});

/**
 * GET /api/citizens/:id
 * Return a single citizen by ID.
 *
 * Notes:
 * - This assumes your table has an "id" column.
 * - If your ID column is named differently, change the .eq("id", id) line.
 */
app.get("/api/citizens/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await cie
      .from(CITIZENS_TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Citizen not found" });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});

app.listen(Number(PORT), () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});