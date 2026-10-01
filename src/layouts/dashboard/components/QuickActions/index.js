import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { v } from "assets/theme/enterprise";
import MotionIcon from "components/MotionIcon";
import Panel from "layouts/dashboard/components/Panel";
import { canAccess } from "auth/roles";

const ACTIONS = [
  { label: "Employees", hint: "Manage people", icon: "users", hue: "blue", to: "/employee" },
  { label: "Projects", hint: "Track delivery", icon: "rocket", hue: "teal", to: "/projects" },
  { label: "KRAs", hint: "Result areas", icon: "gauge", hue: "rose", to: "/kra" },
  { label: "KPAs", hint: "Performance areas", icon: "clipboard-check", hue: "amber", to: "/tables" },
  { label: "Departments", hint: "Org structure", icon: "blocks", hue: "violet", to: "/department" },
  { label: "My profile", hint: "Account & team", icon: "user", hue: "sky", to: "/profile" },
];

function Tile({ a, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        textAlign: "left",
        fontFamily: "inherit",
        cursor: "pointer",
        p: 1.5,
        borderRadius: "12px",
        border: `1px solid ${v("border")}`,
        backgroundColor: v("surface"),
        backgroundImage: `radial-gradient(120% 100% at 100% 0%, ${v(`${a.hue}Soft`)} 0%, transparent 60%)`,
        transition: "transform .15s, box-shadow .15s, border-color .15s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: v("shadowMd"), borderColor: v("borderStrong") },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          backgroundColor: v(a.hue),
          boxShadow: `0 6px 12px -6px ${v(a.hue)}`,
          mb: 1,
        }}
      >
        <MotionIcon name={a.icon} size={18} play={hover} />
      </Box>
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: v("text") }}>{a.label}</Typography>
      <Typography sx={{ fontSize: 12, color: v("text3") }}>{a.hint}</Typography>
    </Box>
  );
}

Tile.propTypes = { a: PropTypes.object.isRequired, onClick: PropTypes.func.isRequired };

function QuickActions({ delay }) {
  const navigate = useNavigate();
  return (
    <Panel title="Quick actions" subtitle="Jump straight in" icon="zap" hue="violet" delay={delay}>
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={1.25}>
        {ACTIONS.filter((a) => canAccess(a.to.slice(1))).map((a) => (
          <Tile key={a.label} a={a} onClick={() => navigate(a.to)} />
        ))}
      </Box>
    </Panel>
  );
}

QuickActions.defaultProps = { delay: 0 };
QuickActions.propTypes = { delay: PropTypes.number };

export default QuickActions;
