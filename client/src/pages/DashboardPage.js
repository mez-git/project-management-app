import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const { authApi, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await authApi.get("/dashboard");
        setDashboardData(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch dashboard data.");
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [authApi]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-[calc(100vh-64px)]">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Typography variant="h6" className="text-center mt-8">
        No dashboard data available.
      </Typography>
    );
  }

  return (
    <Box className="p-4 md:p-8">
      <Typography
        variant="h4"
        gutterBottom
        className="font-semibold text-gray-800 mb-6 text-center md:text-left"
      >
        Welcome, {user?.name}!
      </Typography>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
       
        <Box
          onClick={() => navigate("/projects")}
          className="cursor-pointer transform transition duration-200 hover:scale-[1.03] hover:shadow-lg"
        >
          <Card className="shadow-md rounded-2xl">
            <CardContent className="text-center">
              <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom
                className="text-gray-500"
              >
                Total Projects
              </Typography>
              <Typography variant="h4" component="div" className="font-bold">
                {dashboardData.projectCount}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Pending Tasks */}
        <Card className="shadow-md rounded-2xl">
          <CardContent className="text-center">
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              className="text-gray-500"
            >
              Pending Tasks
            </Typography>
            <Typography variant="h4" component="div" className="font-bold">
              {dashboardData.pendingTasks}
            </Typography>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="shadow-md rounded-2xl">
          <CardContent className="text-center">
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              className="text-gray-500"
            >
              Completed Tasks
            </Typography>
            <Typography variant="h4" component="div" className="font-bold">
              {dashboardData.completedTasks}
            </Typography>
          </CardContent>
        </Card>
      </div>


      <Typography
        variant="h5"
        gutterBottom
        className="font-semibold text-gray-800 mb-4"
      >
        Recent Activity
      </Typography>

      {dashboardData.recentActivities &&
      dashboardData.recentActivities.length > 0 ? (
        <List className="bg-white rounded-lg shadow divide-y">
          {dashboardData.recentActivities.map((activity, index) => (
            <React.Fragment key={activity._id}>
              <ListItem alignItems="flex-start" className="p-4">
                <ListItemText
                  primary={
                    <span className="font-medium text-gray-800">
                      {activity.action}
                    </span>
                  }
                  secondary={
                    <span className="text-gray-600 text-sm">
                      <strong>{activity.user?.name || "Unknown User"}</strong> —{" "}
                      {activity.details} (
                      {new Date(activity.createdAt).toLocaleString()})
                    </span>
                  }
                />
              </ListItem>
              {index < dashboardData.recentActivities.length - 1 && (
                <Divider component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography className="text-gray-600 mt-4">
          No recent activities.
        </Typography>
      )}
    </Box>
  );
}

export default DashboardPage;
