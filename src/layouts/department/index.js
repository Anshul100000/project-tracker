import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";

import MDBox from "components/MDBox";
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

import keycloak from "../../auth/keycloak";
import base_url from "Baseurl";
import axiosInstance from "services.js/axiosInstance";

import { swalsucess } from "../../../src/sucess";
import { swalerror } from "../../../src/Error";

/* -------------------------------------------------------------------------- */
/*                              INITIAL DATA                                  */
/* -------------------------------------------------------------------------- */

const emptyDepartment = {
    departmentName: "",
    description: "",
    active: true,
};

/* -------------------------------------------------------------------------- */
/*                              STATUS BADGE                                  */
/* -------------------------------------------------------------------------- */

function StatusBadge({ active }) {
    return <StatusPill label={active ? "Active" : "Inactive"} tone={active ? "success" : "neutral"} />;
}

StatusBadge.propTypes = {
    active: PropTypes.bool,
};

/* -------------------------------------------------------------------------- */
/*                              SUMMARY CARD                                  */
/* -------------------------------------------------------------------------- */

function SummaryCard({ title, value, icon, description }) {
    const hue = /inactive/i.test(title) ? "slate" : /active/i.test(title) ? "emerald" : "violet";
    return <StatTile title={title} value={value} icon={icon} description={description} hue={hue} />;
}

SummaryCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.node.isRequired,
    description: PropTypes.string,
};

/* -------------------------------------------------------------------------- */
/*                           DEPARTMENT FORM DIALOG                           */
/* -------------------------------------------------------------------------- */

function DepartmentFormDialog({
    open,
    onClose,
    department,
    onSave,
    saving,
}) {
    const [formData, setFormData] = useState(emptyDepartment);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (department) {
            setFormData({
                departmentName: department.departmentName || "",
                description: department.description || "",
                active:
                    typeof department.active === "boolean"
                        ? department.active
                        : true,
            });
        } else {
            setFormData({ ...emptyDepartment });
        }

        setErrors({});
    }, [department, open]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleStatusChange = (event) => {
        setFormData((prev) => ({
            ...prev,
            active: event.target.value === "true",
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.departmentName.trim()) {
            newErrors.departmentName = "Department name is required";
        }

        if (formData.departmentName.trim().length > 100) {
            newErrors.departmentName =
                "Department name must be less than 100 characters";
        }

        if (formData.description.trim().length > 500) {
            newErrors.description =
                "Description must be less than 500 characters";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        onSave({
            departmentName: formData.departmentName.trim(),
            description: formData.description.trim(),
            active: formData.active,
        });
    };

    const isEdit = Boolean(department?.id);

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogHeader
                title={isEdit ? "Edit department" : "Add department"}
                subtitle={isEdit ? "Update the department's details" : "Create a new department"}
                icon="blocks"
                hue="violet"
                onClose={onClose}
                disabled={saving}
            />

            <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={2.5}>
                    <TextField
                        fullWidth
                        label="Department Name"
                        name="departmentName"
                        value={formData.departmentName}
                        onChange={handleChange}
                        error={Boolean(errors.departmentName)}
                        helperText={
                            errors.departmentName ||
                            `${formData.departmentName.length}/100`
                        }
                        disabled={saving}
                        size="small"
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        error={Boolean(errors.description)}
                        helperText={
                            errors.description ||
                            `${formData.description.length}/500`
                        }
                        disabled={saving}
                        size="small"
                    />

                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>

                        <Select
                            value={String(formData.active)}
                            label="Status"
                            onChange={handleStatusChange}
                            disabled={saving}
                        >
                            <MenuItem value="true">Active</MenuItem>
                            <MenuItem value="false">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button
                    onClick={onClose}
                    disabled={saving}
                    sx={{
                        color: "var(--pt-text-2)",
                        textTransform: "none",
                        fontWeight: 600,
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{
                        background:
                            "var(--pt-accent)",
                        color: "#fff",
                        textTransform: "none",
                        fontWeight: 600,
                        minWidth: "100px",
                        "&:hover": {
                            background:
                                "var(--pt-accent-hover)",
                        },
                    }}
                >
                    {saving ? (
                        <CircularProgress size={20} sx={{ color: "#fff" }} />
                    ) : isEdit ? (
                        "Update"
                    ) : (
                        "Create"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

DepartmentFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    department: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    saving: PropTypes.bool,
};

/* -------------------------------------------------------------------------- */
/*                              DELETE DIALOG                                 */
/* -------------------------------------------------------------------------- */

function DeleteDialog({ open, department, onClose, onConfirm, deleting }) {
    return (
        <ConfirmDialog
            open={open}
            title="Delete department?"
            itemKind="department"
            itemName={department?.departmentName}
            busy={Boolean(deleting)}
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}

DeleteDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    department: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    deleting: PropTypes.bool,
};

/* -------------------------------------------------------------------------- */
/*                              VIEW DIALOG                                   */
/* -------------------------------------------------------------------------- */

function ViewDepartmentDialog({
    open,
    department,
    onClose,
}) {
    if (!department) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogHeader
                title="Department details"
                subtitle={department?.departmentName}
                icon="eye"
                hue="violet"
                onClose={onClose}
            />

            <DialogContent>
                {/* Overview */}
                <Box
                    display="flex"
                    alignItems="center"
                    gap={1.75}
                    p={2}
                    mb={2}
                    sx={{
                        borderRadius: "12px",
                        border: "1px solid var(--pt-border)",
                        backgroundImage: `radial-gradient(120% 140% at 100% 0%, var(--pt-${hueFor(department.departmentName || "")}-soft) 0%, transparent 60%)`,
                    }}
                >
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            borderRadius: "14px",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            color: "#fff",
                            backgroundColor: `var(--pt-${hueFor(department.departmentName || "")})`,
                        }}
                    >
                        <ApartmentIcon />
                    </Box>
                    <Box flex={1} minWidth={0}>
                        <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "var(--pt-text)" }} noWrap>
                            {department.departmentName || "Unnamed department"}
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "var(--pt-text-3)" }}>
                            {department.id !== undefined ? `Department ID ${department.id}` : "Department"}
                        </Typography>
                    </Box>
                    <StatusBadge active={Boolean(department.active)} />
                </Box>

                {/* Details */}
                <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={1.5}>
                    <Box gridColumn="1 / -1" p={1.75} sx={{ borderRadius: "10px", backgroundColor: "var(--pt-surface-2)", border: "1px solid var(--pt-border)" }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--pt-text-3)", textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.5 }}>
                            Description
                        </Typography>
                        <Typography sx={{ fontSize: "14px", color: "var(--pt-text)", lineHeight: 1.6 }}>
                            {department.description || "No description provided."}
                        </Typography>
                    </Box>
                    {[
                        ["Status", department.active ? "Active" : "Inactive"],
                        ["Department ID", department.id ?? "—"],
                    ].map(([label, value]) => (
                        <Box key={label} p={1.75} sx={{ borderRadius: "10px", backgroundColor: "var(--pt-surface-2)", border: "1px solid var(--pt-border)" }}>
                            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "var(--pt-text-3)", textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.5 }}>
                                {label}
                            </Typography>
                            <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "var(--pt-text)" }}>{value}</Typography>
                        </Box>
                    ))}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ViewDepartmentDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    department: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

function Departments() {
    const [view, setView] = useViewMode("departments");
    const canManage = can("manageOrganization");
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openView, setOpenView] = useState(false);

    const [selectedDepartment, setSelectedDepartment] = useState(null);

    /* ---------------------------------------------------------------------- */
    /*                           AUTH HEADERS                                  */
    /* ---------------------------------------------------------------------- */

    const getAuthHeaders = async () => {
        if (!keycloak) {
            throw new Error("Keycloak configuration not found.");
        }

        if (!keycloak.authenticated) {
            throw new Error(
                "Keycloak authentication is required. Please login again."
            );
        }

        try {
            await keycloak.updateToken(30);
        } catch (tokenError) {
            console.error(
                "Keycloak token refresh failed:",
                tokenError
            );

            throw new Error("Session expired. Please login again.");
        }

        if (!keycloak.token) {
            throw new Error("Keycloak access token not found.");
        }

        return {
            Authorization: `Bearer ${keycloak.token}`,
            "Content-Type": "application/json",
        };
    };

    /* ---------------------------------------------------------------------- */
    /*                           FETCH DEPARTMENTS                             */
    /* ---------------------------------------------------------------------- */

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError("");

            await getAuthHeaders();

            console.log("Fetching departments...");
            console.log(
                "URL:",
                `${base_url}/departments?activeOnly=false`
            );

            const response = await axiosInstance.get(
                "/departments?activeOnly=false"
            );

            console.log(
                "Departments API response:",
                response.data
            );

            let data = [];

            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (Array.isArray(response.data?.data)) {
                data = response.data.data;
            } else if (Array.isArray(response.data?.content)) {
                data = response.data.content;
            }

            setDepartments(data);
        } catch (err) {
            console.error(
                "Error fetching departments:",
                err
            );

            if (err?.response) {
                console.error(
                    "Status:",
                    err.response.status
                );

                console.error(
                    "Response:",
                    err.response.data
                );
            }

            setDepartments([]);

            if (err?.response?.status === 401) {
                setError(
                    "Unauthorized. Your Keycloak session may have expired. Please login again."
                );
            } else if (err?.response?.status === 403) {
                setError(
                    "You do not have permission to access departments."
                );
            } else {
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to fetch departments."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    /* ---------------------------------------------------------------------- */
    /*                              INITIAL LOAD                              */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        fetchDepartments();
    }, []);

    /* ---------------------------------------------------------------------- */
    /*                              STATISTICS                                */
    /* ---------------------------------------------------------------------- */

    const totalDepartments = departments.length;

    const activeDepartments = departments.filter(
        (department) => department.active === true
    ).length;

    const inactiveDepartments = departments.filter(
        (department) => department.active === false
    ).length;

    /* ---------------------------------------------------------------------- */
    /*                              FILTER DATA                               */
    /* ---------------------------------------------------------------------- */

    const filteredDepartments = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return departments.filter((department) => {
            const departmentName = String(
                department.departmentName || ""
            ).toLowerCase();

            const description = String(
                department.description || ""
            ).toLowerCase();

            const matchesSearch =
                departmentName.includes(searchValue) ||
                description.includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" &&
                    department.active === true) ||
                (statusFilter === "inactive" &&
                    department.active === false);

            return matchesSearch && matchesStatus;
        });
    }, [departments, search, statusFilter]);

    /* ---------------------------------------------------------------------- */
    /*                              CREATE                                    */
    /* ---------------------------------------------------------------------- */

    const handleAdd = () => {
        setSelectedDepartment(null);
        setOpenForm(true);
    };

    /* ---------------------------------------------------------------------- */
    /*                              EDIT                                      */
    /* ---------------------------------------------------------------------- */

    const handleEdit = (department) => {
        setSelectedDepartment(department);
        setOpenForm(true);
    };

    /* ---------------------------------------------------------------------- */
    /*                              VIEW                                      */
    /* ---------------------------------------------------------------------- */

    const handleView = (department) => {
        setSelectedDepartment(department);
        setOpenView(true);
    };

    /* ---------------------------------------------------------------------- */
    /*                              DELETE                                    */
    /* ---------------------------------------------------------------------- */

    const handleDeleteClick = (department) => {
        setSelectedDepartment(department);
        setOpenDelete(true);
    };

    /* ---------------------------------------------------------------------- */
    /*                              SAVE                                      */
    /* ---------------------------------------------------------------------- */

    const handleSave = async (departmentData) => {
        try {
            setSaving(true);
            setError("");

            const headers = await getAuthHeaders();

            let response;

            /* ---------------------------------------------------------------- */
            /*                         UPDATE                                    */
            /* ---------------------------------------------------------------- */

            if (selectedDepartment?.id !== undefined) {
                console.log(
                    "Updating department:",
                    selectedDepartment.id
                );

                response = await axiosInstance.put(
                    `${base_url}/departments/${selectedDepartment.id}`,
                    departmentData,
                    {
                        headers,
                    }
                );

                console.log(
                    "Department updated:",
                    response.data
                );

                swalsucess(
                    "Department updated successfully"
                );
            }

            /* ---------------------------------------------------------------- */
            /*                         CREATE                                    */
            /* ---------------------------------------------------------------- */

            else {
                const payload = {
                    departmentName:
                        departmentData.departmentName,
                    description:
                        departmentData.description,
                };

                console.log(
                    "Create Department Payload:",
                    payload
                );

                response = await axiosInstance.post(
                    `${base_url}/departments/create`,
                    payload,
                    {
                        headers,
                    }
                );

                console.log(
                    "Department created:",
                    response.data
                );

                swalsucess(
                    "Department created successfully"
                );
            }

            setOpenForm(false);
            setSelectedDepartment(null);

            await fetchDepartments();
        } catch (err) {
            console.error(
                "Error saving department:",
                err
            );

            if (err?.response) {
                console.error(
                    "Status:",
                    err.response.status
                );

                console.error(
                    "Response:",
                    err.response.data
                );
            }

            const errorMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to save department.";

            setError(errorMessage);

            swalerror(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    /* ---------------------------------------------------------------------- */
    /*                              DELETE                                    */
    /* ---------------------------------------------------------------------- */

    const handleDelete = async () => {
        if (selectedDepartment?.id === undefined) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            const headers = await getAuthHeaders();

            console.log(
                "Deleting department:",
                selectedDepartment.id
            );

            await axiosInstance.delete(
                `${base_url}/departments/${selectedDepartment.id}`,
                {
                    headers,
                }
            );

            swalsucess(
                "Department deleted successfully"
            );

            setOpenDelete(false);
            setSelectedDepartment(null);

            await fetchDepartments();
        } catch (err) {
            console.error(
                "Error deleting department:",
                err
            );

            if (err?.response) {
                console.error(
                    "Status:",
                    err.response.status
                );

                console.error(
                    "Response:",
                    err.response.data
                );
            }

            const errorMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to delete department.";

            setError(errorMessage);

            swalerror(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    /* ---------------------------------------------------------------------- */
    /*                              CLOSE HANDLERS                            */
    /* ---------------------------------------------------------------------- */

    const handleCloseForm = () => {
        if (saving) return;

        setOpenForm(false);
        setSelectedDepartment(null);
    };

    const handleCloseDelete = () => {
        if (deleting) return;

        setOpenDelete(false);
        setSelectedDepartment(null);
    };

    const handleCloseView = () => {
        setOpenView(false);
        setSelectedDepartment(null);
    };

    /* ---------------------------------------------------------------------- */
    /*                              RENDER                                    */
    /* ---------------------------------------------------------------------- */

    return (
        <DashboardLayout>
            <DashboardNavbar />

            <MDBox
                pb={3}
                sx={{
                    minHeight: "calc(100vh - 150px)",
                }}
            >
                <PageHeader
                    title="Departments"
                    description="Manage your organization departments"
                    icon="apartment"
                    hue="violet"
                    actions={
                        <>
                            <ViewToggle value={view} onChange={setView} />
                            {canManage && (
                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                                Add Department
                            </Button>
                            )}
                        </>
                    }
                />

                {/* ERROR */}
                {error && (
                    <Alert
                        severity="error"
                        onClose={() => setError("")}
                        sx={{
                            mb: 3,
                            borderRadius: "8px",
                            fontSize: "13px",
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* SUMMARY */}
                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <SummaryCard
                            title="Total Departments"
                            value={totalDepartments}
                            description="All departments"
                            icon={<ApartmentIcon />}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <SummaryCard
                            title="Active Departments"
                            value={activeDepartments}
                            description="Currently active"
                            icon={<CheckCircleIcon />}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <SummaryCard
                            title="Inactive Departments"
                            value={inactiveDepartments}
                            description="Currently inactive"
                            icon={<CancelIcon />}
                        />
                    </Grid>
                </Grid>

                {/* TABLE CARD */}
                <Card
                    sx={{
                        borderRadius: "12px",
                        boxShadow:
                            "var(--pt-shadow-sm)",
                        overflow: "hidden",
                    }}
                >
                    {/* SEARCH/FILTER */}
                    <Box sx={{ p: 2.5 }}>
                        <Grid
                            container
                            spacing={2}
                            alignItems="center"
                        >
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search department..."
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
                                                        color: "var(--pt-text-2)",
                                                        fontSize:
                                                            "20px",
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root":
                                            {
                                                borderRadius:
                                                    "8px",
                                                backgroundColor:
                                                    "var(--pt-surface)",
                                                height: "42px",
                                            },
                                        "& input": {
                                            fontSize: "13px",
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <FormControl
                                    fullWidth
                                    size="small"
                                    sx={{
                                        "& .MuiOutlinedInput-root":
                                            {
                                                borderRadius:
                                                    "8px",
                                                height: "42px",
                                            },
                                    }}
                                >
                                    <InputLabel>
                                        Status
                                    </InputLabel>

                                    <Select
                                        value={statusFilter}
                                        label="Status"
                                        onChange={(event) =>
                                            setStatusFilter(
                                                event.target.value
                                            )
                                        }
                                        sx={{
                                            fontSize: "13px",
                                        }}
                                    >
                                        <MenuItem value="all">
                                            All Status
                                        </MenuItem>

                                        <MenuItem value="active">
                                            Active
                                        </MenuItem>

                                        <MenuItem value="inactive">
                                            Inactive
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider />

                    {/* TABLE */}
                    {view === "table" ? (
                        <DataGrid
                            title="Departments"
                            exportName="departments"
                            loading={loading}
                            rows={filteredDepartments}
                            getRowId={(d) => d.id ?? d.departmentName}
                            emptyText="No departments found"
                            columns={[
                                { key: "departmentName", label: "Department", render: (d) => <IconCell icon="apartment" title={d.departmentName || "Unnamed"} sub={d.id !== undefined ? `ID ${d.id}` : null} hue={hueFor(d.departmentName || "")} /> },
                                { key: "description", label: "Description" },
                                { key: "active", label: "Status", value: (d) => (d.active !== false ? "Active" : "Inactive"), render: (d) => <StatusBadge active={d.active !== false} /> },
                            ]}
                            actions={(d) => [
                                { icon: "eye", label: "View", onClick: () => handleView(d) },
                                ...(canManage
            ? [
                  { icon: "square-pen", label: "Edit", tone: "accent", onClick: () => handleEdit(d) },
                  { icon: "delete", label: "Delete", tone: "danger", onClick: () => handleDeleteClick(d) },
              ]
            : []),
                            ]}
                        />
                    ) : (
                        <CardGrid loading={loading} empty={filteredDepartments.length === 0} emptyText="No departments found">
                            {filteredDepartments.map((department, i) => (
                                <RecordCard
                                    key={department.id ?? i}
                                    index={i}
                                    title={department.departmentName || "Unnamed"}
                                    subtitle={department.id !== undefined ? `ID ${department.id}` : null}
                                    avatarIcon="apartment"
                                    hue={hueFor(department.departmentName || "")}
                                    status={<StatusBadge active={department.active !== false} />}
                                    description={department.description || "No description"}
                                    actions={[
                                        { icon: "visibility", label: "View", onClick: () => handleView(department) },
                                        ...(canManage
                    ? [
                          { icon: "edit", label: "Edit", tone: "accent", onClick: () => handleEdit(department) },
                          { icon: "delete_outline", label: "Delete", tone: "danger", onClick: () => handleDeleteClick(department) },
                      ]
                    : []),
                                    ]}
                                />
                            ))}
                        </CardGrid>
                    )}

                    {/* FOOTER */}
                    {!loading && (
                        <>
                            <Divider />

                            <Box
                                sx={{
                                    px: 2.5,
                                    py: 1.5,
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "12px",
                                        color: "var(--pt-text-2)",
                                    }}
                                >
                                    Showing{" "}
                                    <strong>
                                        {
                                            filteredDepartments.length
                                        }
                                    </strong>{" "}
                                    of{" "}
                                    <strong>
                                        {departments.length}
                                    </strong>{" "}
                                    departments
                                </Typography>

                                {(search ||
                                    statusFilter !==
                                        "all") && (
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setSearch("");
                                            setStatusFilter(
                                                "all"
                                            );
                                        }}
                                        sx={{
                                            textTransform:
                                                "none",
                                            fontSize: "12px",
                                            color: "var(--pt-text)",
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </Box>
                        </>
                    )}
                </Card>
            </MDBox>

            {/* FORM */}
            <DepartmentFormDialog
                open={openForm}
                onClose={handleCloseForm}
                department={selectedDepartment}
                onSave={handleSave}
                saving={saving}
            />

            {/* DELETE */}
            <DeleteDialog
                open={openDelete}
                department={selectedDepartment}
                onClose={handleCloseDelete}
                onConfirm={handleDelete}
                deleting={deleting}
            />

            {/* VIEW */}
            <ViewDepartmentDialog
                open={openView}
                department={selectedDepartment}
                onClose={handleCloseView}
            />

            <Footer />
        </DashboardLayout>
    );
}

export default Departments;

