const isAdmin = function (req, res, next) {
  if (!req.isAuthenticated() || !req.user?.is_admin) {
    return res
      .status(404)
      .render("static/404", { isAuth: req.isAuthenticated(), PATH_URL: "404" });
  }
  next();
};

module.exports = isAdmin;
