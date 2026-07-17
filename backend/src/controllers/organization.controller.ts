import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import Employee from "../models/employee.model";
import { AppError } from "../utils/appError";
import {
  buildOrganizationTree,
  getDirectReportees,
  isCircularReporting,
} from "../services/hierarchy.service";

// @desc    Get complete organization tree structure
// @route   GET /api/organization/tree
// @access  Private (Super Admin, HR Manager)
export const getOrgTree = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tree = await buildOrganizationTree();
    res.status(200).json({
      success: true,
      data: tree,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get direct reportees of a specific employee
// @route   GET /api/employees/:id/reportees
// @access  Private (Super Admin, HR Manager)
export const getEmployeeReportees = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOne({ _id: id, isDeleted: false });
    if (!employee) {
      next(new AppError("Employee not found", 404));
      return;
    }

    const reportees = await getDirectReportees(id);

    res.status(200).json({
      success: true,
      count: reportees.length,
      data: reportees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reporting manager for an employee
// @route   PATCH /api/employees/:id/manager
// @access  Private (Super Admin, HR Manager)
export const updateReportingManager = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;
    const currentUser = req.user!;

    // Find target employee
    const targetEmployee = await Employee.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!targetEmployee) {
      next(new AppError("Employee not found", 404));
      return;
    }

    // RBAC check for HR Managers
    if (currentUser.role === "HR Manager") {
      if (targetEmployee.role === "Super Admin") {
        next(
          new AppError(
            "HR Managers cannot change the manager of a Super Admin",
            403,
          ),
        );
        return;
      }
    }

    if (managerId === null || managerId === "") {
      targetEmployee.manager = null;
    } else {
      // Prevent self-reporting
      if (managerId === id) {
        next(new AppError("An employee cannot report to themselves", 400));
        return;
      }

      // Verify prospective manager exists and is active/inactive (not deleted)
      const prospectiveManager = await Employee.findOne({
        _id: managerId,
        isDeleted: false,
      });
      if (!prospectiveManager) {
        next(new AppError("The designated manager does not exist", 400));
        return;
      }

      // Prevent circular reporting
      const circular = await isCircularReporting(id, managerId);
      if (circular) {
        next(
          new AppError(
            "Circular reporting detected. This assignment would create a loop.",
            400,
          ),
        );
        return;
      }

      targetEmployee.manager = managerId;
    }

    await targetEmployee.save();

    res.status(200).json({
      success: true,
      message: "Reporting manager updated successfully",
      data: targetEmployee,
    });
  } catch (error) {
    next(error);
  }
};
