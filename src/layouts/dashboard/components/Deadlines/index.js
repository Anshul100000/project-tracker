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
const fmt = (d) => d.toLocaleDateString([], { day: "numeric", month: "short" });

function relative(days) {
  if (days < -1) return `${Math.abs(days)} days overdue`;
  if (days === -1) return "1 day overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

// Project end dates and KRA due dates: overdue first, then the next 60 days.
function Deadlines({ projects, kras, loading, delay }) {
  const items = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const list = [];
    projects
      .filter((p) => p.active !== false)
      .forEach((p) => {
        const d = toDate(p.endDate);
        if (d) list.push({ key: `p-${p.id ?? p.projectName}`, title: p.projectName || "Project", kind: "Project ends", icon: "folder", d });
      });
    kras
      .filter((k) => k.active !== false)
      .forEach((k) => {
        const d = toDate(k.dueDate ?? k.due);
        if (d) list.push({ key: `k-${k.id}`, title: k.kraName ?? k.name ?? "KRA", kind: "KRA due", icon: "flag", d });
      });
    return list
      .map((x) => ({ ...x, days: Math.round((x.d - now) / DAY) }))
      .filter((x) => x.days <= 60)
      .sort((a, b) => a.days - b.days)
      .slice(0, 7);
  }, [projects, kras]);

  return (
    <Panel title="Upcoming deadlines" subtitle="Next 60 days" icon="calendar-days" hue="amber" delay={delay} bodySx={{ py: 1.5 }}>
      {loading && [...Array(4)].map((_, i) => <Skeleton key={i} height={46} />)}
      {!loading && items.length === 0 && (
        <Box py={5} textAlign="center">
          <Icon sx={{ fontSize: "32px !important", color: v("success") }}>event_available</Icon>
          <Typography sx={{ fontSize: 14, color: v("text2"), mt: 0.5 }}>Nothing due soon</Typography>
        </Box>
      )}
      {!loading &&
        items.map((x, i) => {
          const tone = x.days < 0 ? "danger" : x.days <= 7 ? "warning" : "accentText";
          return (
            <Box key={x.key} display="flex" gap={1.5} position="relative" pb={i === items.length - 1 ? 0 : 1.75}>
              {/* timeline rail */}
              {i < items.length - 1 && (
                <Box position="absolute" left={15} top={32} bottom={0} width="2px" sx={{ backgroundColor: v("border") }} />
              )}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  color: v(tone),
                  backgroundColor: v("surface"),
                  border: `2px solid ${v(tone)}`,
                  position: "relative",
                }}
              >
                <Icon sx={{ fontSize: "16px !important" }}>{x.icon}</Icon>
              </Box>
              <Box flex={1} minWidth={0} pt={0.25}>
                <Box display="flex" justifyContent="space-between" gap={1}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: v("text") }} noWrap>
                    {x.title}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: v("text3"), flexShrink: 0 }}>{fmt(x.d)}</Typography>
                </Box>
                <Typography sx={{ fontSize: 12, color: v(tone), fontWeight: 500 }}>
                  {x.kind} · {relative(x.days)}
                </Typography>
              </Box>
            </Box>
          );
        })}
    </Panel>
  );
}

Deadlines.defaultProps = { delay: 0 };
Deadlines.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  kras: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  delay: PropTypes.number,
};

export default Deadlines;
