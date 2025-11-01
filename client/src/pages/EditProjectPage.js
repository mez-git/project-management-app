import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
  CardContent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function EditProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authApi, hasRole, user } = useAuth();

  const [project, setProject] = useState({
    name: '',
    description: '',
    status: 'Not Started',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await authApi.get(`/projects/${id}`);
        setProject(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, authApi]);

  const isAdminOrPM =
    hasRole('Admin') ||
    project.projectManager === user?._id ||
    project.projectManager?._id === user?._id;

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await authApi.put(`/projects/${id}`, {
        name: project.name,
        description: project.description,
        status: project.status,
      });
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Unauthorized view
  if (!isAdminOrPM) {
    return <Alert severity="error">You are not authorized to edit this project.</Alert>;
  }

  return (
    <Box maxWidth="700px" mx="auto" mt={4}>
      <Typography variant="h4" mb={3}>
        Edit Project
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Project Name"
              name="name"
              fullWidth
              value={project.name}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={3}
              value={project.description}
              onChange={handleChange}
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={project.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
              </Select>
            </FormControl>

            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/projects/${id}`)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{ minWidth: 140 }}
              >
                {saving ? (
                  <>
                    <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} />
                    Saving...
                  </>
                ) : (
                  'Update Project'
                )}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default EditProjectPage;
