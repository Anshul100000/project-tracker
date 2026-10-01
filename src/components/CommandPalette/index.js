import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Icon from "@mui/material/Icon";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import { v } from "assets/theme/enterprise";

/**
 * Quick navigation dialog (Ctrl/⌘ + K).
 * items: [{ key, name, section, icon, hue, onSelect }]
 */
function CommandPalette({ open, onClose, items }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => `${i.name} ${i.section}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);
  useEffect(() => setActive(0), [query]);

  // Keep the highlighted row in view while arrowing.
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (item) => {
    if (!item) return;
    onClose();
    item.onSelect();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active]);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { mt: { xs: 6, sm: "12vh" }, alignSelf: "flex-start", overflow: "hidden" } }}
    >
      <Box display="flex" alignItems="center" gap={1.25} px={2} py={1.5} sx={{ borderBottom: `1px solid ${v("border")}` }}>
        <Icon sx={{ color: v("text3") }}>search</Icon>
        <InputBase
          autoFocus
          fullWidth
          placeholder="Search pages and actions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          inputProps={{ "aria-label": "Search pages" }}
          sx={{ fontSize: 15, "& input": { p: 0 } }}
        />
        <Box
          component="kbd"
          sx={{
            fontSize: 11,
            fontFamily: "inherit",
            px: 0.75,
            py: 0.25,
            borderRadius: "5px",
            border: `1px solid ${v("border")}`,
            color: v("text3"),
          }}
        >
          Esc
        </Box>
      </Box>

      <Box ref={listRef} role="listbox" maxHeight={360} overflow="auto" p={1}>
        {results.length === 0 && (
          <Typography sx={{ fontSize: 14, color: v("text3"), textAlign: "center", py: 4 }}>No matches</Typography>
        )}
        {results.map((item, idx) => (
          <Box
            key={item.key}
            data-idx={idx}
            role="option"
            aria-selected={idx === active}
            onMouseEnter={() => setActive(idx)}
            onClick={() => choose(item)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 1.25,
              py: 1,
              borderRadius: "10px",
              cursor: "pointer",
              backgroundColor: idx === active ? v("hover") : "transparent",
              transition: "background-color .1s",
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "9px",
                display: "grid",
                placeItems: "center",
                backgroundColor: v(`${item.hue}Soft`),
                color: v(`${item.hue}Ink`),
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: "18px !important" }}>{item.icon}</Icon>
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text") }}>{item.name}</Typography>
              <Typography sx={{ fontSize: 12, color: v("text3") }}>{item.section}</Typography>
            </Box>
            {idx === active && <Icon sx={{ fontSize: "18px !important", color: v("text3") }}>keyboard_return</Icon>}
          </Box>
        ))}
      </Box>

      <Box
        px={2}
        py={1}
        display="flex"
        gap={2}
        sx={{ borderTop: `1px solid ${v("border")}`, backgroundColor: v("surface2"), fontSize: 12, color: v("text3") }}
      >
        <span>↑↓ to navigate</span>
        <span>↵ to open</span>
      </Box>
    </Dialog>
  );
}

CommandPalette.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      name: PropTypes.string,
      section: PropTypes.string,
      icon: PropTypes.string,
      hue: PropTypes.string,
      onSelect: PropTypes.func,
    })
  ).isRequired,
};

export default CommandPalette;
