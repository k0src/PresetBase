const express = require("express");
const router = express.Router();
const { dbRun, dbAll, dbGet } = require("../../util/UTIL.js");

/* ----------------------------- Main Admin Page ---------------------------- */
router.get("/", async (req, res) => {
  try {
    res.render("admin/admin", { PATH_URL: "admin" });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
