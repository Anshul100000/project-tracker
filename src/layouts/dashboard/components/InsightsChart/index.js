import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip as ChartTooltip } from "chart.js";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { tokens, v } from "assets/theme/enterprise";
import Panel from "layouts/dashboard/components/Panel";
import { toDate } from "layouts/dashboard/utils/apiShape";

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip);

const MAX_BARS = 8;

const palette = {
  light: { bar: "#0d9488", hover: "#0f766e", grid: "#eef0f3", tick: "#667085", other: "#98a2b3" },
  dark: { bar: "#14b8a6", hover: "#5eead4", grid: "#20252e", tick: "#8a93a2", other: "#6b7482" },
};

// Validated categorical palette (fixed order, adjacent-pair CVD safe) for one bar per department.
const CATEGORICAL = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"],
};

function headcountByDepartment(employees) {
  const counts = new Map();
  employees.forEach((e) => {
    const name = e.department?.departmentName || e.departmentName || "Unassigned";
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length <= MAX_BARS) return sorted;
  const head = sorted.slice(0, MAX_BARS - 1);
  const other = sorted.slice(MAX_BARS - 1).reduce((sum, [, n]) => sum + n, 0);
  return [...head, ["Other", other]];
}

function projectsByMonth(projects) {
  const now = new Date();
  const buckets = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString([], { month: "short" }), n: 0 });
  }
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  projects.forEach((p) => {
    const d = toDate(p.startDate);
    if (!d) return;
    const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) buckets[i].n += 1;
  });
  return buckets.map((b) => [b.label, b.n]);
}

const VIEWS = {
  dept: { label: "By department", title: "Headcount", horizontal: true, unit: "employee" },
  timeline: { label: "Project starts", title: "Projects started", horizontal: false, unit: "project" },
};

function InsightsChart({ employees, employeeTotal, projects, loading, darkMode, delay }) {
  const [view, setView] = useState("dept");
  const cfg = VIEWS[view];
  const colors = darkMode ? palette.dark : palette.light;
  const t = darkMode ? tokens.dark : tokens.light;

  const rows = useMemo(
    () => (view === "dept" ? headcountByDepartment(employees) : projectsByMonth(projects)),
    [view, employees, projects]
  );

  // Color follows the department (alphabetical slot among the shown bars), not its rank,
  // and never repeats: at most 7 named bars + a gray "Other".
  const deptOrder = useMemo(
    () => (view === "dept" ? rows.map(([label]) => label).filter((l) => l !== "Other").sort() : []),
    [view, rows]
  );
  const cat = darkMode ? CATEGORICAL.dark : CATEGORICAL.light;
  const barColors =
    view === "dept"
      ? rows.map(([label]) => (label === "Other" ? colors.other : cat[deptOrder.indexOf(label)]))
      : colors.bar;

  const subtitle =
    view === "dept"
      ? `${employeeTotal.toLocaleString()} active employees${
          employeeTotal > employees.length ? ` · chart covers first ${employees.length}` : ""
        }`
      : "Last 12 months";

  const chartData = {
    labels: rows.map(([label]) => label),
    datasets: [
      {
        label: cfg.title,
        data: rows.map(([, n]) => n),
        backgroundColor: barColors,
        hoverBackgroundColor: view === "dept" ? barColors : colors.hover,
        borderRadius: 4,
        borderSkipped: "start",
        maxBarThickness: cfg.horizontal ? 16 : 20,
      },
    ],
  };

  const valueAxis = {
    beginAtZero: true,
    grid: { color: colors.grid, drawTicks: false },
    border: { display: false },
    ticks: { color: colors.tick, precision: 0, padding: 8, font: { size: 11, family: "Inter" } },
  };
  const categoryAxis = {
    grid: { display: false },
    border: { display: false },
    ticks: { color: colors.tick, padding: 6, font: { size: 11, family: "Inter" } },
  };

  const options = {
    indexAxis: cfg.horizontal ? "y" : "x",
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: t.surface,
        titleColor: t.text,
        bodyColor: t.text2,
        borderColor: t.border,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { family: "Inter", weight: "600" },
        bodyFont: { family: "Inter" },
        callbacks: { label: (ctx) => `${ctx.raw} ${cfg.unit}${ctx.raw === 1 ? "" : "s"}` },
      },
    },
    scales: cfg.horizontal ? { x: valueAxis, y: categoryAxis } : { x: categoryAxis, y: valueAxis },
  };

  const empty = !loading && rows.every(([, n]) => n === 0);

  return (
    <Panel
      title={cfg.title}
      subtitle={subtitle}
      delay={delay}
      icon="chart-bar-increasing"
      hue="blue"
      actions={
        <ToggleButtonGroup exclusive size="small" value={view} onChange={(_, val) => val && setView(val)} aria-label="Chart view">
          {Object.entries(VIEWS).map(([key, val]) => (
            <ToggleButton key={key} value={key}>
              {val.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      }
    >
      <Box position="relative" sx={{ flex: 1, minHeight: 300 }}>
        {loading && <Skeleton variant="rounded" height="100%" />}
        {empty && (
          <Box height="100%" display="grid" sx={{ placeItems: "center" }}>
            <Typography sx={{ fontSize: 14, color: v("text3") }}>No data yet</Typography>
          </Box>
        )}
        {!loading && !empty && <Bar key={`${view}-${darkMode}`} data={chartData} options={options} aria-label={cfg.title} role="img" />}
      </Box>
    </Panel>
  );
}

InsightsChart.defaultProps = { delay: 0 };
InsightsChart.propTypes = {
  employees: PropTypes.arrayOf(PropTypes.object).isRequired,
  employeeTotal: PropTypes.number.isRequired,
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  darkMode: PropTypes.bool.isRequired,
  delay: PropTypes.number,
};

export default InsightsChart;
