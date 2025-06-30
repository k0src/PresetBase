const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.render("auth/login", {
      PATH_URL: "login",
    });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

module.exports = router;
