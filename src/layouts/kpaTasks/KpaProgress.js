import PropTypes from "prop-types";
import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

const pop = keyframes`
  0%   { transform: scale(0.6); opacity: 0; }
  60%  { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;
const glow = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(23, 178, 106, 0.45); }
  100% { box-shadow: 0 0 0 10px rgba(23, 178, 106, 0); }
`;

export const pctColor = (p) => (p >= 75 ? "#17b26a" : p >= 40 ? "#f79009" : "#f04438");

/** Thin completion bar; the width animates when the percentage changes. */
export function CompletionBar({ value, height }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <Box height={height} sx={{ borderRadius: height, backgroundColor: "var(--pt-hover)", overflow: "hidden" }}>
      <Box
        height="100%"
        sx={{
          width: `${pct}%`,
          borderRadius: height,
          backgroundColor: pctColor(pct),
          transition: "width .8s cubic-bezier(0.22,1,0.36,1), background-color .4s",
        }}
      />
    </Box>
  );
}

CompletionBar.defaultProps = { height: 6 };
CompletionBar.propTypes = { value: PropTypes.number.isRequired, height: PropTypes.number };

/**
 * Completion % per KPA assignment. The value comes from the backend
 * (completed active tasks ÷ active tasks × 100), recalculated on every task change.
 * `changes` = { [assignmentId]: deltaPercent } highlights the rows that just moved.
 */
function KpaProgress({ assignments, loading, changes, title, onSelect, selectedId }) {
  const rows = assignments.filter((a) => a.active);

  return (
    <Card sx={{ mb: 2, overflow: "hidden" }}>
      <Box px={2.5} py={1.75} display="flex" alignItems="center" gap={1} sx={{ borderBottom: "1px solid var(--pt-border)" }}>
        <Icon sx={{ color: "var(--pt-emerald)" }}>insights</Icon>
        <Box flex={1}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "var(--pt-text)" }}>{title}</Typography>
          <Typography sx={{ fontSize: 12.5, color: "var(--pt-text-3)" }}>
            Completion = completed tasks ÷ active tasks. Updates whenever a task status changes.
          </Typography>
        </Box>
      </Box>

      <Box p={2} display="grid" gap={1.5} sx={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {loading && [...Array(3)].map((_, i) => <Skeleton key={i} variant="rounded" height={72} />)}
        {!loading && rows.length === 0 && (
          <Typography sx={{ fontSize: 13, color: "var(--pt-text-3)", gridColumn: "1 / -1", textAlign: "center", py: 2 }}>
            No KPA assignments yet.
          </Typography>
        )}
        {!loading &&
          rows.map((a) => {
            const pct = Number.isFinite(a.completion) ? Math.round(a.completion * 100) / 100 : null;
            const delta = changes[a.id];
            const selected = String(selectedId) === String(a.id);
            return (
              <Box
                key={a.id}
                component="button"
                type="button"
                onClick={() => onSelect(selected ? "" : a.id)}
                title={selected ? "Show all tasks" : "Show only this KPA's tasks"}
                sx={{
                  textAlign: "left",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  p: 1.5,
                  borderRadius: "12px",
                  border: `1px solid ${selected ? "var(--pt-accent)" : "var(--pt-border)"}`,
                  backgroundColor: selected ? "var(--pt-accent-soft)" : "var(--pt-surface)",
                  transition: "border-color .15s, background-color .15s",
                  animation: delta ? `${glow} 1.2s ease-out 2` : "none",
                  "&:hover": { borderColor: "var(--pt-border-strong)" },
                }}
              >
                <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
                  <Box minWidth={0} flex={1}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "var(--pt-text)" }} noWrap>
                      {a.kpaName}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "var(--pt-text-3)" }} noWrap>
                      {[a.projectName, a.employeeName].filter(Boolean).join(" · ") || a.kraName || " "}
                    </Typography>
                  </Box>
                  <Box textAlign="right" flexShrink={0}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: pct === null ? "var(--pt-text-3)" : pctColor(pct), lineHeight: 1.1 }}>
                      {pct === null ? "—" : `${pct}%`}
                    </Typography>
                    {delta ? (
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.25,
                          mt: 0.25,
                          px: 0.75,
                          borderRadius: "999px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: delta > 0 ? "var(--pt-success)" : "var(--pt-danger)",
                          backgroundColor: delta > 0 ? "var(--pt-success-soft)" : "var(--pt-danger-soft)",
                          animation: `${pop} .45s cubic-bezier(0.34,1.56,0.64,1)`,
                        }}
                      >
                        <Icon sx={{ fontSize: "13px !important" }}>{delta > 0 ? "arrow_upward" : "arrow_downward"}</Icon>
                        {delta > 0 ? "+" : ""}
                        {Math.round(delta * 100) / 100}%
                      </Box>
                    ) : null}
                  </Box>
                </Box>
                <CompletionBar value={pct ?? 0} />
              </Box>
            );
          })}
      </Box>
    </Card>
  );
}

KpaProgress.defaultProps = { loading: false, changes: {}, title: "KPA progress", selectedId: "" };
KpaProgress.propTypes = {
  assignments: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
  changes: PropTypes.object,
  title: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default KpaProgress;
