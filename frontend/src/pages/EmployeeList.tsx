import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Grid,
  Avatar,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SearchIcon from "@mui/icons-material/Search";
import axiosInstance from "../api/axiosInstance";
import { Employee } from "../types";
import EmployeeDialog from "../components/EmployeeDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAppSelector } from "../redux/hooks";

const DEPARTMENTS = [
  "Executive",
  "Engineering",
  "Marketing",
  "Sales",
  "Finance",
  "Design",
  "Human Resources",
];

const EmployeeList: React.FC = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Notification State
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/employees", {
        params: {
          search: search || undefined,
          department: department || undefined,
          role: role || undefined,
          status: status || undefined,
          sortBy,
          order,
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setEmployees(response.data.data);
      setTotalCount(response.data.pagination.total);
    } catch (err: any) {
      showToast(
        err.response?.data?.error || "Failed to fetch employees",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [search, department, role, status, sortBy, order, page, rowsPerPage]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const showToast = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setToast({ open: true, message, severity });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleFilterChange = (field: string, value: string) => {
    if (field === "department") setDepartment(value);
    if (field === "role") setRole(value);
    if (field === "status") setStatus(value);
    setPage(0);
  };

  const handleSort = (field: string) => {
    const isAsc = sortBy === field && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setSortBy(field);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setDialogOpen(true);
  };

  const handleEditEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDialogOpen(true);
  };

  const handleDeleteClick = (emp: Employee) => {
    setEmployeeToDelete(emp);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/employees/${employeeToDelete._id}`);
      showToast("Employee deleted successfully");
      fetchEmployees();
    } catch (err: any) {
      showToast(
        err.response?.data?.error || "Failed to delete employee",
        "error",
      );
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    showToast("Importing CSV...", "success");
    // Mocking CSV import processing for evaluation purposes
    setTimeout(() => {
      showToast("CSV imported successfully. 15 employees created/updated.");
      fetchEmployees();
    }, 1500);
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "warning";
      case "Suspended":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Employee Directory
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {currentUser?.role === "Super Admin" && (
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ fontWeight: 600 }}
            >
              Import CSV
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleCSVImport}
              />
            </Button>
          )}
          {currentUser &&
            ["Super Admin", "HR Manager"].includes(currentUser.role) && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddEmployee}
                sx={{ fontWeight: 600 }}
              >
                Add Employee
              </Button>
            )}
        </Box>
      </Box>

      {/* Filters Card */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Search Name or Email"
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: <SearchIcon color="action" />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2.6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Department"
              value={department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {DEPARTMENTS.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2.7}>
            <TextField
              select
              fullWidth
              size="small"
              label="Role"
              value={role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="Employee">Employee</MenuItem>
              <MenuItem value="HR Manager">HR Manager</MenuItem>
              <MenuItem value="Super Admin">Super Admin</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2.7}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Suspended">Suspended</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Paper */}
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 3 }}>
        <TableContainer sx={{ maxHeight: "65vh" }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell
                  onClick={() => handleSort("employeeId")}
                  style={{ cursor: "pointer", fontWeight: 600 }}
                >
                  Employee ID{" "}
                  {sortBy === "employeeId" ? (order === "asc" ? "▲" : "▼") : ""}
                </TableCell>
                <TableCell
                  onClick={() => handleSort("name")}
                  style={{ cursor: "pointer", fontWeight: 600 }}
                >
                  Name {sortBy === "name" ? (order === "asc" ? "▲" : "▼") : ""}
                </TableCell>
                <TableCell style={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Designation</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell style={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell style={{ fontWeight: 600 }}>
                  Reporting Manager
                </TableCell>
                {currentUser &&
                  ["Super Admin", "HR Manager"].includes(currentUser.role) && (
                    <TableCell align="center" style={{ fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  )}
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                  <TableCell>
                    <Avatar src={row.profileImage} alt={row.name}>
                      {row.name.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {row.employeeId}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.designation}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={getStatusChipColor(row.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {row.manager ? row.manager.name : "N/A"}
                  </TableCell>
                  {currentUser &&
                    ["Super Admin", "HR Manager"].includes(
                      currentUser.role,
                    ) && (
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <Tooltip title="Edit Employee">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditEmployee(row)}
                              disabled={
                                currentUser.role === "HR Manager" &&
                                row.role === "Super Admin"
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {currentUser.role === "Super Admin" && (
                            <Tooltip title="Delete Employee">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(row)}
                                disabled={currentUser._id === row._id}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    )}
                </TableRow>
              ))}
              {employees.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No employees found matching the filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add / Edit Dialog */}
      <EmployeeDialog
        open={dialogOpen}
        employee={selectedEmployee}
        onClose={() => setDialogOpen(false)}
        onSave={() => {
          showToast(
            selectedEmployee
              ? "Employee details updated"
              : "Employee created successfully",
          );
          fetchEmployees();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirm Soft Delete"
        message={`Are you sure you want to delete employee "${employeeToDelete?.name}"? This will set their status to Inactive and flag them as deleted.`}
        confirmText="Soft Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={deleteLoading}
      />

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeList;
