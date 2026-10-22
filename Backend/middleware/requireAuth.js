const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      message: "Authentication required to access this resource.",
    });
  }
  return next();
};

module.exports = requireAuth;

