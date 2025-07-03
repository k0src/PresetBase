/* ---------------------------- Button functions ---------------------------- */
const goHome = function () {
  window.location.href = "/";
};

const signOut = async function () {
  try {
    const response = await fetch("/account-info/sign-out", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    window.location.href = "/";
  } catch (err) {
    console.error(err);
  }
};
