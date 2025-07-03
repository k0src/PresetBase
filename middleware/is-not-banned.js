const isNotBanned = function (req, res, next) {
  if (req.user && req.user.banned) {
    return res.status(403).render("static/403", {
      isAuth: req.isAuthenticated(),
      userIsAdmin: req.isAuthenticated() && req?.user && req.user?.is_admin,
      PATH_URL: "403",
    });
  }
  return next();
};

module.exports = isNotBanned;
