/* eslint-disable react/function-component-definition */

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { can } from "auth/roles";
import { ConfirmDialog, DialogHeader, FieldGroup } from "components/AppDialog";
import DataGrid, { PersonCell, IconCell, TagCell, ProgressCell, DateCell } from "components/DataGrid";
import ViewToggle, { useViewMode } from "components/ViewToggle";
import RecordCard, { CardGrid } from "components/RecordCard";
import { hueFor } from "assets/theme/enterprise";
import PageHeader from "components/PageHeader";
import StatusPill from "components/StatusPill";
import StatTile from "components/StatTile";
import Footer from "examples/Footer";
import MenuItem from "@mui/material/MenuItem";
import { swalsucess } from "../../../src/sucess";
import { swalerror } from "../../../src/Error";

// Keycloak
import keycloak from "../../auth/keycloak";
import base_url from "Baseurl";
import axiosInstance from "services.js/axiosInstance";

// -----------------------------------------------------------------------------
// INITIAL PROJECTS
// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// EMPTY PROJECT
// -----------------------------------------------------------------------------

const emptyProject = {
  projectName: "",
  description: "",
  startDate: "",
  endDate: "",
  active: true,
};

// -----------------------------------------------------------------------------
// STATUS BADGE
// -----------------------------------------------------------------------------

const StatusBadge = ({ active }) => (
  <StatusPill label={active ? "Active" : "Inactive"} tone={active ? "success" : "neutral"} />
);

StatusBadge.propTypes = {
  active: PropTypes.bool,
};

// -----------------------------------------------------------------------------
// SUMMARY CARD
// -----------------------------------------------------------------------------

const SummaryCard = ({ title, value, icon }) => {
  let hue = "teal";
  if (/inactive/i.test(title)) hue = "slate";
  else if (/active/i.test(title)) hue = "emerald";
  else if (/timeline/i.test(title)) hue = "amber";
  return <StatTile title={title} value={value} icon={icon} hue={hue} />;
};

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
};

// -----------------------------------------------------------------------------
// PROJECT FORM DIALOG
// -----------------------------------------------------------------------------

const ProjectFormDialog = ({
  open,
  project,
  onClose,
  onSave,
  loading,
}) => {
  const [form, setForm] = useState(emptyProject);

  useEffect(() => {
    if (open) {
      if (project) {
        setForm({
          ...emptyProject,
          ...project,
          startDate: project.startDate || "",
          endDate: project.endDate || "",
        });
      } else {
        setForm(emptyProject);
      }
    }
  }, [open, project]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.projectName.trim()) {
      swalerror("Project name is required.");
      return;
    }

    onSave({
      ...form,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "var(--pt-shadow-xl)",
          backgroundColor: "var(--pt-surface)",
        },
      }}
    >
      <DialogHeader
        title={project ? "Edit project" : "Add project"}
        subtitle={project ? "Update project information" : "Create a new project"}
        icon="folder-kanban"
        hue="teal"
        onClose={onClose}
        disabled={loading}
      />

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Box>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--pt-text)",
              mb: 1.5,
            }}
          >
            Project Information
          </Typography>

          <TextField
            fullWidth
            label="Project Name"
            name="projectName"
            value={form.projectName}
            onChange={handleChange}
            size="small"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            size="small"
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--pt-text)",
              mb: 1.5,
            }}
          >
            Project Timeline
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayOutlinedIcon
                        sx={{ fontSize: 18 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayOutlinedIcon
                        sx={{ fontSize: 18 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--pt-text)",
              mb: 1.5,
            }}
          >
            Project Status
          </Typography>

          <TextField
            fullWidth
            select
            SelectProps={{
              native: true,
            }}
            label="Status"
            name="active"
            value={form.active ? "true" : "false"}
            onChange={(event) => {
              setForm((prev) => ({
                ...prev,
                active: event.target.value === "true",
              }));
            }}
            size="small"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </TextField>
        </Box>

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: "12px",
            backgroundColor: "var(--pt-surface-2)",
            border: "1px solid var(--pt-border)",
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              color: "var(--pt-text-2)",
              lineHeight: 1.6,
            }}
          >
            {project
              ? "Update the project details and save your changes."
              : "Enter the project information to create a new project."}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid var(--pt-border)",
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "var(--pt-text-2)",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>

        <MDButton
          variant="gradient"
          color="info"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : project ? (
            "Update Project"
          ) : (
            "Create Project"
          )}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

ProjectFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  project: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

// -----------------------------------------------------------------------------
// DELETE DIALOG
// -----------------------------------------------------------------------------

const DeleteDialog = ({ open, project, onClose, onConfirm, loading }) => (
  <ConfirmDialog
    open={open}
    title="Delete project?"
    itemKind="project"
    itemName={project?.projectName}
    busy={loading}
    onClose={onClose}
    onConfirm={onConfirm}
  />
);

DeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  project: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

// -----------------------------------------------------------------------------
// ASSIGN DEPARTMENT DIALOG
// -----------------------------------------------------------------------------

const AssignDepartmentDialog = ({
  open,
  project,
  departments,
  loading,
  onClose,
  onAssign,
}) => {
  const [departmentId, setDepartmentId] = useState("");

  useEffect(() => {
    if (open) {
      setDepartmentId("");
    }
  }, [open, project]);

  const handleAssign = () => {
    if (!departmentId) {
      swalerror("Please select a department.");
      return;
    }

    onAssign(Number(departmentId));
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "var(--pt-shadow-xl)",
          backgroundColor: "var(--pt-surface)",
        },
      }}
    >
      <DialogHeader
        title="Assign department"
        subtitle={project?.projectName ? `Link "${project.projectName}" to a department` : "Link this project to a department"}
        icon="blocks"
        hue="teal"
        onClose={onClose}
        disabled={loading}
      />

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: "12px",
            backgroundColor: "var(--pt-surface-2)",
            border: "1px solid var(--pt-border)",
          }}
        >
          <Typography
            sx={{
              fontSize: "11px",
              color: "var(--pt-text-2)",
              mb: 0.5,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Project
          </Typography>

          <Typography
            sx={{
              fontSize: "15px",
              color: "var(--pt-text)",
              fontWeight: 600,
            }}
          >
            {project?.projectName || "-"}
          </Typography>

          <Typography
            sx={{
              fontSize: "12px",
              color: "var(--pt-text-2)",
              mt: 0.5,
            }}
          >
            Project ID: {project?.id || "-"}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--pt-text)",
            mb: 1.5,
          }}
        >
          Department Assignment
        </Typography>

        <TextField
          fullWidth
          select
          SelectProps={{
            native: true,
          }}
          label="Department"
          InputLabelProps={{ shrink: true }}
          value={departmentId}
          onChange={(event) => setDepartmentId(event.target.value)}
          size="small"
          disabled={loading}
        >
          <option value="">Select Department</option>

          {departments.map((department) => (
            <option
              key={department.id}
              value={department.id}
            >
              {department.departmentName}
            </option>
          ))}
        </TextField>

        {departments.length === 0 && (
          <Typography
            sx={{
              mt: 1,
              fontSize: "12px",
              color: "var(--pt-text-2)",
            }}
          >
            No departments available.
          </Typography>
        )}

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: "12px",
            backgroundColor: "var(--pt-surface-2)",
            border: "1px solid var(--pt-border)",
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              color: "var(--pt-text-2)",
              lineHeight: 1.6,
            }}
          >
            Select a department to assign this project.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid var(--pt-border)",
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "var(--pt-text-2)",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>

        <MDButton
          variant="gradient"
          color="info"
          onClick={handleAssign}
          disabled={loading || departments.length === 0}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Assign Department"
          )}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

AssignDepartmentDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  project: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    projectName: PropTypes.string,
  }),
  departments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]),
      departmentName: PropTypes.string,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
};

// -----------------------------------------------------------------------------
// PROJECTS
// -----------------------------------------------------------------------------

function Projects() {
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useViewMode("projects");
    const canManage = can("manageProjects");
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Statuses");

  // Department filter
  const [departmentFilter, setDepartmentFilter] =
    useState("All Departments");

  // Project -> Department mapping
  const [projectDepartments, setProjectDepartments] =
    useState([]);

  const [formOpen, setFormOpen] = useState(false);

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [projectToDelete, setProjectToDelete] =
    useState(null);

  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // ASSIGN DEPARTMENT STATES
  // ---------------------------------------------------------------------------

  const [departments, setDepartments] = useState([]);

  const [assignDepartmentOpen, setAssignDepartmentOpen] =
    useState(false);

  const [projectToAssign, setProjectToAssign] =
    useState(null);

  const [assignLoading, setAssignLoading] =
    useState(false);

  // ---------------------------------------------------------------------------
  // FETCH PROJECTS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        setLoadError("");

        if (!keycloak.authenticated) {
          setProjects([]);
          setLoadError("You are not signed in. Please log in again.");
          return;
        }

        try {
          await keycloak.updateToken(30);
        } catch (refreshError) {
          console.error(
            "Failed to refresh Keycloak token:",
            refreshError
          );

          setProjects([]);
          return;
        }

        if (!keycloak.token) {
          setProjects([]);
          return;
        }

        const response = await axiosInstance.get("/projects");

        console.log(
          "Projects API response:",
          response.data
        );

        const apiProjects = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.content)
          ? response.data.content
          : Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data?.data?.content)
          ? response.data.data.content
          : [];

        setProjects(apiProjects);
      } catch (error) {
        console.error(
          "Error fetching projects:",
          error
        );

        setProjects([]);
        setLoadError(
          error?.response?.data?.message ||
            error?.message ||
            "Couldn't load projects."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // ---------------------------------------------------------------------------
  // FETCH DEPARTMENTS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        if (!keycloak.authenticated) {
          return;
        }

        try {
          await keycloak.updateToken(30);
        } catch (refreshError) {
          console.error(
            "Failed to refresh Keycloak token:",
            refreshError
          );

          return;
        }

        if (!keycloak.token) {
          return;
        }

        const response = await axiosInstance.get(
          "/departments?activeOnly=false"
        );

        console.log(
          "Departments API response:",
          response.data
        );

        const apiDepartments = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.content)
          ? response.data.content
          : Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data?.data?.content)
          ? response.data.data.content
          : [];

        setDepartments(apiDepartments);
      } catch (error) {
        console.error(
          "Error fetching departments:",
          error
        );

        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  // ---------------------------------------------------------------------------
  // FETCH PROJECT-DEPARTMENT MAPPING
  //
  // API:
  // GET /project-departments?activeOnly=true&page=0&size=20&sort=department.departmentName
  //
  // Response:
  // {
  //   "content": [
  //     {
  //       "id": 10,
  //       "projectId": 2,
  //       "projectName": "Employee Self Servive",
  //       "departmentId": 9,
  //       "departmentName": "IT",
  //       "active": true
  //     }
  //   ]
  // }
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const fetchProjectDepartments = async () => {
      try {
        if (!keycloak.authenticated) {
          setProjectDepartments([]);
          return;
        }

        try {
          await keycloak.updateToken(30);
        } catch (refreshError) {
          console.error(
            "Failed to refresh Keycloak token:",
            refreshError
          );

          setProjectDepartments([]);
          return;
        }

        if (!keycloak.token) {
          setProjectDepartments([]);
          return;
        }

        const response = await axiosInstance.get(
          "/project-departments",
          {
            params: {
              activeOnly: true,
              page: 0,
              size: 20,
              sort: "department.departmentName",
            },
          }
        );

        console.log(
          "Project Departments API response:",
          response.data
        );

        // IMPORTANT:
        // Your API returns the array in response.data.content
        const apiProjectDepartments = Array.isArray(
          response.data?.content
        )
          ? response.data.content
          : [];

        console.log(
          "Project Departments Content:",
          apiProjectDepartments
        );

        setProjectDepartments(
          apiProjectDepartments
        );
      } catch (error) {
        console.error(
          "Error fetching project departments:",
          error
        );

        setProjectDepartments([]);
      }
    };

    fetchProjectDepartments();
  }, []);

  // ---------------------------------------------------------------------------
  // STATISTICS
  // ---------------------------------------------------------------------------

  const statistics = useMemo(() => {
    const total = projects.length;

    const active = projects.filter(
      (project) => project.active
    ).length;

    const inactive = projects.filter(
      (project) => !project.active
    ).length;

    const completedDates = projects.filter(
      (project) =>
        project.startDate && project.endDate
    ).length;

    return {
      total,
      active,
      inactive,
      completedDates,
    };
  }, [projects]);

  // ---------------------------------------------------------------------------
  // FILTER PROJECTS
  // ---------------------------------------------------------------------------

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // ---------------------------------------------------------------
      // SEARCH
      // ---------------------------------------------------------------

      const projectName = (
        project.projectName || ""
      ).toLowerCase();

      const description = (
        project.description || ""
      ).toLowerCase();

      const searchValue = search.toLowerCase();

      const matchesSearch =
        projectName.includes(searchValue) ||
        description.includes(searchValue);

      // ---------------------------------------------------------------
      // STATUS
      // ---------------------------------------------------------------

      const matchesStatus =
        statusFilter === "All Statuses" ||
        (statusFilter === "Active" && project.active) ||
        (statusFilter === "Inactive" && !project.active);

      // ---------------------------------------------------------------
      // DEPARTMENT
      // ---------------------------------------------------------------

      let matchesDepartment = true;

      if (departmentFilter !== "All Departments") {
        matchesDepartment = projectDepartments.some(
          (mapping) => {
            const mappingProjectId = Number(
              mapping.projectId
            );

            const mappingDepartmentId = Number(
              mapping.departmentId
            );

            const currentProjectId = Number(
              project.id
            );

            const selectedDepartmentId = Number(
              departmentFilter
            );

            return (
              mappingProjectId === currentProjectId &&
              mappingDepartmentId ===
                selectedDepartmentId &&
              mapping.active !== false
            );
          }
        );
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDepartment
      );
    });
  }, [
    projects,
    search,
    statusFilter,
    departmentFilter,
    projectDepartments,
  ]);

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------

  const handleCreate = () => {
    setSelectedProject(null);
    setFormOpen(true);
  };

  // ---------------------------------------------------------------------------
  // EDIT
  // ---------------------------------------------------------------------------

  const handleEdit = (project) => {
    setSelectedProject(project);
    setFormOpen(true);
  };

  // ---------------------------------------------------------------------------
  // SAVE PROJECT
  // ---------------------------------------------------------------------------

  const handleSave = async (formData) => {
    try {
      if (!keycloak.authenticated) {
        swalerror("Please login to continue.");
        return;
      }

      setLoading(true);

      try {
        await keycloak.updateToken(30);
      } catch (refreshError) {
        console.error(
          "Failed to refresh Keycloak token:",
          refreshError
        );

        swalerror(
          "Authentication session expired. Please login again."
        );

        return;
      }

      if (!keycloak.token) {
        swalerror(
          "Authentication token not available."
        );

        return;
      }

      const headers = {
        Authorization: `Bearer ${keycloak.token}`,
        "Content-Type": "application/json",
      };

      // -----------------------------------------------------------------------
      // UPDATE
      // -----------------------------------------------------------------------

      if (selectedProject) {
        const payload = {
          projectName: formData.projectName,
          description: formData.description,
          startDate: formData.startDate || null,
        };

        console.log(
          "Update Project Payload:",
          payload
        );

        const response = await axiosInstance.patch(
          `${base_url}/projects/${selectedProject.id}`,
          payload,
          {
            headers,
          }
        );

        console.log(
          "Update Project Response:",
          response.data
        );

        setProjects((prev) =>
          prev.map((project) =>
            project.id === selectedProject.id
              ? {
                  ...project,
                  ...formData,
                }
              : project
          )
        );

        setFormOpen(false);
        setSelectedProject(null);

        setTimeout(() => {
          swalsucess(
            "Project updated successfully."
          );
        }, 150);
      } else {
        // ---------------------------------------------------------------------
        // CREATE
        // ---------------------------------------------------------------------

        const payload = {
          projectName: formData.projectName,
          description: formData.description,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        };

        console.log(
          "Create Project Payload:",
          payload
        );

        const response = await axiosInstance.post(
          `${base_url}/projects/create`,
          payload,
          {
            headers,
          }
        );

        console.log(
          "Create Project Response:",
          response.data
        );

        const createdProject =
          response.data?.data ||
          response.data;

        setProjects((prev) => [
          ...prev,
          {
            ...formData,
            ...(createdProject || {}),
            id:
              createdProject?.id ||
              Date.now(),
          },
        ]);

        setFormOpen(false);
        setSelectedProject(null);

        setTimeout(() => {
          swalsucess(
            "Project created successfully."
          );
        }, 150);
      }
    } catch (error) {
      console.error(
        "Error saving project:",
        error
      );

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong while saving the project.";

      setTimeout(() => {
        swalerror(errorMessage);
      }, 150);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // DELETE OPEN
  // ---------------------------------------------------------------------------

  const handleDeleteOpen = (project) => {
    setProjectToDelete(project);
    setDeleteOpen(true);
  };

  // ---------------------------------------------------------------------------
  // DELETE PROJECT
  // ---------------------------------------------------------------------------

  const handleDelete = async () => {
    if (!projectToDelete) {
      return;
    }

    try {
      if (!keycloak.authenticated) {
        swalerror("Please login to continue.");
        return;
      }

      setLoading(true);

      try {
        await keycloak.updateToken(30);
      } catch (refreshError) {
        console.error(
          "Failed to refresh Keycloak token:",
          refreshError
        );

        swalerror(
          "Authentication session expired. Please login again."
        );

        return;
      }

      if (!keycloak.token) {
        swalerror(
          "Authentication token not available."
        );

        return;
      }

      const headers = {
        Authorization: `Bearer ${keycloak.token}`,
        "Content-Type": "application/json",
      };

      await axiosInstance.delete(
        `${base_url}/projects/${projectToDelete.id}`,
        {
          headers,
        }
      );

      setProjects((prev) =>
        prev.filter(
          (project) =>
            project.id !== projectToDelete.id
        )
      );

      setProjectDepartments((prev) =>
        prev.filter(
          (mapping) =>
            Number(mapping.projectId) !==
            Number(projectToDelete.id)
        )
      );

      setDeleteOpen(false);
      setProjectToDelete(null);

      setTimeout(() => {
        swalsucess(
          "Project deleted successfully."
        );
      }, 150);
    } catch (error) {
      console.error(
        "Error deleting project:",
        error
      );

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong while deleting the project.";

      setDeleteOpen(false);
      setProjectToDelete(null);

      setTimeout(() => {
        swalerror(errorMessage);
      }, 150);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // OPEN ASSIGN DEPARTMENT
  // ---------------------------------------------------------------------------

  const handleAssignDepartmentOpen = (project) => {
    setProjectToAssign(project);
    setAssignDepartmentOpen(true);
  };

  // ---------------------------------------------------------------------------
  // ASSIGN PROJECT TO DEPARTMENT
  // ---------------------------------------------------------------------------

  const handleAssignDepartment = async (
    departmentId
  ) => {
    if (!projectToAssign) {
      return;
    }

    try {
      if (!keycloak.authenticated) {
        swalerror("Please login to continue.");
        return;
      }

      setAssignLoading(true);

      try {
        await keycloak.updateToken(30);
      } catch (refreshError) {
        console.error(
          "Failed to refresh Keycloak token:",
          refreshError
        );

        swalerror(
          "Authentication session expired. Please login again."
        );

        return;
      }

      if (!keycloak.token) {
        swalerror(
          "Authentication token not available."
        );

        return;
      }

      const payload = {
        projectId: Number(projectToAssign.id),
        departmentId: Number(departmentId),
      };

      console.log(
        "Assign Project Department Payload:",
        payload
      );

      const response = await axiosInstance.post(
        "/project-departments/assign",
        payload
      );

      console.log(
        "Assign Project Department Response:",
        response.data
      );

      const newMapping =
        response.data?.data ||
        response.data;

      if (
        newMapping &&
        typeof newMapping === "object"
      ) {
        setProjectDepartments((prev) => [
          ...prev,
          {
            ...newMapping,
            projectId:
              newMapping.projectId ??
              Number(projectToAssign.id),
            departmentId:
              newMapping.departmentId ??
              Number(departmentId),
            projectName:
              newMapping.projectName ??
              projectToAssign.projectName,
            departmentName:
              newMapping.departmentName ??
              departments.find(
                (department) =>
                  Number(department.id) ===
                  Number(departmentId)
              )?.departmentName,
            active:
              newMapping.active ?? true,
          },
        ]);
      } else {
        setProjectDepartments((prev) => [
          ...prev,
          {
            projectId: Number(
              projectToAssign.id
            ),
            projectName:
              projectToAssign.projectName,
            departmentId: Number(
              departmentId
            ),
            departmentName:
              departments.find(
                (department) =>
                  Number(department.id) ===
                  Number(departmentId)
              )?.departmentName || "",
            active: true,
          },
        ]);
      }

      setAssignDepartmentOpen(false);
      setProjectToAssign(null);

      setTimeout(() => {
        swalsucess(
          "Project assigned to department successfully."
        );
      }, 150);
    } catch (error) {
      console.error(
        "Error assigning project to department:",
        error
      );

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong while assigning the project.";

      setAssignDepartmentOpen(false);
      setProjectToAssign(null);

      setTimeout(() => {
        swalerror(errorMessage);
      }, 150);
    } finally {
      setAssignLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pb={3}>
        <PageHeader
          title="Projects"
          description="Manage and track your projects"
          icon="folder"
          hue="teal"
          actions={
            <>
              <ViewToggle value={view} onChange={setView} />
              {canManage && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                Add Project
              </Button>
              )}
            </>
          }
        />

        {/* ----------------------------------------------------------------- */}
        {/* SUMMARY CARDS */}
        {/* ----------------------------------------------------------------- */}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Total Projects"
              value={statistics.total}
              icon={<FolderOutlinedIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Active Projects"
              value={statistics.active}
              icon={<CheckCircleOutlineIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Inactive Projects"
              value={statistics.inactive}
              icon={<WarningAmberOutlinedIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="With Timeline"
              value={statistics.completedDates}
              icon={<TrendingUpIcon />}
            />
          </Grid>
        </Grid>

        {/* ----------------------------------------------------------------- */}
        {/* TABLE CARD */}
        {/* ----------------------------------------------------------------- */}

        <Card
          sx={{
            mt: 3,
            borderRadius: "12px",
            boxShadow:
              "var(--pt-shadow-sm)",
          }}
        >
          {/* --------------------------------------------------------------- */}
          {/* SEARCH / FILTER */}
          {/* --------------------------------------------------------------- */}

          <Box sx={{ p: 2.5 }}>
            <Grid
              container
              spacing={2}
              alignItems="center"
            >
              {/* DEPARTMENT */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Department"
                  value={departmentFilter}
                  onChange={(event) =>
                    setDepartmentFilter(
                      event.target.value
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessOutlinedIcon
                          sx={{
                            fontSize: 19,
                            color: "var(--pt-text-2)",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 40,
                      borderRadius: "8px",
                      backgroundColor: "var(--pt-surface)",
                    },

                    "& .MuiInputLabel-root": {
                      fontSize: "13px",
                    },

                    "& .MuiSelect-select": {
                      height:
                        "40px !important",
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      paddingTop:
                        "0 !important",
                      paddingBottom:
                        "0 !important",
                      fontSize: "13px",
                      color: "var(--pt-text)",
                    },

                    "& .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor:
                          "var(--pt-border)",
                      },
                  }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          mt: 0.5,
                          borderRadius: "10px",
                          boxShadow:
                            "var(--pt-shadow-lg)",

                          "& .MuiMenuItem-root":
                            {
                              fontSize: "13px",
                              py: 1.2,

                              "&:hover": {
                                backgroundColor:
                                  "var(--pt-surface-2)",
                              },

                              "&.Mui-selected":
                                {
                                  backgroundColor:
                                    "var(--pt-accent-soft)",
                                  color:
                                    "var(--pt-accent-text)",
                                  fontWeight:
                                    600,
                                },
                            },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="All Departments">
                    All Departments
                  </MenuItem>

                  {departments.map(
                    (department) => (
                      <MenuItem
                        key={department.id}
                        value={department.id}
                      >
                        {
                          department.departmentName
                        }
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>

              {/* SEARCH */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{
                            fontSize: 20,
                            color: "var(--pt-text-2)",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 40,
                      borderRadius: "8px",
                      backgroundColor: "var(--pt-surface)",
                    },

                    "& .MuiInputBase-input": {
                      fontSize: "13px",
                    },

                    "& .MuiInputLabel-root": {
                      fontSize: "13px",
                    },

                    "& .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor:
                          "var(--pt-border)",
                      },
                  }}
                />
              </Grid>

              {/* STATUS */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 40,
                      borderRadius: "8px",
                      backgroundColor: "var(--pt-surface)",
                    },

                    "& .MuiInputLabel-root": {
                      fontSize: "13px",
                    },

                    "& .MuiSelect-select": {
                      height:
                        "40px !important",
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      paddingTop:
                        "0 !important",
                      paddingBottom:
                        "0 !important",
                      fontSize: "13px",
                      color: "var(--pt-text)",
                    },

                    "& .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor:
                          "var(--pt-border)",
                      },
                  }}
                >
                  <MenuItem value="All Statuses">
                    All Statuses
                  </MenuItem>

                  <MenuItem value="Active">
                    Active
                  </MenuItem>

                  <MenuItem value="Inactive">
                    Inactive
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* --------------------------------------------------------------- */}
          {/* TABLE */}
          {/* --------------------------------------------------------------- */}

          {loadError && (
            <Alert severity="error" sx={{ m: 2 }} onClose={() => setLoadError("")}>
              {loadError}
            </Alert>
          )}
          {view === "table" ? (
              <DataGrid
                title="Projects"
                exportName="projects"
                loading={loading && filteredProjects.length === 0}
                rows={filteredProjects}
                getRowId={(p) => p.id ?? p.projectName}
                emptyText="No projects found"
                columns={[
                  { key: "projectName", label: "Project", render: (p) => <IconCell icon="folder" title={p.projectName || "Untitled"} sub={p.id !== undefined ? `ID ${p.id}` : null} hue={hueFor(p.projectName || "")} /> },
                  { key: "description", label: "Description" },
                  { key: "startDate", label: "Start", render: (p) => <DateCell value={p.startDate} /> },
                  { key: "endDate", label: "End", render: (p) => <DateCell value={p.endDate} /> },
                  { key: "active", label: "Status", value: (p) => (p.active !== false ? "Active" : "Inactive"), render: (p) => <StatusBadge active={p.active !== false} /> },
                ]}
                actions={canManage ? (p) => [
                  { icon: "blocks", label: "Assign department", onClick: () => handleAssignDepartmentOpen(p) },
                  { icon: "square-pen", label: "Edit", tone: "accent", onClick: () => handleEdit(p) },
                  { icon: "delete", label: "Delete", tone: "danger", onClick: () => handleDeleteOpen(p) },
  ] : null}
              />
          ) : (
              <CardGrid loading={loading && filteredProjects.length === 0} empty={filteredProjects.length === 0} emptyText="No projects found">
                {filteredProjects.map((project, i) => (
                  <RecordCard
                    key={project.id ?? i}
                    index={i}
                    title={project.projectName || "Untitled project"}
                    subtitle={project.id !== undefined ? `ID ${project.id}` : null}
                    hue={hueFor(project.projectName || "")}
                    avatarIcon="folder"
                    status={<StatusBadge active={project.active !== false} />}
                    description={project.description || "No description"}
                    meta={[
                      { icon: "event", label: "Start", value: project.startDate || "—" },
                      { icon: "event_available", label: "End", value: project.endDate || "—" },
                    ]}
                    actions={canManage ? [
        { icon: "domain_add", label: "Assign department", onClick: () => handleAssignDepartmentOpen(project) },
                      { icon: "edit", label: "Edit", tone: "accent", onClick: () => handleEdit(project) },
                      { icon: "delete_outline", label: "Delete", tone: "danger", onClick: () => handleDeleteOpen(project) },
      ] : []}
                  />
                ))}
              </CardGrid>
          )}
        </Card>
      </MDBox>

      {/* ------------------------------------------------------------------- */}
      {/* PROJECT FORM DIALOG */}
      {/* ------------------------------------------------------------------- */}

      <ProjectFormDialog
        open={formOpen}
        project={selectedProject}
        onClose={() => {
          if (!loading) {
            setFormOpen(false);
            setSelectedProject(null);
          }
        }}
        onSave={handleSave}
        loading={loading}
      />

      {/* ------------------------------------------------------------------- */}
      {/* ASSIGN DEPARTMENT DIALOG */}
      {/* ------------------------------------------------------------------- */}

      <AssignDepartmentDialog
        open={assignDepartmentOpen}
        project={projectToAssign}
        departments={departments}
        loading={assignLoading}
        onClose={() => {
          if (!assignLoading) {
            setAssignDepartmentOpen(false);
            setProjectToAssign(null);
          }
        }}
        onAssign={handleAssignDepartment}
      />

      {/* ------------------------------------------------------------------- */}
      {/* DELETE DIALOG */}
      {/* ------------------------------------------------------------------- */}

      <DeleteDialog
        open={deleteOpen}
        project={projectToDelete}
        onClose={() => {
          if (!loading) {
            setDeleteOpen(false);
            setProjectToDelete(null);
          }
        }}
        onConfirm={handleDelete}
        loading={loading}
      />

      <Footer />
    </DashboardLayout>
  );
}

export default Projects;