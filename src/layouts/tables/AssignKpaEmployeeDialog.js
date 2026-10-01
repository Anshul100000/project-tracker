import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Icon from "@mui/material/Icon";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import axiosInstance from "services.js/axiosInstance";
import { DialogHeader, FieldGroup } from "components/AppDialog";
import { hueFor } from "assets/theme/enterprise";
import { extractList } from "layouts/dashboard/utils/apiShape";
import swalsucess from "sucess";

const fullName = (e) => `${e.firstName || ""} ${e.lastName || ""}`.trim() || e.name || e.email || `Employee #${e.id}`;
const deptOf = (e) => e.department?.departmentName || e.departmentName || "";
const designationOf = (e) => e.designations?.[0]?.designationName || e.designation?.designationName || e.designationName || "";

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

function EmployeeAvatar({ name }) {
  const hue = hueFor(name);
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: `var(--pt-${hue}-soft)`,
        color: `var(--pt-${hue}-ink)`,
      }}
    >
      {initials(name)}
    </Box>
  );
}

EmployeeAvatar.propTypes = { name: PropTypes.string.isRequired };

/**
 * Assign an employee to a project KPA.
 * POST /project-kpa-employees  { projectKpaId, employeeId }
 *
 * The employee list comes from GET /employees, which the backend already scopes to the
 * current user. The backend also rejects an employee whose department doesn't match the
 * KPA's department — we pre-filter by department when we know it, and show the backend's
 * message if it refuses.
 */
function AssignKpaEmployeeDialog({ open, kpa, onClose, onAssigned }) {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(null);
  const [sameDeptOnly, setSameDeptOnly] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const kpaDept = kpa?.departmentName || "";

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setError("");
    setSameDeptOnly(true);

    let cancelled = false;
    (async () => {
      setLoadingEmployees(true);
      setLoadError("");
      try {
        const res = await axiosInstance.get("/employees", {
          params: { activeOnly: true, page: 0, size: 500, sort: "firstName" },
        });
        if (!cancelled) setEmployees(extractList(res.data));
      } catch (e) {
        if (!cancelled) {
          setEmployees([]);
          setLoadError(e?.response?.data?.message || "Couldn't load employees.");
        }
      } finally {
        if (!cancelled) setLoadingEmployees(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const options = useMemo(() => {
    const list = kpaDept && sameDeptOnly ? employees.filter((e) => deptOf(e) === kpaDept) : employees;
    return [...list].sort((a, b) => fullName(a).localeCompare(fullName(b)));
  }, [employees, kpaDept, sameDeptOnly]);

  const handleAssign = async () => {
    if (!selected || !kpa?.kpaId) return;
    setSaving(true);
    setError("");
    try {
      await axiosInstance.post("/project-kpa-employees/assign", {
        projectKpaId: Number(kpa.kpaId),
        employeeId: Number(selected.id),
      });
      swalsucess(`${fullName(selected)} assigned to ${kpa.kpaName}`);
      onAssigned();
      onClose();
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.response?.data?.error;
      if (status === 409) setError(msg || "This employee is already assigned to this KPA.");
      else if (status === 400) setError(msg || "This employee can't be assigned to this KPA (check the department).");
      else setError(msg || "Couldn't assign the employee. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogHeader
        title="Assign employee"
        subtitle={kpa?.kpaName ? `Assign an employee to "${kpa.kpaName}"` : "Assign an employee to this KPA"}
        icon="users"
        hue="amber"
        onClose={onClose}
        disabled={saving}
      />

      <DialogContent>
        {/* KPA summary */}
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          p={1.75}
          mb={2.5}
          sx={{ borderRadius: "12px", border: "1px solid var(--pt-border)", backgroundColor: "var(--pt-surface-2)" }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: "var(--pt-amber-ink)",
              backgroundColor: "var(--pt-amber-soft)",
            }}
          >
            <Icon>checklist</Icon>
          </Box>
          <Box minWidth={0}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "var(--pt-text)" }} noWrap>
              {kpa?.kpaName || "KPA"}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "var(--pt-text-3)" }} noWrap>
              {[kpa?.kraName && `KRA · ${kpa.kraName}`, kpa?.projectName, kpaDept].filter(Boolean).join("  ·  ") || `KPA #${kpa?.kpaId}`}
            </Typography>
          </Box>
        </Box>

        <FieldGroup icon="person_add" title="Employee">
          {loadError && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {loadError}
            </Alert>
          )}

          <Autocomplete
            options={options}
            value={selected}
            onChange={(_, v) => {
              setSelected(v);
              setError("");
            }}
            loading={loadingEmployees}
            disabled={saving}
            getOptionLabel={(e) => fullName(e)}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            filterOptions={(opts, { inputValue }) => {
              const q = inputValue.trim().toLowerCase();
              if (!q) return opts;
              return opts.filter((e) =>
                [fullName(e), e.email, e.employeeCode, deptOf(e), designationOf(e)].some((v) =>
                  String(v ?? "").toLowerCase().includes(q)
                )
              );
            }}
            noOptionsText={loadingEmployees ? "Loading…" : "No matching employees"}
            renderOption={(props, e) => (
              <Box component="li" {...props} key={e.id} sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
                <EmployeeAvatar name={fullName(e)} />
                <Box minWidth={0} flex={1}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: "var(--pt-text)" }} noWrap>
                    {fullName(e)}
                    {e.employeeCode !== undefined && e.employeeCode !== null && (
                      <Box component="span" sx={{ ml: 0.75, fontSize: 12, color: "var(--pt-text-3)" }}>
                        #{e.employeeCode}
                      </Box>
                    )}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "var(--pt-text-3)" }} noWrap>
                    {[designationOf(e), deptOf(e)].filter(Boolean).join(" · ") || e.email}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search employee"
                placeholder="Name, code, email…"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingEmployees && <CircularProgress size={18} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {kpaDept && (
            <FormControlLabel
              sx={{ mt: 1, ml: 0 }}
              control={<Switch size="small" checked={sameDeptOnly} onChange={(e) => setSameDeptOnly(e.target.checked)} />}
              label={
                <Typography sx={{ fontSize: 13, color: "var(--pt-text-2)", ml: 1 }}>
                  Only show employees in <b>{kpaDept}</b>
                </Typography>
              }
            />
          )}
        </FieldGroup>

        {selected && (
          <Box
            display="flex"
            alignItems="center"
            gap={1.25}
            p={1.5}
            sx={{ borderRadius: "10px", border: "1px solid var(--pt-accent)", backgroundColor: "var(--pt-accent-soft)" }}
          >
            <EmployeeAvatar name={fullName(selected)} />
            <Box flex={1} minWidth={0}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "var(--pt-text)" }} noWrap>
                {fullName(selected)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "var(--pt-text-2)" }} noWrap>
                {[designationOf(selected), deptOf(selected), selected.email].filter(Boolean).join(" · ")}
              </Typography>
            </Box>
            <Icon sx={{ color: "var(--pt-accent-text)" }}>check_circle</Icon>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selected || saving || !kpa?.kpaId}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Icon>person_add</Icon>}
        >
          {saving ? "Assigning…" : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AssignKpaEmployeeDialog.defaultProps = { kpa: null };
AssignKpaEmployeeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  kpa: PropTypes.shape({
    kpaId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    kpaName: PropTypes.string,
    kraName: PropTypes.string,
    projectName: PropTypes.string,
    departmentName: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onAssigned: PropTypes.func.isRequired,
};

export default AssignKpaEmployeeDialog;
