import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  Paper,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { updateProfileSuccess } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";

const profileSchema = z.object({
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  profileImage: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState({ open: false, message: "" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: "",
      password: "",
      profileImage: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        phone: user.phone || "",
        password: "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setSaving(true);
    setError(null);

    const payload: any = { phone: data.phone, profileImage: data.profileImage };
    if (data.password) {
      payload.password = data.password;
    }

    try {
      const response = await axiosInstance.put(
        `/employees/${user._id}`,
        payload,
      );
      dispatch(updateProfileSuccess(response.data.data));
      setToast({ open: true, message: "Profile updated successfully" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <PersonIcon sx={{ fontSize: 32, color: "primary.main", mr: 1.5 }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My Profile
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                src={user.profileImage}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  border: "4px solid #1976d2",
                }}
              >
                {user.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                {user.designation}
              </Typography>
              <Typography
                variant="body2"
                color="primary"
                sx={{ fontWeight: 600, mb: 3 }}
              >
                {user.role}
              </Typography>

              <Divider sx={{ width: "100%", my: 2 }} />

              <Box sx={{ width: "100%", textAlign: "left" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Employee ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5 }}>
                  {user.employeeId}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Department
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5 }}>
                  {user.department}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Reporting Manager
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.manager ? user.manager.name : "None"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit Profile Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Edit Profile Settings
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email Address (Read Only)"
                    fullWidth
                    disabled
                    value={user.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Salary (Read Only)"
                    fullWidth
                    disabled
                    value={`$${user.salary.toLocaleString()}`}
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

              <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  sx={{ px: 4, py: 1, fontWeight: 600 }}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity="success"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
