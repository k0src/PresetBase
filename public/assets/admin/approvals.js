const post = function (url) {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
  })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      window.location.reload();
    })
    .catch((error) => {
      console.error("POST request failed:", error);
      alert("Action failed. Please try again.");
    });
};
