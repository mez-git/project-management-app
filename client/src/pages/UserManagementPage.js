import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

function UserManagementPage() {
  const { authApi, hasRole, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "" });

  // Fetch all users
  useEffect(() => {
    if (hasRole("Admin")) fetchUsers();
    else {
      setError("You are not authorized to view this page.");
      setLoading(false);
    }
  }, []);

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

  const handleOpenEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setOpenEditDialog(true);
  };

  const handleUpdateUser = async () => {
    try {
      await authApi.put(`/users/${currentUser._id}`, formData);
      fetchUsers();
      setOpenEditDialog(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user.");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
  
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          User Management
        </h1>
      </div>

  
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
          className="w-full md:w-3/4 lg:w-1/2"
        >
          {error}
        </Alert>
      )}

  
      {users.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <>
     
          <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-900 font-medium">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined On</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Tooltip title="User Info">
                          <IconButton
                            size="small"
                            sx={{
                              backgroundColor: "rgba(25,118,210,0.08)",
                              "&:hover": {
                                backgroundColor: "rgba(25,118,210,0.15)",
                              },
                            }}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit User">
                          <IconButton
                            onClick={() => handleOpenEdit(u)}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(156,39,176,0.08)",
                              "&:hover": {
                                backgroundColor: "rgba(156,39,176,0.15)",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {u._id !== user._id && (
                          <Tooltip title="Delete User">
                            <IconButton
                              onClick={() => handleDeleteUser(u._id)}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(211,47,47,0.08)",
                                "&:hover": {
                                  backgroundColor: "rgba(211,47,47,0.15)",
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

   
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {users.map((u) => (
              <div
                key={u._id}
                className="border border-gray-200 rounded-xl shadow-sm p-4 bg-white hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-semibold text-lg text-gray-800">
                    {u.name}
                  </h2>
                  <div className="flex gap-1">
                    <Tooltip title="User Info">
                      <IconButton
                        size="small"
                        sx={{
                          backgroundColor: "rgba(25,118,210,0.08)",
                          "&:hover": {
                            backgroundColor: "rgba(25,118,210,0.15)",
                          },
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit User">
                      <IconButton
                        onClick={() => handleOpenEdit(u)}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(156,39,176,0.08)",
                          "&:hover": {
                            backgroundColor: "rgba(156,39,176,0.15)",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {u._id !== user._id && (
                      <Tooltip title="Delete User">
                        <IconButton
                          onClick={() => handleDeleteUser(u._id)}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(211,47,47,0.08)",
                            "&:hover": {
                              backgroundColor: "rgba(211,47,47,0.15)",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{u.email}</p>
                <p className="text-gray-500 text-xs mb-1">
                  Role:{" "}
                  <span className="text-gray-800 font-medium">{u.role}</span>
                </p>
                <p className="text-gray-400 text-xs">
                  Joined: {new Date(u.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}


      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            <TextField
              label="Name"
              variant="outlined"
              value={formData.name}
              disabled
              fullWidth
            />
            <TextField
              label="Email"
              variant="outlined"
              value={formData.email}
              disabled
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Project Manager">Project Manager</MenuItem>
                <MenuItem value="Team Member">Team Member</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateUser}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserManagementPage;
