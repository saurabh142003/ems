import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import Employee from "../models/employee.model";
import { AppError } from "../utils/appError";
import { signToken } from "../utils/jwt";

// @desc    Authenticate employee & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find employee and explicitly select password field
    const employee = await Employee.findOne({ email }).select("+password");

    if (!employee) {
      next(new AppError("Invalid email or password", 401));
      return;
    }

    // Check if account is active
    if (employee.status !== "Active") {
      next(new AppError("Your account has been suspended or deactivated", 403));
      return;
    }

    // Verify password
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      next(new AppError("Invalid email or password", 401));
      return;
    }

    // Generate token
    const token = signToken(employee._id.toString(), employee.role);

    // Hide password before sending
    const employeeObj = employee.toObject();
    delete employeeObj.password;

    res.status(200).json({
      success: true,
      token,
      user: employeeObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out employee
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in employee profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError("User not found", 404));
      return;
    }

    // Populate manager name and email
    const employee = await Employee.findById(req.user._id).populate(
      "manager",
      "name email employeeId",
    );

    res.status(200).json({
      success: true,
      user: employee,
    });
  } catch (error) {
    next(error);
  }
};
