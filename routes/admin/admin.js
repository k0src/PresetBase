const express = require("express");
const router = express.Router();
const { dbRun, dbAll, dbGet } = require("../../util/UTIL.js");
const isAdmin = require("../../middleware/is-admin.js");

/* ----------------------------- Main Admin Page ---------------------------- */
router.get("/", isAdmin, async (req, res) => {
  try {
    const isAuth = req.isAuthenticated();
    res.render("admin/admin", { isAuth, PATH_URL: "admin" });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }
});

module.exports = router;
