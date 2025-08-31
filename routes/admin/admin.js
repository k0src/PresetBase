import express from "express";
import DB from "../../models/DB.js";
import multer from "../../middleware/multer.js";
import AdminManager from "../../models/AdminManager.js";

const router = express.Router();

router.get("/pending-submissions", async (req, res) => {
  try {
    const pendingSubmissionsData = await DB.all(`
      SELECT
        pending_submissions.id,
        pending_submissions.data,
        pending_submissions.submitted_at,
        pending_submissions.user_id,
        users.username
      FROM pending_submissions
      LEFT JOIN users ON pending_submissions.user_id = users.id`);

    if (pendingSubmissionsData) {
      const submissions = pendingSubmissionsData.map((submission) => ({
        id: submission.id,
        data: JSON.parse(submission.data),
        submittedAt: submission.submitted_at,
        userId: submission.user_id,
        username: submission.username,
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

// Get entry data for slideout
router.get("/entry/:table/:id", async (req, res) => {
  try {
    const { table, id } = req.params;
    const data = await AdminManager.getEntryDataById({ table, entryId: id });
    res.json(data);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

// Update entry
router.put("/entry/:table/:id", multer, async (req, res) => {
  try {
    const { table, id } = req.params;
    await AdminManager.updateEntry({
      table,
      entryId: id,
      formData: req.body,
      fileData: req.files,
    });

    res.json({ message: "Entry updated successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

// Delete entry
router.delete("/entry/:table/:id", async (req, res) => {
  try {
    const { table, id } = req.params;
    await AdminManager.deleteEntry({ table, entryId: id });

    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

// Get field data for autofill
router.get("/field-data/:table", async (req, res) => {
  try {
    const { table } = req.params;
    const { query = "", limit = 10 } = req.query;

    const results = await AdminManager.getEntryAutofillData({
      table,
      query,
      limit: parseInt(limit),
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res
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

router.post("/upload", multer, async (req, res) => {
  try {
    await AdminManager.uploadEntry({
      formData: req.body,
      fileData: req.files,
    });

    res.status(200).json({ message: "Entry uploaded successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
});

export default router;
