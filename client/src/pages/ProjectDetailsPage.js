import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
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
  Autocomplete
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import InfoIcon from '@mui/icons-material/Info';

function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authApi, user, hasRole } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: ''
  });

  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const isProjectManager =
    project?.projectManager?._id === user?._id || hasRole('Admin');
  const isTeamMember = project?.teamMembers?.some(
    (member) => member._id === user?._id
  );

  
  useEffect(() => {
    const fetchData = async () => {
      await fetchProjectDetails();
      await fetchAllUsers();
    };
    fetchData();
   
  }, [id, authApi, user]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const projectRes = await authApi.get(`/projects/${id}`);
      setProject(projectRes.data.data);

      const tasksRes = await authApi.get(`/projects/${id}/tasks`);
      setTasks(tasksRes.data.data);

      const activityRes = await authApi.get(`/projects/${id}/activity-logs`);
      setActivityLogs(activityRes.data.data);

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch project details.');
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await authApi.get('/users');
      setAllUsers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch all users:', err);
    }
  };

  const handleOpenCreateTask = () => {
    setCurrentTask(null);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      status: 'To Do',
      priority: 'Medium',
      dueDate: ''
    });
    setOpenTaskDialog(true);
  };

  const handleOpenEditTask = (task) => {
    setCurrentTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo?._id || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : ''
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
          `Failed to ${currentTask ? 'update' : 'create'} task.`
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await authApi.delete(`/tasks/${taskId}`);
        fetchProjectDetails();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete task.');
      }
    }
  };

  const handleAddTeamMember = async () => {
    if (!selectedMember) {
      setError('Please select a user to add.');
      return;
    }
    try {
      await authApi.put(`/projects/${id}/add-member`, {
        userId: selectedMember._id
      });
      setOpenAddMemberDialog(false);
      setSelectedMember(null);
      fetchProjectDetails();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add team member.');
    }
  };

  const handleRemoveTeamMember = async (userId) => {
    if (
      window.confirm(
        'Are you sure you want to remove this team member? Tasks assigned to them will be unassigned.'
      )
    ) {
      try {
        await authApi.put(`/projects/${id}/remove-member`, { userId });
        fetchProjectDetails();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to remove team member.');
      }
    }
  };

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

  if (!project) {
    return <Typography>Project not found.</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{project.name}</Typography>
        {(isProjectManager || hasRole('Admin')) && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projects/${project._id}/edit`)}
          >
            Edit Project
          </Button>
        )}
      </Box>

      {/* Project Details */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Project Details</Typography>
          <Typography variant="body1"><strong>Description:</strong> {project.description || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Status:</strong> {project.status}</Typography>
          <Typography variant="body1"><strong>Manager:</strong> {project.projectManager?.name || 'N/A'}</Typography>
          <Typography variant="body1"><strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Team Members */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Team Members</Typography>
                {(isProjectManager || hasRole('Admin')) && (
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setOpenAddMemberDialog(true)}
                  >
                    Add Member
                  </Button>
                )}
              </Box>
              <List>
                {project.teamMembers && project.teamMembers.length > 0 ? (
                  project.teamMembers.map((member) => (
                    <ListItem
                      key={member._id}
                      secondaryAction={
                        (isProjectManager || hasRole('Admin')) &&
                        member._id !== user?._id && (
                          <IconButton
                            edge="end"
                            aria-label="remove"
                            onClick={() => handleRemoveTeamMember(member._id)}
                          >
                            <PersonRemoveIcon />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemText primary={member.name} secondary={member.email} />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2">No team members assigned.</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Tasks */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Tasks</Typography>
                {(isProjectManager || hasRole('Admin')) && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateTask}
                  >
                    Create Task
                  </Button>
                )}
              </Box>
              <List>
                {tasks && tasks.length > 0 ? (
                  tasks.map((task) => (
                    <ListItem
                      key={task._id}
                      secondaryAction={
                        <>
                          <IconButton edge="end" onClick={() => navigate(`/tasks/${task._id}`)}>
                            <InfoIcon />
                          </IconButton>
                          {(isProjectManager || hasRole('Admin') || (task.assignedTo?._id === user?._id && hasRole('Team Member'))) && (
                            <IconButton edge="end" onClick={() => handleOpenEditTask(task)}>
                              <EditIcon />
                            </IconButton>
                          )}
                          {(isProjectManager || hasRole('Admin')) && (
                            <IconButton edge="end" onClick={() => handleDeleteTask(task._id)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </>
                      }
                    >
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Status: {task.status} | Priority: {task.priority}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              Assigned To: {task.assignedTo?.name || 'Unassigned'} | Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2">No tasks yet. Create one to get started!</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Logs */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Activity Logs</Typography>
              <List>
                {activityLogs && activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
                    <ListItem key={log._id}>
                      <ListItemText
                        primary={log.action}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {log.user?.name || 'Unknown User'}
                            </Typography>
                            {' — '} {log.details} ({new Date(log.createdAt).toLocaleString()})
                          </>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2">No recent activities for this project.</Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)}>
        <DialogTitle>{currentTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Assigned To</InputLabel>
            <Select
              value={newTask.assignedTo}
              label="Assigned To"
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              disabled={!isProjectManager && !hasRole('Admin')}
            >
              <MenuItem value=""><em>Unassigned</em></MenuItem>
              {project.teamMembers.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newTask.status}
              label="Status"
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              disabled={!isProjectManager && !hasRole('Admin') && !(currentTask?.assignedTo?._id === user?._id && hasRole('Team Member'))}
            >
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
              <MenuItem value="Blocked">Blocked</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTask.priority}
              label="Priority"
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              disabled={!isProjectManager && !hasRole('Admin')}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            sx={{ mb: 2 }}
            disabled={!isProjectManager && !hasRole('Admin')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained">
            {currentTask ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>

 
      <Dialog open={openAddMemberDialog} onClose={() => setOpenAddMemberDialog(false)}>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={allUsers.filter(
              (u) =>
                !project.teamMembers.some((member) => member._id === u._id) &&
                u._id !== project.projectManager?._id
            )}
            getOptionLabel={(option) =>
              option.name ? `${option.name} (${option.email})` : ''
            }
            isOptionEqualToValue={(option, value) => option._id === value._id}
            onChange={(event, newValue) => setSelectedMember(newValue)}
            value={selectedMember}
            renderInput={(params) => (
              <TextField {...params} label="Select User" margin="normal" fullWidth />
            )}
            sx={{ width: 400 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddMemberDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddTeamMember}
            variant="contained"
            disabled={!selectedMember}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectDetailsPage;
