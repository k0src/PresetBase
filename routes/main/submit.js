import express from "express";
import multer from "../../middleware/multer.js";
import UserSubmissionManager from "../../models/UserSubmissionManager.js";

const router = express.Router();

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

export default router;
