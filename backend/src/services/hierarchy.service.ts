import Employee from "../models/employee.model";
import { Types } from "mongoose";

/**
 * Checks if assigning prospectiveManagerId as manager of employeeId would create a circular reporting loop.
 * A loop exists if prospectiveManagerId or any of their managers eventually reports to employeeId.
 */
export const isCircularReporting = async (
  employeeId: string | Types.ObjectId,
  prospectiveManagerId: string | Types.ObjectId,
): Promise<boolean> => {
  if (employeeId.toString() === prospectiveManagerId.toString()) {
    return true;
  }

  let currentManagerId = prospectiveManagerId;

  while (currentManagerId) {
    const manager = await Employee.findById(currentManagerId).select("manager");
    if (!manager) {
      break;
    }

    if (manager.manager) {
      if (manager.manager.toString() === employeeId.toString()) {
        return true;
      }
      currentManagerId = manager.manager as any;
    } else {
      break;
    }
  }

  return false;
};

/**
 * Builds the organization tree starting from the top-level employees (those with no managers).
 */
export const buildOrganizationTree = async (): Promise<any[]> => {
  // Fetch all active/inactive employees with basic info
  const employees = await Employee.find({ status: { $ne: "Suspended" } })
    .select(
      "_id name email role department designation manager profileImage employeeId",
    )
    .lean();

  // Map employees by their ID for quick lookup
  const employeeMap: { [key: string]: any } = {};
  employees.forEach((emp) => {
    employeeMap[emp._id.toString()] = {
      ...emp,
      id: emp._id.toString(),
      children: [],
    };
  });

  const tree: any[] = [];

  employees.forEach((emp) => {
    const empWithChildren = employeeMap[emp._id.toString()];
    if (emp.manager) {
      const managerIdStr = emp.manager.toString();
      if (employeeMap[managerIdStr]) {
        employeeMap[managerIdStr].children.push(empWithChildren);
      } else {
        // If manager is not found or suspended, treat as top-level
        tree.push(empWithChildren);
      }
    } else {
      // Top level employee (no manager)
      tree.push(empWithChildren);
    }
  });

  return tree;
};

/**
 * Get direct reportees for a specific employee.
 */
export const getDirectReportees = async (
  employeeId: string,
): Promise<any[]> => {
  return Employee.find({
    manager: employeeId,
    status: { $ne: "Suspended" },
  }).select(
    "_id employeeId name email role department designation status profileImage",
  );
};
