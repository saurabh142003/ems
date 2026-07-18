import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import PersonIcon from "@mui/icons-material/Person";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logout } from "../redux/slices/authSlice";
import { toggleDarkMode, toggleSidebar } from "../redux/slices/uiSlice";

const drawerWidth = 240;

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const { user } = useAppSelector((state) => state.auth);
  const { darkMode, sidebarOpen } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/",
      allowedRoles: ["Super Admin", "HR Manager"],
    },
    {
      text: "Employees",
      icon: <PeopleIcon />,
      path: "/employees",
      allowedRoles: ["Super Admin", "HR Manager"],
    },
    {
      text: "Org Tree",
      icon: <AccountTreeIcon />,
      path: "/org-tree",
      allowedRoles: ["Super Admin", "HR Manager"],
    },
    {
      text: "My Profile",
      icon: <PersonIcon />,
      path: `/profile`,
      allowedRoles: ["Super Admin", "HR Manager", "Employee"],
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) =>
      !item.allowedRoles || (user && item.allowedRoles.includes(user.role)),
  );

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const drawer = (
    <Box>
      <Toolbar
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
          EMS Dashboard
        </Typography>
      </Toolbar>
      <Divider />
      {user && (
        <Box
          sx={{
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            src={user.profileImage}
            sx={{ width: 64, height: 64, mb: 1, border: "2px solid #1976d2" }}
          >
            {user.name.charAt(0)}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.role}
          </Typography>
        </Box>
      )}
      <Divider />
      <List>
        {filteredMenuItems.map((item) => {
          const isSelected =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (!isSmUp) {
                    dispatch(toggleSidebar());
                  }
                }}
                selected={isSelected}
                sx={{
                  mx: 1,
                  borderRadius: 1.5,
                  my: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "#ffffff",
                    "& .MuiListItemIcon-root": {
                      color: "#ffffff",
                    },
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isSelected ? "#ffffff" : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { sm: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : "100%" },
          ml: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => dispatch(toggleSidebar())}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Employee Management System
          </Typography>

          <Tooltip title="Toggle light/dark theme">
            <IconButton
              color="inherit"
              onClick={() => dispatch(toggleDarkMode())}
              size="small"
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ ml: 1 }}
              size="small"
            >
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { sm: sidebarOpen ? drawerWidth : 0 },
          flexShrink: { sm: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid rgba(0,0,0,0.12)",
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="persistent"
          open={sidebarOpen}
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid rgba(0,0,0,0.12)",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { sm: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : "100%" },
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
