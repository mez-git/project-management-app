import React, { useEffect, useState } from "react";
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
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "Not Started",
    projectManager: "",
  });


  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOption, setSortOption] = useState("date");

  useEffect(() => {
    if (hasRole("Admin")) fetchManagers();
    fetchProjects();
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await authApi.get("/users?role=Project Manager");
      setManagers(res.data.data);
    } catch (err) {
      console.error("Failed to load managers", err);
      setError("Failed to load project managers.");
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await authApi.get("/projects");
      setProjects(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  };

  const resetNewProject = () => {
    setNewProject({
      name: "",
      description: "",
      status: "Not Started",
      projectManager: "",
    });
  };

  const handleCreateProject = async () => {
    try {
      await authApi.post("/projects", newProject);
      fetchProjects();
      resetNewProject();
      setOpenCreateDialog(false);
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.response?.data?.error || "Failed to create project.");
    }
  };

  const handleDeleteProject = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? All associated tasks will also be deleted."
      )
    ) {
      try {
        await authApi.delete(`/projects/${id}`);
        fetchProjects();
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete project.");
      }
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

const filteredProjects = React.useMemo(() => {
  const filtered = projects.filter((project) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      project.name?.toLowerCase().includes(search) ||
      project.description?.toLowerCase().includes(search);
    const matchesStatus =
      filterStatus === "All" || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Use slice() to clone array before sorting to avoid mutating state
  const sorted = filtered.slice().sort((a, b) => {
    switch (sortOption) {
      case "name":
        return a.name.localeCompare(b.name);
      case "status":
        return a.status.localeCompare(b.status);
      case "manager":
        return (a.projectManager?.name || "").localeCompare(
          b.projectManager?.name || ""
        );
      case "date":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return sorted;
}, [projects, searchQuery, filterStatus, sortOption]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
  
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Projects
        </h1>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search projects..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-200 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <FormControl size="small" className="min-w-[150px]">
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
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
              onClick={() => setOpenCreateDialog(true)}
            >
              Create New Project
            </Button>
          )}
        </div>
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

      {filteredProjects.length === 0 ? (
        <p className="text-gray-600">
          No matching projects found. Try adjusting filters or create one!
        </p>
      ) : (
        <>
          {/* 💻 Table View */}
          <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-900 font-medium">
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
                {filteredProjects.map((project) => (
                  <tr
                    key={project._id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold">{project.name}</td>
                    <td className="px-4 py-3">
                      {project.description || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {project.projectManager?.name || "—"}
                    </td>
                    <td className="px-4 py-3">{project.status}</td>
                    <td className="px-4 py-3">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Tooltip title="View Project">
                          <IconButton
                            onClick={() => navigate(`/projects/${project._id}`)}
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

                        {hasRole(["Admin", "Project Manager"]) &&
                          (project.projectManager?._id === user?._id ||
                            hasRole("Admin")) && (
                            <>
                              <Tooltip title="Edit Project">
                                <IconButton
                                  onClick={() =>
                                    navigate(`/projects/${project._id}/edit`)
                                  }
                                  size="small"
                                  sx={{
                                    backgroundColor: "rgba(156,39,176,0.08)",
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(156,39,176,0.15)",
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete Project">
                                <IconButton
                                  onClick={() =>
                                    handleDeleteProject(project._id)
                                  }
                                  size="small"
                                  sx={{
                                    backgroundColor: "rgba(211,47,47,0.08)",
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(211,47,47,0.15)",
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

         
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="border border-gray-200 rounded-xl shadow-sm p-4 bg-white hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-semibold text-lg text-gray-800">
                    {project.name}
                  </h2>
                  <div className="flex gap-1">
                    <Tooltip title="View Project">
                      <IconButton
                        onClick={() => navigate(`/projects/${project._id}`)}
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

                    {hasRole(["Admin", "Project Manager"]) &&
                      (project.projectManager?._id === user?._id ||
                        hasRole("Admin")) && (
                        <>
                          <Tooltip title="Edit Project">
                            <IconButton
                              onClick={() =>
                                navigate(`/projects/${project._id}/edit`)
                              }
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

                          <Tooltip title="Delete Project">
                            <IconButton
                              onClick={() => handleDeleteProject(project._id)}
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
                        </>
                      )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {project.description || "No description"}
                </p>
                <p className="text-gray-500 text-xs mb-1">
                  Manager:{" "}
                  <span className="text-gray-800 font-medium">
                    {project.projectManager?.name || "—"}
                  </span>
                </p>
                <p className="text-gray-500 text-xs mb-1">
                  Status:{" "}
                  <span className="font-medium text-gray-800">
                    {project.status}
                  </span>
                </p>
                <p className="text-gray-400 text-xs">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

     
      <Dialog
        open={openCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          resetNewProject();
        }}
      >
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
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
              </Select>
            </FormControl>
          </div>
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
    </div>
  );
}

export default ProjectListPage;
