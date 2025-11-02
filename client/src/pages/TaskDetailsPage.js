import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authApi, user, hasRole } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
const [savingTask, setSavingTask] = useState(false);
  useEffect(() => {
    fetchTaskDetails();
  }, [id, authApi, user]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const res = await authApi.get(`/tasks/${id}`);
      setTask(res.data.data);
      setEditedTask({
        title: res.data.data.title,
        description: res.data.data.description,
        assignedTo: res.data.data.assignedTo?._id || "",
        status: res.data.data.status,
        priority: res.data.data.priority,
        dueDate: res.data.data.dueDate
          ? new Date(res.data.data.dueDate).toISOString().split("T")[0]
          : "",
      });
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch task details.");
      setLoading(false);
    }
  };
const handleUpdateTask = async () => {
  setSavingTask(true);
  try {
    await authApi.put(`/tasks/${id}`, editedTask);
    setIsEditing(false);
    fetchTaskDetails();
  } catch (err) {
    setError(err.response?.data?.error || "Failed to update task.");
  } finally {
    setSavingTask(false);
  }
};


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

  if (!task) {
    return (
      <Typography variant="h6" className="text-center mt-8">
        Task not found.
      </Typography>
    );
  }

  const isProjectManager =
    task.project?.projectManager?._id === user?.id || hasRole("Admin");
  const isAssignedToUser = task.assignedTo?._id === user?.id;
  const canEdit = isProjectManager || isAssignedToUser;

  return (
    <Box className="p-4 md:p-8">
   
      <Box className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Typography
          variant="h4"
          className="font-semibold text-gray-800 tracking-tight"
        >
          {task.title}
        </Typography>

        {canEdit && (
      <Button
  variant={isEditing ? "contained" : "outlined"}
  color="primary"
  onClick={isEditing ? handleUpdateTask : () => setIsEditing(true)}
  disabled={savingTask}
  startIcon={
    isEditing
      ? savingTask
        ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
        : <SaveIcon />
      : <EditIcon />
  }
  className="transition duration-200 hover:scale-[1.02]"
>
  {isEditing
    ? savingTask
      ? "Saving..."
      : "Save Changes"
    : "Edit Task"}
</Button>

        )}
      </Box>

      <Card className="rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border border-gray-100">
        <CardContent className="space-y-4">
          <Typography variant="h6" className="font-semibold text-gray-700 mb-2">
            Task Details
          </Typography>

          {isEditing ? (
            <>

              <TextField
                label="Title"
                fullWidth
                margin="dense"
                variant="outlined"
                value={editedTask.title}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, title: e.target.value })
                }
                sx={{ mb: 2 }}
                disabled={!isProjectManager && !hasRole("Admin")}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                margin="dense"
                variant="outlined"
                value={editedTask.description}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, description: e.target.value })
                }
                sx={{ mb: 2 }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormControl fullWidth margin="dense">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editedTask.status}
                    label="Status"
                    onChange={(e) =>
                      setEditedTask({ ...editedTask, status: e.target.value })
                    }
                  >
                    <MenuItem value="To Do">To Do</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Done">Done</MenuItem>
                    <MenuItem value="Blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="dense">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editedTask.priority}
                    label="Priority"
                    onChange={(e) =>
                      setEditedTask({ ...editedTask, priority: e.target.value })
                    }
                    disabled={!isProjectManager && !hasRole("Admin")}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Due Date"
                  type="date"
                  fullWidth
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  value={editedTask.dueDate}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, dueDate: e.target.value })
                  }
                  disabled={!isProjectManager && !hasRole("Admin")}
                />

                {(isProjectManager || hasRole("Admin")) && (
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Assigned To</InputLabel>
                    <Select
                      value={editedTask.assignedTo}
                      label="Assigned To"
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          assignedTo: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="">
                        <em>Unassigned</em>
                      </MenuItem>
                      {task.project?.teamMembers?.map((member) => (
                        <MenuItem key={member._id} value={member._id}>
                          {member.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </div>
            </>
          ) : (
            <>
           
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-gray-700">
                <div className="space-y-2">
                  <Typography>
                    <strong>Project:</strong>{" "}
                    <Button
                      variant="text"
                      onClick={() => navigate(`/projects/${task.project._id}`)}
                    >
                      {task.project?.name}
                    </Button>
                  </Typography>
                  <Typography>
                    <strong>Description:</strong> {task.description || "N/A"}
                  </Typography>
                  <Typography>
                    <strong>Assigned To:</strong>{" "}
                    {task.assignedTo?.name || "Unassigned"}
                  </Typography>
                </div>

                <div className="space-y-2">
                  <Typography>
                    <strong>Status:</strong> {task.status}
                  </Typography>
                  <Typography>
                    <strong>Priority:</strong> {task.priority}
                  </Typography>
                  <Typography>
                    <strong>Due Date:</strong>{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                  <Typography>
                    <strong>Created At:</strong>{" "}
                    {new Date(task.createdAt).toLocaleDateString()}
                  </Typography>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default TaskDetailsPage;
