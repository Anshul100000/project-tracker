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
    IconButton,
    Box,
    Typography,
    Avatar,
    Stack,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    CircularProgress,
    Grid,
    TablePagination,
    Tooltip,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

// Dashboard
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
import StatusPill from "components/StatusPill";
import PageHeader from "components/PageHeader";
import StatTile from "components/StatTile";

// Keycloak
import keycloak from "../../auth/keycloak";
import axiosInstance from "services.js/axiosInstance";

// Base URL
import base_url from "Baseurl";

// SweetAlert
import swalsucess from "../../../src/sucess";
import swalerror from "../../../src/Error";

// ---------------------------------------------------------
// Empty Employee Form
// ---------------------------------------------------------

const emptyEmployee = {
    id: null,

    firstName: "",
    lastName: "",
    employeeCode: "",
    email: "",
    phone: "",

    department: "",
    departmentCode: "",
    departmentId: null,

    designation: "",
    designationId: null,

    departmentDesignationMappingId: null,

    status: "Active",
    joiningDate: "",
};

// ---------------------------------------------------------
// Status Badge
// ---------------------------------------------------------

const StatusBadge = ({ status }) => {
    const active = status === "Active";
    return <StatusPill label={active ? "Active" : "Inactive"} tone={active ? "success" : "neutral"} />;
};

StatusBadge.propTypes = {
    status: PropTypes.string,
};

// ---------------------------------------------------------
// Employee Form Dialog
// ---------------------------------------------------------

const EmployeeFormDialog = ({
    open,
    employee,
    departments,
    onClose,
    onSave,
    saving,
}) => {
    const [form, setForm] = useState(emptyEmployee);

    // -----------------------------------------------------
    // Populate Form
    // -----------------------------------------------------

    useEffect(() => {
        if (!open) return;

        if (employee) {
            setForm({
                ...emptyEmployee,
                ...employee,

                firstName: employee.firstName || "",
                lastName: employee.lastName || "",
                employeeCode: employee.employeeCode || "",
                email: employee.email || "",
                phone: employee.phone || "",

                department: employee.department || "",
                departmentCode: employee.departmentCode || "",
                departmentId: employee.departmentId || null,

                designation: employee.designation || "",
                designationId: employee.designationId || null,

                departmentDesignationMappingId:
                    employee.departmentDesignationMappingId || null,

                status: employee.status || "Active",
                joiningDate: employee.joiningDate || "",
            });
        } else {
            setForm({
                ...emptyEmployee,
            });
        }
    }, [open, employee]);

    // -----------------------------------------------------
    // Input Change
    // -----------------------------------------------------

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // -----------------------------------------------------
    // Department Change
    // -----------------------------------------------------

    const handleDepartmentChange = (event) => {
        const departmentId = Number(event.target.value);

        const selectedDepartment = departments.find(
            (department) =>
                Number(department.id) === departmentId
        );

        setForm((prev) => ({
            ...prev,

            departmentId:
                selectedDepartment?.id || null,

            department:
                selectedDepartment?.departmentName || "",

            departmentCode:
                selectedDepartment?.departmentCode || "",

            designation: "",
            designationId: null,
            departmentDesignationMappingId: null,
        }));
    };

    // -----------------------------------------------------
    // Selected Department
    // -----------------------------------------------------

    const selectedDepartment =
        departments.find(
            (department) =>
                Number(department.id) ===
                Number(form.departmentId)
        ) || null;

    // -----------------------------------------------------
    // Designation List
    // -----------------------------------------------------

    const designationList =
        selectedDepartment?.designations || [];

    // -----------------------------------------------------
    // Designation Change
    // -----------------------------------------------------

    const handleDesignationChange = (event) => {
        const designationId = Number(
            event.target.value
        );

        const selectedDesignation =
            designationList.find(
                (designation) =>
                    Number(
                        designation.designationId ??
                            designation.id
                    ) === designationId
            );

        if (!selectedDesignation) {
            setForm((prev) => ({
                ...prev,

                designation: "",
                designationId: null,
                departmentDesignationMappingId: null,
            }));

            return;
        }

        const actualDesignationId =
            selectedDesignation.designationId ??
            selectedDesignation.id;

        const mappingId =
            selectedDesignation.mappingId ??
            selectedDesignation.departmentDesignationMappingId ??
            selectedDesignation.id ??
            null;

        setForm((prev) => ({
            ...prev,

            designationId: actualDesignationId,

            designation:
                selectedDesignation.designationName ||
                selectedDesignation.name ||
                "",

            departmentDesignationMappingId:
                mappingId,
        }));
    };

    // -----------------------------------------------------
    // Submit
    // -----------------------------------------------------

    const handleSubmit = () => {
        if (!form.firstName.trim()) {
            swalerror("Please enter first name.");
            return;
        }

        if (!form.email.trim()) {
            swalerror("Please enter email.");
            return;
        }

        if (!form.employeeCode) {
            swalerror("Please enter employee code.");
            return;
        }

        if (!form.departmentId) {
            swalerror("Please select department.");
            return;
        }

        if (!form.designationId) {
            swalerror("Please select designation.");
            return;
        }

        if (!form.departmentDesignationMappingId) {
            swalerror(
                "Department and designation mapping was not found."
            );
            return;
        }

        onSave({
            ...form,
        });
    };

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            fullWidth
            maxWidth="md"
        >
            <DialogHeader
                title={employee ? "Edit employee" : "Add employee"}
                subtitle={employee ? `Update details for ${employee.name || "this employee"}` : "Create a new employee record"}
                icon="user"
                hue="blue"
                onClose={onClose}
                disabled={saving}
            />

            <DialogContent>
                <Grid
                    container
                    spacing={2.5}
                    sx={{ pt: 1 }}
                >
                    <Grid item xs={12} sx={{ pb: "0 !important" }}>
                        <FieldGroup icon="badge" title="Personal details" />
                    </Grid>

                    {/* First Name */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                            size="small"
                        />
                    </Grid>

                    {/* Last Name */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            size="small"
                        />
                    </Grid>

                    {/* Employee Code */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Employee Code"
                            name="employeeCode"
                            value={form.employeeCode}
                            onChange={handleChange}
                            required
                            size="small"
                        />
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            size="small"
                        />
                    </Grid>

                    {/* Phone */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12} sx={{ pb: "0 !important" }}>
                        <FieldGroup icon="work" title="Work details" />
                    </Grid>

                    {/* Department */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Department"
                            value={
                                form.departmentId || ""
                            }
                            onChange={
                                handleDepartmentChange
                            }
                            size="small"
                            required
                            disabled={
                                departments.length === 0
                            }
                            sx={{
                                "& .MuiOutlinedInput-root":
                                    {
                                        height: "40px",
                                        borderRadius: "8px",
                                    },

                                "& .MuiSelect-select": {
                                    height:
                                        "40px !important",
                                    minHeight:
                                        "40px !important",
                                    boxSizing:
                                        "border-box",
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    paddingTop:
                                        "0 !important",
                                    paddingBottom:
                                        "0 !important",
                                },
                            }}
                        >
                            <MenuItem value="">
                                {departmentLoadingFallback(
                                    departments
                                )}
                            </MenuItem>

                            {departments.map(
                                (department) => (
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

                    {/* Designation */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Designation"
                            value={
                                form.designationId ||
                                ""
                            }
                            onChange={
                                handleDesignationChange
                            }
                            size="small"
                            required
                            disabled={
                                !form.departmentId ||
                                designationList.length ===
                                    0
                            }
                            sx={{
                                "& .MuiOutlinedInput-root":
                                    {
                                        height: "40px",
                                        borderRadius: "8px",
                                    },

                                "& .MuiSelect-select": {
                                    height:
                                        "40px !important",
                                    minHeight:
                                        "40px !important",
                                    boxSizing:
                                        "border-box",
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    paddingTop:
                                        "0 !important",
                                    paddingBottom:
                                        "0 !important",
                                },
                            }}
                        >
                            <MenuItem value="">
                                {!form.departmentId
                                    ? "Select Department First"
                                    : designationList.length ===
                                      0
                                    ? "No Designations"
                                    : "Select Designation"}
                            </MenuItem>

                            {designationList.map(
                                (designation) => {
                                    const designationId =
                                        designation.designationId ??
                                        designation.id;

                                    return (
                                        <MenuItem
                                            key={
                                                designationId
                                            }
                                            value={
                                                designationId
                                            }
                                        >
                                            {designation.designationName ||
                                                designation.name ||
                                                "-"}
                                        </MenuItem>
                                    );
                                }
                            )}
                        </TextField>
                    </Grid>

                    {/* Status */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            size="small"
                            sx={{
                                "& .MuiOutlinedInput-root":
                                    {
                                        height: "40px",
                                        borderRadius: "8px",
                                    },

                                "& .MuiSelect-select": {
                                    height:
                                        "40px !important",
                                    minHeight:
                                        "40px !important",
                                    boxSizing:
                                        "border-box",
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    paddingTop:
                                        "0 !important",
                                    paddingBottom:
                                        "0 !important",
                                },
                            }}
                        >
                            <MenuItem value="Active">
                                Active
                            </MenuItem>

                            <MenuItem value="Inactive">
                                Inactive
                            </MenuItem>
                        </TextField>
                    </Grid>

                    {/* Joining Date */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Joining Date"
                            name="joiningDate"
                            value={form.joiningDate}
                            onChange={handleChange}
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 2,
                    gap: 1,
                }}
            >
                <MDButton
                    variant="text"
                    color="dark"
                    onClick={onClose}
                    disabled={saving}
                >
                    Cancel
                </MDButton>

                <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleSubmit}
                    disabled={saving}
                    startIcon={
                        saving ? (
                            <CircularProgress
                                size={16}
                                color="inherit"
                            />
                        ) : null
                    }
                >
                    {saving
                        ? "Saving..."
                        : employee
                        ? "Update Employee"
                        : "Save Employee"}
                </MDButton>
            </DialogActions>
        </Dialog>
    );
};

EmployeeFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    employee: PropTypes.object,
    departments: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    saving: PropTypes.bool.isRequired,
};

// ---------------------------------------------------------
// Department Loading Text Helper
// ---------------------------------------------------------

const departmentLoadingFallback = (departments) => {
    if (departments.length === 0) {
        return "Loading Departments...";
    }

    return "Select Department";
};

// ---------------------------------------------------------
// Delete Dialog
// ---------------------------------------------------------

const DeleteDialog = ({ open, employee, onClose, onConfirm, deleting }) => (
    <ConfirmDialog
        open={open}
        title="Delete employee?"
        itemKind="employee"
        itemName={employee?.name}
        busy={deleting}
        onClose={onClose}
        onConfirm={onConfirm}
    />
);

DeleteDialog.propTypes = {
    open: PropTypes.bool.isRequired,

    employee: PropTypes.shape({
        name: PropTypes.string,
    }),

    onClose: PropTypes.func.isRequired,

    onConfirm: PropTypes.func.isRequired,

    deleting: PropTypes.bool.isRequired,
};

// ---------------------------------------------------------
// Main Employee Component
// ---------------------------------------------------------

function Employee() {
    const [view, setView] = useViewMode("employees");
    const canManage = can("manageEmployees");
    const [employees, setEmployees] = useState([]);

    const [departments, setDepartments] =
        useState([]);

    const [search, setSearch] = useState("");

    const [deptFilter, setDeptFilter] =
        useState("All Departments");

    const [statusFilter, setStatusFilter] =
        useState("All Statuses");

    const [loading, setLoading] =
        useState(false);

    const [departmentLoading, setDepartmentLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [addEmployeeOpen, setAddEmployeeOpen] =
        useState(false);

    const [selectedEmployee, setSelectedEmployee] =
        useState(null);

    const [deleteOpen, setDeleteOpen] =
        useState(false);

    const [employeeToDelete, setEmployeeToDelete] =
        useState(null);

    // -------------------------------------------------------
    // Pagination
    // -------------------------------------------------------

    const [page, setPage] = useState(0);

    const [rowsPerPage, setRowsPerPage] =
        useState(20);

    const [totalElements, setTotalElements] =
        useState(0);

    // -------------------------------------------------------
    // Fetch Employees
    // -------------------------------------------------------

    const fetchEmployees = async (
        requestedPage = page,
        requestedSize = rowsPerPage
    ) => {
        try {
            setLoading(true);

            if (!keycloak.authenticated) {
                console.error(
                    "User is not authenticated with Keycloak"
                );

                setEmployees([]);
                setTotalElements(0);

                return;
            }

            await keycloak.updateToken(30);

            if (!keycloak.token) {
                console.error(
                    "Keycloak access token is missing"
                );

                setEmployees([]);
                setTotalElements(0);

                return;
            }

            const response =
                await axiosInstance.get(
                    "/employees",
                    {
                        params: {
                            activeOnly: true,
                            page: requestedPage,
                            size: requestedSize,
                            sort: "firstName",
                        },
                    }
                );

            console.log(
                "Employees API response:",
                response.data
            );

            const pageData =
                response.data?.data || {};

            const apiData =
                Array.isArray(
                    pageData.content
                )
                    ? pageData.content
                    : [];

            const formattedEmployees =
                apiData.map((employee) => {
                    const employeeDesignation =
                        employee.designations?.[0];

                    return {
                        id: employee.id,

                        employeeCode:
                            employee.employeeCode !==
                                null &&
                            employee.employeeCode !==
                                undefined
                                ? String(
                                      employee.employeeCode
                                  )
                                : "",

                        firstName:
                            employee.firstName || "",

                        lastName:
                            employee.lastName || "",

                        name:
                            `${employee.firstName || ""} ${
                                employee.lastName || ""
                            }`.trim(),

                        email:
                            employee.email || "",

                        phone:
                            employee.phone || "",

                        dept:
                            employee.department
                                ?.departmentName ||
                            "N/A",

                        departmentCode:
                            employee.department
                                ?.departmentCode !==
                                null &&
                            employee.department
                                ?.departmentCode !==
                                undefined
                                ? String(
                                      employee
                                          .department
                                          .departmentCode
                                  )
                                : "",

                        departmentId:
                            employee.department
                                ?.id || null,

                        designation:
                            employeeDesignation
                                ?.designationName ||
                            "N/A",

                        designationId:
                            employeeDesignation?.id ||
                            null,

                        departmentDesignationMappingId:
                            null,

                        status:
                            employee.active === true
                                ? "Active"
                                : "Inactive",

                        joiningDate:
                            employee.joiningDate ||
                            "",

                        originalData:
                            employee,
                    };
                });

            setEmployees(
                formattedEmployees
            );

            setTotalElements(
                Number(
                    pageData.totalElements || 0
                )
            );
        } catch (error) {
            console.error(
                "Error fetching employees:",
                error
            );

            console.error(
                "Employee API error:",
                error.response?.data
            );

            setEmployees([]);
            setTotalElements(0);

            if (
                error.response?.status ===
                401
            ) {
                swalerror(
                    "Your session has expired. Please login again."
                );
            } else if (
                error.response?.status ===
                403
            ) {
                swalerror(
                    "You do not have permission to view employees."
                );
            } else {
                swalerror(
                    "Failed to fetch employees."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------
    // Fetch Departments
    // -------------------------------------------------------

    const fetchDepartments = async () => {
        try {
            setDepartmentLoading(true);

            if (!keycloak.authenticated) {
                console.error(
                    "User is not authenticated with Keycloak"
                );

                setDepartments([]);

                return;
            }

            await keycloak.updateToken(30);

            if (!keycloak.token) {
                console.error(
                    "Keycloak access token is missing"
                );

                setDepartments([]);

                return;
            }

            const response =
                await axiosInstance.get(
                    "/departments",
                    {
                        params: {
                            activeOnly: false,
                        },
                    }
                );

            console.log(
                "Departments API response:",
                response.data
            );

            /*
             * Supports:
             *
             * response.data = []
             *
             * response.data.data = []
             *
             * response.data.content = []
             *
             * response.data.data.content = []
             */

            let apiData = [];

            if (
                Array.isArray(response.data)
            ) {
                apiData = response.data;
            } else if (
                Array.isArray(
                    response.data?.data
                )
            ) {
                apiData =
                    response.data.data;
            } else if (
                Array.isArray(
                    response.data?.content
                )
            ) {
                apiData =
                    response.data.content;
            } else if (
                Array.isArray(
                    response.data?.data
                        ?.content
                )
            ) {
                apiData =
                    response.data.data.content;
            }

            console.log(
                "Department API data:",
                apiData
            );

            const formattedDepartments =
                apiData
                    .filter(
                        (department) =>
                            department?.id !==
                                null &&
                            department?.id !==
                                undefined
                    )
                    .map((department) => ({
                        id: department.id,

                        departmentName:
                            department.departmentName ||
                            "",

                        departmentCode:
                            department.departmentCode !==
                                null &&
                            department.departmentCode !==
                                undefined
                                ? String(
                                      department.departmentCode
                                  )
                                : "",

                        description:
                            department.description ||
                            "",

                        active:
                            department.active !==
                            false,

                        designations: [],
                    }));

            console.log(
                "Formatted departments:",
                formattedDepartments
            );

            setDepartments(
                formattedDepartments
            );
        } catch (error) {
            console.error(
                "Error fetching departments:",
                error
            );

            console.error(
                "Department API error:",
                error.response?.data
            );

            setDepartments([]);

            if (
                error.response?.status ===
                401
            ) {
                swalerror(
                    "Your session has expired. Please login again."
                );
            } else if (
                error.response?.status ===
                403
            ) {
                swalerror(
                    "You do not have permission to view departments."
                );
            } else {
                swalerror(
                    "Failed to fetch departments."
                );
            }
        } finally {
            setDepartmentLoading(false);
        }
    };

    // -------------------------------------------------------
    // Fetch Department Designations
    // -------------------------------------------------------

    const fetchDepartmentDesignations =
        async () => {
            try {
                if (!keycloak.authenticated) {
                    console.error(
                        "User is not authenticated with Keycloak"
                    );

                    return;
                }

                await keycloak.updateToken(30);

                if (!keycloak.token) {
                    console.error(
                        "Keycloak access token is missing"
                    );

                    return;
                }

                const response =
                    await axiosInstance.get(
                        "/department-designations",
                        {
                            params: {
                                activeOnly: true,
                            },
                        }
                    );

                console.log(
                    "Department Designations API response:",
                    response.data
                );

                let apiData = [];

                if (
                    Array.isArray(
                        response.data
                    )
                ) {
                    apiData =
                        response.data;
                } else if (
                    Array.isArray(
                        response.data?.data
                    )
                ) {
                    apiData =
                        response.data.data;
                } else if (
                    Array.isArray(
                        response.data?.content
                    )
                ) {
                    apiData =
                        response.data.content;
                } else if (
                    Array.isArray(
                        response.data?.data
                            ?.content
                    )
                ) {
                    apiData =
                        response.data.data.content;
                }

                console.log(
                    "Department designation API data:",
                    apiData
                );

                /*
                 * Merge designation mappings
                 * into already loaded departments.
                 */

                setDepartments(
                    (currentDepartments) => {
                        return currentDepartments.map(
                            (department) => {
                                const mappings =
                                    apiData.filter(
                                        (item) =>
                                            Number(
                                                item.departmentId
                                            ) ===
                                            Number(
                                                department.id
                                            )
                                    );

                                const designations =
                                    mappings
                                        .filter(
                                            (item) =>
                                                item.active !==
                                                false &&
                                                item.designationId !==
                                                    null &&
                                                item.designationId !==
                                                    undefined
                                        )
                                        .map(
                                            (
                                                item
                                            ) => ({
                                                departmentId:
                                                    item.departmentId,

                                                designationId:
                                                    item.designationId,

                                                designationName:
                                                    item.designationName ||
                                                    item.designation
                                                        ?.designationName ||
                                                    item.designation
                                                        ?.name ||
                                                    "",

                                                /*
                                                 * IMPORTANT:
                                                 * This is the
                                                 * DepartmentDesignation
                                                 * mapping ID.
                                                 */
                                                mappingId:
                                                    item.id,

                                                id:
                                                    item.id,
                                            })
                                        );

                                /*
                                 * Remove duplicate
                                 * designation IDs.
                                 */
                                const uniqueDesignations =
                                    designations.filter(
                                        (
                                            item,
                                            index,
                                            array
                                        ) =>
                                            index ===
                                            array.findIndex(
                                                (
                                                    x
                                                ) =>
                                                    Number(
                                                        x.designationId
                                                    ) ===
                                                    Number(
                                                        item.designationId
                                                    )
                                            )
                                    );

                                return {
                                    ...department,
                                    designations:
                                        uniqueDesignations,
                                };
                            }
                        );
                    }
                );
            } catch (error) {
                console.error(
                    "Error fetching department-designations:",
                    error
                );

                console.error(
                    "Department designation API error:",
                    error.response?.data
                );

                if (
                    error.response?.status ===
                    401
                ) {
                    swalerror(
                        "Your session has expired. Please login again."
                    );
                }
            }
        };

    // -------------------------------------------------------
    // Initial API Calls
    // -------------------------------------------------------

    useEffect(() => {
        const loadData = async () => {
            await fetchDepartments();
            await fetchDepartmentDesignations();
            await fetchEmployees(
                0,
                rowsPerPage
            );
        };

        loadData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -------------------------------------------------------
    // Refetch when page changes
    // -------------------------------------------------------

    useEffect(() => {
        if (page === 0) return;

        fetchEmployees(
            page,
            rowsPerPage
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage]);

    // -------------------------------------------------------
    // Statistics
    // -------------------------------------------------------

    const statistics = useMemo(() => {
        const total = totalElements;

        const active =
            employees.filter(
                (employee) =>
                    employee.status ===
                    "Active"
            ).length;

        const inactive =
            employees.filter(
                (employee) =>
                    employee.status ===
                    "Inactive"
            ).length;

        return {
            total,
            active,
            inactive,
        };
    }, [
        employees,
        totalElements,
    ]);

    // -------------------------------------------------------
    // Search across ALL employees (not just the current page):
    // while a search is typed, load the whole list once; restore paging when cleared.
    // -------------------------------------------------------

    const [searchAll, setSearchAll] = useState(false);

    useEffect(() => {
        const q = search.trim();
        const timer = setTimeout(() => {
            if (q && !searchAll) {
                setSearchAll(true);
                fetchEmployees(0, Math.max(totalElements || 0, 1000));
            } else if (!q && searchAll) {
                setSearchAll(false);
                fetchEmployees(page, rowsPerPage);
            }
        }, 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // -------------------------------------------------------
    // Filter Employees
    // -------------------------------------------------------

    const filteredEmployees =
        useMemo(() => {
            return employees.filter(
                (employee) => {
                    const searchText =
                        search
                            .toLowerCase()
                            .trim();

                    const matchesSearch =
                        !searchText ||
                        employee.name
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        employee.email
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        employee.employeeCode
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        employee.designation
                            ?.toLowerCase()
                            .includes(
                                searchText
                            );

                    const matchesDepartment =
                        deptFilter ===
                            "All Departments" ||
                        employee.dept ===
                            deptFilter;

                    const matchesStatus =
                        statusFilter ===
                            "All Statuses" ||
                        employee.status ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesDepartment &&
                        matchesStatus
                    );
                }
            ).sort((a, b) => {
                // an exact employee-code match goes to the top
                const q = search.trim().toLowerCase();
                if (!q) return 0;
                const ea = String(a.employeeCode || "").toLowerCase() === q;
                const eb = String(b.employeeCode || "").toLowerCase() === q;
                return ea === eb ? 0 : ea ? -1 : 1;
            });
        }, [
            employees,
            search,
            deptFilter,
            statusFilter,
        ]);

    // -------------------------------------------------------
    // Add Employee
    // -------------------------------------------------------

    const handleAddEmployee = () => {
        setSelectedEmployee(null);
        setAddEmployeeOpen(true);
    };

    // -------------------------------------------------------
    // Edit Employee
    // -------------------------------------------------------

    const handleEditEmployee = (
        employee
    ) => {
        const department =
            departments.find(
                (item) =>
                    Number(item.id) ===
                    Number(
                        employee.departmentId
                    )
            );

        const mapping =
            department?.designations?.find(
                (item) =>
                    Number(
                        item.designationId
                    ) ===
                    Number(
                        employee.designationId
                    )
            );

        const employeeForEdit = {
            ...employee,

            departmentDesignationMappingId:
                mapping?.mappingId ||
                mapping?.id ||
                null,
        };

        setSelectedEmployee(
            employeeForEdit
        );

        setAddEmployeeOpen(true);
    };

    // -------------------------------------------------------
    // Close Employee Dialog
    // -------------------------------------------------------

    const handleCloseEmployeeDialog = () => {
        if (saving) return;

        setAddEmployeeOpen(false);
        setSelectedEmployee(null);
    };

    // -------------------------------------------------------
    // Find Mapping ID
    // -------------------------------------------------------

    const findDepartmentDesignationMappingId =
        (
            departmentId,
            designationId
        ) => {
            const department =
                departments.find(
                    (item) =>
                        Number(item.id) ===
                        Number(
                            departmentId
                        )
                );

            if (!department) {
                return null;
            }

            const mapping =
                department.designations.find(
                    (item) =>
                        Number(
                            item.departmentId
                        ) ===
                            Number(
                                departmentId
                            ) &&
                        Number(
                            item.designationId
                        ) ===
                            Number(
                                designationId
                            )
                );

            return (
                mapping?.mappingId ||
                mapping?.id ||
                null
            );
        };

    // -------------------------------------------------------
    // Save Employee
    // -------------------------------------------------------

    const handleSaveEmployee = async (
        employeeData
    ) => {
        try {
            setSaving(true);

            if (!keycloak.authenticated) {
                swalerror(
                    "User is not authenticated with Keycloak."
                );

                return;
            }

            await keycloak.updateToken(30);

            if (!keycloak.token) {
                swalerror(
                    "Keycloak token is missing."
                );

                return;
            }

            const mappingId =
                findDepartmentDesignationMappingId(
                    employeeData.departmentId,
                    employeeData.designationId
                ) ||
                employeeData.departmentDesignationMappingId;

            if (!mappingId) {
                swalerror(
                    "Department and designation mapping was not found."
                );

                console.error(
                    "Department ID:",
                    employeeData.departmentId
                );

                console.error(
                    "Designation ID:",
                    employeeData.designationId
                );

                return;
            }

            console.log(
                "DepartmentDesignation Mapping ID:",
                mappingId
            );

            // =================================================
            // CREATE
            // =================================================

            if (!selectedEmployee) {
                const payload = {
                    employeeCode:
                        Number(
                            employeeData.employeeCode
                        ),

                    firstName:
                        employeeData.firstName.trim(),

                    lastName:
                        employeeData.lastName.trim(),

                    email:
                        employeeData.email.trim(),

                    phone:
                        employeeData.phone.trim(),

                    joiningDate:
                        employeeData.joiningDate ||
                        null,

                    departmentDesignationIds: [
                        Number(mappingId),
                    ],

                    designation:
                        employeeData.designation.trim(),
                };

                console.log(
                    "CREATE EMPLOYEE PAYLOAD:",
                    payload
                );

                const response =
                    await axiosInstance.post(
                        "/employees",
                        payload
                    );

                console.log(
                    "Create employee response:",
                    response.data
                );

                swalsucess(
                    "Employee created successfully."
                );
            }

            // =================================================
            // UPDATE
            // =================================================

            else {
                const payload = {
                    firstName:
                        employeeData.firstName.trim(),

                    lastName:
                        employeeData.lastName.trim(),

                    employeeCode:
                        Number(
                            employeeData.employeeCode
                        ),

                    email:
                        employeeData.email.trim(),

                    phone:
                        employeeData.phone.trim(),

                    active:
                        employeeData.status ===
                        "Active",

                    joiningDate:
                        employeeData.joiningDate ||
                        null,

                    departmentCode:
                        employeeData.departmentCode ||
                        null,

                    designation:
                        employeeData.designation ||
                        null,

                    departmentDesignationIds: [
                        Number(mappingId),
                    ],
                };

                console.log(
                    "UPDATE EMPLOYEE PAYLOAD:",
                    payload
                );

                const response =
                    await axiosInstance.put(
                        `/employees/${selectedEmployee.id}`,
                        payload
                    );

                console.log(
                    "Update employee response:",
                    response.data
                );

                swalsucess(
                    "Employee updated successfully."
                );
            }

            setAddEmployeeOpen(false);
            setSelectedEmployee(null);

            await fetchEmployees(
                page,
                rowsPerPage
            );
        } catch (error) {
            console.error(
                "Error saving employee:",
                error
            );

            console.error(
                "Status:",
                error.response?.status
            );

            console.error(
                "Data:",
                error.response?.data
            );

            if (
                error.response?.status ===
                401
            ) {
                swalerror(
                    "Your session has expired. Please login again."
                );
            } else if (
                error.response?.status ===
                403
            ) {
                swalerror(
                    "You do not have permission to save employees."
                );
            } else {
                swalerror(
                    error.response?.data
                        ?.message ||
                        "Failed to save employee."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // -------------------------------------------------------
    // Delete Open
    // -------------------------------------------------------

    const handleDeleteOpen = (
        employee
    ) => {
        setEmployeeToDelete(employee);
        setDeleteOpen(true);
    };

    // -------------------------------------------------------
    // Delete Close
    // -------------------------------------------------------

    const handleDeleteClose = () => {
        if (deleting) return;

        setDeleteOpen(false);
        setEmployeeToDelete(null);
    };

    // -------------------------------------------------------
    // Delete Employee
    // -------------------------------------------------------

    const handleDeleteConfirm =
        async () => {
            if (!employeeToDelete)
                return;

            try {
                setDeleting(true);

                if (
                    !keycloak.authenticated
                ) {
                    swalerror(
                        "User is not authenticated with Keycloak."
                    );

                    return;
                }

                await keycloak.updateToken(
                    30
                );

                if (!keycloak.token) {
                    swalerror(
                        "Keycloak token is missing."
                    );

                    return;
                }

                await axiosInstance.delete(
                    `/employees/${employeeToDelete.id}`
                );

                swalsucess(
                    "Employee deleted successfully."
                );

                setDeleteOpen(false);
                setEmployeeToDelete(null);

                await fetchEmployees(
                    page,
                    rowsPerPage
                );
            } catch (error) {
                console.error(
                    "Error deleting employee:",
                    error
                );

                if (
                    error.response?.status ===
                    401
                ) {
                    swalerror(
                        "Your session has expired. Please login again."
                    );
                } else if (
                    error.response?.status ===
                    403
                ) {
                    swalerror(
                        "You do not have permission to delete employees."
                    );
                } else {
                    swalerror(
                        error.response?.data
                            ?.message ||
                            "Failed to delete employee."
                    );
                }
            } finally {
                setDeleting(false);
            }
        };

    // -------------------------------------------------------
    // Pagination
    // -------------------------------------------------------

    const handleChangePage = (
        event,
        newPage
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event
    ) => {
        const newSize = parseInt(
            event.target.value,
            10
        );

        setRowsPerPage(newSize);
        setPage(0);

        fetchEmployees(
            0,
            newSize
        );
    };

    // -------------------------------------------------------
    // Date Format
    // -------------------------------------------------------

    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // -------------------------------------------------------
    // Render
    // -------------------------------------------------------

    return (
        <DashboardLayout>
            <DashboardNavbar />

            <MDBox pb={3}>
                <PageHeader
                    title="Employees"
                    icon="badge"
                    hue="blue"
                    actions={<ViewToggle value={view} onChange={setView} />}
                    description="Manage and track your employees"
                />

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={4}>
                        <StatTile title="Total employees" value={statistics.total} icon="groups" hue="blue" />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <StatTile title="Active" value={statistics.active} icon="check_circle" hue="emerald" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatTile title="Inactive" value={statistics.inactive} icon="person_off" hue="slate" />
                    </Grid>
                </Grid>

                {/* Filters */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "center",
                        mb: 2,
                        flexWrap: "wrap",
                    }}
                >
                    {/* Search */}
                    <TextField
                        size="small"
                        placeholder="Search by employee code, name, email…"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon
                                        fontSize="small"
                                        sx={{
                                            color:
                                                "var(--pt-text-3)",
                                        }}
                                    />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            flex:
                                "1 1 360px",

                            "& .MuiOutlinedInput-root":
                                {
                                    height: "40px",
                                    borderRadius:
                                        "12px",
                                    backgroundColor:
                                        "var(--pt-surface)",
                                },

                            "& .MuiOutlinedInput-input":
                                {
                                    height: "40px",
                                    boxSizing:
                                        "border-box",
                                    py: 0,
                                },
                        }}
                    />

                    {/* Department Filter */}
                    <TextField
                        select
                        size="small"
                        value={deptFilter}
                        onChange={(e) =>
                            setDeptFilter(
                                e.target.value
                            )
                        }
                        sx={{
                            minWidth: 190,

                            "& .MuiOutlinedInput-root":
                                {
                                    height: "40px",
                                    borderRadius:
                                        "12px",
                                },

                            "& .MuiSelect-select":
                                {
                                    height:
                                        "40px",
                                    boxSizing:
                                        "border-box",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    py: 0,
                                },
                        }}
                    >
                        <MenuItem value="All Departments">
                            All Departments
                        </MenuItem>

                        {departments.map(
                            (department) => (
                                <MenuItem
                                    key={
                                        department.id
                                    }
                                    value={
                                        department.departmentName
                                    }
                                >
                                    {
                                        department.departmentName
                                    }
                                </MenuItem>
                            )
                        )}
                    </TextField>

                    {/* Status Filter */}
                    <TextField
                        select
                        size="small"
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                        sx={{
                            minWidth: 160,

                            "& .MuiOutlinedInput-root":
                                {
                                    height: "40px",
                                    borderRadius:
                                        "12px",
                                },

                            "& .MuiSelect-select":
                                {
                                    height:
                                        "40px",
                                    boxSizing:
                                        "border-box",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    py: 0,
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

                    {/* Add Employee (ADMIN / HR_ADMIN) */}
                    {canManage && (
                    <MDButton
                        variant="gradient"
                        color="info"
                        startIcon={
                            <AddIcon />
                        }
                        onClick={
                            handleAddEmployee
                        }
                        sx={{
                            height: "40px",
                            borderRadius:
                                "12px",
                            px: 2.2,
                            whiteSpace:
                                "nowrap",
                        }}
                    >
                        Add Employee
                    </MDButton>
                    )}
                </Box>

                {/* Table */}
                <Paper
                    sx={{
                        borderRadius:
                            "12px",
                        overflow:
                            "hidden",
                        boxShadow:
                            "var(--pt-shadow-sm)",
                    }}
                >
                    {view === "table" ? (
                        <DataGrid
                            title="Employees"
                            exportName="employees"
                            loading={loading}
                            rows={filteredEmployees}
                            paginate={false}
                            emptyText="No employees found"
                            columns={[
                                { key: "name", label: "Employee", render: (e) => <PersonCell name={e.name || "Unnamed"} sub={e.employeeCode ? `#${e.employeeCode}` : null} hue={hueFor(e.name || "")} /> },
                                { key: "email", label: "Email" },
                                { key: "dept", label: "Department", render: (e) => <TagCell label={e.dept} hue={hueFor(e.dept || "")} /> },
                                { key: "designation", label: "Designation" },
                                { key: "status", label: "Status", render: (e) => <StatusBadge status={e.status} /> },
                                { key: "joiningDate", label: "Joined", render: (e) => <DateCell value={formatDate(e.joiningDate)} /> },
                            ]}
                            actions={
                                canManage
                                    ? (e) => [
                                          { icon: "square-pen", label: "Edit", tone: "accent", onClick: () => handleEditEmployee(e) },
                                          { icon: "delete", label: "Delete", tone: "danger", onClick: () => handleDeleteOpen(e) },
                                      ]
                                    : null
                            }
                        />
                    ) : (
                        <CardGrid loading={loading} empty={filteredEmployees.length === 0} emptyText="No employees found">
                            {filteredEmployees.map((employee, i) => (
                                <RecordCard
                                    key={employee.id}
                                    index={i}
                                    title={employee.name || "Unnamed"}
                                    subtitle={employee.designation || "—"}
                                    hue={hueFor(employee.name || "")}
                                    status={<StatusBadge status={employee.status} />}
                                    meta={[
                                        { icon: "mail", label: "Email", value: employee.email || "—" },
                                        { icon: "apartment", label: "Department", value: employee.dept || "—" },
                                        { icon: "tag", label: "Code", value: employee.employeeCode || "—" },
                                        { icon: "event", label: "Joined", value: formatDate(employee.joiningDate) },
                                    ]}
                                    actions={
                                        canManage
                                            ? [
                                                  { icon: "edit", label: "Edit", tone: "accent", onClick: () => handleEditEmployee(employee) },
                                                  { icon: "delete_outline", label: "Delete", tone: "danger", onClick: () => handleDeleteOpen(employee) },
                                              ]
                                            : []
                                    }
                                />
                            ))}
                        </CardGrid>
                    )}

                    {/* Pagination */}
                    {!searchAll && (
                    <TablePagination
                        component="div"
                        count={
                            totalElements
                        }
                        page={page}
                        onPageChange={
                            handleChangePage
                        }
                        rowsPerPage={
                            rowsPerPage
                        }
                        onRowsPerPageChange={
                            handleChangeRowsPerPage
                        }
                        rowsPerPageOptions={[
                            5,
                            10,
                            20,
                            50,
                        ]}
                        sx={{
                            borderTop:
                                "1px solid var(--pt-border)",

                            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                                {
                                    fontSize:
                                        "12px",
                                    color:
                                        "var(--pt-text-2)",
                                },
                        }}
                    />
                    )}
                </Paper>
            </MDBox>

            {/* Add / Edit */}
            <EmployeeFormDialog
                open={
                    addEmployeeOpen
                }
                employee={
                    selectedEmployee
                }
                departments={
                    departments
                }
                onClose={
                    handleCloseEmployeeDialog
                }
                onSave={
                    handleSaveEmployee
                }
                saving={saving}
            />

            {/* Delete */}
            <DeleteDialog
                open={deleteOpen}
                employee={
                    employeeToDelete
                }
                onClose={
                    handleDeleteClose
                }
                onConfirm={
                    handleDeleteConfirm
                }
                deleting={deleting}
            />
        </DashboardLayout>
    );
}

export default Employee;

