import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { useMaterialUIController, setAccent, setDarkMode, setSidenavBg } from "context";
import { ACCENTS, v } from "assets/theme/enterprise";
import { SIDENAV_BACKGROUNDS } from "assets/images/pt";
import AnimatedIcon from "components/AnimatedIcon";

function SectionTitle({ icon, children, hint }) {
  return (
    <Box mb={1.25}>
      <Box display="flex" alignItems="center" gap={0.75}>
        <Icon sx={{ fontSize: "18px !important", color: v("accentText") }}>{icon}</Icon>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: v("text"), textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {children}
        </Typography>
      </Box>
      {hint && <Typography sx={{ fontSize: 12, color: v("text3"), mt: 0.25 }}>{hint}</Typography>}
    </Box>
  );
}

SectionTitle.defaultProps = { hint: null };
SectionTitle.propTypes = { icon: PropTypes.string.isRequired, children: PropTypes.node.isRequired, hint: PropTypes.string };

const selectedRing = (on) => ({
  borderColor: on ? v("accent") : v("border"),
  boxShadow: on ? `0 0 0 3px ${v("accentSoft")}` : "none",
});

function ThemePanel({ open, onClose }) {
  const [{ accent, darkMode, sidenavBg }, dispatch] = useMaterialUIController();

  const surprise = () => {
    const keys = Object.keys(ACCENTS).filter((k) => k !== accent);
    setAccent(dispatch, keys[Math.floor(Math.random() * keys.length)]);
  };

  const reset = () => {
    setAccent(dispatch, "ocean");
    setSidenavBg(dispatch, "city");
    setDarkMode(dispatch, false);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 380 },
          backgroundColor: v("surface"),
          borderLeft: `1px solid ${v("border")}`,
          borderRadius: 0,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        px={2.5}
        py={2}
        display="flex"
        alignItems="center"
        gap={1.5}
        sx={{
          color: "#fff",
          background: `linear-gradient(120deg, ${v("brandFrom")} 0%, ${v("brandTo")} 100%)`,
          transition: "background .4s",
        }}
      >
        <Box sx={{ width: 40, height: 40, borderRadius: "12px", display: "grid", placeItems: "center", backgroundColor: "rgba(255,255,255,0.16)" }}>
          <AnimatedIcon name="settings2" size={26} color="#ffffff" speed={0.6} />
        </Box>
        <Box flex={1}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Customize</Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>Colour suggestions & appearance</Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose} sx={{ color: "#fff", "&:hover": { backgroundColor: "rgba(255,255,255,0.16)" } }}>
          <Icon>close</Icon>
        </IconButton>
      </Box>

      <Box flex={1} overflow="auto" px={2.5} py={2.5} display="flex" flexDirection="column" gap={3}>
        {/* Colour suggestions */}
        <Box>
          <SectionTitle icon="palette" hint="Pick a theme — the whole app updates instantly.">
            Colour suggestions
          </SectionTitle>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.25}>
            {Object.entries(ACCENTS).map(([key, a]) => {
              const on = key === accent;
              return (
                <Box
                  key={key}
                  component="button"
                  type="button"
                  onClick={() => setAccent(dispatch, key)}
                  aria-pressed={on}
                  sx={{
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    p: 1,
                    borderRadius: "12px",
                    border: "1px solid",
                    backgroundColor: v("surface"),
                    transition: "border-color .15s, box-shadow .15s, transform .15s",
                    "&:hover": { transform: "translateY(-2px)" },
                    ...selectedRing(on),
                  }}
                >
                  <Box
                    sx={{
                      height: 44,
                      borderRadius: "8px",
                      background: `linear-gradient(120deg, ${a.from} 0%, ${a.to} 100%)`,
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 0.5,
                      p: 0.75,
                    }}
                  >
                    {[a.light.accent, a.light.accentSoft, a.to].map((c) => (
                      <Box key={c} sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: c, border: "2px solid rgba(255,255,255,0.85)" }} />
                    ))}
                    {on && (
                      <Icon sx={{ position: "absolute", top: 6, right: 6, color: "#fff", fontSize: "18px !important" }}>check_circle</Icon>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: v("text"), mt: 0.75 }}>{a.name}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: v("text3") }}>{a.mood}</Typography>
                </Box>
              );
            })}
          </Box>
          <Button fullWidth variant="outlined" startIcon={<Icon>shuffle</Icon>} onClick={surprise} sx={{ mt: 1.25 }}>
            Surprise me with a random theme
          </Button>
        </Box>

        {/* Sidebar background */}
        <Box>
          <SectionTitle icon="wallpaper" hint="Photo behind the sidebar, tinted with your theme colour.">
            Sidebar background
          </SectionTitle>
          <Box display="grid" gridTemplateColumns="repeat(5, 1fr)" gap={1}>
            {Object.entries(SIDENAV_BACKGROUNDS).map(([key, bg]) => {
              const on = key === sidenavBg;
              return (
                <Box key={key} textAlign="center">
                  <Box
                    component="button"
                    type="button"
                    aria-label={`${bg.name} background`}
                    aria-pressed={on}
                    onClick={() => setSidenavBg(dispatch, key)}
                    sx={{
                      width: "100%",
                      aspectRatio: "3 / 5",
                      borderRadius: "10px",
                      border: "2px solid",
                      cursor: "pointer",
                      p: 0,
                      position: "relative",
                      overflow: "hidden",
                      backgroundColor: v("nav"),
                      backgroundImage: bg.src
                        ? `linear-gradient(180deg, rgba(10,15,35,0.25), rgba(10,15,35,0.55)), url(${bg.src})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      transition: "transform .15s",
                      "&:hover": { transform: "scale(1.04)" },
                      ...selectedRing(on),
                    }}
                  >
                    {on && (
                      <Icon sx={{ position: "absolute", inset: 0, m: "auto", color: "#fff", fontSize: "20px !important" }}>check_circle</Icon>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 11, color: on ? v("text") : v("text3"), mt: 0.5, fontWeight: on ? 600 : 400 }}>
                    {bg.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Mode */}
        <Box>
          <SectionTitle icon="contrast">Mode</SectionTitle>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.25}>
            {[
              [false, "Light", "light_mode", "#f7f8fa", "#ffffff"],
              [true, "Dark", "dark_mode", "#0c0e12", "#14171d"],
            ].map(([dark, label, icon, bg, card]) => {
              const on = darkMode === dark;
              return (
                <Box
                  key={label}
                  component="button"
                  type="button"
                  onClick={() => setDarkMode(dispatch, dark)}
                  aria-pressed={on}
                  sx={{
                    cursor: "pointer",
                    fontFamily: "inherit",
                    p: 1,
                    borderRadius: "12px",
                    border: "1px solid",
                    backgroundColor: v("surface"),
                    textAlign: "left",
                    ...selectedRing(on),
                  }}
                >
                  <Box sx={{ height: 52, borderRadius: "8px", backgroundColor: bg, p: 0.75, display: "flex", gap: 0.5 }}>
                    <Box sx={{ width: 14, borderRadius: "4px", background: `linear-gradient(180deg, ${v("brandFrom")}, ${v("brandTo")})` }} />
                    <Box flex={1} display="flex" flexDirection="column" gap={0.5}>
                      <Box sx={{ height: 10, borderRadius: "3px", backgroundColor: card }} />
                      <Box sx={{ flex: 1, borderRadius: "3px", backgroundColor: card }} />
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.75}>
                    <Icon sx={{ fontSize: "16px !important", color: v("text2") }}>{icon}</Icon>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: v("text") }}>{label}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box px={2.5} py={1.5} display="flex" gap={1} sx={{ borderTop: `1px solid ${v("border")}` }}>
        <Button variant="outlined" startIcon={<Icon>restart_alt</Icon>} onClick={reset} fullWidth>
          Reset
        </Button>
        <Button variant="contained" onClick={onClose} fullWidth>
          Done
        </Button>
      </Box>
    </Drawer>
  );
}

ThemePanel.propTypes = { open: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired };

export default ThemePanel;
