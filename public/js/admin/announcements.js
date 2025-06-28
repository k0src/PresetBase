const modal = document.querySelector(".deactivate-modal");
const modalOverlay = document.querySelector(".deactivate-modal-overlay");
const modalCancelBtn = document.querySelector(".deactivate-btn--cancel");
const modalDeleteBtn = document.querySelector(".deactivate-btn--delete");

const deactivateActiveAnnouncement = async (activeAnnouncementId) => {
  try {
    const response = await fetch(
      `/admin/announcements/deactivate-announcement/${encodeURIComponent(
        activeAnnouncementId
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.redirected) {
      window.location.href = response.url;
    }
  } catch (err) {
    console.error("Error deactivating announcement:", err);
    return;
  }
};

const closeDeleteModal = function () {
  modalOverlay.style.display = "none";
};

const showDeleteModal = function (btn) {
  const activeAnnouncementId = btn.parentNode.querySelector(
    "[name=activeAnnouncementId]"
  ).value;
  modalOverlay.style.display = "block";

  modalCancelBtn.addEventListener("click", closeDeleteModal);
  modalOverlay.addEventListener("click", closeDeleteModal);
  document.addEventListener("keydown", function escListener(e) {
    if (e.key === "Escape") {
      closeDeleteModal();
      document.removeEventListener("keydown", escListener);
    }
  });

  modalDeleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    deactivateActiveAnnouncement(activeAnnouncementId);
    closeDeleteModal();
  });
};
