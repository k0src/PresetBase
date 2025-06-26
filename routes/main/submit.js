const express = require("express");
const router = express.Router();
const multer = require("../../middleware/multer.js");
const {
  dbRun,
  attachFilesToBody,
  sanitizeData,
  mergeAndValidateSubmitData,
} = require("../../util/UTIL.js");

/* Example submission */
router.get("/example", async (req, res) => {
  res.render("main/submit/submit-example", { PATH_URL: "submit" });
});

/* Main submit page */
router.get("/", async (req, res) => {
  try {
    res.render("main/submit/submit", {
      success: req.query.success === "1",
      PATH_URL: "submit",
    });
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }
});

router.post("/", multer, async (req, res) => {
  const rawData = attachFilesToBody(req.body, req.files);
  try {
    const sanitizedData = await sanitizeData(rawData);
    const fullBodyData = await mergeAndValidateSubmitData(sanitizedData);

    const pendingData = JSON.stringify(fullBodyData);
    const query = `INSERT INTO pending_submissions (data) VALUES (?)`;

    await dbRun(query, [pendingData]);
  } catch (err) {
    return res
      .status(500)
      .render("static/db-error", { err, PATH_URL: "db-error" });
  }

  res.redirect("/submit?success=1");
});

module.exports = router;
