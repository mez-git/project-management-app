  import React, { useEffect, useState } from 'react';
    import { useAuth } from '../auth/AuthContext';
    import {
      Box,
      Typography,
      Grid,
      Card,
      CardContent,
      CircularProgress,
      Alert,
      List,
      ListItem,
      ListItemText,
      Divider,
    } from '@mui/material';

    function DashboardPage() {
      const { authApi, user } = useAuth();
      const [dashboardData, setDashboardData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState('');

      useEffect(() => {
        const fetchDashboardData = async () => {
          try {
            const res = await authApi.get('/dashboard');
            setDashboardData(res.data.data);
            setLoading(false);
          } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch dashboard data.');
            setLoading(false);
          }
        };
        fetchDashboardData();
      }, [authApi]);

      if (loading) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
            <CircularProgress />
          </Box>
        );
      }

      if (error) {
        return <Alert severity="error">{error}</Alert>;
      }

      if (!dashboardData) {
        return <Typography variant="h6">No dashboard data available.</Typography>;
      }

      return (
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.name}!
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Projects
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData.projectCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Pending Tasks
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData.pendingTasks}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Completed Tasks
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData.completedTasks}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom>
            Recent Activity
          </Typography>
          {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
            <List sx={{ bgcolor: 'background.paper' }}>
              {dashboardData.recentActivities.map((activity, index) => (
                <React.Fragment key={activity._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={activity.action}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {activity.user?.name || 'Unknown User'}
                          </Typography>
                          {' — '}{activity.details} ({new Date(activity.createdAt).toLocaleString()})
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < dashboardData.recentActivities.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography>No recent activities.</Typography>
          )}

         
        </Box>
      );
    }

    export default DashboardPage;