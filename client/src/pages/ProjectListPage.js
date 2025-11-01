import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';

function ProjectListPage() {
  const { authApi, hasRole, user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'Not Started',
    projectManager: ''
  });

  // ✅ Fetch projects and managers
  useEffect(() => {
    if (hasRole('Admin')) fetchManagers();
    fetchProjects();
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await authApi.get('/users?role=Project Manager');
      setManagers(res.data.data);
    } catch (err) {
      console.error('Failed to load managers', err);
      setError('Failed to load project managers.');
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await authApi.get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset form fields
  const resetNewProject = () => {
    setNewProject({
      name: '',
      description: '',
      status: 'Not Started',
      projectManager: ''
    });
  };

  // ✅ Create project handler
  const handleCreateProject = async () => {
    try {
      await authApi.post('/projects', newProject);
      fetchProjects();
      resetNewProject();
      setOpenCreateDialog(false);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.error || 'Failed to create project.');
    }
  };

  // ✅ Delete project handler
  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) {
      try {
        await authApi.delete(`/projects/${id}`);
        fetchProjects();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete project.');
      }
    }
  };

  // ✅ Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ✅ Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        {hasRole(['Admin', 'Project Manager']) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Create New Project
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Projects Table */}
      {projects.length === 0 ? (
        <Typography>No projects available. Create one to get started!</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>{project.projectManager?.name || '—'}</TableCell>
                  <TableCell>{project.status}</TableCell>
                  <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => navigate(`/projects/${project._id}`)} color="primary">
                      <InfoIcon />
                    </IconButton>
                    {hasRole(['Admin', 'Project Manager']) &&
                      (project.projectManager?._id === user?._id || hasRole('Admin')) && (
                        <>
                          <IconButton
                            onClick={() => navigate(`/projects/${project._id}/edit`)}
                            color="secondary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteProject(project._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Project Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          resetNewProject();
        }}
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          {hasRole('Admin') && (
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Project Manager</InputLabel>
              <Select
                value={newProject.projectManager || ''}
                label="Project Manager"
                onChange={(e) => setNewProject({ ...newProject, projectManager: e.target.value })}
              >
                {managers.map((m) => (
                  <MenuItem key={m._id} value={m._id}>
                    {m.name} ({m.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={newProject.status}
              label="Status"
              onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
            >
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenCreateDialog(false);
              resetNewProject();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateProject}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectListPage;
