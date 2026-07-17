import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Employee } from "../types";
import axiosInstance from "../api/axiosInstance";

interface EmployeeDialogProps {
  open: boolean;
  employee: Employee | null; // Null means creating new
  onClose: () => void;
  onSave: () => void;
}

const employeeFormSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(["Super Admin", "HR Manager", "Employee"]),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  salary: z.coerce.number().min(0, "Salary cannot be negative"),
  joiningDate: z.string().min(1, "Joining date is required"),
  status: z.enum(["Active", "Inactive", "Suspended"]),
  manager: z.string().nullable().optional(),
  profileImage: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  open,
  employee,
  onClose,
  onSave,
}) => {
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!employee;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "Employee",
      department: "",
      designation: "",
      salary: 0,
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Active",
      manager: "",
      profileImage: "",
    },
  });

  // Fetch potential managers
  useEffect(() => {
    if (open) {
      const fetchManagers = async () => {
        setLoadingManagers(true);
        try {
          const response = await axiosInstance.get("/employees?limit=100");
          let list = response.data.data as Employee[];
          if (isEdit && employee) {
            // Filter out self
            list = list.filter((emp) => emp._id !== employee._id);
          }
          setManagers(list);
        } catch (err) {
          console.error("Failed to fetch managers", err);
        } finally {
          setLoadingManagers(false);
        }
      };

      fetchManagers();
    }
  }, [open, employee, isEdit]);

  // Set default values when editing
  useEffect(() => {
    if (employee) {
      reset({
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        password: "", // Don't populate password
        role: employee.role,
        department: employee.department,
        designation: employee.designation,
        salary: employee.salary,
        joiningDate: employee.joiningDate
          ? new Date(employee.joiningDate).toISOString().split("T")[0]
          : "",
        status: employee.status,
        manager: employee.manager ? employee.manager._id : "",
        profileImage: employee.profileImage || "",
      });
    } else {
      reset({
        employeeId: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "Employee",
        department: "",
        designation: "",
        salary: 0,
        joiningDate: new Date().toISOString().split("T")[0],
        status: "Active",
        manager: "",
        profileImage: "",
      });
    }
    setError(null);
  }, [employee, reset, open]);

  const onSubmit = async (data: EmployeeFormValues) => {
    setSaving(true);
    setError(null);

    // Clean up data
    const payload = { ...data };
    if (payload.manager === "") {
      payload.manager = null;
    }
    if (isEdit && !payload.password) {
      delete payload.password; // Don't send empty password
    }

    try {
      if (isEdit && employee) {
        await axiosInstance.put(`/employees/${employee._id}`, payload);
      } else {
        await axiosInstance.post("/employees", payload);
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "An error occurred while saving employee details.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEdit ? "Edit Employee Details" : "Add New Employee"}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register("employeeId")}
                label="Employee ID (e.g. EMP-1001)"
                fullWidth
                disabled={isEdit}
                error={!!errors.employeeId}
                helperText={errors.employeeId?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register("name")}
                label="Full Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register("email")}
                label="Email Address"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register("phone")}
                label="Phone Number"
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </Grid>
            {!isEdit && (
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register("password")}
                  label="Password"
                  type="password"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>
            )}
            {isEdit && (
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register("password")}
                  label="Reset Password (leave blank to keep current)"
                  type="password"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Role"
                    fullWidth
                    error={!!errors.role}
                    helperText={errors.role?.message}
                  >
                    <MenuItem value="Employee">Employee</MenuItem>
                    <MenuItem value="HR Manager">HR Manager</MenuItem>
                    <MenuItem value="Super Admin">Super Admin</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register("department")}
                label="Department"
                fullWidth
                error={!!errors.department}
                helperText={errors.department?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register("designation")}
                label="Designation"
                fullWidth
                error={!!errors.designation}
                helperText={errors.designation?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register("salary")}
                label="Salary ($)"
                type="number"
                fullWidth
                error={!!errors.salary}
                helperText={errors.salary?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register("joiningDate")}
                label="Joining Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.joiningDate}
                helperText={errors.joiningDate?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Status"
                    fullWidth
                    error={!!errors.status}
                    helperText={errors.status?.message}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Suspended">Suspended</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="manager"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Reporting Manager"
                    fullWidth
                    disabled={loadingManagers}
                    error={!!errors.manager}
                    helperText={errors.manager?.message}
                    InputProps={{
                      endAdornment: loadingManagers && (
                        <CircularProgress size={20} />
                      ),
                    }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {managers.map((mgr) => (
                      <MenuItem key={mgr._id} value={mgr._id}>
                        {mgr.name} ({mgr.role} - {mgr.department})
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register("profileImage")}
                label="Profile Image URL"
                fullWidth
                error={!!errors.profileImage}
                helperText={errors.profileImage?.message}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Employee"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmployeeDialog;
