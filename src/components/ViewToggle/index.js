import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Icon from "@mui/material/Icon";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";

// Cards/table preference, remembered per page. Cards are the default.
export function useViewMode(pageKey) {
  const storageKey = `pt-view-${pageKey}`;
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || "cards";
    } catch {
      return "cards";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, view);
    } catch {
      // storage blocked: preference just won't persist
    }
  }, [storageKey, view]);
  return [view, setView];
}

function ViewToggle({ value, onChange }) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, v) => v && onChange(v)}
      aria-label="Layout"
      sx={{ height: 38 }}
    >
      <ToggleButton value="cards" aria-label="Card view" sx={{ gap: 0.75, px: 1.25 }}>
        <Tooltip title="Card view">
          <Icon sx={{ fontSize: "18px !important" }}>grid_view</Icon>
        </Tooltip>
        <span className="pt-view-label">Cards</span>
      </ToggleButton>
      <ToggleButton value="table" aria-label="Table view" sx={{ gap: 0.75, px: 1.25 }}>
        <Tooltip title="Table view">
          <Icon sx={{ fontSize: "18px !important" }}>table_rows</Icon>
        </Tooltip>
        <span className="pt-view-label">Table</span>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

ViewToggle.propTypes = {
  value: PropTypes.oneOf(["cards", "table"]).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ViewToggle;
