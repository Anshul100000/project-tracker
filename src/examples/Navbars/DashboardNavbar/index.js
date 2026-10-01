import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { keyframes } from "@emotion/react";

import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ListItemIcon from "@mui/material/ListItemIcon";

import { useMaterialUIController, setMiniSidenav, setDarkMode } from "context";
import currentUser from "auth/currentUser";
import { ROLE_LABELS, canAccess, primaryRole } from "auth/roles";
import { v } from "assets/theme/enterprise";
import { PAGE_GUTTER } from "examples/LayoutContainers/DashboardLayout";
import CommandPalette from "components/CommandPalette";
import ThemePanel from "components/ThemePanel";
import AnimatedIcon from "components/AnimatedIcon";
import MotionIcon from "components/MotionIcon";

// Page metadata for the title, breadcrumb and quick navigation.
export const PAGES = [
  { key: "dashboard", name: "Dashboard", section: "Overview", icon: "space_dashboard", hue: "indigo" },
  { key: "employee", name: "Employees", section: "Organization", icon: "badge", hue: "blue" },
  { key: "department", name: "Departments", section: "Organization", icon: "apartment", hue: "violet" },
  { key: "projects", name: "Projects", section: "Organization", icon: "folder", hue: "teal" },
  { key: "tables", name: "KPAs", section: "Performance", icon: "checklist", hue: "amber" },
  { key: "kra", name: "KRAs", section: "Performance", icon: "flag", hue: "rose" },
  { key: "kpa-tasks", name: "KPA Tasks", section: "Performance", icon: "task_alt", hue: "emerald" },
  { key: "profile", name: "Profile", section: "Account", icon: "account_circle", hue: "sky" },
];

const titleIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
`;
const spinIn = keyframes`
  from { opacity: 0; transform: rotate(-120deg) scale(0.6); }
  to   { opacity: 1; transform: none; }
`;
const rotate = keyframes`
  to { transform: rotate(360deg); }
`;
const flow = keyframes`
  from { background-position: 0% 0; }
  to   { background-position: 200% 0; }
`;
const noMotion = { "@media (prefers-reduced-motion: reduce)": { animation: "none" } };

const neg = (g) => Object.fromEntries(Object.entries(g).map(([k, val]) => [k, -val]));

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <Box
      display={{ xs: "none", lg: "flex" }}
      alignItems="center"
      gap={0.75}
      px={1.25}
      height={34}
      sx={{ borderRadius: "999px", border: `1px solid ${v("border")}`, backgroundColor: v("surface"), color: v("text2") }}
    >
      <Icon sx={{ fontSize: "16px !important", color: v("indigo") }}>schedule</Icon>
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: v("text2"), whiteSpace: "nowrap" }}>
        {now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })} ·{" "}
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Typography>
    </Box>
  );
}

const iconBtn = {
  width: 36,
  height: 36,
  borderRadius: "10px",
  color: v("text2"),
  transition: "background-color .15s, color .15s, transform .15s",
  "&:hover": { backgroundColor: v("hover"), color: v("text"), transform: "translateY(-1px)" },
};

// `absolute`, `light` and `isMini` are accepted for compatibility with existing pages.
// eslint-disable-next-line no-unused-vars
function DashboardNavbar({ absolute, light, isMini }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, darkMode } = controller;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));
  const user = currentUser();

  const key = pathname.split("/")[1] || "dashboard";
  // The X only makes sense while the slide-over drawer (below desktop width) is open.
  const drawerOpen = !miniSidenav && typeof window !== "undefined" && window.innerWidth < 1200;
  const page = PAGES.find((p) => p.key === key) || { name: key, section: "Workspace", icon: "article", hue: "blue" };

  // Ctrl/⌘ + K opens quick navigation.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const paletteItems = [
    ...PAGES.filter((p) => canAccess(p.key)).map((p) => ({ ...p, onSelect: () => navigate(`/${p.key}`) })),
    {
      key: "theme",
      name: darkMode ? "Switch to light mode" : "Switch to dark mode",
      section: "Action",
      icon: darkMode ? "light_mode" : "dark_mode",
      hue: "amber",
      onSelect: () => setDarkMode(dispatch, !darkMode),
    },
    { key: "customize", name: "Customize colours", section: "Action", icon: "palette", hue: "violet", onSelect: () => setThemeOpen(true) },
    { key: "logout", name: "Sign out", section: "Action", icon: "logout", hue: "rose", onSelect: () => navigate("/logout") },
  ];

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        mx: neg(PAGE_GUTTER),
        px: PAGE_GUTTER,
        mb: 3,
        height: 68,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        backgroundColor: darkMode ? "rgba(12,14,18,0.78)" : "rgba(247,248,250,0.78)",
        backdropFilter: "saturate(180%) blur(14px)",
        // slowly flowing gradient hairline
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "2px",
          backgroundImage: `linear-gradient(90deg, ${v("brandFrom")}, ${v("brandTo")}, ${v("accent")}, ${v("brandFrom")})`,
          backgroundSize: "200% 100%",
          opacity: 0.55,
          animation: `${flow} 12s linear infinite`,
          ...noMotion,
        },
      }}
    >
      <Tooltip title={miniSidenav ? "Expand sidebar" : "Collapse sidebar"}>
        <IconButton
          size="small"
          aria-label="Toggle navigation"
          onClick={() => setMiniSidenav(dispatch, !miniSidenav)}
          sx={{ ...iconBtn, border: `1px solid ${v("border")}`, backgroundColor: v("surface") }}
        >
          <AnimatedIcon
            key={drawerOpen ? "x" : "menu"}
            name="menu3"
            size={24}
            color={darkMode ? "#e5e7eb" : "#344054"}
            loop={false}
            autoplay={false}
            reverse={drawerOpen}
            speed={1.4}
          />
        </IconButton>
      </Tooltip>

      {/* Title + breadcrumb */}
      <Box
        key={key}
        component="nav"
        aria-label="Breadcrumb"
        display="flex"
        alignItems="center"
        gap={1.25}
        minWidth={0}
        flex={1}
        sx={{ animation: `${titleIn} .35s cubic-bezier(0.22,1,0.36,1)`, ...noMotion }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            display: { xs: "none", sm: "grid" },
            placeItems: "center",
            backgroundColor: v(`${page.hue}Soft`),
            color: v(`${page.hue}Ink`),
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: "20px !important" }}>{page.icon}</Icon>
        </Box>
        <Box minWidth={0}>
          <Box display={{ xs: "none", sm: "flex" }} alignItems="center" gap={0.5}>
            <Typography
              component={Link}
              to="/dashboard"
              sx={{ fontSize: 12, color: v("text3"), "&:hover": { color: v("text2") } }}
            >
              {page.section}
            </Typography>
            <Icon sx={{ fontSize: "14px !important", color: v("text3") }}>chevron_right</Icon>
            <Typography sx={{ fontSize: 12, color: v("text3") }}>{page.name}</Typography>
          </Box>
          <Typography component="h1" sx={{ fontSize: 16, fontWeight: 600, color: v("text"), lineHeight: 1.25 }} noWrap>
            {page.name}
          </Typography>
        </Box>
      </Box>

      {/* Search */}
      <Box
        component="button"
        type="button"
        onClick={() => setPaletteOpen(true)}
        aria-label="Search pages"
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 1,
          height: 36,
          width: { md: 220, lg: 260 },
          px: 1.25,
          borderRadius: "10px",
          border: `1px solid ${v("border")}`,
          backgroundColor: v("surface"),
          color: v("text3"),
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "border-color .15s, box-shadow .15s",
          "&:hover": { borderColor: v("borderStrong"), boxShadow: v("shadowSm") },
        }}
      >
        <MotionIcon name="search" size={17} />
        <Typography sx={{ fontSize: 13, color: v("text3"), flex: 1, textAlign: "left" }}>Search pages…</Typography>
        <Box
          component="kbd"
          sx={{
            fontSize: 11,
            fontFamily: "inherit",
            px: 0.75,
            py: 0.1,
            borderRadius: "5px",
            border: `1px solid ${v("border")}`,
            backgroundColor: v("surface2"),
            color: v("text3"),
          }}
        >
          Ctrl K
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={0.5}>
        <Tooltip title="Search">
          <IconButton aria-label="Search pages" onClick={() => setPaletteOpen(true)} sx={{ ...iconBtn, display: { md: "none" } }}>
            <Icon sx={{ fontSize: "20px !important" }}>search</Icon>
          </IconButton>
        </Tooltip>

        <Clock />

        <Tooltip title="Customize colours">
          <Box
            component="button"
            type="button"
            onClick={() => setThemeOpen(true)}
            aria-label="Customize colours"
            sx={{
              position: "relative",
              width: 36,
              height: 36,
              borderRadius: "11px",
              border: 0,
              p: "2px",
              cursor: "pointer",
              overflow: "hidden",
              background: "transparent",
              transition: "transform .15s",
              "&:hover": { transform: "translateY(-1px) scale(1.04)" },
              // rotating rainbow ring
              "&::before": {
                content: '""',
                position: "absolute",
                inset: "-50%",
                background: "conic-gradient(#2563eb, #7c3aed, #db2777, #ea580c, #059669, #0284c7, #2563eb)",
                animation: `${rotate} 4s linear infinite`,
                ...noMotion,
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "9px",
                display: "grid",
                placeItems: "center",
                backgroundColor: v("surface"),
                color: v("accentText"),
              }}
            >
              <MotionIcon name="palette" size={18} loop={5000} loopDelay={1500} />
            </Box>
          </Box>
        </Tooltip>

        <Tooltip title={fullscreen ? "Exit full screen" : "Full screen"}>
          <IconButton aria-label="Toggle full screen" onClick={toggleFullscreen} sx={{ ...iconBtn, display: { xs: "none", sm: "inline-flex" } }}>
            <MotionIcon name="maximize" size={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
          <IconButton aria-label="Toggle dark mode" onClick={() => setDarkMode(dispatch, !darkMode)} sx={iconBtn}>
            <Icon
              key={darkMode ? "sun" : "moon"}
              sx={{
                fontSize: "20px !important",
                color: darkMode ? "#fbbf24" : v("indigo"),
                animation: `${spinIn} .45s cubic-bezier(0.34,1.56,0.64,1)`,
                ...noMotion,
              }}
            >
              {darkMode ? "light_mode" : "dark_mode"}
            </Icon>
          </IconButton>
        </Tooltip>

        <Box sx={{ width: "1px", height: 24, backgroundColor: v("border"), mx: 0.75 }} />

        <Box
          component="button"
          type="button"
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            border: 0,
            background: "none",
            cursor: "pointer",
            borderRadius: "10px",
            p: 0.5,
            pr: 1,
            color: v("text"),
            fontFamily: "inherit",
            transition: "background-color .15s",
            "&:hover": { backgroundColor: v("hover") },
          }}
        >
          <Box position="relative">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #0d9488 0%, #2563eb 100%)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {user.initials}
            </Box>
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                right: -1,
                bottom: -1,
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#17b26a",
                border: `2px solid ${v("bg")}`,
              }}
            />
          </Box>
          <Box display={{ xs: "none", md: "block" }} textAlign="left">
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: v("text"), lineHeight: 1.2 }}>{user.firstName}</Typography>
            <Typography sx={{ fontSize: 11, color: v("text3"), lineHeight: 1.2 }}>{ROLE_LABELS[primaryRole()]}</Typography>
          </Box>
          <Icon
            sx={{
              fontSize: "18px !important",
              color: v("text3"),
              transition: "transform .2s",
              transform: anchor ? "rotate(180deg)" : "none",
            }}
          >
            expand_more
          </Icon>
        </Box>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{ sx: { mt: 1, minWidth: 240 } }}
        >
          <Box px={1.25} py={1} display="flex" alignItems="center" gap={1.25}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #0d9488 0%, #2563eb 100%)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {user.initials}
            </Box>
            <Box minWidth={0}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: v("text") }} noWrap>
                {user.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: v("text3") }} noWrap>
                {user.email}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  mt: 0.5,
                  px: 0.75,
                  py: 0.1,
                  borderRadius: "5px",
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  color: v("accentText"),
                  backgroundColor: v("accentSoft"),
                }}
              >
                {ROLE_LABELS[primaryRole()]}
              </Box>
            </Box>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              setAnchor(null);
              navigate("/profile");
            }}
          >
            <ListItemIcon>
              <Icon sx={{ fontSize: "18px !important", color: v("sky") }}>account_circle</Icon>
            </ListItemIcon>
            My profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              setPaletteOpen(true);
            }}
          >
            <ListItemIcon>
              <Icon sx={{ fontSize: "18px !important", color: v("indigo") }}>search</Icon>
            </ListItemIcon>
            Quick navigation
            <Typography sx={{ ml: "auto", pl: 2, fontSize: 11, color: v("text3") }}>Ctrl K</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchor(null);
              setThemeOpen(true);
            }}
          >
            <ListItemIcon>
              <Icon sx={{ fontSize: "18px !important", color: v("violet") }}>palette</Icon>
            </ListItemIcon>
            Customize colours
          </MenuItem>
          <MenuItem onClick={() => setDarkMode(dispatch, !darkMode)}>
            <ListItemIcon>
              <Icon sx={{ fontSize: "18px !important", color: v("amber") }}>{darkMode ? "light_mode" : "dark_mode"}</Icon>
            </ListItemIcon>
            {darkMode ? "Light mode" : "Dark mode"}
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              setAnchor(null);
              navigate("/logout");
            }}
            sx={{ color: `${v("danger")} !important` }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <Icon sx={{ fontSize: "18px !important" }}>logout</Icon>
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Box>

      <ThemePanel open={themeOpen} onClose={() => setThemeOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={paletteItems} />
    </Box>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
