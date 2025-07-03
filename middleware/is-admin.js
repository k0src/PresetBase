const isAdmin = function (req, res, next) {
  if (!req?.isAuthenticated() || !req?.user?.is_admin || req?.user?.banned) {
    return res.status(404).render("static/404", {
      isAuth: req.isAuthenticated(),
      userIsAdmin: req.isAuthenticated() && req?.user && req.user?.is_admin,
      PATH_URL: "404",
    });
  }
  next();
};

module.exports = isAdmin;
