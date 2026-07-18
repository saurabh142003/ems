import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import BusinessIcon from "@mui/icons-material/Business";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axiosInstance from "../api/axiosInstance";
import { DashboardStats } from "../types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const DashboardHome: React.FC = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/dashboard/stats");
        setData(response.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Failed to fetch dashboard stats",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          {error || "Error loading dashboard data"}
        </Typography>
      </Box>
    );
  }

  const { stats, charts } = data;

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: <PeopleAltIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      bg: "primary.light",
    },
    {
      title: "Active Employees",
      value: stats.activeEmployees,
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />,
      bg: "success.light",
    },
    {
      title: "Inactive/Suspended",
      value: stats.inactiveEmployees + stats.suspendedEmployees,
      icon: <BlockIcon sx={{ fontSize: 40, color: "error.main" }} />,
      bg: "error.light",
    },
    {
      title: "Departments",
      value: stats.departmentCount,
      icon: <BusinessIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
      bg: "secondary.light",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card sx={{ height: "100%" }}>
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: { xs: "row", sm: "column" },
                  textAlign: { xs: "left", sm: "center" },
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : `${card.bg}15`,
                  }}
                >
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Department Distribution Bar Chart */}
        <Grid item xs={12} sm={12} md={7}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Department Distribution
            </Typography>
            <Box sx={{ height: { xs: 250, sm: 300 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.departmentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="department"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="count" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Status Distribution Pie Chart */}
        <Grid item xs={12} sm={12} md={5}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Employee Status Distribution
            </Typography>
            <Box
              sx={{
                height: { xs: 250, sm: 300 },
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {charts.statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Monthly Joining Trends */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Monthly Joining Trends
            </Typography>
            <Box sx={{ height: { xs: 250, sm: 300 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <ChartTooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2e7d32"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
