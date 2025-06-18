const express = require("express");
const router = express.Router();
const { dbRun } = require("../UTIL.js");

/* Main submit page */
router.get("/", (req, res) => {
  res.render("main/submit/submit", { PATH_URL: "submit" });
});

/* Example submission */
router.get("/example", (req, res) => {
  res.render("main/submit/submit-example", { PATH_URL: "submit" });
});

router.post("/", async (req, res) => {
  const rawData = JSON.stringify(req.body);
  const query = `INSERT INTO pending_submissions (data) VALUES (?)`;

  try {
    await dbRun(query, [rawData]);
  } catch (err) {
    return res.render("static/db-error", { err, PATH_URL: "db-error" });
  }

  res.redirect("/submit?success=1");
});

module.exports = router;
