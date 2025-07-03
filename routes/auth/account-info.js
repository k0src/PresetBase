const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const {
  formatDate,
  titleCase,
  dbRun,
  dbGet,
  deleteAllPendingFiles,
} = require("../../util/UTIL.js");
const isAuth = require("../../middleware/is-auth.js");

router.get("/", isAuth, async (req, res) => {
  const isAuth = req.isAuthenticated();
  const userIsAdmin = isAuth && req.user && req.user.is_admin;

  try {
    const userTimestamp = await User.getUserTimestamp(req.user.id);
    const { id, email, username, is_admin, authenticated_with } = req.user;

    const userSubmissions = await User.getUserSubmissions(id);
    const pendingSubmissions = await User.getUserPendingSubmissions(id);

    res.render("auth/account-info", {
      isAuth,
      userIsAdmin,
      user: {
        id,
        username,
        email,
        timestamp: formatDate(userTimestamp),
        is_admin,
        authenticated_with: titleCase(authenticated_with),
      },
      userSubmissions,
      pendingSubmissions,
      PATH_URL: "account",
    });
  } catch (err) {
    return res.status(500).render("static/db-error", {
      err,
      isAuth,
      userIsAdmin,
      PATH_URL: "db-error",
    });
  }
});

router.put("/update-username", isAuth, async (req, res) => {
  const { newUsername } = req.body;

  try {
    const user = await User.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await user.setUsername(newUsername);

    res.json({ username: newUsername });
  } catch (err) {
    console.error(err);

    if (err.message === "Invalid username format") {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({
      error: "An error occurred while updating the username.",
    });
  }
});

router.post("/sign-out", isAuth, async (req, res) => {
  try {
    const user = await User.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ error: "Failed to destroy session." });
      }

      return res.status(200).json({ message: "Signed out successfully." });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while attempting to sign out.",
    });
  }
});

router.post("/delete-account", isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await User.deleteAccountById(userId);

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ error: "Failed to destroy session." });
      }

      return res.status(200).json({ message: "Signed out successfully." });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "An error occurred while attempting to delete account.",
    });
  }
});

router.delete(
  "/delete-pending-submission/:submissionId",
  isAuth,
  async (req, res) => {
    const submissionId = req.params.submissionId;
    const userId = req.user.id;

    try {
      const submission = await dbGet(
        `SELECT data FROM pending_submissions WHERE id = ? AND user_id = ?`,
        [submissionId, userId]
      );

      if (!submission) {
        throw new Error("Submission not found");
      }

      // Delete all pending files
      const data = JSON.parse(submission.data);
      await deleteAllPendingFiles(data);

      await dbRun(
        `DELETE FROM pending_submissions WHERE id = ? AND user_id = ?`,
        [submissionId, userId]
      );
      return res
        .status(200)
        .json({ message: "Pending submission deleted successfully." });
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Error deleting submission: " + err.message });
    }
  }
);

module.exports = router;
