const express = require("express");
const router = express.Router();
const multer = require("../../middleware/multer.js");

const UserSubmissionManager = require("../../models/UserSubmissionManager.js");

// const {
//   dbRun,
//   attachFilesToBody,
//   sanitizeData,
//   mergeAndValidateSubmitData,
// } = require("../../util/UTIL.js");
// const isAuth = require("../../middleware/is-auth.js");
// const isNotBanned = require("../../middleware/is-not-banned.js");

// /* Example submission */
// router.get("/example", async (req, res) => {
//   const isAuth = req.isAuthenticated();
//   const userIsAdmin = isAuth && req.user && req.user.is_admin;

//   try {
//     res.render("main/submit/submit-example", {
//       isAuth,
//       userIsAdmin,
//       PATH_URL: "submit",
//     });
//   } catch (err) {
//     return res.status(500).render("static/db-error", {
//       err,
//       isAuth,
//       userIsAdmin,
//       PATH_URL: "db-error",
//     });
//   }
// });

// /* Main submit page */
// router.get("/", isAuth, isNotBanned, async (req, res) => {
//   const isAuth = req.isAuthenticated();
//   const userIsAdmin = isAuth && req.user && req.user.is_admin;

//   try {
//     res.render("main/submit/submit", {
//       isAuth,
//       userIsAdmin,
//       success: req.query.success === "1",
//       PATH_URL: "submit",
//     });
//   } catch (err) {
//     return res.status(500).render("static/db-error", {
//       err,
//       isAuth,
//       userIsAdmin,
//       PATH_URL: "db-error",
//     });
//   }
// });

// router.post("/", isAuth, isNotBanned, multer, async (req, res) => {
//   const isAuth = req.isAuthenticated();
//   const userIsAdmin = isAuth && req.user && req.user.is_admin;

//   if (!isAuth) {
//     return res.status(403).send("Forbidden");
//   }

//   const userId = req.user.id;
//   const now = new Date().toISOString();
//   const rawData = attachFilesToBody(req.body, req.files);

//   try {
//     const sanitizedData = await sanitizeData(rawData);
//     const fullBodyData = await mergeAndValidateSubmitData(sanitizedData);

//     const pendingData = JSON.stringify(fullBodyData);
//     const query = `
//       INSERT INTO pending_submissions
//         (data, submitted_at, user_id)
//       VALUES (?, ?, ?)`;

//     await dbRun(query, [pendingData, now, userId]);
//   } catch (err) {
//     return res.status(500).render("static/db-error", {
//       err,
//       isAuth,
//       userIsAdmin,
//       PATH_URL: "db-error",
//     });
//   }

//   res.redirect("/submit?success=1");
// });

router.post("/", multer, async (req, res) => {
  try {
    await UserSubmissionManager.processSubmission({
      formData: req.body,
      fileData: req.files,
    });

    res.status(200).json({ message: "Submission processed successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
