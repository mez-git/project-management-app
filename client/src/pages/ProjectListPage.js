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
      const { authApi, hasRole,user } = useAuth();
      const navigate = useNavigate();
      const [projects, setProjects] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState('');
      const [openCreateDialog, setOpenCreateDialog] = useState(false);
      const [newProject, setNewProject] = useState({ name: '', description: '', status: 'Not Started' });

      useEffect(() => {
        fetchProjects();
      }, []);

      const fetchProjects = async () => {
        setLoading(true);
        try {
          const res = await authApi.get('/projects');
          setProjects(res.data.data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch projects.');
          setLoading(false);
        }
      };

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

      const handleCreateProject = async () => {
        try {
          await authApi.post('/projects', newProject);
          setOpenCreateDialog(false);
          setNewProject({ name: '', description: '', status: 'Not Started' });
          fetchProjects();
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to create project.');
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

      return (
        <Box>
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
                      <TableCell>{project.projectManager?.name}</TableCell>
                      <TableCell>{project.status}</TableCell>
                      <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => navigate(`/projects/${project._id}`)} color="primary">
                          <InfoIcon />
                        </IconButton>
                        {hasRole(['Admin', 'Project Manager']) && (project.projectManager?._id === user?._id || hasRole('Admin')) && (
                            <>
                                <IconButton onClick={() => navigate(`/projects/${project._id}/edit`)} color="secondary">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteProject(project._id)} color="error">
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

    
          <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
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
              <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateProject} variant="contained">Create</Button>
            </DialogActions>
          </Dialog>
        </Box>
      );
    }

    export default ProjectListPage;