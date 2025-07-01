const express = require("express");
const router = express.Router();
const multer = require("../../middleware/multer.js");
const {
  dbRun,
  attachFilesToBody,
  sanitizeData,
  mergeAndValidateSubmitData,
} = require("../../util/UTIL.js");
const isAuth = require("../../middleware/is-auth.js");

/* Example submission */
router.get("/example", async (req, res) => {
  const isAuth = req.isAuthenticated();
  res.render("main/submit/submit-example", {
    isAuth,
    PATH_URL: "submit",
  });
});

/* Main submit page */
router.get("/", isAuth, async (req, res) => {
  try {
    const isAuth = req.isAuthenticated();

    res.render("main/submit/submit", {
      success: req.query.success === "1",
      isAuth,
      PATH_URL: "submit",
    });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }
});

router.post("/", isAuth, multer, async (req, res) => {
  const isAuth = req.isAuthenticated();

  if (!isAuth) {
    return res.status(403).send("Forbidden");
  }

  const userId = req.user.id;
  const now = new Date().toISOString();

  const rawData = attachFilesToBody(req.body, req.files);

  try {
    const sanitizedData = await sanitizeData(rawData);
    const fullBodyData = await mergeAndValidateSubmitData(sanitizedData);

    const pendingData = JSON.stringify(fullBodyData);
    const query = `
      INSERT INTO pending_submissions 
        (data, submitted_at, user_id) 
      VALUES (?, ?, ?)`;

    await dbRun(query, [pendingData, now, userId]);
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth: req.isAuthenticated(),
      PATH_URL: "db-error",
    });
  }

  res.redirect("/submit?success=1");
});

module.exports = router;
