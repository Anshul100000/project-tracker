import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip } from "chart.js";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import InputAdornment from "@mui/material/InputAdornment";
import Skeleton from "@mui/material/Skeleton";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import StatTile from "components/StatTile";
import StatusPill from "components/StatusPill";
import { useMaterialUIController, setDarkMode } from "context";
import keycloak from "auth/keycloak";
import currentUser from "auth/currentUser";
import { hueFor, v } from "assets/theme/enterprise";
import useDashboardData from "layouts/dashboard/hooks/useDashboardData";
import { normalizeKra, toDate } from "layouts/dashboard/utils/apiShape";
import { coverFjord } from "assets/images/pt";

ChartJS.register(ArcElement, ChartTooltip);

// Keycloak adds these to every user; they aren't meaningful to show.
const HIDDEN_ROLES = /^(offline_access|uma_authorization|default-roles-.*|manage-account|manage-account-links|view-profile)$/;

const STATUS = [
  { key: "track", label: "On track", min: 75, tone: "success", color: "#17b26a", icon: "trending_up" },
  { key: "progress", label: "In progress", min: 40, tone: "warning", color: "#f79009", icon: "trending_flat" },
  { key: "risk", label: "At risk", min: 0, tone: "danger", color: "#f04438", icon: "trending_down" },
];
const statusOf = (p) => STATUS.find((s) => p >= s.min);

const fmtDate = (d) => (d ? d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) : "—");
const fmtTime = (seconds) =>
  seconds
    ? new Date(seconds * 1000).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "—";

function tenure(from) {
  if (!from) return "—";
  const months = Math.max(0, (new Date().getFullYear() - from.getFullYear()) * 12 + new Date().getMonth() - from.getMonth());
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (!y) return `${m} mo`;
  return m ? `${y}y ${m}m` : `${y} yr${y > 1 ? "s" : ""}`;
}

const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function Section({ title, subtitle, action, children, bodySx }) {
  return (
    <Card sx={{ height: "100%" }}>
      <Box
        px={2.5}
        py={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        sx={{ borderBottom: `1px solid ${v("border")}` }}
      >
        <Box minWidth={0}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: v("text") }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontSize: 13, color: v("text3"), mt: 0.25 }}>{subtitle}</Typography>}
        </Box>
        {action}
      </Box>
      <Box px={2.5} py={1.5} sx={bodySx}>
        {children}
      </Box>
    </Card>
  );
}

Section.defaultProps = { subtitle: null, action: null, bodySx: {} };
Section.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node.isRequired,
  bodySx: PropTypes.object,
};

function InfoItem({ icon, hue, label, value }) {
  return (
    <Box display="flex" alignItems="center" gap={1.5} py={1.25}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          backgroundColor: v(`${hue}Soft`),
          color: v(`${hue}Ink`),
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: "18px !important" }}>{icon}</Icon>
      </Box>
      <Box minWidth={0}>
        <Typography sx={{ fontSize: 12, color: v("text3") }}>{label}</Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text"), wordBreak: "break-word" }}>{value || "—"}</Typography>
      </Box>
    </Box>
  );
}

InfoItem.propTypes = {
  icon: PropTypes.string.isRequired,
  hue: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};
InfoItem.defaultProps = { value: null };

function Row({ label, children }) {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap={1}
      justifyContent="space-between"
      alignItems="center"
      py={1.4}
      sx={{ "& + &": { borderTop: `1px solid ${v("border")}` } }}
    >
      <Typography sx={{ fontSize: 14, color: v("text2") }}>{label}</Typography>
      <Box sx={{ fontSize: 14, fontWeight: 500, color: v("text"), textAlign: "right" }}>{children}</Box>
    </Box>
  );
}

Row.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

function Badge({ icon, children, hue }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.35,
        borderRadius: "6px",
        fontSize: 12,
        fontWeight: 500,
        backgroundColor: v(`${hue}Soft`),
        color: v(`${hue}Ink`),
      }}
    >
      {icon && <Icon sx={{ fontSize: "14px !important" }}>{icon}</Icon>}
      {children}
    </Box>
  );
}

Badge.defaultProps = { icon: null, hue: "blue" };
Badge.propTypes = { icon: PropTypes.string, children: PropTypes.node.isRequired, hue: PropTypes.string };

function Avatar({ name, size }) {
  const hue = hueFor(name);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        backgroundColor: v(`${hue}Soft`),
        color: v(`${hue}Ink`),
        fontWeight: 600,
        fontSize: size * 0.36,
        flexShrink: 0,
      }}
    >
      {initialsOf(name)}
    </Box>
  );
}

Avatar.defaultProps = { size: 40 };
Avatar.propTypes = { name: PropTypes.string.isRequired, size: PropTypes.number };

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function readLive() {
  try {
    return (JSON.parse(localStorage.getItem("dashboard-prefs")) || {}).live ?? true;
  } catch {
    return true;
  }
}

function Profile() {
  const navigate = useNavigate();
  const [{ darkMode }, dispatch] = useMaterialUIController();
  const [tab, setTab] = useState("overview");
  const [teamQuery, setTeamQuery] = useState("");
  const [liveDashboard, setLiveDashboard] = useState(readLive);

  const user = currentUser();
  const token = keycloak.tokenParsed || {};
  const { data, loading, errors } = useDashboardData({ live: false });

  const roles = useMemo(() => {
    const realm = token.realm_access?.roles || [];
    const client = Object.values(token.resource_access || {}).flatMap((a) => a.roles || []);
    return [...new Set([...realm, ...client])].filter((r) => !HIDDEN_ROLES.test(r));
  }, [token]);

  // Match the signed-in user to their employee record.
  const me = useMemo(() => {
    const email = (user.email || "").toLowerCase();
    const username = (token.preferred_username || "").toLowerCase();
    return data.employees.list.find(
      (e) => (e.email && e.email.toLowerCase() === email) || (username && String(e.employeeCode || "").toLowerCase() === username)
    );
  }, [data.employees.list, user.email, token.preferred_username]);

  const department = me?.department?.departmentName || me?.departmentName || "";
  const designation =
    me?.designations?.[0]?.designationName || me?.designation?.designationName || me?.designationName || me?.designation || "";
  const joined = toDate(me?.joiningDate || me?.dateOfJoining || me?.joinDate || me?.createdAt);
  const active = me ? me.active !== false : true;

  // Department-scoped performance (falls back to the whole org when unlinked).
  const kras = useMemo(() => {
    const all = data.kras.list.map(normalizeKra).filter((k) => k.active);
    return department ? all.filter((k) => k.dept === department) : all;
  }, [data.kras.list, department]);

  const avg = kras.length ? Math.round(kras.reduce((s, k) => s + k.progress, 0) / kras.length) : 0;
  const statusCounts = STATUS.map((s) => ({ ...s, count: kras.filter((k) => statusOf(k.progress).key === s.key).length }));
  const deptProjects = useMemo(() => {
    const names = [...new Set(kras.map((k) => k.projectName).filter(Boolean))];
    return names.map((n) => data.projects.list.find((p) => p.projectName === n) || { projectName: n });
  }, [kras, data.projects.list]);

  const team = useMemo(() => {
    const list = department
      ? data.employees.list.filter((e) => (e.department?.departmentName || e.departmentName) === department && e.id !== me?.id)
      : [];
    const q = teamQuery.trim().toLowerCase();
    return list.filter((e) =>
      !q ? true : `${e.firstName || ""} ${e.lastName || ""} ${e.email || ""}`.toLowerCase().includes(q)
    );
  }, [data.employees.list, department, me, teamQuery]);

  const toggleLiveDashboard = (checked) => {
    setLiveDashboard(checked);
    try {
      const prefs = JSON.parse(localStorage.getItem("dashboard-prefs")) || {};
      localStorage.setItem("dashboard-prefs", JSON.stringify({ ...prefs, live: checked }));
    } catch {
      // storage blocked: preference just won't persist
    }
  };

  const scope = department || "your organization";

  // ------------------------------------------------------------------ tabs
  const overview = (
    <Grid container spacing={2}>
      <Grid item xs={6} md={3}>
        <StatTile title="Department KRAs" value={loading ? "—" : kras.length} icon="flag" hue="rose" />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatTile title="Avg. progress" value={loading ? "—" : `${avg}%`} icon="insights" hue="emerald" />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatTile title="Projects" value={loading ? "—" : deptProjects.length} icon="folder" hue="teal" />
      </Grid>
      <Grid item xs={6} md={3}>
        <StatTile title="Tenure" value={tenure(joined)} icon="workspace_premium" hue="amber" />
      </Grid>

      <Grid item xs={12} lg={8}>
        <Section title="About" subtitle={me ? "From your employee record" : "From your sign-in account"}>
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} height={48} />)
          ) : (
            <Grid container columnSpacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoItem icon="person" hue="blue" label="Full name" value={user.name} />
                <InfoItem icon="mail" hue="violet" label="Email" value={user.email} />
                <InfoItem icon="call" hue="teal" label="Phone" value={me?.phone} />
                <InfoItem icon="tag" hue="indigo" label="Employee code" value={me?.employeeCode} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem icon="apartment" hue="violet" label="Department" value={department} />
                <InfoItem icon="work" hue="sky" label="Designation" value={designation} />
                <InfoItem icon="event" hue="amber" label="Joined" value={joined ? fmtDate(joined) : null} />
                <InfoItem icon="alternate_email" hue="rose" label="Username" value={token.preferred_username} />
              </Grid>
            </Grid>
          )}
        </Section>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Section title="Access" subtitle="Roles granted to your account">
            <Box display="flex" flexWrap="wrap" gap={0.75} py={0.5}>
              {roles.length ? (
                roles.map((r) => (
                  <Badge key={r} hue={hueFor(r)} icon="verified_user">
                    {r}
                  </Badge>
                ))
              ) : (
                <Typography sx={{ fontSize: 14, color: v("text3") }}>No additional roles assigned</Typography>
              )}
            </Box>
          </Section>
          <Section title="Session">
            <Row label="Signed in">{fmtTime(token.auth_time || token.iat)}</Row>
            <Row label="Token refresh">{fmtTime(token.exp)}</Row>
            <Row label="Status">
              <StatusPill label="Active" tone="success" />
            </Row>
          </Section>
        </Box>
      </Grid>
    </Grid>
  );

  const performance = (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={8}>
        <Section title="KRA progress" subtitle={`Key result areas in ${scope}`} bodySx={{ py: 0.5 }}>
          {loading && [...Array(4)].map((_, i) => <Skeleton key={i} height={56} />)}
          {!loading && kras.length === 0 && (
            <Typography sx={{ fontSize: 14, color: v("text3"), py: 5, textAlign: "center" }}>No KRAs yet</Typography>
          )}
          {!loading &&
            [...kras]
              .sort((a, b) => a.progress - b.progress)
              .map((k) => {
                const s = statusOf(k.progress);
                return (
                  <Box key={k.id} py={1.5} sx={{ "& + &": { borderTop: `1px solid ${v("border")}` } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={1.5} mb={1}>
                      <Box minWidth={0}>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text") }} noWrap>
                          {k.name}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: v("text3") }} noWrap>
                          {k.projectName || "—"}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
                        <StatusPill label={s.label} tone={s.tone} />
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: v("text"), minWidth: 38, textAlign: "right" }}>
                          {k.progress}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box height={6} sx={{ borderRadius: 3, backgroundColor: v("hover"), overflow: "hidden" }}>
                      <Box
                        height="100%"
                        sx={{ width: `${k.progress}%`, backgroundColor: s.color, borderRadius: 3, transition: "width .6s ease" }}
                      />
                    </Box>
                  </Box>
                );
              })}
        </Section>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Section title="Status breakdown">
            {loading ? (
              <Skeleton variant="circular" width={180} height={180} sx={{ mx: "auto", my: 2 }} />
            ) : (
              <>
                <Box position="relative" height={190} my={1}>
                  <Doughnut
                    data={{
                      labels: statusCounts.map((s) => s.label),
                      datasets: [
                        {
                          data: statusCounts.map((s) => s.count),
                          backgroundColor: statusCounts.map((s) => s.color),
                          borderColor: darkMode ? "#14171d" : "#ffffff",
                          borderWidth: 2,
                          hoverOffset: 4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "72%",
                      plugins: { legend: { display: false } },
                    }}
                    aria-label="KRA status breakdown"
                    role="img"
                  />
                  <Box position="absolute" sx={{ inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
                    <Box textAlign="center">
                      <Typography sx={{ fontSize: 26, fontWeight: 600, color: v("text"), lineHeight: 1 }}>{avg}%</Typography>
                      <Typography sx={{ fontSize: 12, color: v("text3"), mt: 0.5 }}>avg. progress</Typography>
                    </Box>
                  </Box>
                </Box>
                {statusCounts.map((s) => (
                  <Row key={s.key} label={s.label}>
                    <Box display="inline-flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "3px", backgroundColor: s.color }} />
                      {s.count}
                    </Box>
                  </Row>
                ))}
              </>
            )}
          </Section>

          <Section title="Projects" subtitle={`Linked to ${scope}`} bodySx={{ py: 0.5 }}>
            {!loading && deptProjects.length === 0 && (
              <Typography sx={{ fontSize: 14, color: v("text3"), py: 3, textAlign: "center" }}>No projects yet</Typography>
            )}
            {deptProjects.slice(0, 6).map((p) => (
              <Box
                key={p.projectName}
                display="flex"
                alignItems="center"
                gap={1.25}
                py={1.1}
                sx={{ "& + &": { borderTop: `1px solid ${v("border")}` } }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: v(`${hueFor(p.projectName)}Soft`),
                    color: v(`${hueFor(p.projectName)}Ink`),
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {initialsOf(p.projectName)}
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text"), flex: 1 }} noWrap>
                  {p.projectName}
                </Typography>
                {p.active !== undefined && (
                  <StatusPill label={p.active ? "Active" : "Inactive"} tone={p.active ? "success" : "neutral"} />
                )}
              </Box>
            ))}
          </Section>
        </Box>
      </Grid>
    </Grid>
  );

  const teamTab = (
    <Section
      title={department ? `${department} team` : "Team"}
      subtitle={department ? `${team.length} colleague${team.length === 1 ? "" : "s"}` : "Link your employee record to see your team"}
      action={
        department && (
          <TextField
            size="small"
            placeholder="Search team"
            value={teamQuery}
            onChange={(e) => setTeamQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon sx={{ fontSize: "18px !important", color: v("text3") }}>search</Icon>
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: 160, sm: 240 } }}
          />
        )
      }
      bodySx={{ py: 2 }}
    >
      {loading && <Skeleton height={120} />}
      {!loading && team.length === 0 && (
        <Typography sx={{ fontSize: 14, color: v("text3"), py: 4, textAlign: "center" }}>
          {department ? "No colleagues match" : "No team to show"}
        </Typography>
      )}
      <Grid container spacing={1.5}>
        {team.slice(0, 24).map((e) => {
          const name = `${e.firstName || ""} ${e.lastName || ""}`.trim() || e.email || "Employee";
          return (
            <Grid item xs={12} sm={6} lg={4} key={e.id}>
              <Box
                display="flex"
                alignItems="center"
                gap={1.5}
                p={1.5}
                sx={{
                  border: `1px solid ${v("border")}`,
                  borderRadius: "12px",
                  transition: "border-color .15s, background-color .15s",
                  "&:hover": { borderColor: v("borderStrong"), backgroundColor: v("surface2") },
                }}
              >
                <Avatar name={name} size={40} />
                <Box minWidth={0} flex={1}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text") }} noWrap>
                    {name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: v("text3") }} noWrap>
                    {e.designations?.[0]?.designationName || e.email}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Section>
  );

  const settings = (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={6}>
        <Section title="Preferences" subtitle="Saved on this device">
          <Row label="Dark mode">
            <Switch checked={darkMode} onChange={(e) => setDarkMode(dispatch, e.target.checked)} inputProps={{ "aria-label": "Dark mode" }} />
          </Row>
          <Row label="Live dashboard updates">
            <Switch
              checked={liveDashboard}
              onChange={(e) => toggleLiveDashboard(e.target.checked)}
              inputProps={{ "aria-label": "Live dashboard updates" }}
            />
          </Row>
        </Section>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Section title="Account" subtitle="Managed by your organization's identity provider">
          <Row label="Password, email & 2-step verification">
            <Button size="small" variant="outlined" startIcon={<Icon>open_in_new</Icon>} onClick={() => keycloak.accountManagement()}>
              Manage
            </Button>
          </Row>
          <Row label="Realm">{keycloak.realm || "—"}</Row>
          <Row label="Application">{keycloak.clientId || "—"}</Row>
          <Row label="Sign out of this device">
            <Button size="small" variant="outlined" color="error" startIcon={<Icon>logout</Icon>} onClick={() => navigate("/logout")}>
              Sign out
            </Button>
          </Row>
        </Section>
      </Grid>
    </Grid>
  );

  const panels = { overview, performance, team: teamTab, settings };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* Cover + identity */}
      <Card sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            height: { xs: 120, md: 168 },
            position: "relative",
            backgroundImage: `linear-gradient(120deg, color-mix(in srgb, ${v("brandFrom")} 78%, transparent) 0%, color-mix(in srgb, ${v("brandTo")} 62%, transparent) 100%), url(${coverFjord})`,
            backgroundSize: "cover",
            backgroundPosition: "center 60%",
            // subtle dot grid on the cover
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
              maskImage: "linear-gradient(90deg, transparent 0%, #000 60%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 60%)",
            },
          }}
        />
        <Box px={{ xs: 2, md: 3 }} pb={0}>
          <Box display="flex" flexWrap="wrap" alignItems="flex-end" gap={2.5} position="relative">
            <Box
              sx={{
                width: { xs: 88, md: 104 },
                height: { xs: 88, md: 104 },
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #0d9488 0%, #2563eb 100%)",
                color: "#fff",
                fontSize: { xs: 30, md: 36 },
                fontWeight: 600,
                border: `4px solid ${v("surface")}`,
                boxShadow: v("shadowMd"),
                flexShrink: 0,
                mt: { xs: "-44px", md: "-52px" },
              }}
            >
              {user.initials}
            </Box>
            <Box flex={1} minWidth={220} pt={1.5} pb={0.5}>
              <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 600, color: v("text"), letterSpacing: "-0.01em" }}>
                {user.name}
              </Typography>
              <Typography sx={{ fontSize: 14, color: v("text2") }}>
                {[designation, department].filter(Boolean).join(" · ") || user.email}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.75} mt={1}>
                <StatusPill label={active ? "Active" : "Inactive"} tone={active ? "success" : "neutral"} />
                {me?.employeeCode !== undefined && me?.employeeCode !== null && (
                  <Badge icon="tag" hue="indigo">
                    {me.employeeCode}
                  </Badge>
                )}
                {token.email_verified && (
                  <Badge icon="verified" hue="teal">
                    Email verified
                  </Badge>
                )}
                {department && (
                  <Badge icon="apartment" hue="violet">
                    {department}
                  </Badge>
                )}
              </Box>
            </Box>
            <Box display="flex" gap={1} pb={0.5}>
              <Button variant="outlined" startIcon={<Icon>manage_accounts</Icon>} onClick={() => keycloak.accountManagement()}>
                Manage account
              </Button>
            </Box>
          </Box>

          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val)}
            variant="scrollable"
            scrollButtons={false}
            sx={{
              mt: 2.5,
              minHeight: 44,
              backgroundColor: "transparent !important",
              backgroundImage: "none !important",
              border: 0,
              borderRadius: 0,
              p: "0 !important",
              overflow: "visible",
              "& .MuiTabs-flexContainer": { gap: 0.5 },
              "& .MuiTabs-indicator": {
                height: "2px !important",
                top: "auto !important",
                bottom: 0,
                borderRadius: 2,
                backgroundColor: `${v("accent")} !important`,
                boxShadow: "none !important",
              },
            }}
          >
            {[
              ["overview", "Overview", "dashboard"],
              ["performance", "Performance", "insights"],
              ["team", "Team", "groups"],
              ["settings", "Settings", "tune"],
            ].map(([value, label, icon]) => (
              <Tab
                key={value}
                value={value}
                label={label}
                icon={<Icon sx={{ fontSize: "18px !important" }}>{icon}</Icon>}
                iconPosition="start"
                disableRipple
                sx={{
                  flex: "none",
                  minWidth: "auto",
                  minHeight: 44,
                  px: 1.5,
                  gap: 0.75,
                  fontSize: 14,
                  color: `${v("text2")} !important`,
                  "&.Mui-selected": { color: `${v("text")} !important` },
                  "& .MuiIcon-root": { mb: "0 !important" },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Card>

      {!loading && !me && !errors.employees && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your sign-in ({user.email || token.preferred_username}) isn&apos;t linked to an employee record yet, so figures cover
          the whole organization.
        </Alert>
      )}

      <Box key={tab} sx={{ animation: "ptFade .25s ease", "@keyframes ptFade": { from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "none" } } }}>
        {panels[tab]}
      </Box>

      <Footer />
    </DashboardLayout>
  );
}

export default Profile;
