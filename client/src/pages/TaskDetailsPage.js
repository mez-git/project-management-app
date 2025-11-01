 import React, { useEffect, useState } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { useAuth } from '../auth/AuthContext';
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
      FormControl
    } from '@mui/material';
    import EditIcon from '@mui/icons-material/Edit';
    import SaveIcon from '@mui/icons-material/Save';

    function TaskDetailsPage() {
      const { id } = useParams();
      const navigate = useNavigate();
      const { authApi, user, hasRole } = useAuth();
      const [task, setTask] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState('');
      const [isEditing, setIsEditing] = useState(false);
      const [editedTask, setEditedTask] = useState({});

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
            assignedTo: res.data.data.assignedTo?._id || '',
            status: res.data.data.status,
            priority: res.data.data.priority,
            dueDate: res.data.data.dueDate ? new Date(res.data.data.dueDate).toISOString().split('T')[0] : '',
          });
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch task details.');
          setLoading(false);
        }
      };

      const handleUpdateTask = async () => {
        try {
          await authApi.put(`/tasks/${id}`, editedTask);
          setIsEditing(false);
          fetchTaskDetails(); 
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to update task.');
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

      if (!task) {
        return <Typography>Task not found.</Typography>;
      }

      const isProjectManager = task.project?.projectManager?._id === user?.id || hasRole('Admin');
      const isAssignedToUser = task.assignedTo?._id === user?.id;
      const canEdit = isProjectManager || isAssignedToUser;

      return (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">{task.title}</Typography>
            {canEdit && (
              isEditing ? (
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleUpdateTask}>
                  Save Changes
                </Button>
              ) : (
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                  Edit Task
                </Button>
              )
            )}
          </Box>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Task Details</Typography>

              {isEditing ? (
                <>
                  <TextField
                    margin="dense"
                    label="Title"
                    fullWidth
                    variant="outlined"
                    value={editedTask.title}
                    onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                    sx={{ mb: 2 }}
                    disabled={!isProjectManager && !hasRole('Admin')}
                  />
                  <TextField
                    margin="dense"
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={editedTask.description}
                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editedTask.status}
                      label="Status"
                      onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
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
                      value={editedTask.priority}
                      label="Priority"
                      onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
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
                    value={editedTask.dueDate}
                    onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                    sx={{ mb: 2 }}
                    disabled={!isProjectManager && !hasRole('Admin')}
                  />
              
                  {(isProjectManager || hasRole('Admin')) && (
                    <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                      <InputLabel>Assigned To</InputLabel>
                      <Select
                        value={editedTask.assignedTo}
                        label="Assigned To"
                        onChange={(e) => setEditedTask({ ...editedTask, assignedTo: e.target.value })}
                      >
                        <MenuItem value=""><em>Unassigned</em></MenuItem>
                        {task.project?.teamMembers?.map((member) => (
                          <MenuItem key={member._id} value={member._id}>
                            {member.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              ) : (
                <>
                  <Typography variant="body1"><strong>Project:</strong> <Button variant="text" onClick={() => navigate(`/projects/${task.project._id}`)}>{task.project?.name}</Button></Typography>
                  <Typography variant="body1"><strong>Description:</strong> {task.description || 'N/A'}</Typography>
                  <Typography variant="body1"><strong>Assigned To:</strong> {task.assignedTo?.name || 'Unassigned'}</Typography>
                  <Typography variant="body1"><strong>Status:</strong> {task.status}</Typography>
                  <Typography variant="body1"><strong>Priority:</strong> {task.priority}</Typography>
                  <Typography variant="body1"><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</Typography>
                  <Typography variant="body1"><strong>Created At:</strong> {new Date(task.createdAt).toLocaleDateString()}</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    export default TaskDetailsPage;