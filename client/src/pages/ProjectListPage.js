import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

function ProjectListPage() {
  const { authApi, hasRole, user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "Not Started",
    projectManager: "",
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOption, setSortOption] = useState("date");

  // ─── Fetch Projects & Managers ────────────────────────────────────────────────
  useEffect(() => {
    fetchProjects();
    if (hasRole("Admin")) fetchManagers();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await authApi.get("/projects");
      setProjects(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await authApi.get("/users?role=Project Manager");
      setManagers(res.data.data || []);
    } catch {
      setError("Failed to load project managers.");
    }
  };

  // ─── Create / Delete ─────────────────────────────────────────────────────────
  const handleCreateProject = async () => {
    try {
      const payload = {
        ...newProject,
        projectManager: hasRole("Project Manager")
          ? user._id // automatically assign manager
          : newProject.projectManager,
      };

      await authApi.post("/projects", payload);
      fetchProjects();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create project.");
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project and its tasks?")) return;
    try {
      await authApi.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete project.");
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewProject({
      name: "",
      description: "",
      status: "Not Started",
      projectManager: "",
    });
  };

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const canManage = (project) =>
    hasRole("Admin") ||
    (hasRole("Project Manager") &&
      (project.projectManager === user?._id ||
        project.projectManager?._id === user?._id));

  // ─── Filter + Sort ───────────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase();

    const filtered = projects.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      const matchesStatus = filterStatus === "All" || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return filtered.slice().sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return a.status.localeCompare(b.status);
        case "manager":
          return (a.projectManager?.name || "").localeCompare(
            b.projectManager?.name || ""
          );
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [projects, search, filterStatus, sortOption]);

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <CircularProgress />
      </div>
    );

  // ─── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Projects
        </h1>

        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <FormControl size="small" className="min-w-[150px]">
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {["All", "Not Started", "In Progress", "Completed", "On Hold"].map(
                (s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>

          <FormControl size="small" className="min-w-[150px]">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOption}
              label="Sort By"
              onChange={(e) => setSortOption(e.target.value)}
            >
              <MenuItem value="date">Date Created</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="status">Status</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </Select>
          </FormControl>

          {hasRole(["Admin", "Project Manager"]) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table View */}
      {filteredProjects.length === 0 ? (
        <p className="text-gray-600">
          No projects found. Try adjusting filters or create one.
        </p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 font-medium">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => (
                  <tr
                    key={p._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    <td className="px-4 py-3">{p.description || "—"}</td>
                    <td className="px-4 py-3">{p.projectManager?.name || "—"}</td>
                    <td className="px-4 py-3">{p.status}</td>
                    <td className="px-4 py-3">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip title="View Project">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/projects/${p._id}`)}
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

                        {canManage(p) && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  navigate(`/projects/${p._id}/edit`)
                                }
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

                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteProject(p._id)}
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {filteredProjects.map((p) => (
              <div
                key={p._id}
                className="border border-gray-200 rounded-xl shadow-sm p-4 bg-white hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-semibold text-lg">{p.name}</h2>
                  <div className="flex gap-1">
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/projects/${p._id}`)}
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
                    {canManage(p) && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/projects/${p._id}/edit`)}
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
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteProject(p._id)}
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
                      </>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-2">
                  {p.description || "No description"}
                </p>
                <p className="text-gray-500 text-xs mb-1">
                  Manager:{" "}
                  <span className="font-medium text-gray-800">
                    {p.projectManager?.name || "—"}
                  </span>
                </p>
                <p className="text-gray-500 text-xs mb-1">
                  Status:{" "}
                  <span className="font-medium text-gray-800">{p.status}</span>
                </p>
                <p className="text-gray-400 text-xs">
                  Created: {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─── Create Dialog ──────────────────────────────────────────────── */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2 w-80 sm:w-96">
            <input
              type="text"
              placeholder="Project Name"
              className="border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200 outline-none"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              className="border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200 outline-none"
              rows="4"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />

            {hasRole("Admin") && (
              <FormControl fullWidth>
                <InputLabel>Project Manager</InputLabel>
                <Select
                  value={newProject.projectManager || ""}
                  label="Project Manager"
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      projectManager: e.target.value,
                    })
                  }
                >
                  {managers.map((m) => (
                    <MenuItem key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newProject.status}
                label="Status"
                onChange={(e) =>
                  setNewProject({ ...newProject, status: e.target.value })
                }
              >
                {["Not Started", "In Progress", "Completed", "On Hold"].map(
                  (s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateProject}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ProjectListPage;
