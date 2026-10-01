/* eslint-disable react/function-component-definition */

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    MenuItem,
    LinearProgress,
    IconButton,
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    InputAdornment,
    CircularProgress,
    TablePagination,
    Button,
    Chip,
    Tooltip,
} from "@mui/material";

// -----------------------------------------------------------------------------
// ICONS
// -----------------------------------------------------------------------------

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

// -----------------------------------------------------------------------------
// DASHBOARD
// -----------------------------------------------------------------------------

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { can } from "auth/roles";
import { ConfirmDialog, DialogHeader, FieldGroup } from "components/AppDialog";
import DataGrid, { PersonCell, IconCell, TagCell, ProgressCell, DateCell } from "components/DataGrid";
import ViewToggle, { useViewMode } from "components/ViewToggle";
import RecordCard, { CardGrid } from "components/RecordCard";
import { hueFor } from "assets/theme/enterprise";
import PageHeader from "components/PageHeader";
import MDButton from "components/MDButton";

// -----------------------------------------------------------------------------
// SWEET ALERT
// -----------------------------------------------------------------------------

import { swalsucess } from "../../../src/sucess";
import { swalerror } from "../../../src/Error";

// -----------------------------------------------------------------------------
// KEYCLOAK / API
// -----------------------------------------------------------------------------

import keycloak from "../../auth/keycloak";
import axiosInstance from "services.js/axiosInstance";

// -----------------------------------------------------------------------------
// FALLBACK DATA
// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// STATUS BADGE
// -----------------------------------------------------------------------------

// "IN_PROGRESS" -> "In progress"
const formatStatus = (status) => {
    const text = String(status || "Unknown").replace(/[_-]+/g, " ").toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
};

function StatusBadge({ status }) {
    const normalizedStatus = String(
        status || "Unknown"
    ).toLowerCase();

    const isPositive =
        normalizedStatus.includes("track") ||
        normalizedStatus.includes("active") ||
        normalizedStatus.includes("complete");

    const isNegative =
        normalizedStatus.includes("inactive") ||
        normalizedStatus.includes("failed") ||
        normalizedStatus.includes("rejected");

    let color = "var(--pt-warning)";
    let backgroundColor = "var(--pt-warning-soft)";
    let borderColor = "var(--pt-warning-border)";

    if (isPositive) {
        color = "var(--pt-success)";
        backgroundColor = "var(--pt-success-soft)";
        borderColor = "var(--pt-success-border)";
    }

    if (isNegative) {
        color = "var(--pt-danger)";
        backgroundColor = "var(--pt-danger-soft)";
        borderColor = "var(--pt-danger-border)";
    }

    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                px: 1.2,
                py: 0.45,
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 500,
                border: "1px solid",
                color,
                backgroundColor,
                borderColor,
                whiteSpace: "nowrap",
            }}
        >
            {formatStatus(status)}
        </Box>
    );
}

StatusBadge.propTypes = {
    status: PropTypes.string,
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

function Kra() {
    const [view, setView] = useViewMode("kras");
    const canManage = can("manageKras");
    // =========================================================================
    // KRA TABLE DATA
    // =========================================================================

    const [kraData, setKraData] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    // =========================================================================
    // FILTERS
    // =========================================================================

    const [departmentFilter, setDepartmentFilter] =
        useState("");

    const [projectDepartmentFilter, setProjectDepartmentFilter] =
        useState("");

    const [searchInput, setSearchInput] = useState("");

    const [search, setSearch] = useState("");

    // API sort parameter
    const [sort] = useState("kraName");

    // API activeOnly parameter
    const [activeOnly] = useState(true);

    // =========================================================================
    // PAGINATION
    // =========================================================================

    const [page, setPage] = useState(0);

    const [size, setSize] = useState(20);

    const [totalElements, setTotalElements] =
        useState(0);

    // =========================================================================
    // DEPARTMENTS
    // =========================================================================

    const [departments, setDepartments] =
        useState([]);

    // =========================================================================
    // PROJECTS
    // =========================================================================
    // This comes from GET /projects
    // =========================================================================

    const [projects, setProjects] =
        useState([]);

    const [projectLoading, setProjectLoading] =
        useState(false);

    // =========================================================================
    // PROJECT-DEPARTMENT MAPPINGS
    // =========================================================================
    // Used to resolve projectDepartmentId for POST /project-kras
    // =========================================================================

    const [projectDepartments, setProjectDepartments] =
        useState([]);

    // =========================================================================
    // CREATE KRA
    // =========================================================================

    const [openAddDialog, setOpenAddDialog] =
        useState(false);

    const [createKraLoading, setCreateKraLoading] =
        useState(false);

    const [formError, setFormError] =
        useState("");

    // =========================================================================
    // FORM DATA
    // =========================================================================

    const [formData, setFormData] = useState({
        projectId: "",
        dept: "",
        name: "",
        description: "",
    });

    // =========================================================================
    // COMMON FIELD STYLE
    // =========================================================================

    const commonFieldSx = {
        "& .MuiOutlinedInput-root": {
            height: "45px",
            borderRadius: "12px",
            backgroundColor: "var(--pt-surface)",
            fontSize: "14px",

            "& fieldset": {
                borderColor: "var(--pt-border)",
            },

            "&:hover fieldset": {
                borderColor: "var(--pt-border-strong)",
            },

            "&.Mui-focused fieldset": {
                borderColor: "var(--pt-accent)",
                borderWidth: "1px",
            },
        },

        "& .MuiInputBase-input": {
            height: "45px",
            boxSizing: "border-box",
            padding: "0 14px",
        },

        "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            height: "45px !important",
            boxSizing: "border-box",
            padding: "0 14px",
        },

        "& .MuiInputLabel-root": {
            fontSize: "13px",
        },
    };

    // =========================================================================
    // DIALOG FIELD STYLE
    // =========================================================================

    const dialogFieldSx = {
        "& .MuiOutlinedInput-root": {
            minHeight: "45px",
            borderRadius: "10px",
            backgroundColor: "var(--pt-surface)",
            fontSize: "14px",

            "& fieldset": {
                borderColor: "var(--pt-border)",
            },

            "&:hover fieldset": {
                borderColor: "var(--pt-border-strong)",
            },

            "&.Mui-focused fieldset": {
                borderColor: "var(--pt-accent)",
                borderWidth: "1px",
            },
        },

        "& .MuiInputLabel-root": {
            fontSize: "14px",
        },

        "& .MuiInputBase-input": {
            fontSize: "14px",
        },

        "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            minHeight: "45px !important",
            boxSizing: "border-box",
        },
    };

    // =========================================================================
    // NORMALIZE KRA API RESPONSE
    // =========================================================================

    const normalizeKra = (item) => {
        const target = Number(
            item.target ??
                item.targetValue ??
                item.goal ??
                0
        );

        const current = Number(
            item.current ??
                item.currentValue ??
                item.actual ??
                0
        );

        const calculatedProgress =
            target > 0
                ? Math.min(
                      Math.round(
                          (current / target) * 100
                      ),
                      100
                  )
                : 0;

        return {
            id: item.id,

            name:
                item.kraName ??
                item.name ??
                "-",

            dept:
                item.departmentName ??
                item.department?.departmentName ??
                item.department?.name ??
                item.dept ??
                "-",

            projectName:
                item.projectName ??
                item.projectDepartmentName ??
                item.projectDepartment?.projectName ??
                item.project?.projectName ??
                "-",

            description:
                item.description ??
                "-",

            target,

            current,

            progress:
                Number(
                    item.progress ??
                        item.progressPercentage ??
                        calculatedProgress
                ) || 0,

            status:
                item.status ??
                (item.active === false
                    ? "Inactive"
                    : "Active"),

            due:
                item.dueDate ??
                item.due ??
                "-",

            kpis:
                Number(
                    item.linkedKpis ??
                        item.kpis ??
                        item.kpiCount ??
                        0
                ) || 0,
        };
    };

    // =========================================================================
    // FETCH REFERENCE DATA
    // =========================================================================

    const fetchReferenceData = async () => {
        try {
            if (!keycloak.authenticated) {
                return;
            }

            await keycloak.updateToken(30);

            if (!keycloak.token) {
                return;
            }

            setProjectLoading(true);

            // You can change these filter values as needed
            const projectDepartmentsDepartmentId = 12; // example: filter by department
            const projectStatus = "DRAFT";             // example: filter by project status

            const [
                departmentResponse,
                projectDepartmentResponse,
                projectResponse,
            ] = await Promise.all([
                // Departments
                axiosInstance.get("/departments", {
                    params: { activeOnly: false },
                }),

                // Project -> Department mapping with filters
                axiosInstance.get("/project-departments", {
                    params: {
                        activeOnly: true,
                        page: 0,
                        size: 20,
                        sort: "department.departmentName",
                        departmentId: projectDepartmentsDepartmentId,
                        projectStatus: projectStatus,
                    },
                }),

                // PROJECT DROPDOWN (still used in dialog)
                axiosInstance.get("/projects"),
            ]);

            // -----------------------------------------------------------------
            // DEPARTMENTS
            // -----------------------------------------------------------------

            const departmentData =
                Array.isArray(departmentResponse.data)
                    ? departmentResponse.data
                    : departmentResponse.data?.data ||
                      departmentResponse.data?.content ||
                      [];

            // -----------------------------------------------------------------
            // PROJECT DEPARTMENT MAPPING
            // -----------------------------------------------------------------

            const projectDepartmentResponseData =
                projectDepartmentResponse.data;

            const projectDepartmentData =
                Array.isArray(projectDepartmentResponseData)
                    ? projectDepartmentResponseData
                    : projectDepartmentResponseData?.content ||
                      projectDepartmentResponseData?.data?.content ||
                      [];

            // -----------------------------------------------------------------
            // PROJECTS
            // -----------------------------------------------------------------

            const projectData =
                Array.isArray(projectResponse.data)
                    ? projectResponse.data
                    : projectResponse.data?.data ||
                      projectResponse.data?.content ||
                      [];

            console.log(
                "Departments:",
                departmentData
            );

            console.log(
                "Projects:",
                projectData
            );

            console.log(
                "Project Departments (filtered):",
                projectDepartmentData
            );

            setDepartments(departmentData);
            setProjectDepartments(projectDepartmentData);
            setProjects(projectData);
        } catch (fetchError) {
            console.error(
                "Error fetching reference data:",
                fetchError
            );

            setDepartments([]);
            setProjects([]);
            setProjectDepartments([]);
        } finally {
            setProjectLoading(false);
        }
    };

    // =========================================================================
    // INITIAL REFERENCE DATA
    // =========================================================================

    useEffect(() => {
        fetchReferenceData();
    }, []);

    // =========================================================================
    // SEARCH DEBOUNCE
    // =========================================================================

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(
                searchInput.trim()
            );

            setPage(0);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // =========================================================================
    // SELECTED PROJECT DEPARTMENT
    // =========================================================================

    const selectedProjectDepartment = useMemo(() => {
        if (
            !formData.projectId ||
            !formData.dept
        ) {
            return null;
        }

        return (
            projectDepartments.find(
                (item) =>
                    Number(
                        item.projectId
                    ) ===
                        Number(
                            formData.projectId
                        ) &&
                    Number(
                        item.departmentId
                    ) ===
                        Number(
                            formData.dept
                        ) &&
                    item.active !== false
            ) || null
        );
    }, [
        formData.projectId,
        formData.dept,
        projectDepartments,
    ]);

    // =========================================================================
    // FETCH PROJECT KRAs
    // =========================================================================

    const fetchProjectKras = async (
        pageOverride = page
    ) => {
        try {
            setLoading(true);

            setError("");

            if (!keycloak.authenticated) {
                setKraData([]);
                setTotalElements(0);
                setError("You are not signed in. Please log in again.");
                return;
            }

            try {
                await keycloak.updateToken(
                    30
                );
            } catch (refreshError) {
                console.error(
                    "Failed to refresh Keycloak token:",
                    refreshError
                );

                setError(
                    "Authentication session expired. Please login again."
                );

                return;
            }

            if (!keycloak.token) {
                setError(
                    "Authentication token not available."
                );

                return;
            }

            const params = {
                activeOnly,
                page: pageOverride,
                size,
                sort,
            };

            // -------------------------------------------------------------
            // DEPARTMENT FILTER
            // -------------------------------------------------------------

            if (departmentFilter) {
                params.departmentId =
                    Number(
                        departmentFilter
                    );
            }

            // -------------------------------------------------------------
            // PROJECT DEPARTMENT FILTER
            // -------------------------------------------------------------

            if (
                projectDepartmentFilter
            ) {
                params.projectDepartmentId =
                    Number(
                        projectDepartmentFilter
                    );
            }

            // -------------------------------------------------------------
            // SEARCH
            // -------------------------------------------------------------

            if (search) {
                params.search =
                    search;
            }

            console.log(
                "GET /project-kras params:",
                params
            );

            const response =
                await axiosInstance.get(
                    "/project-kras",
                    {
                        params,
                    }
                );

            console.log(
                "Project KRA Response:",
                response.data
            );

            const responseData =
                response.data;

            // -------------------------------------------------------------
            // RESOLVE ARRAY
            // -------------------------------------------------------------

            let rows = [];

            if (
                Array.isArray(
                    responseData
                )
            ) {
                rows =
                    responseData;
            } else if (
                Array.isArray(
                    responseData?.content
                )
            ) {
                rows =
                    responseData.content;
            } else if (
                Array.isArray(
                    responseData?.data
                )
            ) {
                rows =
                    responseData.data;
            } else if (
                Array.isArray(
                    responseData?.data
                        ?.content
                )
            ) {
                rows =
                    responseData.data
                        .content;
            }

            // -------------------------------------------------------------
            // NORMALIZE
            // -------------------------------------------------------------

            const normalizedRows =
                rows.map(
                    normalizeKra
                );

            setKraData(
                normalizedRows
            );

            // -------------------------------------------------------------
            // TOTAL
            // -------------------------------------------------------------

            const total =
                responseData?.totalElements ??
                responseData?.totalCount ??
                responseData?.total ??
                responseData?.data
                    ?.totalElements ??
                responseData?.data
                    ?.totalCount ??
                responseData?.data?.total ??
                normalizedRows.length;

            setTotalElements(
                Number(total) || 0
            );
        } catch (fetchError) {
            console.error(
                "Error fetching Project KRAs:",
                fetchError
            );

            setKraData([]);

            setTotalElements(0);

            const message =
                fetchError.response
                    ?.data?.message ||
                fetchError.response
                    ?.data?.error ||
                "Unable to load Project KRAs.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // FETCH TABLE WHEN FILTER / PAGE CHANGES
    // =========================================================================

    useEffect(() => {
        fetchProjectKras();
    }, [
        page,
        size,
        departmentFilter,
        projectDepartmentFilter,
        search,
        activeOnly,
        sort,
    ]);

    // =========================================================================
    // DEPARTMENT FILTER CHANGE
    // =========================================================================

    const handleDepartmentFilterChange = (
        event
    ) => {
        const value =
            event.target.value;

        setDepartmentFilter(value);

        setProjectDepartmentFilter("");

        setPage(0);
    };

    // =========================================================================
    // PROJECT FILTER CHANGE
    // =========================================================================

    const handleProjectDepartmentFilterChange = (
        event
    ) => {
        setProjectDepartmentFilter(
            event.target.value
        );

        setPage(0);
    };

    // =========================================================================
    // RESET FILTERS
    // =========================================================================

    const handleResetFilters = () => {
        setDepartmentFilter("");

        setProjectDepartmentFilter("");

        setSearchInput("");

        setSearch("");

        setPage(0);
    };

    // =========================================================================
    // PAGINATION
    // =========================================================================

    const handlePageChange = (
        _event,
        newPage
    ) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (
        event
    ) => {
        setSize(
            Number(
                event.target.value
            )
        );

        setPage(0);
    };

    // =========================================================================
    // OPEN ADD KRA
    // =========================================================================

    const handleOpenAddDialog = () => {
        setFormData({
            projectId: "",
            dept: "",
            name: "",
            description: "",
        });

        setFormError("");

        setOpenAddDialog(true);
    };

    // =========================================================================
    // CLOSE ADD KRA
    // =========================================================================

    const handleCloseAddDialog = () => {
        if (createKraLoading) {
            return;
        }

        setOpenAddDialog(false);

        setFormError("");
    };

    // =========================================================================
    // FORM CHANGE
    // =========================================================================

    const handleFormChange = (
        field,
        value
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        setFormError("");
    };

    // =========================================================================
    // CREATE PROJECT KRA
    // =========================================================================

    const handleCreateKra = async () => {
        if (!formData.projectId) {
            setFormError(
                "Please select a project."
            );

            return;
        }

        if (!formData.dept) {
            setFormError(
                "Please select a department."
            );

            return;
        }

        if (
            !selectedProjectDepartment
        ) {
            setFormError(
                "The selected project is not assigned to the selected department."
            );

            return;
        }

        if (
            !formData.name.trim()
        ) {
            setFormError(
                "KRA Name is required."
            );

            return;
        }

        if (
            !formData.description.trim()
        ) {
            setFormError(
                "Description is required."
            );

            return;
        }

        try {
            setCreateKraLoading(
                true
            );

            setFormError("");

            if (!keycloak.authenticated) {
                swalerror(
                    "Please login to continue."
                );

                return;
            }

            try {
                await keycloak.updateToken(
                    30
                );
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
                projectDepartmentId:
                    Number(
                        selectedProjectDepartment.id
                    ),

                kraName:
                    formData.name.trim(),

                description:
                    formData.description.trim(),
            };

            console.log(
                "Create Project KRA Payload:",
                payload
            );

            const response =
                await axiosInstance.post(
                    "/project-kras/create",
                    payload
                );

            console.log(
                "Create Project KRA Response:",
                response.data
            );

            setOpenAddDialog(
                false
            );

            setFormError("");

            setFormData({
                projectId: "",
                dept: "",
                name: "",
                description: "",
            });

            setTimeout(() => {
                swalsucess(
                    "KRA created successfully."
                );
            }, 150);

            setPage(0);

            await fetchProjectKras(
                0
            );
        } catch (createError) {
            console.error(
                "Error creating Project KRA:",
                createError
            );

            const errorMessage =
                createError.response
                    ?.data?.message ||
                createError.response
                    ?.data?.error ||
                "Something went wrong while creating the KRA.";

            swalerror(
                errorMessage
            );
        } finally {
            setCreateKraLoading(
                false
            );
        }
    };

    // =========================================================================
    // DELETE KRA
    // =========================================================================

    const handleDeleteKra = (
        id
    ) => {
        setKraData((prev) =>
            prev.filter(
                (item) =>
                    item.id !== id
            )
        );

        setTotalElements(
            (prev) =>
                Math.max(
                    prev - 1,
                    0
                )
        );
    };

    // =========================================================================
    // PAGINATION DISPLAY
    // =========================================================================

    const showingStart =
        totalElements === 0
            ? 0
            : page * size + 1;

    const showingEnd =
        Math.min(
            (page + 1) * size,
            totalElements
        );

    // =========================================================================
    // SELECTED DEPARTMENT NAME
    // =========================================================================

    const selectedDepartmentName =
        departments.find(
            (department) =>
                Number(
                    department.id
                ) ===
                Number(
                    departmentFilter
                )
        )
            ?.departmentName ||
        "";

    // =========================================================================
    // SELECTED PROJECT NAME FOR FILTER
    // =========================================================================

    const selectedFilterProject =
        projectDepartments.find(
            (item) =>
                Number(item.id) ===
                Number(
                    projectDepartmentFilter
                )
        );

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <DashboardLayout>
            <DashboardNavbar />

            <PageHeader
                title="KRAs"
                icon="flag"
                hue="rose"
                description="Manage project key result areas with department and project filters."
                actions={
                    <>
                        <ViewToggle value={view} onChange={setView} />
                        {canManage && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
                            Add KRA
                        </Button>
                        )}
                    </>
                }
            />

            <Box sx={{ pb: 2 }}>
                <Box
                    sx={{
                        backgroundColor:
                            "var(--pt-surface)",
                        border:
                            "1px solid var(--pt-border)",
                        borderRadius:
                            "12px",
                        boxShadow:
                            "var(--pt-shadow-sm)",
                        overflow:
                            "hidden",
                    }}
                >

                    {/* FILTER BAR */}

                    <Box
                        sx={{
                            px: {
                                xs: 2,
                                md: 3,
                            },
                            py: 2,
                            backgroundColor:
                                "var(--pt-surface-2)",
                            borderBottom:
                                "1px solid var(--pt-border)",
                        }}
                    >
                        <Grid
                            container
                            spacing={1.5}
                            alignItems="center"
                        >
                            {/* DEPARTMENT */}

                            <Grid
                                item
                                xs={12}
                                md={3}
                            >
                                <TextField
                                    fullWidth
                                    select
                                    size="small"
                                    label="Department"
                                    value={
                                        departmentFilter
                                    }
                                    onChange={
                                        handleDepartmentFilterChange
                                    }
                                    InputProps={{
                                        startAdornment:
                                            (
                                                <InputAdornment position="start">
                                                    <BusinessOutlinedIcon
                                                        sx={{
                                                            fontSize:
                                                                18,
                                                            color:
                                                                "var(--pt-text-2)",
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                    }}
                                    sx={
                                        commonFieldSx
                                    }
                                >
                                    <MenuItem value="">
                                        All Departments
                                    </MenuItem>

                                    {departments
                                        .slice()
                                        .sort(
                                            (
                                                a,
                                                b
                                            ) =>
                                                String(
                                                    a.departmentName ||
                                                        ""
                                                ).localeCompare(
                                                    String(
                                                        b.departmentName ||
                                                            ""
                                                    )
                                                )
                                        )
                                        .map(
                                            (
                                                department
                                            ) => (
                                                <MenuItem
                                                    key={
                                                        department.id
                                                    }
                                                    value={
                                                        department.id
                                                    }
                                                >
                                                    {
                                                        department.departmentName
                                                    }
                                                </MenuItem>
                                            )
                                        )}
                                </TextField>
                            </Grid>

                            {/* PROJECT (uses filtered /project-departments) */}

                            <Grid
                                item
                                xs={12}
                                md={3}
                            >
                                <TextField
                                    fullWidth
                                    select
                                    size="small"
                                    label="Project"
                                    value={
                                        projectDepartmentFilter
                                    }
                                    onChange={
                                        handleProjectDepartmentFilterChange
                                    }
                                    InputProps={{
                                        startAdornment:
                                            (
                                                <InputAdornment position="start">
                                                    <FolderOutlinedIcon
                                                        sx={{
                                                            fontSize:
                                                                18,
                                                            color:
                                                                "var(--pt-text-2)",
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                    }}
                                    sx={
                                        commonFieldSx
                                    }
                                >
                                    <MenuItem value="">
                                        All Projects
                                    </MenuItem>

                                    {projectDepartments &&
                                    projectDepartments.length > 0
                                        ? projectDepartments
                                              .slice()
                                              .sort(
                                                  (
                                                      a,
                                                      b
                                                  ) =>
                                                      String(
                                                          a.projectName ||
                                                              ""
                                                      ).localeCompare(
                                                          String(
                                                              b.projectName ||
                                                                  ""
                                                          )
                                                      )
                                              )
                                              .map(
                                                  (
                                                      pd
                                                  ) => (
                                                      <MenuItem
                                                          key={
                                                              pd.id
                                                          }
                                                          value={
                                                              pd.id
                                                          }
                                                      >
                                                          {
                                                              pd.projectName
                                                          }
                                                      </MenuItem>
                                                  )
                                              )
                                        : projects
                                              .slice()
                                              .sort(
                                                  (
                                                      a,
                                                      b
                                                  ) =>
                                                      String(
                                                          a.projectName ||
                                                              ""
                                                      ).localeCompare(
                                                          String(
                                                              b.projectName ||
                                                                  ""
                                                          )
                                                      )
                                              )
                                              .map(
                                                  (
                                                      project
                                                  ) => (
                                                      <MenuItem
                                                          key={
                                                              project.id
                                                          }
                                                          value={
                                                              project.id
                                                          }
                                                      >
                                                          {
                                                              project.projectName
                                                          }
                                                      </MenuItem>
                                                  )
                                              )}
                                </TextField>
                            </Grid>

                            {/* SEARCH */}

                            <Grid
                                item
                                xs={12}
                                md={3}
                            >
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Search Description"
                                    placeholder="Search by description..."
                                    value={
                                        searchInput
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSearchInput(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    InputProps={{
                                        startAdornment:
                                            (
                                                <InputAdornment position="start">
                                                    <SearchIcon
                                                        sx={{
                                                            fontSize:
                                                                19,
                                                            color:
                                                                "var(--pt-text-2)",
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                    }}
                                    sx={
                                        commonFieldSx
                                    }
                                />
                            </Grid>

                            {/* SORT */}

                            <Grid
                                item
                                xs={12}
                                md={3}
                            >
                                <TextField
                                    fullWidth
                                    select
                                    size="small"
                                    label="Sort By"
                                    value="kraName"
                                    disabled
                                    InputProps={{
                                        startAdornment:
                                            (
                                                <InputAdornment position="start">
                                                    <SortByAlphaIcon
                                                        sx={{
                                                            fontSize:
                                                                18,
                                                            color:
                                                                "var(--pt-text-2)",
                                                        }}
                                                    />
                                                </InputAdornment>
                                            ),
                                    }}
                                    sx={{
                                        ...commonFieldSx,

                                        "& .MuiInputBase-root.Mui-disabled":
                                            {
                                                backgroundColor:
                                                    "var(--pt-surface-2)",
                                            },
                                    }}
                                >
                                    <MenuItem value="kraName">
                                        KRA Name
                                    </MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>

                        {/* FILTER SUMMARY */}

                        <Box
                            sx={{
                                mt: 1.5,
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "space-between",
                                gap: 1,
                                flexWrap:
                                    "wrap",
                            }}
                        >
                            <Box
                                sx={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: 1,
                                    flexWrap:
                                        "wrap",
                                }}
                            >
                                <FilterAltOutlinedIcon
                                    sx={{
                                        fontSize:
                                            17,
                                        color:
                                            "var(--pt-text-3)",
                                    }}
                                />

                                <Typography
                                    sx={{
                                        fontSize:
                                            "12px",
                                        color:
                                            "var(--pt-text-2)",
                                    }}
                                >
                                    Active KRAs
                                    only
                                </Typography>

                                {selectedDepartmentName && (
                                    <Chip
                                        size="small"
                                        label={
                                            selectedDepartmentName
                                        }
                                        sx={{
                                            height:
                                                26,
                                            borderRadius:
                                                "7px",
                                            backgroundColor:
                                                "var(--pt-accent-soft)",
                                            color:
                                                "var(--pt-accent-text)",
                                            fontWeight:
                                                600,
                                            fontSize:
                                                "11px",
                                        }}
                                    />
                                )}

                                {selectedFilterProject && (
                                    <Chip
                                        size="small"
                                        label={
                                            selectedFilterProject.projectName ||
                                            "Project"
                                        }
                                        sx={{
                                            height:
                                                26,
                                            borderRadius:
                                                "7px",
                                            backgroundColor:
                                                "var(--pt-success-soft)",
                                            color:
                                                "var(--pt-success)",
                                            fontWeight:
                                                600,
                                            fontSize:
                                                "11px",
                                        }}
                                    />
                                )}

                                {search && (
                                    <Chip
                                        size="small"
                                        label={`Search: ${search}`}
                                        sx={{
                                            height:
                                                26,
                                            borderRadius:
                                                "7px",
                                            backgroundColor:
                                                "var(--pt-warning-soft)",
                                            color:
                                                "var(--pt-warning)",
                                            fontWeight:
                                                600,
                                            fontSize:
                                                "11px",
                                        }}
                                    />
                                )}
                            </Box>

                            <Box
                                sx={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: 1,
                                }}
                            >
                                {(departmentFilter ||
                                    projectDepartmentFilter ||
                                    searchInput) && (
                                    <MDButton
                                        variant="outlined"
                                        color="secondary"
                                        onClick={
                                            handleResetFilters
                                        }
                                        startIcon={
                                            <RefreshIcon />
                                        }
                                        sx={{
                                            minHeight:
                                                "36px",
                                            borderRadius:
                                                "9px",
                                            textTransform:
                                                "none",
                                            fontSize:
                                                "12px",
                                            px: 1.5,
                                        }}
                                    >
                                        Reset
                                    </MDButton>
                                )}

                                <Tooltip title="Refresh">
                                    <IconButton
                                        onClick={() =>
                                            fetchProjectKras()
                                        }
                                        disabled={
                                            loading
                                        }
                                        size="small"
                                        sx={{
                                            border:
                                                "1px solid var(--pt-border)",
                                            borderRadius:
                                                "9px",
                                            backgroundColor:
                                                "var(--pt-surface)",
                                        }}
                                    >
                                        <RefreshIcon
                                            sx={{
                                                fontSize:
                                                    19,
                                            }}
                                        />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>

                    {/* ERROR */}

                    {error && (
                        <Box
                            sx={{
                                mx: 3,
                                mt: 2,
                                px: 2,
                                py: 1.25,
                                borderRadius:
                                    "10px",
                                backgroundColor:
                                    "var(--pt-danger-soft)",
                                border:
                                    "1px solid var(--pt-danger-border)",
                                color:
                                    "var(--pt-danger)",
                                fontSize:
                                    "13px",
                            }}
                        >
                            {error}
                        </Box>
                    )}

                    {/* LOADING */}

                    {loading && (
                        <LinearProgress
                            sx={{
                                height: 2,
                            }}
                        />
                    )}

                    {/* TABLE */}

                    {view === "table" ? (
                        <DataGrid
                            title="Project KRAs"
                            exportName="kras"
                            loading={loading && kraData.length === 0}
                            rows={kraData}
                            paginate={false}
                            emptyText="No KRAs found"
                            columns={[
                                { key: "name", label: "KRA", render: (r) => <IconCell icon="flag" title={r.name} sub={r.projectName !== "-" ? r.projectName : null} hue={hueFor(r.dept || "")} /> },
                                { key: "dept", label: "Department", render: (r) => <TagCell label={r.dept} hue={hueFor(r.dept || "")} /> },
                                { key: "description", label: "Description" },
                                { key: "current", label: "Current / Target", align: "center", render: (r) => `${r.current} / ${r.target}` },
                                { key: "progress", label: "Progress", value: (r) => Number(r.progress) || 0, render: (r) => <ProgressCell value={Number(r.progress) || 0} /> },
                                { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
                                { key: "due", label: "Due", render: (r) => <DateCell value={r.due} /> },
                            ]}
                            actions={canManage ? (r) => [{ icon: "delete", label: "Delete KRA", tone: "danger", onClick: () => handleDeleteKra(r.id) }] : null}
                        />
                    ) : (
                        <CardGrid loading={loading && kraData.length === 0} empty={kraData.length === 0} emptyText="No KRAs found">
                            {kraData.map((row, i) => (
                                <RecordCard
                                    key={row.id ?? i}
                                    index={i}
                                    title={row.name}
                                    subtitle={row.projectName && row.projectName !== "-" ? row.projectName : null}
                                    avatarIcon="flag"
                                    hue={hueFor(row.dept || "")}
                                    status={<StatusBadge status={row.status} />}
                                    description={row.description && row.description !== "-" ? row.description : null}
                                    meta={[
                                        { icon: "apartment", label: "Department", value: row.dept },
                                        { icon: "track_changes", label: "Target / current", value: `${row.target} / ${row.current}` },
                                        { icon: "event", label: "Due", value: row.due || "—" },
                                    ]}
                                    progress={Number(row.progress) || 0}
                                    actions={canManage ? [{ icon: "delete_outline", label: "Delete KRA", tone: "danger", onClick: () => handleDeleteKra(row.id) }] : []}
                                />
                            ))}
                        </CardGrid>
                    )}

                    {/* PAGINATION */}

                    <Box
                        sx={{
                            px: {
                                xs: 1,
                                md: 2,
                            },
                            py: 0.5,
                            borderTop:
                                "1px solid var(--pt-border)",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "space-between",
                            flexWrap:
                                "wrap",
                        }}
                    >
                        <Typography
                            sx={{
                                pl: {
                                    xs: 1,
                                    md: 1.5,
                                },
                                fontSize:
                                    "12px",
                                color:
                                    "var(--pt-text-2)",
                            }}
                        >
                            Showing{" "}
                            {
                                showingStart
                            }
                            -
                            {
                                showingEnd
                            }{" "}
                            of{" "}
                            {
                                totalElements
                            }{" "}
                            KRAs
                        </Typography>

                        <TablePagination
                            component="div"
                            count={
                                totalElements
                            }
                            page={page}
                            onPageChange={
                                handlePageChange
                            }
                            rowsPerPage={
                                size
                            }
                            onRowsPerPageChange={
                                handleRowsPerPageChange
                            }
                            rowsPerPageOptions={[
                                10,
                                20,
                                50,
                                100,
                            ]}
                            labelRowsPerPage="Rows"
                            sx={{
                                "& .MuiTablePagination-toolbar":
                                    {
                                        minHeight:
                                            "56px",
                                        px: 0,
                                    },

                                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                                    {
                                        fontSize:
                                            "12px",
                                        color:
                                            "var(--pt-text-2)",
                                    },

                                "& .MuiTablePagination-select":
                                    {
                                        fontSize:
                                            "12px",
                                    },
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* CREATE KRA DIALOG */}

            <Dialog
                open={
                    openAddDialog
                }
                onClose={
                    handleCloseAddDialog
                }
                fullWidth
                maxWidth="md"
            >
                <DialogHeader
                    title="Add project KRA"
                    subtitle="Define a key result area for a project and department"
                    icon="gauge"
                    hue="rose"
                    onClose={handleCloseAddDialog}
                />

                <DialogContent>
                    {formError && (
                        <Box
                            sx={{
                                backgroundColor:
                                    "var(--pt-danger-soft)",
                                color:
                                    "var(--pt-danger)",
                                border:
                                    "1px solid var(--pt-danger-border)",
                                borderRadius:
                                    "8px",
                                px: 2,
                                py: 1.2,
                                mb: 2,
                                fontSize:
                                    "14px",
                            }}
                        >
                            {formError}
                        </Box>
                    )}

                    <Grid
                        container
                        spacing={2}
                    >
                        {/* PROJECT */}

                        <Grid
                            item
                            xs={12}
                            md={6}
                        >
                            <TextField
                                select
                                fullWidth
                                label="Project"
                                value={
                                    formData.projectId
                                }
                                onChange={(e) =>
                                    handleFormChange(
                                        "projectId",
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    projectLoading ||
                                    createKraLoading
                                }
                                sx={
                                    dialogFieldSx
                                }
                                InputProps={{
                                    startAdornment:
                                        (
                                            <InputAdornment position="start">
                                                <FolderOutlinedIcon
                                                    sx={{
                                                        fontSize:
                                                            18,
                                                        color:
                                                            "var(--pt-text-2)",
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                }}
                            >
                                <MenuItem value="">
                                    {projectLoading
                                        ? "Loading projects..."
                                        : "Select Project"}
                                </MenuItem>

                                {projects
                                    .slice()
                                    .sort(
                                        (
                                            a,
                                            b
                                        ) =>
                                            String(
                                                a.projectName ||
                                                    ""
                                            ).localeCompare(
                                                String(
                                                    b.projectName ||
                                                        ""
                                                )
                                            )
                                    )
                                    .map(
                                        (
                                            project
                                        ) => (
                                            <MenuItem
                                                key={
                                                    project.id
                                                }
                                                value={
                                                    project.id
                                                }
                                            >
                                                {
                                                    project.projectName
                                                }
                                            </MenuItem>
                                        )
                                    )}
                            </TextField>
                        </Grid>

                        {/* DEPARTMENT */}

                        <Grid
                            item
                            xs={12}
                            md={6}
                        >
                            <TextField
                                select
                                fullWidth
                                label="Department"
                                value={
                                    formData.dept
                                }
                                onChange={(e) =>
                                    handleFormChange(
                                        "dept",
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    createKraLoading
                                }
                                sx={
                                    dialogFieldSx
                                }
                                InputProps={{
                                    startAdornment:
                                        (
                                            <InputAdornment position="start">
                                                <BusinessOutlinedIcon
                                                    sx={{
                                                        fontSize:
                                                            18,
                                                        color:
                                                            "var(--pt-text-2)",
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                }}
                            >
                                <MenuItem value="">
                                    Select Department
                                </MenuItem>

                                {departments
                                    .slice()
                                    .sort(
                                        (
                                            a,
                                            b
                                        ) =>
                                            String(
                                                a.departmentName ||
                                                    ""
                                            ).localeCompare(
                                                String(
                                                    b.departmentName ||
                                                        ""
                                                )
                                            )
                                    )
                                    .map(
                                        (
                                            department
                                        ) => (
                                            <MenuItem
                                                key={
                                                    department.id
                                                }
                                                value={
                                                    department.id
                                                }
                                            >
                                                {
                                                    department.departmentName
                                                }
                                            </MenuItem>
                                        )
                                    )}
                            </TextField>
                        </Grid>

                        {/* PROJECT-DEPARTMENT STATUS */}

                        {formData.projectId &&
                            formData.dept && (
                                <Grid
                                    item
                                    xs={12}
                                >
                                    <Box
                                        sx={{
                                            px: 2,
                                            py: 1.5,
                                            borderRadius:
                                                "10px",

                                            backgroundColor:
                                                selectedProjectDepartment
                                                    ? "var(--pt-success-soft)"
                                                    : "var(--pt-warning-soft)",

                                            border:
                                                selectedProjectDepartment
                                                    ? "1px solid var(--pt-success-border)"
                                                    : "1px solid var(--pt-warning-border)",
                                        }}
                                    >
                                        {selectedProjectDepartment ? (
                                            <Typography
                                                sx={{
                                                    fontSize:
                                                        "12px",
                                                    color:
                                                        "var(--pt-success)",
                                                    fontWeight:
                                                        600,
                                                }}
                                            >
                                                Project
                                                assignment
                                                found.
                                                Project
                                                Department
                                                ID:{" "}
                                                {
                                                    selectedProjectDepartment.id
                                                }
                                            </Typography>
                                        ) : (
                                            <Typography
                                                sx={{
                                                    fontSize:
                                                        "12px",
                                                    color:
                                                        "var(--pt-warning)",
                                                    fontWeight:
                                                        600,
                                                }}
                                            >
                                                This
                                                project
                                                is not
                                                assigned
                                                to the
                                                selected
                                                department.
                                                Please
                                                choose a
                                                matching
                                                project
                                                and
                                                department.
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            )}

                        {/* KRA NAME */}

                        <Grid
                            item
                            xs={12}
                        >
                            <TextField
                                fullWidth
                                label="KRA Name"
                                placeholder="Enter KRA name"
                                value={
                                    formData.name
                                }
                                onChange={(e) =>
                                    handleFormChange(
                                        "name",
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    createKraLoading
                                }
                                required
                                sx={
                                    dialogFieldSx
                                }
                            />
                        </Grid>

                        {/* DESCRIPTION */}

                        <Grid
                            item
                            xs={12}
                        >
                            <TextField
                                fullWidth
                                label="Description"
                                placeholder="Enter KRA description"
                                multiline
                                rows={4}
                                value={
                                    formData.description
                                }
                                onChange={(e) =>
                                    handleFormChange(
                                        "description",
                                        e.target
                                            .value
                                    )
                                }
                                disabled={
                                    createKraLoading
                                }
                                required
                                sx={
                                    dialogFieldSx
                                }
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                {/* DIALOG BUTTONS */}

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        gap: 1,
                    }}
                >
                    <MDButton
                        variant="outlined"
                        color="secondary"
                        onClick={
                            handleCloseAddDialog
                        }
                        disabled={
                            createKraLoading
                        }
                        sx={{
                            borderRadius:
                                "10px",
                        }}
                    >
                        Cancel
                    </MDButton>

                    <MDButton
                        variant="gradient"
                        color="info"
                        onClick={
                            handleCreateKra
                        }
                        disabled={
                            createKraLoading ||
                            !selectedProjectDepartment
                        }
                        sx={{
                            borderRadius:
                                "10px",
                            minWidth:
                                "125px",
                        }}
                    >
                        {createKraLoading ? (
                            <CircularProgress
                                size={
                                    20
                                }
                                sx={{
                                    color:
                                        "#fff",
                                }}
                            />
                        ) : (
                            "Create KRA"
                        )}
                    </MDButton>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}

export default Kra;