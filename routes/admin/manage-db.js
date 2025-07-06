const express = require("express");
const router = express.Router();
const isAdmin = require("../../middleware/is-admin.js");
const { dbAll, dbGet } = require("../../util/UTIL.js");

router.get("/", isAdmin, async (req, res) => {
  const isAuth = req.isAuthenticated();
  const userIsAdmin = req.user && req.user.is_admin;

  // Load songs table initally - most important
  const query = `
      SELECT COUNT(*) AS total_tables
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'`;

  try {
    const totalTables = await dbGet(query);

    res.render("admin/manage-db", {
      isAuth,
      userIsAdmin,
      totalTables,
      PATH_URL: "admin",
    });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth,
      userIsAdmin,
      PATH_URL: "db-error",
    });
  }
});

router.get("/table-data/:table", isAdmin, async (req, res) => {
  const tables = ["songs", "artists", "albums", "synths", "presets"];

  const table = req.params.table;

  if (!tables.includes(table)) {
    return res.status(404).json({
      error: "Table not found.",
    });
  }
  const where = table === "albums" ? "WHERE id != 0" : "";

  try {
    const tableData = await dbAll(`
      SELECT *
      FROM ${table}
      ${where}
      ORDER BY id ASC
    `);

    res.json(tableData);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while fetching table data.",
    });
  }
});

module.exports = router;
