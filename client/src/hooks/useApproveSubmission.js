import { useState } from "react";
import { approveSubmission, denySubmission } from "../api/admin.js";

export function useApproveSubmission() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const collectFormData = (formElement, submissionId) => {
    const formData = new FormData(formElement);
    // entryId is already included in the form as a hidden input
    return formData;
  };

  const handleApprove = async (formElement, submissionId, onSuccess) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = collectFormData(formElement, submissionId);
      await approveSubmission(formData);

      if (onSuccess) {
        onSuccess(submissionId);
      }
    } catch (err) {
      console.error("Approval error:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async (submissionId, onSuccess) => {
    setIsProcessing(true);
    setError(null);

    try {
      await denySubmission(submissionId);

      if (onSuccess) {
        onSuccess(submissionId);
      }
    } catch (err) {
      console.error("Denial error:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    error,
    handleApprove,
    handleDeny,
  };
}
