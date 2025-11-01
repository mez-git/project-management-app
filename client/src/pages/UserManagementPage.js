import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import PrivateRoute from "../auth/PrivateRoute";
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
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

function UserManagementPage() {
  const { authApi, hasRole, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Team Member",
  });

  useEffect(() => {
    if (hasRole("Admin")) {
      fetchUsers();
    } else {
      setError("You are not authorized to view this page.");
      setLoading(false);
    }
  }, [authApi, hasRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authApi.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateUser = () => {
    setCurrentUser(null);
    setUserFormData({ name: "", email: "", password: "", role: "Team Member" });
    setOpenUserDialog(true);
  };

  const handleOpenEditUser = (user) => {
    setCurrentUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setOpenUserDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      if (currentUser) {
        const updateData = { ...userFormData };
        delete updateData.password;
        await authApi.put(`/users/${currentUser._id}`, updateData);
      } else {
        await authApi.post("/users", userFormData);
      }
      setOpenUserDialog(false);
      fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          `Failed to ${currentUser ? "update" : "create"} user.`
      );
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await authApi.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete user.");
      }
    }
  };

  if (!hasRole("Admin")) {
    return (
      <Alert severity="error">You are not authorized to view this page.</Alert>
    );
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="calc(100vh - 64px)"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateUser}
        >
          Add New User
        </Button>
      </Box>

      {users.length === 0 ? (
        <Typography>No users found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((userItem) => (
                <TableRow key={userItem._id}>
                  <TableCell>{userItem.name}</TableCell>
                  <TableCell>{userItem.email}</TableCell>
                  <TableCell>{userItem.role}</TableCell>
                  <TableCell>
                    {new Date(userItem.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenEditUser(userItem)}
                      color="secondary"
                    >
                      <EditIcon />
                    </IconButton>
                    {userItem._id !== user._id && (
                      <IconButton
                        onClick={() => handleDeleteUser(userItem._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
        <DialogTitle>
          {currentUser ? "Edit User" : "Create New User"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={userFormData.name}
            onChange={(e) =>
              setUserFormData({ ...userFormData, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={userFormData.email}
            onChange={(e) =>
              setUserFormData({ ...userFormData, email: e.target.value })
            }
            sx={{ mb: 2 }}
            disabled={!!currentUser}
          />

          {!currentUser && (
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={userFormData.password}
              onChange={(e) =>
                setUserFormData({ ...userFormData, password: e.target.value })
              }
              sx={{ mb: 2 }}
            />
          )}

          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={userFormData.role}
              label="Role"
              onChange={(e) =>
                setUserFormData({ ...userFormData, role: e.target.value })
              }
            >
              <MenuItem
                value="Admin"
                disabled={
                  users.some((u) => u.role === "Admin") &&
                  (!currentUser || currentUser.role !== "Admin")
                }
              >
                Admin
              </MenuItem>
              <MenuItem value="Project Manager">Project Manager</MenuItem>
              <MenuItem value="Team Member">Team Member</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {currentUser ? "Update User" : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const ProtectedUserManagementPage = () => (
  <PrivateRoute allowedRoles={["Admin"]}>
    <UserManagementPage />
  </PrivateRoute>
);

export default ProtectedUserManagementPage;
