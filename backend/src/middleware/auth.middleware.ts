import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import Employee from "../models/employee.model";
import { AppError } from "../utils/appError";
import { AuthenticatedRequest } from "../types";

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      next(new AppError("Not authorized to access this route", 401));
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await Employee.findById(decoded.id);
    if (!user) {
      next(
        new AppError("The user belonging to this token no longer exists", 401),
      );
      return;
    }

    if (user.status !== "Active") {
      next(new AppError("This user account is inactive or suspended", 403));
      return;
    }

    // Grant access
    req.user = user;
    next();
  } catch (error) {
    next(new AppError("Not authorized to access this route", 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      next(
        new AppError("User context not found. Auth middleware missing?", 500),
      );
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this resource`,
          403,
        ),
      );
      return;
    }

    next();
  };
};
