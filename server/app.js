require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware to simulate logged-in user and set RLS context
app.use(async (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(401).json({ error: "Missing user ID" });
  }

  // Validate UUID format to prevent SQL injection
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  const client = await pool.connect();

  try {
    // Set user context inside PostgreSQL using parameterized approach
    await client.query("SELECT set_config('app.current_user', $1, true)", [
      userId,
    ]);
    req.db = client;
    next();
  } catch (err) {
    client.release();
    res.status(500).json({ error: err.message });
  }
});

// Get notes (RLS applied automatically)
app.get("/notes", async (req, res) => {
  try {
    const result = await req.db.query("SELECT * FROM notes");
    res.json(result.rows);
  } finally {
    req.db.release();
  }
});

// Create note
app.post("/notes", async (req, res) => {
  try {
    const { content } = req.body;

    const result = await req.db.query(
      "INSERT INTO notes (user_id, content) VALUES (current_setting('app.current_user')::uuid, $1) RETURNING *",
      [content]
    );

    res.json(result.rows[0]);
  } finally {
    req.db.release();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
