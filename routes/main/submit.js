const express = require("express");
const router = express.Router();
const multer = require("../../middleware/multer.js");

const UserSubmissionManager = require("../../models/UserSubmissionManager.js");

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
