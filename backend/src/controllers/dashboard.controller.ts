import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import Employee from "../models/employee.model";

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Super Admin, HR Manager)
export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const totalEmployees = await Employee.countDocuments({ isDeleted: false });
    const activeEmployees = await Employee.countDocuments({
      isDeleted: false,
      status: "Active",
    });
    const inactiveEmployees = await Employee.countDocuments({
      isDeleted: false,
      status: "Inactive",
    });
    const suspendedEmployees = await Employee.countDocuments({
      isDeleted: false,
      status: "Suspended",
    });

    // Department Count & Distribution
    const deptDistribution = await Employee.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const departmentCount = deptDistribution.length;

    // Status Distribution
    const statusDistribution = await Employee.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    // Monthly Joining Trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1); // Start of month

    const monthlyTrends = await Employee.aggregate([
      {
        $match: {
          isDeleted: false,
          joiningDate: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$joiningDate" },
            month: { $month: "$joiningDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format monthly trends to readable months
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedMonthlyTrends = monthlyTrends.map((trend) => {
      const monthIndex = trend._id.month - 1;
      return {
        month: `${monthNames[monthIndex]} ${trend._id.year}`,
        count: trend.count,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          suspendedEmployees,
          departmentCount,
        },
        charts: {
          departmentDistribution: deptDistribution,
          statusDistribution,
          monthlyTrends: formattedMonthlyTrends,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
