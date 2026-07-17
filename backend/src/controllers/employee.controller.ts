import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import Employee from "../models/employee.model";
import { AppError } from "../utils/appError";
import { isCircularReporting } from "../services/hierarchy.service";

// @desc    Get all employees with search, filter, sort, pagination
// @route   GET /api/employees
// @access  Private (Super Admin, HR Manager)
export const getEmployees = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      search,
      department,
      role,
      status,
      sortBy,
      order,
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = { isDeleted: false };

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filters
    if (department) {
      query.department = department;
    }
    if (role) {
      query.role = role;
    }
    if (status) {
      query.status = status;
    }

    // Sorting
    let sortOptions: any = {};
    if (sortBy) {
      const sortField = sortBy as string;
      const sortOrder = order === "desc" ? -1 : 1;
      sortOptions[sortField] = sortOrder;
    } else {
      sortOptions.createdAt = -1; // Default to newest
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const employees = await Employee.find(query)
      .populate("manager", "name email employeeId")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      count: employees.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private (Super Admin, HR Manager, or Owner)
export const getEmployeeById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    // RBAC Check: Employees can only view their own profile
    if (req.user?.role === "Employee" && req.user._id.toString() !== id) {
      next(new AppError("You are not authorized to view this profile", 403));
      return;
    }

    const employee = await Employee.findOne({
      _id: id,
      isDeleted: false,
    }).populate("manager", "name email employeeId");

    if (!employee) {
      next(new AppError("Employee not found", 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private (Super Admin, HR Manager)
export const createEmployee = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      password,
      role,
      department,
      designation,
      salary,
      joiningDate,
      status,
      manager,
      profileImage,
    } = req.body;

    // RBAC Check: HR Manager cannot create a Super Admin account
    if (req.user?.role === "HR Manager" && role === "Super Admin") {
      next(
        new AppError(
          "HR Managers are not allowed to create Super Admin accounts",
          403,
        ),
      );
      return;
    }

    // Check if employeeId already exists
    const existingId = await Employee.findOne({ employeeId });
    if (existingId) {
      next(
        new AppError(`Employee ID '${employeeId}' is already assigned`, 400),
      );
      return;
    }

    // Check if email already exists
    const existingEmail = await Employee.findOne({ email });
    if (existingEmail) {
      next(new AppError(`Email '${email}' is already registered`, 400));
      return;
    }

    // If manager is assigned, verify they exist and are not Deleted
    if (manager) {
      const managerDoc = await Employee.findOne({
        _id: manager,
        isDeleted: false,
      });
      if (!managerDoc) {
        next(new AppError("Reporting manager not found", 400));
        return;
      }
    }

    // Create employee
    const newEmployee = await Employee.create({
      employeeId,
      name,
      email,
      phone,
      password,
      role,
      department,
      designation,
      salary,
      joiningDate,
      status,
      manager: manager || null,
      profileImage: profileImage || "",
    });

    const employeeObj = newEmployee.toObject();
    delete employeeObj.password;

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employeeObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private (Super Admin, HR Manager, or Owner)
export const updateEmployee = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Find the target employee
    const targetEmployee = await Employee.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!targetEmployee) {
      next(new AppError("Employee not found", 404));
      return;
    }

    // RBAC logic for updates
    if (currentUser.role === "Employee") {
      // Employees can only update their own profile
      if (currentUser._id.toString() !== id) {
        next(
          new AppError("You are not authorized to update this profile", 403),
        );
        return;
      }

      // Employees can only update limited fields: phone, password, profileImage
      const { phone, password, profileImage } = req.body;
      if (phone) targetEmployee.phone = phone;
      if (password) targetEmployee.password = password;
      if (profileImage !== undefined)
        targetEmployee.profileImage = profileImage;

      await targetEmployee.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: targetEmployee,
      });
      return;
    }

    // HR and Super Admin update path
    const {
      name,
      email,
      phone,
      password,
      role,
      department,
      designation,
      salary,
      joiningDate,
      status,
      manager,
      profileImage,
    } = req.body;

    // RBAC Check for HR Managers:
    if (currentUser.role === "HR Manager") {
      // 1. Cannot modify Super Admin accounts
      if (targetEmployee.role === "Super Admin") {
        next(
          new AppError("HR Managers cannot modify Super Admin accounts", 403),
        );
        return;
      }
      // 2. Cannot assign Super Admin role
      if (role === "Super Admin") {
        next(
          new AppError("HR Managers cannot assign the Super Admin role", 403),
        );
        return;
      }
    }

    // Validate email uniqueness if changing email
    if (email && email.toLowerCase() !== targetEmployee.email.toLowerCase()) {
      const existingEmail = await Employee.findOne({ email, _id: { $ne: id } });
      if (existingEmail) {
        next(new AppError(`Email '${email}' is already registered`, 400));
        return;
      }
      targetEmployee.email = email;
    }

    // Validate circular reporting if manager changes
    if (manager !== undefined) {
      if (manager === null || manager === "") {
        targetEmployee.manager = null;
      } else {
        // Prevent assigning self as manager
        if (manager === id) {
          next(new AppError("An employee cannot report to themselves", 400));
          return;
        }

        // Check for circular reporting
        const circular = await isCircularReporting(id, manager);
        if (circular) {
          next(
            new AppError(
              "Circular reporting detected. This assignment would create a loop.",
              400,
            ),
          );
          return;
        }

        targetEmployee.manager = manager;
      }
    }

    // Update other fields
    if (name) targetEmployee.name = name;
    if (phone) targetEmployee.phone = phone;
    if (password) targetEmployee.password = password;
    if (role) targetEmployee.role = role;
    if (department) targetEmployee.department = department;
    if (designation) targetEmployee.designation = designation;
    if (salary !== undefined) targetEmployee.salary = salary;
    if (joiningDate) targetEmployee.joiningDate = new Date(joiningDate);
    if (status) targetEmployee.status = status;
    if (profileImage !== undefined) targetEmployee.profileImage = profileImage;

    await targetEmployee.save();

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: targetEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee (Soft Delete)
// @route   DELETE /api/employees/:id
// @access  Private (Super Admin)
export const deleteEmployee = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    // Find employee
    const employee = await Employee.findOne({ _id: id, isDeleted: false });
    if (!employee) {
      next(new AppError("Employee not found", 404));
      return;
    }

    // Prevent deleting self
    if (req.user?._id.toString() === id) {
      next(new AppError("You cannot delete your own account", 400));
      return;
    }

    // Check if employee has direct reportees
    const directReportsCount = await Employee.countDocuments({
      manager: id,
      isDeleted: false,
    });

    if (directReportsCount > 0) {
      next(
        new AppError(
          `Cannot delete employee who is an active manager. Please reassign their ${directReportsCount} reportees first.`,
          400,
        ),
      );
      return;
    }

    // Soft delete
    employee.isDeleted = true;
    employee.status = "Inactive";
    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully (soft delete)",
    });
  } catch (error) {
    next(error);
  }
};
