import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Team Member'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();


  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="Team Member">Team Member</MenuItem>
              <MenuItem value="Project Manager">Project Manager</MenuItem>
             
            </Select>
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
          <Box display="flex" justifyContent="flex-end">
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Already have an account? Sign In
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default RegisterPage;