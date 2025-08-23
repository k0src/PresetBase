const express = require("express");
const router = express.Router();
const { dbAll, dbGet } = require("../../util/UTIL.js");
const multer = require("../../middleware/multer.js");
const AdminManager = require("../../models/AdminManager.js");

router.get("/pending-submissions", async (req, res) => {
  try {
    // add support for user id later - dummy ID 1

    const pendingSubmissionsData = await dbAll(
      "SELECT id, data, submitted_at, user_id FROM pending_submissions"
    );

    if (pendingSubmissionsData) {
      const submissions = pendingSubmissionsData.map((submission) => ({
        id: submission.id,
        data: JSON.parse(submission.data),
        submittedAt: submission.submitted_at,
        userId: 1,
        username: "Test",
      }));
      res.json(submissions);
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.post("/approve-submission", multer, async (req, res) => {
  try {
    await AdminManager.approveSubmission({
      pendingSubmissionId: req.body.entryId,
      formData: req.body,
      fileData: req.files,
    });

    res.status(200).json({ message: "Submission approved successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

router.post("/deny-submission", async (req, res) => {
  try {
    await AdminManager.denySubmission(req.body.submissionId);

    res.status(200).json({ message: "Submission denied successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;
