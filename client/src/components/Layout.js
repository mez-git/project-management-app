import React from 'react';
    import { Outlet } from 'react-router-dom';
    import { useAuth } from '../auth/AuthContext';
    import {
      AppBar,
      Toolbar,
      Typography,
      Button,
      Box,
      Drawer,
      List,
      ListItem,
      ListItemText,
      ListItemIcon,
      Divider,
    } from '@mui/material';
    import DashboardIcon from '@mui/icons-material/Dashboard';
    import FolderIcon from '@mui/icons-material/Folder';
    import PeopleIcon from '@mui/icons-material/People';
    import { useNavigate } from 'react-router-dom';

    const drawerWidth = 240;

    const Layout = () => {
      const { user, logout, hasRole } = useAuth();
      const navigate = useNavigate();

      const navItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Projects', icon: <FolderIcon />, path: '/projects' },
          { text: 'Change Password', icon: <FolderIcon />, path: '/change-password' },
      ];

      if (hasRole('Admin')) {
        navItems.push({ text: 'User Management', icon: <PeopleIcon />, path: '/users' });
      }

      return (
        <Box sx={{ display: 'flex' }}>
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                Project Management
              </Typography>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                Hello, {user?.name} ({user?.role})
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            <Toolbar /> 
            <Box sx={{ overflow: 'auto' }}>
              <List>
                {navItems.map((item) => (
                  <ListItem button key={item.text} onClick={() => navigate(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
              <Divider />
           
            </Box>
          </Drawer>
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}> 
            <Outlet />
          </Box>
        </Box>
      );
    };

    export default Layout;