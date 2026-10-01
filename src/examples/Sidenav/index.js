import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { keyframes } from "@emotion/react";

import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { useMaterialUIController, setMiniSidenav, setAccent } from "context";
import currentUser from "auth/currentUser";
import { ROLE_LABELS, primaryRole } from "auth/roles";
import { ACCENTS, HUE_VALUES, v } from "assets/theme/enterprise";
import useDashboardData from "layouts/dashboard/hooks/useDashboardData";
import { SIDENAV_BACKGROUNDS } from "assets/images/pt";
import AnimatedIcon from "components/AnimatedIcon";
import MotionIcon from "components/MotionIcon";

export const SIDENAV_WIDTH = 256;
export const SIDENAV_MINI_WIDTH = 76;
const INSET = 12; // floating gap around the desktop panel
// Horizontal space the desktop panel occupies, for the page layout's left margin.
export const SIDENAV_SPACE = SIDENAV_WIDTH + INSET * 2;
export const SIDENAV_MINI_SPACE = SIDENAV_MINI_WIDTH + INSET * 2;
const DESKTOP = 1200;

const itemIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: none; }
`;
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.0), 0 6px 16px -6px rgba(99,102,241,0.8); }
  50%      { box-shadow: 0 0 0 6px rgba(99,102,241,0.12), 0 6px 16px -6px rgba(99,102,241,0.8); }
`;
const noMotion = { "@media (prefers-reduced-motion: reduce)": { animation: "none", transition: "none" } };

// Chip colors that read on the navy panel (the dark-mode tint + ink of each hue).
const chip = (hue) => {
  const h = HUE_VALUES[hue] || HUE_VALUES.blue;
  return { solid: h.solid, soft: h.dark[0], ink: h.dark[1] };
};

// Animated icon for each page (falls back to the static route icon).
const MOTION = {
  dashboard: "layout-grid",
  employee: "users",
  department: "blocks",
  projects: "folder-kanban",
  tables: "clipboard-check",
  kra: "gauge",
  "kpa-tasks": "circle-check",
  profile: "user",
};

function NavItem({ item, active, mini, onNavigate, index, itemRef, count }) {
  const c = chip(item.hue);
  const [hover, setHover] = useState(false);
  const motionName = MOTION[item.key];
  const link = (
    <Box
      ref={itemRef}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      component={NavLink}
      to={item.route}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      sx={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        height: 42,
        px: mini ? 0 : 0.75,
        justifyContent: mini ? "center" : "flex-start",
        borderRadius: "10px",
        color: active ? "#fff" : v("navText"),
        fontWeight: active ? 600 : 500,
        fontSize: "0.875rem",
        transition: "color .15s, background-color .15s",
        animation: `${itemIn} .4s cubic-bezier(0.22,1,0.36,1) ${0.05 + index * 0.04}s both`,
        "&:hover": { color: "#fff", backgroundColor: active ? "transparent" : v("navHover") },
        "&:hover .nav-chip": { transform: "scale(1.08) rotate(-6deg)" },
        ...noMotion,
      }}
    >
      <Box
        className="nav-chip"
        sx={{
          width: 30,
          height: 30,
          borderRadius: "9px",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          backgroundColor: active ? c.solid : c.soft,
          color: active ? "#fff" : c.ink,
          boxShadow: active ? `0 6px 14px -6px ${c.solid}` : "none",
          transition: "transform .25s cubic-bezier(0.34,1.56,0.64,1), background-color .2s, box-shadow .2s",
          "& .MuiIcon-root": { fontSize: "18px !important", color: "inherit" },
          ...noMotion,
        }}
      >
        {motionName ? (
          <MotionIcon name={motionName} size={18} play={hover} loop={active ? 3600 : 0} loopDelay={600} />
        ) : (
          item.icon
        )}
      </Box>
      {!mini && (
        <Box component="span" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
          {item.name}
        </Box>
      )}
      {!mini && typeof count === "number" && (
        <Box
          component="span"
          sx={{
            minWidth: 24,
            height: 20,
            px: 0.75,
            mr: 0.5,
            borderRadius: "999px",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 600,
            color: active ? "#fff" : v("navText"),
            backgroundColor: active ? c.solid : "rgba(255,255,255,0.10)",
            transition: "background-color .2s",
          }}
        >
          {count > 999 ? "999+" : count}
        </Box>
      )}
      {mini && typeof count === "number" && count > 0 && (
        <Box
          component="span"
          sx={{ position: "absolute", top: 4, right: 10, width: 8, height: 8, borderRadius: "50%", backgroundColor: c.solid, border: `2px solid ${v("nav")}` }}
        />
      )}
    </Box>
  );

  return mini ? (
    <Tooltip title={item.name} placement="right" arrow>
      {link}
    </Tooltip>
  ) : (
    link
  );
}

NavItem.propTypes = {
  item: PropTypes.shape({ key: PropTypes.string, route: PropTypes.string, name: PropTypes.string, icon: PropTypes.node, hue: PropTypes.string })
    .isRequired,
  active: PropTypes.bool.isRequired,
  mini: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  itemRef: PropTypes.func.isRequired,
  count: PropTypes.number,
};
NavItem.defaultProps = { count: undefined };

function NavPanel({ mini, sections, activeKey, brandName, onNavigate, onClose, showClose, counts, onToggleMini }) {
  const navigate = useNavigate();
  const [{ accent }, dispatch] = useMaterialUIController();
  const role = primaryRole();
  const user = currentUser();
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const [pill, setPill] = useState(null);

  // Slide the highlight behind whichever item is active.
  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[activeKey];
      if (!el) return setPill(null);
      return setPill({ top: el.offsetTop, height: el.offsetHeight, left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeKey, mini, sections.length]);

  let running = 0;

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Brand */}
      <Box
        display="flex"
        alignItems="center"
        gap={1.25}
        px={mini ? 0 : 2}
        justifyContent={mini ? "center" : "flex-start"}
        height={68}
        flexShrink={0}
      >
        <Box
          component={NavLink}
          to="/dashboard"
          aria-label={brandName}
          sx={{
            width: 36,
            height: 36,
            borderRadius: "11px",
            display: "grid",
            placeItems: "center",
            background: `linear-gradient(135deg, ${v("brandFrom")} 0%, ${v("brandTo")} 100%)`,
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff",
            flexShrink: 0,
            animation: `${glow} 3.2s ease-in-out infinite`,
            ...noMotion,
          }}
        >
          <AnimatedIcon name="activity" size={26} color="#ffffff" speed={0.7} />
        </Box>
        {!mini && (
          <Box minWidth={0} flex={1}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.01em" }} noWrap>
              {brandName}
            </Typography>
            <Typography sx={{ fontSize: 12, color: v("navMuted"), lineHeight: 1.3 }} noWrap>
              Performance workspace
            </Typography>
          </Box>
        )}
        {showClose && !mini && (
          <IconButton
            size="small"
            aria-label="Close navigation"
            onClick={onClose}
            sx={{ color: v("navText"), "&:hover": { backgroundColor: v("navHover") } }}
          >
            <Icon>close</Icon>
          </IconButton>
        )}
      </Box>

      <Box mx={mini ? 1.5 : 2} sx={{ borderTop: `1px solid ${v("navBorder")}` }} />

      {/* Navigation */}
      <Box ref={navRef} component="nav" aria-label="Main" flex={1} overflow="auto" px={1.5} py={1.5} position="relative">
        {pill && (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              zIndex: 0,
              top: pill.top,
              left: pill.left,
              width: pill.width,
              height: pill.height,
              borderRadius: "10px",
              background: "linear-gradient(90deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)",
              border: "1px solid rgba(255,255,255,0.10)",
              transition: "top .35s cubic-bezier(0.22,1,0.36,1), height .35s, width .2s",
              ...noMotion,
            }}
          />
        )}
        {sections.map((section, i) => (
          <Box key={section.name || i} mb={1.5}>
            {section.name &&
              (mini ? (
                i > 0 && <Box mx={1} my={1} sx={{ borderTop: `1px solid ${v("navBorder")}` }} />
              ) : (
                <Typography
                  sx={{
                    px: 1,
                    mt: i ? 1 : 0.5,
                    mb: 0.5,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: v("navMuted"),
                  }}
                >
                  {section.name}
                </Typography>
              ))}
            <Box display="flex" flexDirection="column" gap={0.25}>
              {section.items.map((item) => {
                running += 1;
                return (
                  <NavItem
                    key={item.key}
                    item={item}
                    mini={mini}
                    index={running}
                    active={item.key === activeKey}
                    onNavigate={onNavigate}
                    count={counts[item.key]}
                    itemRef={(el) => {
                      itemRefs.current[item.key] = el;
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Quick theme + collapse */}
      <Box
        mx={1.5}
        mb={0.5}
        display="flex"
        alignItems="center"
        justifyContent={mini ? "center" : "space-between"}
        flexDirection={mini ? "column" : "row"}
        gap={1}
      >
        {!mini && (
          <Box display="flex" alignItems="center" gap={0.75} pl={0.5}>
            {Object.entries(ACCENTS)
              .slice(0, 6)
              .map(([key, a]) => (
                <Tooltip key={key} title={`${a.name} theme`}>
                  <Box
                    component="button"
                    type="button"
                    aria-label={`${a.name} theme`}
                    aria-pressed={key === accent}
                    onClick={() => setAccent(dispatch, key)}
                    sx={{
                      width: 18,
                      height: 18,
                      p: 0,
                      borderRadius: "50%",
                      cursor: "pointer",
                      border: key === accent ? "2px solid #fff" : "2px solid transparent",
                      background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
                      boxShadow: key === accent ? `0 0 0 2px ${a.from}` : "none",
                      transition: "transform .15s",
                      "&:hover": { transform: "scale(1.2)" },
                    }}
                  />
                </Tooltip>
              ))}
          </Box>
        )}
        {onToggleMini && (
          <Tooltip title={mini ? "Expand" : "Collapse"} placement="right">
            <IconButton
              size="small"
              aria-label={mini ? "Expand sidebar" : "Collapse sidebar"}
              onClick={onToggleMini}
              sx={{ color: v("navText"), border: `1px solid ${v("navBorder")}`, "&:hover": { backgroundColor: v("navHover"), color: "#fff" } }}
            >
              <MotionIcon name={mini ? "chevron-right" : "chevron-left"} size={16} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* User */}
      <Box p={1.5} flexShrink={0}>
        <Box
          display="flex"
          alignItems="center"
          gap={1.25}
          p={mini ? 0.75 : 1.25}
          justifyContent={mini ? "center" : "flex-start"}
          sx={{
            borderRadius: "14px",
            backgroundColor: "rgba(255,255,255,0.06)",
            border: `1px solid ${v("navBorder")}`,
            transition: "background-color .15s",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.09)" },
          }}
        >
          <Tooltip title={mini ? user.name : ""} placement="right">
            <Box position="relative" flexShrink={0}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, #0d9488 0%, #2563eb 100%)",
                  color: "#fff",
                  fontSize: 13,
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
                  border: `2px solid ${v("nav")}`,
                }}
              />
            </Box>
          </Tooltip>
          {!mini && (
            <>
              <Box minWidth={0} flex={1}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#fff" }} noWrap>
                  {user.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.75} minWidth={0}>
                  <Box
                    component="span"
                    sx={{
                      flexShrink: 0,
                      px: 0.75,
                      py: 0.1,
                      borderRadius: "5px",
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      color: "#fff",
                      background: `linear-gradient(135deg, ${v("brandFrom")}, ${v("brandTo")})`,
                    }}
                  >
                    {ROLE_LABELS[role]}
                  </Box>
                  <Typography sx={{ fontSize: 12, color: v("navMuted") }} noWrap>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Sign out">
                <IconButton
                  size="small"
                  aria-label="Sign out"
                  onClick={() => navigate("/logout")}
                  sx={{
                    color: v("navText"),
                    "&:hover": { backgroundColor: "rgba(244,63,94,0.18)", color: "#fda4af" },
                  }}
                >
                  <Icon sx={{ fontSize: "18px !important" }}>logout</Icon>
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

NavPanel.defaultProps = { showClose: false, counts: {}, onToggleMini: null };
NavPanel.propTypes = {
  mini: PropTypes.bool.isRequired,
  sections: PropTypes.arrayOf(PropTypes.object).isRequired,
  activeKey: PropTypes.string.isRequired,
  brandName: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  showClose: PropTypes.bool,
  counts: PropTypes.objectOf(PropTypes.number),
  onToggleMini: PropTypes.func,
};

// Photo (optional) under a dark glass overlay tinted with the theme's brand colours.
const panelBg = (src) => ({
  backgroundColor: v("nav"),
  backgroundImage: [
    `linear-gradient(180deg, color-mix(in srgb, ${v("brandFrom")} 40%, transparent) 0%, transparent 45%, color-mix(in srgb, ${v("brandTo")} 32%, transparent) 100%)`,
    src ? "linear-gradient(180deg, rgba(8,12,30,0.60) 0%, rgba(8,12,30,0.80) 55%, rgba(8,12,30,0.92) 100%)" : null,
    src ? `url(${src})` : null,
  ]
    .filter(Boolean)
    .join(", "),
  backgroundSize: "cover",
  backgroundPosition: "center",
});

function Sidenav({ brandName, routes }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, sidenavBg } = controller;
  const bgSrc = (SIDENAV_BACKGROUNDS[sidenavBg] || SIDENAV_BACKGROUNDS.city).src;
  const location = useLocation();
  const activeKey = location.pathname.split("/")[1] || "dashboard";

  // Collapse to hidden on small screens, expanded on desktop.
  useEffect(() => {
    const handle = () => setMiniSidenav(dispatch, window.innerWidth < DESKTOP);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [dispatch]);

  const close = () => setMiniSidenav(dispatch, true);
  const closeOnMobile = () => window.innerWidth < DESKTOP && close();

  // Group visible routes by section, keeping their order.
  const sections = [];
  routes
    .filter((r) => r.type === "collapse" && r.route && !r.hidden)
    .forEach((r) => {
      const name = r.section || "";
      let group = sections.find((s) => s.name === name);
      if (!group) {
        group = { name, items: [] };
        sections.push(group);
      }
      group.items.push(r);
    });

  // One-time fetch for the count badges (no polling).
  const { data, loading, errors } = useDashboardData({ live: false });
  const counts = {};
  if (!loading) {
    [
      ["employee", "employees"],
      ["department", "departments"],
      ["projects", "projects"],
      ["tables", "kpas"],
      ["kra", "kras"],
    ].forEach(([navKey, dataKey]) => {
      if (!errors[dataKey]) counts[navKey] = data[dataKey].total;
    });
  }

  const panelProps = { sections, activeKey, brandName, onNavigate: closeOnMobile, onClose: close, counts };

  return (
    <>
      {/* Desktop: floating panel, collapses to an icon rail */}
      <Box
        component="aside"
        sx={{
          ...panelBg(bgSrc),
          display: { xs: "none", xl: "block" },
          position: "fixed",
          top: INSET,
          left: INSET,
          bottom: INSET,
          zIndex: 1200,
          width: miniSidenav ? SIDENAV_MINI_WIDTH : SIDENAV_WIDTH,
          borderRadius: "20px",
          border: `1px solid ${v("navBorder")}`,
          boxShadow: "0 20px 40px -20px rgba(15,27,61,0.6)",
          overflow: "hidden",
          transition: "width .25s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <NavPanel mini={miniSidenav} onToggleMini={() => setMiniSidenav(dispatch, !miniSidenav)} {...panelProps} />
      </Box>

      {/* Mobile / tablet: slide-over drawer */}
      <Box sx={{ display: { xs: "block", xl: "none" } }}>
        <Box
          onClick={close}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1199,
            backgroundColor: "rgba(16,24,40,0.5)",
            backdropFilter: "blur(2px)",
            opacity: miniSidenav ? 0 : 1,
            pointerEvents: miniSidenav ? "none" : "auto",
            transition: "opacity .2s",
          }}
        />
        <Box
          component="aside"
          sx={{
            ...panelBg(bgSrc),
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 1200,
            width: SIDENAV_WIDTH,
            transform: miniSidenav ? `translateX(-${SIDENAV_WIDTH + 1}px)` : "none",
            transition: "transform .25s cubic-bezier(0.22,1,0.36,1)",
            boxShadow: miniSidenav ? "none" : v("shadowXl"),
          }}
        >
          {!miniSidenav && <NavPanel mini={false} showClose {...panelProps} />}
        </Box>
      </Box>
    </>
  );
}

Sidenav.defaultProps = { brandName: "Performance Tracker" };
Sidenav.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
