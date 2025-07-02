const express = require("express");
const router = express.Router();
const isAdmin = require("../../middleware/is-admin.js");

/* ----------------------------- Main Admin Page ---------------------------- */
router.get("/", isAdmin, async (req, res) => {
  const isAuth = req.isAuthenticated();
  const userIsAdmin = req.user && req.user.is_admin;

  try {
    res.render("admin/admin", { isAuth, userIsAdmin, PATH_URL: "admin" });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth,
      userIsAdmin,
      PATH_URL: "db-error",
    });
  }
});

module.exports = router;
