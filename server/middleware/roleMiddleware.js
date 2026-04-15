const roleMiddleware = (roles) => {
  return (req, res, next) => {
    // Convert to array if a single string is passed
    const authorizedRoles = Array.isArray(roles) ? roles : [roles];

    if (!req.user || !authorizedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = roleMiddleware;
