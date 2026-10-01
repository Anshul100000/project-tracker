/* eslint-disable react/function-component-definition */

import { useEffect, useMemo, useState } from "react";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TablePagination from "@mui/material/TablePagination";

// MUI Icons
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { can } from "auth/roles";
import { ConfirmDialog, DialogHeader, FieldGroup } from "components/AppDialog";
import DataGrid, { PersonCell, IconCell, TagCell, ProgressCell, DateCell } from "components/DataGrid";
import ViewToggle, { useViewMode } from "components/ViewToggle";
import RecordCard, { CardGrid } from "components/RecordCard";
import { hueFor } from "assets/theme/enterprise";
import PageHeader from "components/PageHeader";
import StatTile from "components/StatTile";
import AssignKpaEmployeeDialog from "layouts/tables/AssignKpaEmployeeDialog";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Footer from "examples/Footer";

// Projects table

// API
import keycloak from "../../auth/keycloak";
import axiosInstance from "services.js/axiosInstance";

// SweetAlert
import swalsucess from "../../../src/sucess";
import swalerror from "../../../src/Error";


function Tables() {
  const [view, setView] = useViewMode("kpas");
    const canManage = can("manageKpas");
  const canAssign = can("manageAssignments");
  const [assignKpa, setAssignKpa] = useState(null);

  // =========================================================
  // PROJECT KPA STATES
  // =========================================================

  const [kpaRows, setKpaRows] = useState([]);

  const [loadingKpas, setLoadingKpas] =
    useState(false);

  const [kpaError, setKpaError] =
    useState("");

  // Backend pagination
  const [kpaPage, setKpaPage] =
    useState(0);

  const [kpaRowsPerPage, setKpaRowsPerPage] =
    useState(20);

  const [kpaTotalElements, setKpaTotalElements] =
    useState(0);


  // =========================================================
  // PROJECT KRA STATES
  // =========================================================

  const [kraList, setKraList] =
    useState([]);

  const [loadingKras, setLoadingKras] =
    useState(false);


  // =========================================================
  // KPA DIALOG STATES
  // =========================================================

  const [openKpaDialog, setOpenKpaDialog] =
    useState(false);

  const [creatingKpa, setCreatingKpa] =
    useState(false);

  const [kpaForm, setKpaForm] = useState({
    projectKraId: "",
    kpaName: "",
    description: "",
  });

  const [formError, setFormError] =
    useState("");


  // =========================================================
  // FETCH PROJECT KPAs
  // =========================================================

  const fetchProjectKPAs = async (
    page = kpaPage,
    size = kpaRowsPerPage
  ) => {
    try {
      setLoadingKpas(true);
      setKpaError("");

      if (!keycloak.authenticated) {
        setKpaError(
          "User is not authenticated."
        );
        setKpaRows([]);
        setKpaTotalElements(0);
        return;
      }

      await keycloak.updateToken(30);

      if (!keycloak.token) {
        setKpaError(
          "Authentication token is missing."
        );
        setKpaRows([]);
        setKpaTotalElements(0);
        return;
      }

      const response =
        await axiosInstance.get(
          "/project-kpas",
          {
            params: {
              activeOnly: true,
              page: page,
              size: size,
              sort: "kpaName,desc",
            },
          }
        );

      console.log(
        "Project KPA API Response:",
        response.data
      );

      // =====================================================
      // SPRING BOOT PAGE RESPONSE
      //
      // {
      //   content: [],
      //   totalElements: 50,
      //   totalPages: 3,
      //   number: 0,
      //   size: 20
      // }
      // =====================================================

      const kpaData =
        Array.isArray(response.data)
          ? response.data
          : Array.isArray(
              response.data?.content
            )
          ? response.data.content
          : Array.isArray(
              response.data?.data
            )
          ? response.data.data
          : [];

      const totalElements =
        response.data?.totalElements ??
        response.data?.data?.totalElements ??
        kpaData.length;

      setKpaTotalElements(
        Number(totalElements) || 0
      );


      // =====================================================
      // FORMAT TABLE DATA
      // =====================================================

      const formattedRows =
        kpaData.map(
          (item, index) => {

            // -----------------------------------------------
            // EMPLOYEE
            // -----------------------------------------------

            const employee =
              item?.employee ||
              item?.employeeDetails ||
              {};

            const employeeName =
              item?.employeeName ||
              (typeof item?.employee ===
              "string"
                ? item.employee
                : "") ||
              employee?.name ||
              employee?.employeeName ||
              [
                employee?.firstName,
                employee?.lastName,
              ]
                .filter(Boolean)
                .join(" ") ||
              "-";

            const employeeDesignation =
              item?.employeeDesignation ||
              employee?.designation ||
              employee?.designationName ||
              employee?.email ||
              "-";


            // -----------------------------------------------
            // PROJECT
            // -----------------------------------------------

            const project =
              item?.project ||
              item?.projectDetails ||
              {};

            const projectName =
              item?.projectName ||
              (typeof item?.project ===
              "string"
                ? item.project
                : "") ||
              project?.projectName ||
              project?.name ||
              "-";


            // -----------------------------------------------
            // PROJECT KRA
            // -----------------------------------------------

            const projectKra =
              item?.kra ||
              item?.projectKra ||
              item?.projectKRA ||
              item?.kraDetails ||
              {};

            const kraName =
              item?.kraName ||
              item?.projectKraName ||
              item?.projectKRAName ||
              projectKra?.kraName ||
              projectKra?.name ||
              "-";

            const kraDescription =
              item?.kraDescription ||
              projectKra?.description ||
              "";


            // -----------------------------------------------
            // PROJECT KPA
            // -----------------------------------------------

            const projectKpa =
              item?.kpa ||
              item?.projectKpa ||
              item?.projectKPA ||
              item?.kpaDetails ||
              {};

            const kpaName =
              item?.kpaName ||
              item?.projectKpaName ||
              item?.projectKPAName ||
              projectKpa?.kpaName ||
              projectKpa?.name ||
              "-";

            const kpaDescription =
              item?.kpaDescription ||
              projectKpa?.description ||
              "";


            // -----------------------------------------------
            // PERFORMANCE
            // -----------------------------------------------

            const performance =
              item?.performance ||
              item?.performanceStatus ||
              item?.status ||
              "-";


            // -----------------------------------------------
            // SCORE
            // -----------------------------------------------

            const score =
              item?.score ??
              item?.rating ??
              item?.kraScore ??
              item?.kpaScore ??
              item?.performanceScore ??
              null;


            // -----------------------------------------------
            // RETURN ROW
            // -----------------------------------------------

            return {
              id:
                item?.id ||
                item?.projectKpaId ||
                item?.projectKPAId ||
                `${page}-${index}`,

              raw: {
                kpaId: item?.id ?? item?.projectKpaId ?? item?.projectKPAId ?? null,
                kraId: item?.projectKraId ?? item?.projectKRAId ?? projectKra?.id ?? item?.kraId ?? null,
                departmentName:
                  item?.departmentName ||
                  item?.department?.departmentName ||
                  projectKra?.departmentName ||
                  projectKra?.department?.departmentName ||
                  projectKra?.projectDepartment?.department?.departmentName ||
                  projectKra?.projectDepartment?.departmentName ||
                  item?.projectDepartment?.department?.departmentName ||
                  "",
                employeeName,
                employeeDesignation,
                projectName,
                kraName,
                kraDescription,
                kpaName,
                kpaDescription,
                performance,
                score,
              },

              // Employee
              employee: (
                <Box>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    sx={{
                      fontSize:
                        "0.85rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {employeeName}
                  </MDTypography>

                  <MDTypography
                    variant="caption"
                    color="text"
                    sx={{
                      display:
                        "block",
                      fontSize:
                        "0.72rem",
                      mt: 0.3,
                    }}
                  >
                    {
                      employeeDesignation
                    }
                  </MDTypography>
                </Box>
              ),

              // Project
              project: (
                <MDTypography
                  variant="button"
                  fontWeight="medium"
                  sx={{
                    fontSize:
                      "0.82rem",
                  }}
                >
                  {projectName}
                </MDTypography>
              ),

              // KRA
              kra: (
                <Box>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    sx={{
                      fontSize:
                        "0.82rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {kraName}
                  </MDTypography>

                  {kraDescription && (
                    <MDTypography
                      variant="caption"
                      color="text"
                      sx={{
                        display:
                          "block",
                        mt: 0.4,
                        fontSize:
                          "0.7rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {
                        kraDescription
                      }
                    </MDTypography>
                  )}
                </Box>
              ),

              // KPA
              kpa: (
                <Box>
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    sx={{
                      fontSize:
                        "0.82rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {kpaName}
                  </MDTypography>

                  {kpaDescription && (
                    <MDTypography
                      variant="caption"
                      color="text"
                      sx={{
                        display:
                          "block",
                        mt: 0.4,
                        fontSize:
                          "0.7rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {
                        kpaDescription
                      }
                    </MDTypography>
                  )}
                </Box>
              ),

              // Performance
              status: (
                <MDTypography
                  variant="button"
                  fontWeight="medium"
                  sx={{
                    fontSize:
                      "0.8rem",
                  }}
                >
                  {performance}
                </MDTypography>
              ),

              // Score
              score: (
                <MDTypography
                  variant="button"
                  fontWeight="medium"
                  sx={{
                    fontSize:
                      "0.85rem",
                  }}
                >
                  {score !== null &&
                  score !== undefined
                    ? score
                    : "-"}
                </MDTypography>
              ),

              // Action
              action: (
                <MDTypography
                  variant="caption"
                  color="text"
                >
                  -
                </MDTypography>
              ),
            };
          }
        );

      setKpaRows(formattedRows);

    } catch (error) {
      console.error(
        "Error fetching Project KPAs:",
        error
      );

      setKpaRows([]);
      setKpaTotalElements(0);

      if (
        error?.response?.status ===
        401
      ) {
        setKpaError(
          "Session expired. Please login again."
        );
      } else if (
        error?.response?.status ===
        403
      ) {
        setKpaError(
          "You do not have permission to view Project KPAs."
        );
      } else {
        setKpaError(
          error?.response?.data
            ?.message ||
            error?.response?.data
              ?.error ||
            "Failed to load Project KPAs."
        );
      }
    } finally {
      setLoadingKpas(false);
    }
  };


  // =========================================================
  // FETCH PROJECT KRAs
  // =========================================================

  const fetchProjectKRAs = async () => {
    try {
      setLoadingKras(true);
      setFormError("");

      if (!keycloak.authenticated) {
        setKraList([]);
        return;
      }

      await keycloak.updateToken(30);

      if (!keycloak.token) {
        setKraList([]);
        return;
      }

      const response =
        await axiosInstance.get(
          "/project-kras"
        );

      console.log(
        "Project KRA API Response:",
        response.data
      );

      const kraData =
        Array.isArray(
          response?.data?.content
        )
          ? response.data.content
          : Array.isArray(
              response?.data
            )
          ? response.data
          : [];

      const activeKras =
        kraData.filter(
          (kra) =>
            kra?.active !== false
        );

      console.log(
        "Project KRA Dropdown Data:",
        activeKras
      );

      setKraList(activeKras);

    } catch (error) {
      console.error(
        "Error fetching Project KRAs:",
        error
      );

      setKraList([]);

      const message =
        error?.response?.data
          ?.message ||
        error?.response?.data
          ?.error ||
        "Failed to load Project KRAs.";

      setFormError(message);
    } finally {
      setLoadingKras(false);
    }
  };


  // =========================================================
  // OPEN KPA DIALOG
  // =========================================================

  const handleOpenKpaDialog =
    async () => {
      setFormError("");

      setKpaForm({
        projectKraId: "",
        kpaName: "",
        description: "",
      });

      setOpenKpaDialog(true);

      await fetchProjectKRAs();
    };


  // =========================================================
  // CLOSE KPA DIALOG
  // =========================================================

  const handleCloseKpaDialog =
    () => {
      if (creatingKpa) {
        return;
      }

      setOpenKpaDialog(false);
      setFormError("");
    };


  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleKpaChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setKpaForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    if (formError) {
      setFormError("");
    }
  };


  // =========================================================
  // CREATE PROJECT KPA
  // =========================================================

  const handleCreateKPA =
    async () => {
      try {
        setFormError("");

        // -----------------------------------------------
        // VALIDATION
        // -----------------------------------------------

        if (!kpaForm.projectKraId) {
          setFormError(
            "Please select a Project KRA."
          );
          return;
        }

        if (
          !kpaForm.kpaName.trim()
        ) {
          setFormError(
            "KPA name is required."
          );
          return;
        }

        if (!keycloak.authenticated) {
          setFormError(
            "User is not authenticated."
          );
          return;
        }

        setCreatingKpa(true);

        await keycloak.updateToken(30);

        if (!keycloak.token) {
          setFormError(
            "Authentication token is missing."
          );
          return;
        }


        // -----------------------------------------------
        // CREATE PAYLOAD
        // -----------------------------------------------

        const payload = {
          projectKraId: Number(
            kpaForm.projectKraId
          ),

          kpaName:
            kpaForm.kpaName.trim(),

          description:
            kpaForm.description.trim(),
        };

        console.log(
          "Create Project KPA Payload:",
          payload
        );


        // -----------------------------------------------
        // POST API
        // -----------------------------------------------

        await axiosInstance.post(
          "/project-kpas/create",
          payload
        );


        // -----------------------------------------------
        // SUCCESS
        // -----------------------------------------------

        swalsucess(
          "Project KPA created successfully."
        );

        setOpenKpaDialog(false);

        setKpaForm({
          projectKraId: "",
          kpaName: "",
          description: "",
        });


        // Refresh current backend page
        await fetchProjectKPAs(
          kpaPage,
          kpaRowsPerPage
        );

      } catch (error) {
        console.error(
          "Error creating Project KPA:",
          error
        );

        const message =
          error?.response?.data
            ?.message ||
          error?.response?.data
            ?.error ||
          "Failed to create Project KPA.";

        setFormError(message);

        swalerror(message);

      } finally {
        setCreatingKpa(false);
      }
    };


  // =========================================================
  // BACKEND PAGINATION
  // =========================================================

  const handleKpaPageChange = (
    event,
    newPage
  ) => {
    setKpaPage(newPage);

    fetchProjectKPAs(
      newPage,
      kpaRowsPerPage
    );
  };


  const handleKpaRowsPerPageChange =
    (event) => {
      const newRowsPerPage =
        parseInt(
          event.target.value,
          10
        );

      setKpaRowsPerPage(
        newRowsPerPage
      );

      setKpaPage(0);

      fetchProjectKPAs(
        0,
        newRowsPerPage
      );
    };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchProjectKPAs(
      0,
      kpaRowsPerPage
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // =========================================================
  // KPA TABLE COLUMNS
  // =========================================================



  // =========================================================
  // SEARCH / FILTERS (apply to the page of KPAs already loaded)
  // =========================================================

  const [kpaSearch, setKpaSearch] = useState("");
  const [kraFilter, setKraFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const clean = (x) => (x && x !== "-" ? x : "");
  // ---------------------------------------------------------
  // PROJECT NAME via projectKraId
  // KPA → projectKraId → KRA → project (direct, or via projectDepartment / projectId)
  // ---------------------------------------------------------

  const [projectByKra, setProjectByKra] = useState({});

  const kraProjectName = (kra, projectsById, pdById) => {
    if (!kra) return "";
    const pd = kra.projectDepartment || pdById[kra.projectDepartmentId] || {};
    const projectId =
      kra.projectId ?? kra.project?.id ?? pd.projectId ?? pd.project?.id;
    return (
      kra.projectName ||
      kra.project?.projectName ||
      pd.projectName ||
      pd.project?.projectName ||
      projectsById[projectId] ||
      ""
    );
  };

  const [lookups, setLookups] = useState({ projectsById: {}, pdById: {} });

  // Load KRAs, project-departments and projects once and map every KRA id to its project name.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [kraRes, pdRes, projRes] = await Promise.allSettled([
        axiosInstance.get("/project-kras", { params: { page: 0, size: 500 } }),
        axiosInstance.get("/project-departments", { params: { activeOnly: false, page: 0, size: 500 } }),
        axiosInstance.get("/projects"),
      ]);
      const list = (r) => {
        if (r.status !== "fulfilled") return [];
        const d = r.value.data;
        if (Array.isArray(d)) return d;
        return d?.content || d?.data?.content || (Array.isArray(d?.data) ? d.data : []);
      };
      const projectsById = Object.fromEntries(list(projRes).map((p) => [p.id, p.projectName]));
      const pdById = Object.fromEntries(list(pdRes).map((pd) => [pd.id, pd]));
      const map = {};
      list(kraRes).forEach((kra) => {
        const name = kraProjectName(kra, projectsById, pdById);
        if (kra.id !== undefined && name) map[kra.id] = name;
      });
      if (!cancelled) {
        setLookups({ projectsById, pdById });
        setProjectByKra(map);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Any KRA id on the current page that the list didn't cover: fetch it directly.
  useEffect(() => {
    const missing = [
      ...new Set(
        kpaRows
          .filter((r) => !clean(r.raw?.projectName) && r.raw?.kraId !== null && r.raw?.kraId !== undefined)
          .map((r) => r.raw.kraId)
          .filter((id) => !(id in projectByKra))
      ),
    ];
    if (!missing.length) return undefined;
    let cancelled = false;
    Promise.allSettled(missing.map((id) => axiosInstance.get(`/project-kras/${id}`))).then((results) => {
      if (cancelled) return;
      const add = {};
      results.forEach((r, i) => {
        const kra = r.status === "fulfilled" ? r.value.data?.data || r.value.data : null;
        add[missing[i]] = kraProjectName(kra, lookups.projectsById, lookups.pdById); // "" = unknown, don't refetch
      });
      setProjectByKra((m) => ({ ...m, ...add }));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpaRows, lookups]);

  const resolvedKpaRows = useMemo(
    () =>
      kpaRows.map((r) => {
        const projectName = clean(r.raw?.projectName) || projectByKra[r.raw?.kraId] || "";
        return projectName === r.raw?.projectName ? r : { ...r, raw: { ...r.raw, projectName } };
      }),
    [kpaRows, projectByKra]
  );

  const kraOptions = useMemo(() => [...new Set(resolvedKpaRows.map((r) => clean(r.raw?.kraName)).filter(Boolean))].sort(), [resolvedKpaRows]);
  const projectOptions = useMemo(() => [...new Set(resolvedKpaRows.map((r) => clean(r.raw?.projectName)).filter(Boolean))].sort(), [resolvedKpaRows]);

  const shownKpas = useMemo(() => {
    const q = kpaSearch.trim().toLowerCase();
    return resolvedKpaRows.filter((r) => {
      const x = r.raw || {};
      if (kraFilter !== "all" && clean(x.kraName) !== kraFilter) return false;
      if (projectFilter !== "all" && clean(x.projectName) !== projectFilter) return false;
      if (!q) return true;
      return [x.kpaName, x.kpaDescription, x.kraName, x.projectName, x.employeeName].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [resolvedKpaRows, kpaSearch, kraFilter, projectFilter]);

  const filtersActive = kpaSearch || kraFilter !== "all" || projectFilter !== "all";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <PageHeader
        title="KPAs"
        icon="checklist"
        hue="amber"
        description="Key performance areas defined under each project KRA."
        actions={
          <>
            <ViewToggle value={view} onChange={setView} />
            {canManage && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenKpaDialog}>
              Add project KPA
            </Button>
            )}
          </>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatTile title="Total KPAs" value={loadingKpas ? "—" : kpaTotalElements} icon="checklist" hue="amber" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile title="KRAs covered" value={loadingKpas ? "—" : kraOptions.length} icon="flag" hue="rose" description="On this page" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile title="Projects" value={loadingKpas ? "—" : projectOptions.length} icon="folder" hue="teal" description="On this page" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatTile
            title="Assigned to employees"
            value={loadingKpas ? "—" : kpaRows.filter((r) => clean(r.raw?.employeeName)).length}
            icon="person"
            hue="blue"
            description="On this page"
          />
        </Grid>
      </Grid>

      <Box display="flex" flexWrap="wrap" gap={1.5} alignItems="center" mb={2}>
        <TextField
          size="small"
          placeholder="Search KPAs, KRAs, projects…"
          value={kpaSearch}
          onChange={(e) => setKpaSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ flex: "1 1 320px" }}
        />
        <TextField select size="small" label="KRA" value={kraFilter} onChange={(e) => setKraFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="all">All KRAs</MenuItem>
          {kraOptions.map((k) => (
            <MenuItem key={k} value={k}>{k}</MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Project" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="all">All projects</MenuItem>
          {projectOptions.map((p) => (
            <MenuItem key={p} value={p}>{p}</MenuItem>
          ))}
        </TextField>
        {filtersActive && (
          <Button
            variant="text"
            onClick={() => {
              setKpaSearch("");
              setKraFilter("all");
              setProjectFilter("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </Box>

      <MDBox
        pb={3}
      >
        <Grid
          container
          spacing={3}
        >

          {/* =================================================
              PROJECT KPA & KRA TABLE
          ================================================= */}

          <Grid
            item
            xs={12}
          >
            <Card
              sx={{
                overflow:
                  "hidden",
                borderRadius:
                  "12px",
              }}
            >



              {/* TABLE */}

              <MDBox>

                {loadingKpas ? (
                  <Box
                    sx={{
                      minHeight:
                        "250px",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",
                    }}
                  >
                    <CircularProgress />
                  </Box>

                ) : kpaError ? (

                  <Alert
                    severity="error"
                    sx={{
                      borderRadius:
                        "10px",
                      m: 2,
                    }}
                  >
                    {kpaError}
                  </Alert>

                ) : kpaRows.length ===
                  0 ? (

                  <Box
                    sx={{
                      minHeight:
                        "180px",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",
                    }}
                  >
                    <MDTypography
                      color="text"
                      variant="button"
                    >
                      No Project
                      KPAs found.
                    </MDTypography>
                  </Box>

                ) : (

                  <>

                    {view === "table" ? (
                        <DataGrid
                          title="Project KPAs"
                          exportName="kpas"
                          rows={shownKpas}
                          paginate={false}
                          actions={
                            canAssign
                              ? (r) => [{ icon: "users", label: "Assign employee", tone: "accent", onClick: () => setAssignKpa(r.raw) }]
                              : null
                          }
                          emptyText={filtersActive ? "No KPAs match your filters" : "No KPAs found"}
                          columns={[
                            { key: "kpa", label: "KPA", value: (r) => r.raw?.kpaName, render: (r) => <IconCell icon="checklist" title={r.raw?.kpaName || "KPA"} sub={r.raw?.kpaDescription || null} hue={hueFor(r.raw?.kraName || "")} /> },
                            { key: "kra", label: "KRA", value: (r) => r.raw?.kraName, render: (r) => <TagCell label={r.raw?.kraName} hue={hueFor(r.raw?.kraName || "")} /> },
                            { key: "project", label: "Project", value: (r) => clean(r.raw?.projectName) },
                            { key: "employee", label: "Employee", value: (r) => r.raw?.employeeName, render: (r) => (r.raw?.employeeName && r.raw.employeeName !== "-" ? <PersonCell name={r.raw.employeeName} sub={r.raw.employeeDesignation !== "-" ? r.raw.employeeDesignation : null} hue={hueFor(r.raw.employeeName)} /> : "—") },
                            { key: "performance", label: "Performance", value: (r) => clean(r.raw?.performance) },
                            { key: "score", label: "Score", align: "center", value: (r) => r.raw?.score ?? "" },
                          ]}
                        />
                    ) : (
                        <CardGrid empty={shownKpas.length === 0} emptyText="No KPAs match your filters">
                          {shownKpas.map((row, i) => (
                            <RecordCard
                              key={row.id}
                              index={i}
                              title={row.raw?.kpaName || "KPA"}
                              subtitle={row.raw?.kraName && row.raw.kraName !== "-" ? `KRA · ${row.raw.kraName}` : null}
                              avatarIcon="checklist"
                              hue={hueFor(row.raw?.kraName || "")}
                              description={row.raw?.kpaDescription || null}
                              meta={[
                                { icon: "folder", label: "Project", value: clean(row.raw?.projectName) },
                                { icon: "person", label: "Employee", value: clean(row.raw?.employeeName) },
                                { icon: "insights", label: "Performance", value: clean(row.raw?.performance) },
                                { icon: "star", label: "Score", value: row.raw?.score ?? "" },
                              ].filter((m) => m.value !== "" && m.value !== null && m.value !== undefined)}
                              actions={
                                canAssign
                                  ? [{ icon: "person_add", label: "Assign employee", tone: "accent", onClick: () => setAssignKpa(row.raw) }]
                                  : []
                              }
                            />
                          ))}
                        </CardGrid>
                    )}


                    {/* =================================================
                        BACKEND PAGINATION
                    ================================================= */}

                    <Box
                      sx={{
                        borderTop:
                          "1px solid var(--pt-border)",

                        mt: 1,

                        px: {
                          xs: 0,
                          sm: 1,
                        },

                        py: 1.5,

                        display: "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "flex-end",

                        width: "100%",
                      }}
                    >

                      <TablePagination
                        component="div"

                        count={
                          kpaTotalElements
                        }

                        page={
                          kpaPage
                        }

                        onPageChange={
                          handleKpaPageChange
                        }

                        rowsPerPage={
                          kpaRowsPerPage
                        }

                        onRowsPerPageChange={
                          handleKpaRowsPerPageChange
                        }

                        rowsPerPageOptions={[
                          10,
                          20,
                          50,
                          100,
                        ]}

                        labelRowsPerPage="Rows per page:"

                        sx={{
                          border:
                            "none",

                          ".MuiTablePagination-toolbar":
                            {
                              minHeight:
                                "48px",
                            },

                          ".MuiTablePagination-selectLabel":
                            {
                              fontSize:
                                "0.8rem",

                              marginBottom:
                                0,
                            },

                          ".MuiTablePagination-displayedRows":
                            {
                              fontSize:
                                "0.8rem",

                              marginBottom:
                                0,
                            },
                        }}
                      />

                    </Box>

                  </>
                )}

              </MDBox>

            </Card>
          </Grid>



        </Grid>
      </MDBox>


      {/* =====================================================
          ADD PROJECT KPA DIALOG
      ===================================================== */}

      <Dialog
        open={
          openKpaDialog
        }
        onClose={
          handleCloseKpaDialog
        }
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius:
              "12px",

            overflow:
              "hidden",

            boxShadow:
              "var(--pt-shadow-xl)",
          },
        }}
      >

        {/* HEADER */}

        <DialogHeader
          title="Add project KPA"
          subtitle="Create a key performance area for a project KRA"
          icon="clipboard-check"
          hue="amber"
          onClose={handleCloseKpaDialog}
          disabled={creatingKpa}
        />


        {/* CONTENT */}

        <DialogContent
          sx={{
            backgroundColor:
              "var(--pt-surface-2)",

            px: {
              xs: 2,
              sm: 3,
            },

            py: 3,
          }}
        >

          {/* FORM ERROR */}

          {formError && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius:
                  "10px",
              }}
            >
              {formError}
            </Alert>
          )}


          {/* =================================================
              KRA DETAILS
          ================================================= */}

          <Box mb={3}>

            <MDTypography
              variant="h6"
              fontWeight="medium"
              sx={{
                fontSize:
                  "0.95rem",

                mb: 0.5,
              }}
            >
              KRA Details
            </MDTypography>

            <MDTypography
              variant="caption"
              color="text"
              sx={{
                display:
                  "block",

                mb: 1.5,

                fontSize:
                  "0.75rem",
              }}
            >
              Select the Project
              KRA under which
              this KPA will be
              created.
            </MDTypography>


            {/* PROJECT KRA DROPDOWN */}

            <TextField
              select
              fullWidth
              label="Project KRA"
              name="projectKraId"
              value={
                kpaForm.projectKraId
              }
              onChange={
                handleKpaChange
              }
              disabled={
                loadingKras ||
                creatingKpa
              }
              sx={{
                "& .MuiInputBase-root":
                  {
                    height:
                      "48px",

                    minHeight:
                      "48px",

                    backgroundColor:
                      "var(--pt-surface)",

                    borderRadius:
                      "10px",
                  },

                "& .MuiOutlinedInput-root":
                  {
                    height:
                      "48px",

                    minHeight:
                      "48px",

                    borderRadius:
                      "10px",
                  },

                "& .MuiOutlinedInput-input":
                  {
                    height:
                      "48px",

                    minHeight:
                      "48px",

                    boxSizing:
                      "border-box",

                    padding:
                      "0 14px",

                    display:
                      "flex",

                    alignItems:
                      "center",
                  },

                "& .MuiSelect-select":
                  {
                    height:
                      "48px !important",

                    minHeight:
                      "48px !important",

                    boxSizing:
                      "border-box",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    padding:
                      "0 40px 0 14px !important",
                  },

                "& .MuiInputLabel-root":
                  {
                    backgroundColor:
                      "var(--pt-surface)",

                    padding:
                      "0 4px",
                  },
              }}
            >

              <MenuItem value="">
                <em>
                  Select Project KRA
                </em>
              </MenuItem>


              {loadingKras && (
                <MenuItem disabled>
                  Loading Project
                  KRAs...
                </MenuItem>
              )}


              {!loadingKras &&
                kraList.length ===
                  0 && (
                  <MenuItem disabled>
                    No active Project
                    KRAs found
                  </MenuItem>
                )}


              {!loadingKras &&
                kraList.length >
                  0 &&
                kraList.map(
                  (kra) => (
                    <MenuItem
                      key={
                        kra.id
                      }
                      value={
                        kra.id
                      }
                      sx={{
                        minHeight:
                          "60px !important",

                        py: 1,
                      }}
                    >

                      <Box
                        sx={{
                          width:
                            "100%",
                        }}
                      >

                        <MDTypography
                          variant="button"
                          fontWeight="medium"
                          sx={{
                            display:
                              "block",

                            fontSize:
                              "0.82rem",

                            lineHeight:
                              1.4,
                          }}
                        >
                          {
                            kra.kraName
                          }
                        </MDTypography>


                        <MDTypography
                          variant="caption"
                          color="text"
                          sx={{
                            display:
                              "block",

                            mt: 0.25,

                            fontSize:
                              "0.7rem",
                          }}
                        >
                          {
                            kra.projectName
                          }
                          {" • "}
                          {
                            kra.departmentName
                          }
                        </MDTypography>

                      </Box>

                    </MenuItem>
                  )
                )}

            </TextField>

          </Box>


          {/* =================================================
              KPA DETAILS
          ================================================= */}

          <Box>

            <MDTypography
              variant="h6"
              fontWeight="medium"
              sx={{
                fontSize:
                  "0.95rem",

                mb: 0.5,
              }}
            >
              KPA Details
            </MDTypography>

            <MDTypography
              variant="caption"
              color="text"
              sx={{
                display:
                  "block",

                mb: 1.5,

                fontSize:
                  "0.75rem",
              }}
            >
              Enter the KPA
              information for
              the selected Project
              KRA.
            </MDTypography>


            <Stack spacing={2.2}>

              {/* KPA NAME */}

              <TextField
                fullWidth
                label="KPA Name"
                name="kpaName"
                value={
                  kpaForm.kpaName
                }
                onChange={
                  handleKpaChange
                }
                disabled={
                  creatingKpa
                }
                placeholder="Enter KPA name"
                sx={{
                  "& .MuiInputBase-root":
                    {
                      height:
                        "48px",

                      minHeight:
                        "48px",

                      backgroundColor:
                        "var(--pt-surface)",

                      borderRadius:
                        "10px",
                    },

                  "& .MuiOutlinedInput-root":
                    {
                      height:
                        "48px",

                      minHeight:
                        "48px",

                      borderRadius:
                        "10px",
                    },

                  "& .MuiOutlinedInput-input":
                    {
                      height:
                        "48px",

                      minHeight:
                        "48px",

                      boxSizing:
                        "border-box",

                      padding:
                        "0 14px",

                      display:
                        "flex",

                      alignItems:
                        "center",
                    },

                  "& .MuiInputLabel-root":
                    {
                      backgroundColor:
                        "var(--pt-surface)",

                      padding:
                        "0 4px",
                    },
                }}
              />


              {/* DESCRIPTION */}

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={
                  kpaForm.description
                }
                onChange={
                  handleKpaChange
                }
                disabled={
                  creatingKpa
                }
                placeholder="Enter KPA description"
                sx={{
                  "& .MuiInputBase-root":
                    {

                      backgroundColor:
                        "var(--pt-surface)",

                      borderRadius:
                        "10px",

                      alignItems:
                        "flex-start",
                    },

                  "& .MuiOutlinedInput-root":
                    {

                      borderRadius:
                        "10px",

                      alignItems:
                        "flex-start",
                    },

                  "& .MuiOutlinedInput-input":
                    {
                      lineHeight:
                        1.5,
                    },

                  "& .MuiInputLabel-root":
                    {
                      backgroundColor:
                        "var(--pt-surface)",

                      padding:
                        "0 4px",
                    },
                }}
              />

            </Stack>


            {/* TIP */}

            <Box
              sx={{
                mt: 2.5,

                p: 1.5,

                borderRadius:
                  "10px",

                backgroundColor:
                  "var(--pt-accent-soft)",

                border:
                  "1px solid var(--pt-border)",
              }}
            >

              <MDTypography
                variant="caption"
                sx={{
                  color:
                    "var(--pt-accent-text)",

                  fontSize:
                    "0.74rem",

                  lineHeight:
                    1.5,
                }}
              >
                <strong>
                  Tip:
                </strong>{" "}
                Keep the KPA name
                specific and
                measurable so it
                can be used
                effectively for
                performance
                tracking.
              </MDTypography>

            </Box>

          </Box>

        </DialogContent>


        {/* =================================================
            FOOTER
        ================================================= */}

        <DialogActions
          sx={{
            px: 3,
            py: 2,

            borderTop:
              "1px solid var(--pt-border)",

            gap: 1,
          }}
        >

          <Button
            variant="outlined"
            onClick={
              handleCloseKpaDialog
            }
            disabled={
              creatingKpa
            }
            sx={{
              minWidth:
                "100px",

              height:
                "42px",

              borderRadius:
                "9px",

              textTransform:
                "none",

              fontWeight: 600,
            }}
          >
            Cancel
          </Button>


          <Button
            variant="contained"
            onClick={
              handleCreateKPA
            }
            disabled={
              creatingKpa ||
              loadingKras
            }
            sx={{
              minWidth:
                "120px",

              height:
                "42px",

              borderRadius:
                "9px",

              textTransform:
                "none",

              fontWeight: 600,

              boxShadow:
                "var(--pt-shadow-sm)",

              "&:hover": {
                boxShadow:
                  "var(--pt-shadow-sm)",
              },
            }}
          >

            {creatingKpa ? (

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <CircularProgress
                  size={18}
                  color="inherit"
                />

                <span>
                  Creating...
                </span>
              </Stack>

            ) : (
              "Create KPA"
            )}

          </Button>

        </DialogActions>

      </Dialog>


      <AssignKpaEmployeeDialog
        open={Boolean(assignKpa)}
        kpa={assignKpa}
        onClose={() => setAssignKpa(null)}
        onAssigned={() => fetchProjectKPAs(kpaPage, kpaRowsPerPage)}
      />

      <Footer />

    </DashboardLayout>
  );
}

export default Tables;