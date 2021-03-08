exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    userName: req.user.name,
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.get500 = (req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error 500",
    path: "/500",
    userName: req.user.name,
    isAuthenticated: req.session.isLoggedIn,
  });
};
