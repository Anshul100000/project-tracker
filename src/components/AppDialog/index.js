import PropTypes from "prop-types";
import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { HUES, v } from "assets/theme/enterprise";
import MotionIcon from "components/MotionIcon";

const ring = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(240, 68, 56, 0.35); }
  70%  { box-shadow: 0 0 0 12px rgba(240, 68, 56, 0); }
  100% { box-shadow: 0 0 0 0 rgba(240, 68, 56, 0); }
`;
const noMotion = { "@media (prefers-reduced-motion: reduce)": { animation: "none" } };

/**
 * Consistent dialog header: coloured icon tile, title, subtitle and a close button.
 * `icon` is an animated icon name (components/MotionIcon) or a Material icon via `materialIcon`.
 */
export function DialogHeader({ title, subtitle, icon, materialIcon, hue, onClose, disabled }) {
  return (
    <Box
      px={3}
      pt={2.5}
      pb={2}
      display="flex"
      alignItems="center"
      gap={1.75}
      sx={{
        position: "relative",
        borderBottom: `1px solid ${v("border")}`,
        backgroundImage: `radial-gradient(120% 140% at 0% 0%, ${v(`${hue}Soft`)} 0%, transparent 55%)`,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          color: "#fff",
          backgroundColor: v(hue),
          boxShadow: `0 8px 16px -8px ${v(hue)}`,
        }}
      >
        {icon ? <MotionIcon name={icon} size={22} loop={4500} loopDelay={350} /> : <Icon sx={{ fontSize: "22px !important" }}>{materialIcon}</Icon>}
      </Box>
      <Box flex={1} minWidth={0}>
        <Typography component="h2" sx={{ fontSize: 17, fontWeight: 600, color: v("text"), lineHeight: 1.3 }}>
          {title}
        </Typography>
        {subtitle && <Typography sx={{ fontSize: 13, color: v("text3"), mt: 0.25 }}>{subtitle}</Typography>}
      </Box>
      {onClose && (
        <Tooltip title="Close">
          <span>
            <IconButton
              aria-label="Close dialog"
              onClick={onClose}
              disabled={disabled}
              sx={{
                width: 34,
                height: 34,
                color: v("text3"),
                "& .MuiIcon-root": { transition: "transform .25s cubic-bezier(0.34,1.56,0.64,1)" },
                "&:hover": { backgroundColor: v("hover"), color: v("text") },
                "&:hover .MuiIcon-root": { transform: "rotate(90deg)" },
              }}
            >
              <Icon sx={{ fontSize: "20px !important" }}>close</Icon>
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}

DialogHeader.defaultProps = { subtitle: null, icon: null, materialIcon: "edit_note", hue: "blue", onClose: null, disabled: false };
DialogHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  icon: PropTypes.string,
  materialIcon: PropTypes.string,
  hue: PropTypes.oneOf(HUES),
  onClose: PropTypes.func,
  disabled: PropTypes.bool,
};

/** Small section label used to group fields inside form dialogs. */
export function FieldGroup({ icon, title, children }) {
  return (
    <Box mb={children ? 2.5 : 0}>
      <Box display="flex" alignItems="center" gap={0.75} mb={children ? 1.5 : 0}>
        {icon && <Icon sx={{ fontSize: "16px !important", color: v("accentText") }}>{icon}</Icon>}
        <Typography sx={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: v("text2") }}>
          {title}
        </Typography>
        <Box flex={1} ml={1} sx={{ borderTop: `1px dashed ${v("border")}` }} />
      </Box>
      {children}
    </Box>
  );
}

FieldGroup.defaultProps = { icon: null, children: null };
FieldGroup.propTypes = { icon: PropTypes.string, title: PropTypes.string.isRequired, children: PropTypes.node };

/** Destructive-action confirmation used by every delete flow. */
export function ConfirmDialog({ open, title, itemName, itemKind, message, confirmLabel, busy, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogContent sx={{ pt: "28px !important", pb: 1, textAlign: "center" }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            mx: "auto",
            mb: 2,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: v("danger"),
            backgroundColor: v("dangerSoft"),
            border: `6px solid color-mix(in srgb, ${v("dangerSoft")} 50%, transparent)`,
            animation: `${ring} 1.8s ease-out infinite`,
            ...noMotion,
          }}
        >
          <MotionIcon name="delete" size={26} loop={2600} loopDelay={500} />
        </Box>
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: v("text") }}>{title}</Typography>
        <Typography sx={{ fontSize: 14, color: v("text2"), mt: 1, lineHeight: 1.6 }}>
          {message || (
            <>
              You&apos;re about to delete {itemKind} <br />
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  mt: 1,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: "8px",
                  fontWeight: 600,
                  color: v("text"),
                  backgroundColor: v("surface2"),
                  border: `1px solid ${v("border")}`,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  verticalAlign: "bottom",
                }}
              >
                {itemName || `this ${itemKind}`}
              </Box>
            </>
          )}
        </Typography>
        <Box
          display="inline-flex"
          alignItems="center"
          gap={0.75}
          mt={2}
          px={1.25}
          py={0.5}
          sx={{ borderRadius: "8px", backgroundColor: v("warningSoft"), color: v("warning"), fontSize: 12.5, fontWeight: 500 }}
        >
          <Icon sx={{ fontSize: "16px !important" }}>info</Icon>
          This action can&apos;t be undone.
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "stretch", "& > *": { flex: 1 } }}>
        <Button variant="outlined" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <Icon>delete</Icon>}
        >
          {busy ? "Deleting…" : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmDialog.defaultProps = { itemName: null, itemKind: "item", message: null, confirmLabel: "Delete", busy: false };
ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.node.isRequired,
  itemName: PropTypes.node,
  itemKind: PropTypes.string,
  message: PropTypes.node,
  confirmLabel: PropTypes.string,
  busy: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
