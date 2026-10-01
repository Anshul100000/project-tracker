import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { DialogHeader, FieldGroup } from "components/AppDialog";
import swalsucess from "sucess";
import { createTask, errorMessage, findAssignmentForKpa } from "layouts/kpaTasks/api";

const NAME_MAX = 150;
const DESC_MAX = 1000;

/**
 * Employee creates a task under a KPA assigned to them.
 *
 * KPA dropdown  ← GET /project-kpas (backend returns only the employee's assigned KPAs)
 * On select     → resolve the employee's assignment id for that KPA
 *                 (embedded on the KPA → from the loaded assignments → GET /project-kpa-employees?projectKpaId=)
 * Create        → POST /project-kpa-tasks { kpaEmployeeAssignmentId, taskName, description }
 */
function CreateTaskDialog({ open, kpas, loadingKpas, assignments, defaultKpaId, onClose, onCreated }) {
  const [kpaId, setKpaId] = useState("");
  const [assignmentId, setAssignmentId] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [notAssigned, setNotAssigned] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKpaId(defaultKpaId || (kpas.length === 1 ? kpas[0].id : ""));
    setTaskName("");
    setDescription("");
    setError("");
    setTouched(false);
  }, [open, defaultKpaId, kpas]);

  // Find the signed-in employee's assignment for the chosen KPA.
  useEffect(() => {
    setAssignmentId(null);
    setNotAssigned(false);
    if (!open || !kpaId) return undefined;

    const kpa = kpas.find((k) => String(k.id) === String(kpaId));
    if (kpa?.assignmentId !== undefined && kpa?.assignmentId !== null) {
      setAssignmentId(kpa.assignmentId);
      return undefined;
    }
    const local = assignments.find((a) => a.active && String(a.kpaId) === String(kpaId));
    if (local) {
      setAssignmentId(local.id);
      return undefined;
    }

    let cancelled = false;
    setResolving(true);
    findAssignmentForKpa(kpaId)
      .then((id) => {
        if (cancelled) return;
        if (id !== null && id !== undefined) setAssignmentId(id);
        else setNotAssigned(true);
      })
      .catch(() => !cancelled && setNotAssigned(true))
      .finally(() => !cancelled && setResolving(false));
    return () => {
      cancelled = true;
    };
  }, [open, kpaId, kpas, assignments]);

  const selected = kpas.find((k) => String(k.id) === String(kpaId));
  const completion = assignments.find((a) => String(a.id) === String(assignmentId))?.completion;
  const nameError = touched && !taskName.trim() ? "Task name is required" : "";
  const canSave = Boolean(kpaId && assignmentId && taskName.trim()) && !saving && !resolving;

  const handleSave = async () => {
    setTouched(true);
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      await createTask({
        kpaEmployeeAssignmentId: Number(assignmentId),
        taskName: taskName.trim(),
        description: description.trim(),
      });
      swalsucess(`Task "${taskName.trim()}" created`);
      onCreated();
      onClose();
    } catch (e) {
      setError(errorMessage(e, "Couldn't create the task. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogHeader
        title="New task"
        subtitle="Add a task under a KPA assigned to you"
        icon="circle-check"
        hue="emerald"
        onClose={onClose}
        disabled={saving}
      />

      <DialogContent>
        {!loadingKpas && kpas.length === 0 ? (
          <Alert severity="info">
            No KPAs are assigned to you yet. Ask your manager to assign you a KPA, then you can add tasks under it.
          </Alert>
        ) : (
          <>
            <FieldGroup icon="checklist" title="KPA">
              <TextField
                select
                fullWidth
                label="Select KPA"
                value={kpaId}
                onChange={(e) => setKpaId(e.target.value)}
                disabled={saving || loadingKpas}
                error={touched && !kpaId}
                helperText={touched && !kpaId ? "Choose the KPA this task belongs to" : " "}
                InputProps={{
                  endAdornment: loadingKpas ? <CircularProgress size={18} sx={{ mr: 3 }} /> : null,
                }}
              >
                {kpas.map((k) => (
                  <MenuItem key={k.id} value={k.id}>
                    <Box minWidth={0}>
                      <Typography sx={{ fontSize: 14, fontWeight: 500 }} noWrap>
                        {k.kpaName}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "var(--pt-text-3)" }} noWrap>
                        {[k.kraName && `KRA · ${k.kraName}`, k.projectName, k.departmentName].filter(Boolean).join("  ·  ") ||
                          `KPA #${k.id}`}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {selected && resolving && (
                <Box display="flex" alignItems="center" gap={1} sx={{ fontSize: 13, color: "var(--pt-text-2)" }}>
                  <CircularProgress size={14} /> Checking your assignment…
                </Box>
              )}
              {selected && notAssigned && !resolving && (
                <Alert severity="warning">
                  You aren&apos;t assigned to this KPA, so you can&apos;t add tasks to it. Pick another KPA.
                </Alert>
              )}
              {selected && assignmentId && !resolving && Number.isFinite(completion) && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Box flex={1} height={6} sx={{ borderRadius: 3, backgroundColor: "var(--pt-hover)", overflow: "hidden" }}>
                    <Box height="100%" sx={{ width: `${completion}%`, backgroundColor: "var(--pt-success)", borderRadius: 3 }} />
                  </Box>
                  <Typography sx={{ fontSize: 12, color: "var(--pt-text-2)" }}>{Math.round(completion)}% complete</Typography>
                </Box>
              )}
            </FieldGroup>

            <FieldGroup icon="edit_note" title="Task details">
              <TextField
                fullWidth
                label="Task name"
                placeholder="e.g. Develop Timesheet Backend APIs"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value.slice(0, NAME_MAX))}
                onBlur={() => setTouched(true)}
                disabled={saving}
                error={Boolean(nameError)}
                helperText={nameError || `${taskName.length}/${NAME_MAX}`}
                sx={{ mb: 1.5 }}
              />
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                placeholder="What needs to be done?"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
                disabled={saving}
                helperText={`${description.length}/${DESC_MAX}`}
              />
            </FieldGroup>
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
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
          onClick={handleSave}
          disabled={saving || resolving || kpas.length === 0 || notAssigned}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Icon>add_task</Icon>}
        >
          {saving ? "Creating…" : "Create task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CreateTaskDialog.defaultProps = { defaultKpaId: "", loadingKpas: false, assignments: [] };
CreateTaskDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  kpas: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadingKpas: PropTypes.bool,
  assignments: PropTypes.arrayOf(PropTypes.object),
  defaultKpaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};

export default CreateTaskDialog;
