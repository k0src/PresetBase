import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../../api/api";
import { useAsyncData } from "../../hooks/useAsyncData";

import { BounceLoader } from "react-spinners";
import DeleteModal from "../DeleteModal/DeleteModal";
import styles from "./UserSubmissions.module.css";

import { FaTrash, FaClock } from "react-icons/fa6";

export default function UserSubmissions({ userId }) {
  const [deletingSubmissions, setDeletingSubmissions] = useState(new Set());
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, loading, error, refetch } = useAsyncData(
    {
      pendingSubmissions: () => authAPI.getUserPendingSubmissions(),
      approvedSubmissions: () => authAPI.getUserApprovedSubmissions(),
    },
    [userId],
    { cacheKey: `userSubmissions-${userId}` }
  );

  const pendingSubmissionsData = data.pendingSubmissions?.data || [];
  const approvedSubmissionsData = data.approvedSubmissions?.data || [];

  if (error) {
    return (
      <div className={styles.userSubmissions}>
        <span className={styles.errorText}>Error loading user submissions</span>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  const confirmDeleteSubmission = (submissionId) => {
    setSubmissionToDelete(submissionId);
    setShowDeleteConfirm(true);
  };

  const cancelDeleteSubmission = () => {
    setSubmissionToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;

    try {
      setDeletingSubmissions((prev) => new Set(prev).add(submissionToDelete));
      await authAPI.deletePendingSubmission(submissionToDelete);
      refetch();
      setShowDeleteConfirm(false);
      setSubmissionToDelete(null);
    } catch (err) {
      console.error("Failed to delete submission:", err);
    } finally {
      setDeletingSubmissions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(submissionToDelete);
        return newSet;
      });
    }
  };

  const PendingSubmission = memo(({ submission }) => {
    const mainArtist =
      submission.data?.artists.find((artist) => artist.role === "Main")?.name ||
      submission.data?.artists[0]?.name ||
      "";

    const isDeleting = deletingSubmissions.has(submission.id);

    return (
      <div key={submission.id} className={styles.submissionCard}>
        <span className={styles.artistName}>{mainArtist}</span>
        <span className={styles.songTitle}>{submission.data?.songTitle}</span>
        <span className={styles.timestamp}>
          {formatDate(submission.submitted_at)}
        </span>
        <hr className={styles.submissionCardHr} />
        <div className={styles.submissionPresets}>
          <span className={styles.presetNames}>
            {submission.data?.synths
              ?.flatMap(
                (synth) => synth.presets?.map((preset) => preset.name) || []
              )
              .join(", ")}
          </span>
        </div>
        <div className={styles.submissionCardBottom}>
          <span className={styles.statusText}>
            <FaClock />
            Status: Pending
          </span>
          <span className={styles.statusText}>&bull;</span>
          <button
            className={styles.deleteText}
            onClick={() => confirmDeleteSubmission(submission.id)}
            disabled={isDeleting}
          >
            <FaTrash />
            {isDeleting ? "Deleting..." : "Delete Pending Submission"}
          </button>
        </div>
      </div>
    );
  });

  const ApprovedSubmission = memo(({ submission }) => (
    <Link
      to={`/song/${submission.songId}`}
      key={submission.songId}
      className={styles.submissionCardLink}
    >
      <span className={styles.artistName}>{submission.artistName}</span>
      <span className={styles.songTitle}>{submission.songTitle}</span>
      <span className={styles.timestamp}>
        {formatDate(submission.timestamp)}
      </span>
      <hr className={styles.submissionCardHr} />
      <div className={styles.submissionPresets}>
        <span className={styles.presetNames}>
          {submission?.presets?.map((preset) => preset.presetName).join(", ")}
        </span>
      </div>
    </Link>
  ));

  return (
    <div className={styles.userSubmissions}>
      {loading && (
        <div className={styles.loaderContainer}>
          <BounceLoader color="#e3e5e4" size={60} />
        </div>
      )}

      {!loading && pendingSubmissionsData.length > 0 && (
        <div className={styles.userSubmissionsSection}>
          <h3 className={styles.headingTertiary}>Pending</h3>
          <div className={styles.submissionsGrid}>
            {pendingSubmissionsData.map((submission) => (
              <PendingSubmission key={submission.id} submission={submission} />
            ))}
          </div>
        </div>
      )}

      {!loading && approvedSubmissionsData.length > 0 && (
        <div className={styles.userSubmissionsSection}>
          <h3 className={styles.headingTertiary}>Approved</h3>
          <div className={styles.submissionsGrid}>
            {approvedSubmissionsData.map((submission) => (
              <ApprovedSubmission
                key={submission.songId}
                submission={submission}
              />
            ))}
          </div>
        </div>
      )}

      {!loading &&
        pendingSubmissionsData.length === 0 &&
        approvedSubmissionsData.length === 0 && (
          <span className={styles.noSubmissionsText}>
            No submissions yet...
          </span>
        )}

      <DeleteModal
        isOpen={showDeleteConfirm}
        title="Confirm Submission Deletion"
        message="Are you sure you want to delete this pending submission? This action cannot be undone."
        confirmText="Delete Submission"
        cancelText="Cancel"
        onConfirm={handleDeleteSubmission}
        onCancel={cancelDeleteSubmission}
        isLoading={
          submissionToDelete && deletingSubmissions.has(submissionToDelete)
        }
        loadingText="Deleting..."
      />
    </div>
  );
}
