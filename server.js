const express = require("express");
const app = express();
const db = require("./db/db");
const path = require("path");

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Test route
app.get("/", async (req, res) => {
  try {
    const result = await db.all("SELECT 1");
    res.send("Server and DB are connected.");
  } catch (err) {
    res.status(500).send("Database connection failed: " + err.message);
  }
});

const songRoutes = require("./routes/songs");
app.use("/song", songRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
