const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "Forbidden-You are not authorized to access this route"
      );
    }
    next();
  };

export default authorizeRoles;
