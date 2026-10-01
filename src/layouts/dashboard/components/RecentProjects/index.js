import { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { hueFor, v } from "assets/theme/enterprise";
import Panel from "layouts/dashboard/components/Panel";
import { canAccess } from "auth/roles";
import { toDate } from "layouts/dashboard/utils/apiShape";

const fmt = (d) => (d ? d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) : "—");

// Newest start date first; projects without one sort last.
const sortKey = (p) => toDate(p.startDate)?.getTime() ?? 0;

function initials(name = "") {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "P"
  );
}

function RecentProjects({ projects, loading, delay }) {
  const navigate = useNavigate();
  const rows = useMemo(() => [...projects].sort((a, b) => sortKey(b) - sortKey(a)).slice(0, 6), [projects]);

  return (
    <Panel
      title="Recent projects"
      subtitle="Newest by start date"
      delay={delay}
      icon="history"
      hue="teal"
      actions={
        canAccess("projects") && (
        <Button size="small" variant="text" color="primary" endIcon={<Icon>arrow_forward</Icon>} onClick={() => navigate("/projects")}>
          View all
        </Button>
        )
      }
      bodySx={{ py: 1 }}
    >
      {loading && [...Array(4)].map((_, i) => <Skeleton key={i} height={52} />)}
      {!loading && rows.length === 0 && (
        <Typography sx={{ fontSize: 14, color: v("text3"), py: 5, textAlign: "center" }}>No projects yet</Typography>
      )}
      {!loading &&
        rows.map((p, i) => {
          const active = p.active !== false;
          return (
            <Box
              key={p.id ?? i}
              display="flex"
              alignItems="center"
              gap={1.5}
              py={1.25}
              sx={{ "& + &": { borderTop: `1px solid ${v("border")}` } }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: v(`${hueFor(p.projectName || "")}Soft`),
                  color: v(`${hueFor(p.projectName || "")}Ink`),
                  fontWeight: 600,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {initials(p.projectName)}
              </Box>
              <Box flex={1} minWidth={0}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text") }} noWrap>
                  {p.projectName || "Untitled project"}
                </Typography>
                <Typography sx={{ fontSize: 12, color: v("text3") }} noWrap>
                  {fmt(toDate(p.startDate))} – {fmt(toDate(p.endDate))}
                </Typography>
              </Box>
              <Box
                display="inline-flex"
                alignItems="center"
                gap={0.5}
                px={1}
                py={0.25}
                sx={{
                  borderRadius: "6px",
                  fontSize: 12,
                  fontWeight: 500,
                  flexShrink: 0,
                  color: active ? v("success") : v("text2"),
                  backgroundColor: active ? v("successSoft") : v("hover"),
                  border: `1px solid ${active ? v("successBorder") : v("border")}`,
                }}
              >
                <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "currentColor" }} />
                {active ? "Active" : "Inactive"}
              </Box>
            </Box>
          );
        })}
    </Panel>
  );
}

RecentProjects.defaultProps = { delay: 0 };
RecentProjects.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  delay: PropTypes.number,
};

export default RecentProjects;
