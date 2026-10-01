import { useMemo } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { v } from "assets/theme/enterprise";
import Panel from "layouts/dashboard/components/Panel";
import { toDate } from "layouts/dashboard/utils/apiShape";

const DAY = 24 * 60 * 60 * 1000;

function Row({ icon, tone, label, hint, value }) {
  return (
    <Box display="flex" alignItems="center" gap={1.5} py={1.25} sx={{ "& + &": { borderTop: `1px solid ${v("border")}` } }}>
      <Icon sx={{ fontSize: "20px !important", color: v(tone) }}>{icon}</Icon>
      <Box flex={1} minWidth={0}>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text") }}>{label}</Typography>
        <Typography sx={{ fontSize: 12, color: v("text3") }}>{hint}</Typography>
      </Box>
      <Typography sx={{ fontSize: 16, fontWeight: 600, color: v("text"), fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Typography>
    </Box>
  );
}

Row.propTypes = {
  icon: PropTypes.string.isRequired,
  tone: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  hint: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};

function ProjectHealth({ projects, departments, loading, delay }) {
  const s = useMemo(() => {
    const now = Date.now();
    const active = projects.filter((p) => p.active !== false);
    let endingSoon = 0;
    let overdue = 0;
    active.forEach((p) => {
      const end = toDate(p.endDate);
      if (!end) return;
      const diff = end.getTime() - now;
      if (diff < 0) overdue += 1;
      else if (diff <= 30 * DAY) endingSoon += 1;
    });
    return {
      total: projects.length,
      active: active.length,
      inactive: projects.length - active.length,
      endingSoon,
      overdue,
      activeDepts: departments.filter((d) => d.active !== false).length,
    };
  }, [projects, departments]);

  const pct = s.total ? Math.round((s.active / s.total) * 100) : 0;

  return (
    <Panel title="Project health" subtitle="Status across all projects" icon="heart-pulse" hue="teal" delay={delay}>
      {loading ? (
        <>
          <Skeleton height={48} />
          <Skeleton height={36} />
          <Skeleton height={36} />
          <Skeleton height={36} />
        </>
      ) : (
        <>
          <Box display="flex" alignItems="baseline" gap={1}>
            <Typography sx={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", color: v("text") }}>
              {pct}%
            </Typography>
            <Typography sx={{ fontSize: 13, color: v("text2") }}>
              active · {s.active} of {s.total}
            </Typography>
          </Box>
          <Box
            role="img"
            aria-label={`${s.active} active, ${s.inactive} inactive`}
            height={8}
            mt={1}
            mb={1.5}
            sx={{ borderRadius: 4, overflow: "hidden", backgroundColor: v("hover") }}
          >
            <Box
              height="100%"
              sx={{ width: `${pct}%`, backgroundColor: v("success"), borderRadius: 4, transition: "width .6s ease" }}
            />
          </Box>

          <Row icon="check_circle" tone="success" label="Active" hint="Currently running" value={s.active} />
          <Row icon="pause_circle" tone="text3" label="Inactive" hint="Paused or closed" value={s.inactive} />
          <Row icon="schedule" tone="warning" label="Ending soon" hint="Within 30 days" value={s.endingSoon} />
          <Row icon="error_outline" tone="danger" label="Overdue" hint="Active past end date" value={s.overdue} />
          <Row
            icon="apartment"
            tone="accentText"
            label="Active departments"
            hint={`of ${departments.length} total`}
            value={s.activeDepts}
          />
        </>
      )}
    </Panel>
  );
}

ProjectHealth.defaultProps = { delay: 0 };
ProjectHealth.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  departments: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  delay: PropTypes.number,
};

export default ProjectHealth;
