import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Notifications from "./Notifications";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 250;

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Projects", icon: <FolderIcon />, path: "/projects" },
    { text: "Change Password", icon: <LockIcon />, path: "/change-password" },
  ];

  if (hasRole("Admin")) {
    navItems.push({
      text: "User Management",
      icon: <PeopleIcon />,
      path: "/users",
    });
  }

  const drawerContent = (
    <Box className="flex flex-col h-full justify-between bg-white">

      <div>
        <Toolbar className="flex justify-center border-b">
          <Typography variant="h6" className="text-primary font-semibold">
            Menu
          </Typography>
        </Toolbar>
        <List>
          {navItems.map((item) => (
            <ListItem
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              className="hover:bg-blue-50 transition-all cursor-pointer"
            >
              <ListItemIcon sx={{ color: "#1976d2" }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>
          ))}
        </List>
      </div>

     
      <div className="p-4 border-t flex justify-center">
        <Tooltip title="Logout">
          <IconButton
            color="error"
            onClick={logout}
            sx={{
              border: "1px solid",
              borderColor: "error.main",
              borderRadius: 2,
              p: 1.2,
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.1)",
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </div>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>

      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          backgroundColor: "#1565c0",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          className="flex justify-between px-3 sm:px-6"
          sx={{ minHeight: 64 }}
        >
       
          <Box className="flex items-center gap-2">
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              className="lg:hidden"
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              className="font-semibold"
            >
              Project Management
            </Typography>
          </Box>

          <Box className="flex items-center gap-2 sm:gap-4">
            <Notifications />

            <Typography
              variant="subtitle1"
              className="hidden sm:inline text-sm md:text-base"
            >
              Hello, <span className="font-medium">{user?.name}</span> (
              {user?.role})
            </Typography>

            <Tooltip title="Logout">
              <IconButton
                color="inherit"
                onClick={logout}
                aria-label="logout"
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
   
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              boxShadow: 4,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", lg: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid #e0e0e0",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: 8,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
