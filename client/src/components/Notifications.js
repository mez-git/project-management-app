import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { authApi } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await authApi.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    try {
      await authApi.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ style: { width: 350, maxHeight: 400 } }}
      >
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">Notifications</Typography>
          <Button size="small" onClick={handleMarkAllAsRead}>Mark all read</Button>
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            No notifications
          </Typography>
        ) : (
          notifications.slice(0, 5).map((n) => (
            <MenuItem
              key={n._id}
              sx={{
                whiteSpace: 'normal',
                backgroundColor: n.isRead ? 'inherit' : '#e3f2fd'
              }}
            >
              <Box>
                <Typography variant="body2">{n.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(n.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}

        <Divider />
        <MenuItem onClick={() => { handleClose(); navigate('/notifications'); }}>
          <Typography color="primary" sx={{ textAlign: 'center', width: '100%' }}>
            See more
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Notifications;
