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
  Chip,
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
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to fetch dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [authApi]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-[calc(100vh-64px)] bg-gray-50">
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

  const {
    projectCount,
    pendingTasks,
    completedTasks,
    recentActivities,
    projectsSummary,
    tasksSummary,
  } = dashboardData;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border border-green-300";
      case "in progress":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "on hold":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // 🎯 Dynamic labels based on role
  const role = user?.role?.toLowerCase();
  const projectLabel =
    role === "admin"
      ? "All Projects"
      : role === "projectmanager"
      ? "Projects"
      : "Your Projects";
  const taskLabel =
    role === "admin"
      ? "All Tasks"
      : role === "projectmanager"
      ? "Tasks"
      : "Your Tasks";

  return (
    <Box className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <Box className="mb-8 text-center md:text-left">
        <Typography variant="h4" className="font-semibold text-gray-800 mb-2">
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="subtitle1" className="text-gray-600">
          Here’s a quick overview of your projects, tasks, and team activity.
        </Typography>
      </Box>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card
          onClick={() => navigate("/projects")}
          className="shadow-md rounded-2xl cursor-pointer hover:shadow-xl transition border-l-4 border-blue-500"
        >
          <CardContent className="text-center">
            <Typography variant="h6" className="text-gray-500">
              Total Projects
            </Typography>
            <Typography variant="h4" className="font-bold text-blue-600 mt-2">
              {projectCount}
            </Typography>
            <Typography className="text-sm text-gray-500 mt-1">
              Active 
            </Typography>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl hover:shadow-xl transition border-l-4 border-amber-500">
          <CardContent className="text-center">
            <Typography variant="h6" className="text-gray-500">
              Pending Tasks
            </Typography>
            <Typography variant="h4" className="font-bold text-amber-600 mt-2">
              {pendingTasks}
            </Typography>
            <Typography className="text-sm text-gray-500 mt-1">
              Tasks waiting for your action
            </Typography>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl hover:shadow-xl transition border-l-4 border-emerald-500">
          <CardContent className="text-center">
            <Typography variant="h6" className="text-gray-500">
              Completed Tasks
            </Typography>
            <Typography
              variant="h4"
              className="font-bold text-emerald-600 mt-2"
            >
              {completedTasks}
            </Typography>
            <Typography className="text-sm text-gray-500 mt-1">
              Great progress so far!
            </Typography>
          </CardContent>
        </Card>
      </div>

    
      <Box className="mb-12">
        <Typography variant="h5" className="font-semibold text-gray-800 mb-4">
          Recent Activity
        </Typography>

        {recentActivities?.length > 0 ? (
          <Box className="bg-white rounded-xl shadow p-4">
            {recentActivities.slice(0, 5).map((activity) => (
              <Box
                key={activity._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 py-3 last:border-0"
              >
                <Typography className="text-gray-800 font-medium">
                  {activity.action}
                </Typography>
                <Typography className="text-gray-500 text-sm mt-1 sm:mt-0">
                  {activity.user?.name || "Unknown User"} •{" "}
                  {new Date(activity.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            ))}

            {recentActivities.length > 5 && (
              <Box className="flex justify-center mt-4">
                <button
                  onClick={() => navigate("/activities")}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  See more →
                </button>
              </Box>
            )}
          </Box>
        ) : (
          <Typography className="text-gray-600 mt-2">
            No recent activity.
          </Typography>
        )}
      </Box>

  
      <Box className="mb-12">
        <Typography variant="h5" className="font-semibold text-gray-800 mb-4">
          📁 {projectLabel}
        </Typography>
        {projectsSummary?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projectsSummary.map((project) => (
              <Card
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="shadow-md rounded-2xl cursor-pointer hover:shadow-xl transition border border-gray-200 bg-white"
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    className="font-semibold text-gray-800 mb-2"
                  >
                    {project.name}
                  </Typography>
                  <div className="flex justify-between items-center">
                    <Typography variant="body2" className="text-gray-500">
                      Status:
                    </Typography>
                    <Chip
                      label={project.status}
                      className={`${getStatusColor(
                        project.status
                      )} text-xs px-2 py-1`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Typography className="text-gray-600 mt-2">
            No projects available.
          </Typography>
        )}
      </Box>

      <Box>
        <Typography variant="h5" className="font-semibold text-gray-800 mb-4">
          ✅ {taskLabel}
        </Typography>
        {tasksSummary?.length > 0 ? (
          <List className="bg-white rounded-xl shadow-md divide-y">
            {tasksSummary.map((task) => (
              <ListItem
                key={task.id}
                className="p-4 hover:bg-gray-50 transition"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full">
                  <div>
                    <Typography
                      variant="subtitle1"
                      className="font-medium text-gray-800"
                    >
                      {task.title}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 mt-1">
                      {task.projectName && `Project: ${task.projectName}`}
                    </Typography>
                  </div>
                  <Chip
                    label={task.status}
                    className={`${getStatusColor(
                      task.status
                    )} mt-2 sm:mt-0 text-xs px-2 py-1`}
                  />
                </div>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography className="text-gray-600 mt-2">
            No tasks available.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default DashboardPage;
