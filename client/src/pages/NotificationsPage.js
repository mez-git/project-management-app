import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button
} from '@mui/material';

const NotificationsPage = () => {
  const { authApi } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await authApi.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    await authApi.put('/notifications/read-all');
    fetchNotifications();
  };

  if (loading) return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Notifications
      </Typography>
      <Button onClick={handleMarkAllAsRead} variant="outlined" sx={{ mb: 2 }}>
        Mark All as Read
      </Button>

      {notifications.length === 0 ? (
        <Typography>No notifications found.</Typography>
      ) : (
        notifications.map((n) => (
          <Paper
            key={n._id}
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: n.isRead ? 'white' : '#e3f2fd',
            }}
          >
            <Typography variant="body1">{n.message}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(n.createdAt).toLocaleString()}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default NotificationsPage;
