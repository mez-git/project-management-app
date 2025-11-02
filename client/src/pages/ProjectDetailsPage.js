import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  Typography,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Autocomplete,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authApi, user, hasRole } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "To Do",
    priority: "Medium",
    dueDate: "",
  });

  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const isProjectManager =
    project?.projectManager?._id === user?._id || hasRole("Admin");

  useEffect(() => {
    const fetchData = async () => {
      await fetchProjectDetails();
      await fetchAllUsers();
    };
    fetchData();
  }, [id, authApi]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const projectRes = await authApi.get(`/projects/${id}`);
      setProject(projectRes.data.data);

      const tasksRes = await authApi.get(`/projects/${id}/tasks`);
      setTasks(tasksRes.data.data);

      const activityRes = await authApi.get(`/projects/${id}/activity-logs`);
      setActivityLogs(activityRes.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch project details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await authApi.get("/users");
      setAllUsers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleOpenCreateTask = () => {
    setCurrentTask(null);
    setNewTask({
      title: "",
      description: "",
      assignedTo: "",
      status: "To Do",
      priority: "Medium",
      dueDate: "",
    });
    setOpenTaskDialog(true);
  };

  const handleOpenEditTask = (task) => {
    setCurrentTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo?._id || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });
    setOpenTaskDialog(true);
  };

  const handleSaveTask = async () => {
    try {
      if (currentTask) {
        await authApi.put(`/tasks/${currentTask._id}`, newTask);
      } else {
        await authApi.post(`/projects/${id}/tasks`, newTask);
      }
      setOpenTaskDialog(false);
      fetchProjectDetails();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          `Failed to ${currentTask ? "update" : "create"} task.`
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await authApi.delete(`/tasks/${taskId}`);
        fetchProjectDetails();
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete task.");
      }
    }
  };

  const handleAddTeamMember = async () => {
    if (!selectedMember) return setError("Please select a user.");
    try {
      await authApi.put(`/projects/${id}/add-member`, {
        userId: selectedMember._id,
      });
      setOpenAddMemberDialog(false);
      setSelectedMember(null);
      fetchProjectDetails();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add team member.");
    }
  };

  const handleRemoveTeamMember = async (userId) => {
    if (
      window.confirm(
        "Remove this team member? Tasks assigned to them will be unassigned."
      )
    ) {
      try {
        await authApi.put(`/projects/${id}/remove-member`, { userId });
        fetchProjectDetails();
      } catch (err) {
        setError(err.response?.data?.error || "Failed to remove member.");
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <CircularProgress />
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <Alert severity="error">{error}</Alert>
      </div>
    );

  if (!project)
    return (
      <div className="p-6">
        <Typography>Project not found.</Typography>
      </div>
    );

  const visibleLogs = showAllLogs ? activityLogs : activityLogs.slice(0, 5);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
  
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          {project.name}
        </h1>
        {isProjectManager && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projects/${project._id}/edit`)}
          >
            Edit Project
          </Button>
        )}
      </div>

  
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Project Details
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.status === "Completed"
                ? "bg-green-100 text-green-700"
                : project.status === "In Progress"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {project.status}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <p>
            <strong>Description:</strong>{" "}
            {project.description || "No description provided."}
          </p>
          <p>
            <strong>Manager:</strong> {project.projectManager?.name || "N/A"}
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Members:</strong> {project.teamMembers?.length || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">
              Team Members
            </h2>
            {isProjectManager && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => setOpenAddMemberDialog(true)}
              >
                Add Member
              </Button>
            )}
          </div>
          {project.teamMembers?.length ? (
            <ul className="divide-y divide-gray-100">
              {project.teamMembers.map((member) => (
                <li
                  key={member._id}
                  className="flex justify-between items-center py-2"
                >
                  <div>
                    <p className="font-medium text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  {isProjectManager && member._id !== user?._id && (
                    <IconButton
                      onClick={() => handleRemoveTeamMember(member._id)}
                      color="error"
                      size="small"
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No team members yet.</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Tasks</h2>
            {isProjectManager && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateTask}
                disabled={project.status === "Completed"}
                title={
                  project.status === "Completed"
                    ? "Cannot add tasks to a completed project"
                    : "Create a new task"
                }
              >
                Create Task
              </Button>
            )}
          </div>
          {tasks.length ? (
            <ul className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className="flex justify-between items-start py-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      Status: {task.status} | Priority: {task.priority}
                    </p>
                    <p className="text-xs text-gray-400">
                      Assigned: {task.assignedTo?.name || "Unassigned"} | Due:{" "}
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <IconButton
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      size="small"
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                    {isProjectManager && project.status !== "Completed" && (
                      <>
                        <IconButton
                          onClick={() => handleOpenEditTask(task)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteTask(task._id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No tasks yet.</p>
          )}
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-700">Activity Logs</h2>
          {activityLogs.length > 5 && (
            <Button
              size="small"
              endIcon={showAllLogs ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setShowAllLogs(!showAllLogs)}
            >
              {showAllLogs ? "Show Less" : "See More"}
            </Button>
          )}
        </div>
        {visibleLogs.length ? (
          <ul className="divide-y divide-gray-100">
            {visibleLogs.map((log) => (
              <li key={log._id} className="py-2 text-sm text-gray-600">
                <strong>{log.user?.name || "Unknown User"}</strong> —{" "}
                {log.action} • {log.details}{" "}
                <span className="text-gray-400">
                  ({new Date(log.createdAt).toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">
            No recent activity for this project.
          </p>
        )}
      </div>

      {/* Task Dialog */}
      <Dialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {currentTask ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-3 mt-2">
            <TextField
              label="Task Title"
              fullWidth
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={newTask.assignedTo}
                label="Assigned To"
                onChange={(e) =>
                  setNewTask({ ...newTask, assignedTo: e.target.value })
                }
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {project.teamMembers.map((m) => (
                  <MenuItem key={m._id} value={m._id}>
                    {m.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newTask.status}
                label="Status"
                onChange={(e) =>
                  setNewTask({ ...newTask, status: e.target.value })
                }
              >
                <MenuItem value="To Do">To Do</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
                <MenuItem value="Blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                label="Priority"
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Due Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTask}>
            {currentTask ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog
        open={openAddMemberDialog}
        onClose={() => setOpenAddMemberDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={allUsers.filter(
              (u) =>
                !project.teamMembers.some((m) => m._id === u._id) &&
                u._id !== project.projectManager?._id
            )}
            getOptionLabel={(o) => (o.name ? `${o.name} (${o.email})` : "")}
            onChange={(e, newVal) => setSelectedMember(newVal)}
            renderInput={(params) => (
              <TextField {...params} label="Select User" fullWidth />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddMemberDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddTeamMember}
            disabled={!selectedMember}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ProjectDetailsPage;
