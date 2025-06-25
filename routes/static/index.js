const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.render("static/index", {
      PATH_URL: "home",
    });
  } catch (err) {
    return res.render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
