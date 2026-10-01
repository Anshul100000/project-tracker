import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { v } from "assets/theme/enterprise";
import MotionIcon from "components/MotionIcon";

const rowIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
`;

const ACTION_TONES = {
  default: { fg: "text2", bg: "hover" },
  accent: { fg: "accentText", bg: "accentSoft" },
  danger: { fg: "danger", bg: "dangerSoft" },
};

// Plain-text value for sorting and CSV export.
const plain = (col, row) => {
  const val = col.value ? col.value(row) : row[col.key];
  return val === null || val === undefined ? "" : val;
};

function compare(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

function toCsv(columns, rows) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const head = columns.map((c) => esc(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => esc(plain(c, r))).join(",")).join("\n");
  return `${head}\n${body}`;
}

/**
 * Upgraded data table.
 *
 * columns: [{ key, label, width, align, render(row), value(row), sortable=true, hideable=true }]
 * actions(row): [{ icon (motion icon name), label, tone, onClick }]
 * paginate: client-side pages (for pages that load everything); pass false when the page pages on the server.
 */
function DataGrid({ title, columns, rows, getRowId, loading, actions, paginate, emptyText, exportName, footer }) {
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [density, setDensity] = useState(() => {
    try {
      return localStorage.getItem("pt-grid-density") || "comfortable";
    } catch {
      return "comfortable";
    }
  });
  const [hidden, setHidden] = useState([]);
  const [colsAnchor, setColsAnchor] = useState(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [hoverRow, setHoverRow] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("pt-grid-density", density);
    } catch {
      // ignore
    }
  }, [density]);

  useEffect(() => setPage(0), [rows.length, sort, perPage]);
  useEffect(() => setSelected([]), [rows]);

  const visibleCols = columns.filter((c) => !hidden.includes(c.key));

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const out = [...rows].sort((a, b) => compare(plain(col, a), plain(col, b)));
    return sort.dir === "asc" ? out : out.reverse();
  }, [rows, sort, columns]);

  const pageCount = paginate ? Math.max(1, Math.ceil(sorted.length / perPage)) : 1;
  const shown = paginate ? sorted.slice(page * perPage, page * perPage + perPage) : sorted;

  const toggleSort = (key) =>
    setSort((s) => (s.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : { key: null, dir: "asc" }));

  const ids = shown.map(getRowId);
  const allChecked = ids.length > 0 && ids.every((id) => selected.includes(id));
  const someChecked = ids.some((id) => selected.includes(id));

  const exportCsv = () => {
    const chosen = selected.length ? sorted.filter((r) => selected.includes(getRowId(r))) : sorted;
    const blob = new Blob([toCsv(visibleCols, chosen)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pad = density === "compact" ? 1 : 1.75;

  return (
    <Box>
      {/* Toolbar */}
      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        gap={1}
        px={2}
        py={1.5}
        sx={{ borderBottom: `1px solid ${v("border")}`, backgroundColor: v("surface") }}
      >
        <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={180}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "9px",
              display: "grid",
              placeItems: "center",
              backgroundColor: v("accentSoft"),
              color: v("accentText"),
            }}
          >
            <MotionIcon name="layers" size={18} loop={5000} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: v("text"), lineHeight: 1.2 }}>{title}</Typography>
            <Typography sx={{ fontSize: 12, color: v("text3") }}>
              {loading ? "Loading…" : `${rows.length.toLocaleString()} record${rows.length === 1 ? "" : "s"}`}
              {selected.length > 0 && ` · ${selected.length} selected`}
            </Typography>
          </Box>
        </Box>

        <ToggleButtonGroup exclusive size="small" value={density} onChange={(_, d) => d && setDensity(d)} aria-label="Row density">
          <Tooltip title="Comfortable rows">
            <ToggleButton value="comfortable" aria-label="Comfortable">
              <Icon sx={{ fontSize: "18px !important" }}>density_medium</Icon>
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Compact rows">
            <ToggleButton value="compact" aria-label="Compact">
              <Icon sx={{ fontSize: "18px !important" }}>density_small</Icon>
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <Box
          component="button"
          type="button"
          onClick={(e) => setColsAnchor(e.currentTarget)}
          sx={toolbarBtn}
        >
          <MotionIcon name="sliders-horizontal" size={16} />
          Columns
        </Box>
        <Menu anchorEl={colsAnchor} open={Boolean(colsAnchor)} onClose={() => setColsAnchor(null)}>
          {columns
            .filter((c) => c.hideable !== false)
            .map((c) => (
              <MenuItem
                key={c.key}
                onClick={() => setHidden((h) => (h.includes(c.key) ? h.filter((k) => k !== c.key) : [...h, c.key]))}
                sx={{ gap: 1 }}
              >
                <Checkbox size="small" checked={!hidden.includes(c.key)} sx={{ p: 0 }} />
                {c.label}
              </MenuItem>
            ))}
        </Menu>

        <Box component="button" type="button" onClick={exportCsv} disabled={!rows.length} sx={toolbarBtn}>
          <MotionIcon name="download" size={16} />
          {selected.length ? "Export selected" : "Export CSV"}
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: "auto", maxHeight: 640, overflowY: "auto" }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 760 }}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{ ...th, width: 44, pl: 2 }}>
                <Checkbox
                  size="small"
                  checked={allChecked}
                  indeterminate={!allChecked && someChecked}
                  onChange={() => setSelected(allChecked ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])])}
                  inputProps={{ "aria-label": "Select all rows" }}
                  sx={{ p: 0.5 }}
                />
              </Box>
              {visibleCols.map((c) => {
                const active = sort.key === c.key;
                const sortable = c.sortable !== false;
                return (
                  <Box
                    component="th"
                    key={c.key}
                    onClick={sortable ? () => toggleSort(c.key) : undefined}
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    sx={{
                      ...th,
                      width: c.width,
                      textAlign: c.align || "left",
                      cursor: sortable ? "pointer" : "default",
                      color: active ? v("text") : v("text2"),
                      "&:hover .sort-ico": { opacity: 1 },
                    }}
                  >
                    <Box display="inline-flex" alignItems="center" gap={0.5}>
                      {c.label}
                      {sortable && (
                        <Icon
                          className="sort-ico"
                          sx={{
                            fontSize: "16px !important",
                            opacity: active ? 1 : 0,
                            color: active ? v("accentText") : v("text3"),
                            transform: active && sort.dir === "desc" ? "rotate(180deg)" : "none",
                            transition: "transform .25s cubic-bezier(0.34,1.56,0.64,1), opacity .15s",
                          }}
                        >
                          arrow_upward
                        </Icon>
                      )}
                    </Box>
                  </Box>
                );
              })}
              {actions && <Box component="th" sx={{ ...th, ...stickyRight, zIndex: 2, textAlign: "right", pr: 2.5, width: 130 }}>Actions</Box>}
            </Box>
          </Box>

          <Box component="tbody">
            {loading &&
              [...Array(6)].map((_, i) => (
                <Box component="tr" key={`sk-${i}`}>
                  <Box component="td" sx={{ ...td(pad), pl: 2 }}>
                    <Skeleton variant="rounded" width={18} height={18} />
                  </Box>
                  {visibleCols.map((c) => (
                    <Box component="td" key={c.key} sx={td(pad)}>
                      <Skeleton width={`${50 + ((i * 17 + c.key.length * 7) % 40)}%`} />
                    </Box>
                  ))}
                  {actions && <Box component="td" sx={td(pad)} />}
                </Box>
              ))}

            {!loading && shown.length === 0 && (
              <Box component="tr">
                <Box component="td" colSpan={visibleCols.length + (actions ? 2 : 1)} sx={{ py: 8, textAlign: "center" }}>
                  <Box sx={{ color: v("text3"), display: "inline-grid", placeItems: "center", gap: 1 }}>
                    <MotionIcon name="search" size={36} loop={3000} />
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: v("text2") }}>{emptyText}</Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {!loading &&
              shown.map((row, i) => {
                const id = getRowId(row);
                const isSel = selected.includes(id);
                const hovered = hoverRow === id;
                return (
                  <Box
                    component="tr"
                    key={id}
                    onMouseEnter={() => setHoverRow(id)}
                    onMouseLeave={() => setHoverRow(null)}
                    sx={{
                      animation: `${rowIn} .35s ease ${Math.min(i, 15) * 0.025}s both`,
                      backgroundColor: isSel ? v("accentSoft") : i % 2 ? v("surface2") : v("surface"),
                      transition: "background-color .12s",
                      "&:hover": { backgroundColor: isSel ? v("accentSoft") : v("hover") },
                      "&:hover td:first-of-type": { boxShadow: `inset 3px 0 0 ${v("accent")}` },
                      "&:hover .row-actions": { opacity: 1, transform: "none" },
                      "@media (prefers-reduced-motion: reduce)": { animation: "none" },
                    }}
                  >
                    <Box component="td" sx={{ ...td(pad), pl: 2, transition: "box-shadow .15s" }}>
                      <Checkbox
                        size="small"
                        checked={isSel}
                        onChange={() => setSelected((s) => (isSel ? s.filter((x) => x !== id) : [...s, id]))}
                        inputProps={{ "aria-label": "Select row" }}
                        sx={{ p: 0.5 }}
                      />
                    </Box>
                    {visibleCols.map((c) => (
                      <Box component="td" key={c.key} sx={{ ...td(pad), textAlign: c.align || "left" }}>
                        {c.render ? (
                          c.render(row)
                        ) : (
                          <Box
                            title={String(plain(c, row))}
                            sx={{ maxWidth: c.maxWidth || 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: v("text2") }}
                          >
                            {plain(c, row) || "—"}
                          </Box>
                        )}
                      </Box>
                    ))}
                    {actions && (
                      <Box component="td" sx={{ ...td(pad), ...stickyRight, backgroundColor: "inherit", textAlign: "right", pr: 2 }}>
                        <Box
                          className="row-actions"
                          display="inline-flex"
                          gap={0.25}
                          sx={{
                            opacity: { xs: 1, md: 0.55 },
                            transform: { md: "translateX(4px)" },
                            transition: "opacity .15s, transform .15s",
                          }}
                        >
                          {actions(row).map((a) => {
                            const t = ACTION_TONES[a.tone] || ACTION_TONES.default;
                            return (
                              <Tooltip key={a.label} title={a.label}>
                                <IconButton
                                  size="small"
                                  aria-label={a.label}
                                  onClick={a.onClick}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    color: v(t.fg),
                                    "&:hover": { backgroundColor: v(t.bg) },
                                  }}
                                >
                                  <MotionIcon name={a.icon} size={17} play={hovered && a.tone === "accent"} />
                                </IconButton>
                              </Tooltip>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </Box>
                );
              })}
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      {(paginate || footer) && (
        <Box
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="space-between"
          gap={1.5}
          px={2}
          py={1.25}
          sx={{ borderTop: `1px solid ${v("border")}`, backgroundColor: v("surface") }}
        >
          {paginate ? (
            <>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography sx={{ fontSize: 13, color: v("text3") }}>Rows per page</Typography>
                <Select size="small" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} sx={{ height: 32, fontSize: 13 }}>
                  {[10, 25, 50, 100].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography sx={{ fontSize: 13, color: v("text2"), mr: 1 }}>
                  {sorted.length ? `${page * perPage + 1}–${Math.min(sorted.length, (page + 1) * perPage)} of ${sorted.length}` : "0 of 0"}
                </Typography>
                <IconButton size="small" aria-label="Previous page" disabled={page === 0} onClick={() => setPage((p) => p - 1)} sx={pagerBtn}>
                  <MotionIcon name="chevron-left" size={16} />
                </IconButton>
                {[...Array(pageCount)].slice(0, 7).map((_, n) => (
                  <Box
                    // eslint-disable-next-line react/no-array-index-key
                    key={n}
                    component="button"
                    type="button"
                    onClick={() => setPage(n)}
                    sx={{
                      ...pagerBtn,
                      minWidth: 32,
                      border: 0,
                      fontFamily: "inherit",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: n === page ? v("accent") : "transparent",
                      color: n === page ? "#fff" : v("text2"),
                      "&:hover": { backgroundColor: n === page ? v("accentHover") : v("hover") },
                    }}
                  >
                    {n + 1}
                  </Box>
                ))}
                <IconButton size="small" aria-label="Next page" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)} sx={pagerBtn}>
                  <MotionIcon name="chevron-right" size={16} />
                </IconButton>
              </Box>
            </>
          ) : (
            footer
          )}
        </Box>
      )}
    </Box>
  );
}

const th = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  backgroundColor: v("surface2"),
  borderBottom: `1px solid ${v("border")}`,
  px: 1.5,
  py: 1.25,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
  userSelect: "none",
  textAlign: "left",
};

const td = (py) => ({
  px: 1.5,
  py,
  fontSize: 14,
  color: v("text"),
  borderBottom: `1px solid ${v("border")}`,
  verticalAlign: "middle",
});

const toolbarBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  height: 34,
  px: 1.25,
  borderRadius: "8px",
  border: `1px solid ${v("borderStrong")}`,
  backgroundColor: v("surface"),
  color: v("text"),
  fontFamily: "inherit",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  transition: "background-color .15s",
  "&:hover": { backgroundColor: v("hover") },
  "&:disabled": { opacity: 0.5, cursor: "default" },
};

// Keeps row actions visible when the table scrolls sideways.
const stickyRight = {
  position: "sticky",
  right: 0,
  boxShadow: `-8px 0 12px -10px rgba(16,24,40,0.25)`,
};

const pagerBtn = { width: 32, height: 32, borderRadius: "8px" };

DataGrid.defaultProps = {
  title: "Records",
  loading: false,
  actions: null,
  paginate: true,
  emptyText: "No records found",
  exportName: "export",
  footer: null,
  getRowId: (r) => r.id,
};

DataGrid.propTypes = {
  title: PropTypes.string,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      align: PropTypes.oneOf(["left", "center", "right"]),
      render: PropTypes.func,
      value: PropTypes.func,
      sortable: PropTypes.bool,
      hideable: PropTypes.bool,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  getRowId: PropTypes.func,
  loading: PropTypes.bool,
  actions: PropTypes.func,
  paginate: PropTypes.bool,
  emptyText: PropTypes.string,
  exportName: PropTypes.string,
  footer: PropTypes.node,
};

// ---- Reusable cell renderers -------------------------------------------------

export function PersonCell({ name, sub, hue }) {
  const initials =
    String(name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "?";
  return (
    <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          fontSize: 13,
          fontWeight: 600,
          backgroundColor: v(`${hue}Soft`),
          color: v(`${hue}Ink`),
          boxShadow: `0 0 0 2px ${v("surface")}, 0 0 0 3px ${v(`${hue}Soft`)}`,
        }}
      >
        {initials}
      </Box>
      <Box minWidth={0} maxWidth={340}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: v("text"), lineHeight: 1.3 }} noWrap>
          {name}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: 12, color: v("text3") }} noWrap>
            {sub}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

PersonCell.defaultProps = { sub: null, hue: "blue" };
PersonCell.propTypes = { name: PropTypes.node.isRequired, sub: PropTypes.node, hue: PropTypes.string };

export function IconCell({ icon, title, sub, hue }) {
  return (
    <Box display="flex" alignItems="center" gap={1.25} minWidth={0}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          backgroundColor: v(`${hue}Soft`),
          color: v(`${hue}Ink`),
        }}
      >
        <Icon sx={{ fontSize: "19px !important" }}>{icon}</Icon>
      </Box>
      <Box minWidth={0} maxWidth={340}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: v("text"), lineHeight: 1.3 }} noWrap>
          {title}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: 12, color: v("text3") }} noWrap>
            {sub}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

IconCell.defaultProps = { sub: null, hue: "blue" };
IconCell.propTypes = { icon: PropTypes.string.isRequired, title: PropTypes.node.isRequired, sub: PropTypes.node, hue: PropTypes.string };

export function TagCell({ label, hue }) {
  if (!label || label === "-") return <Typography sx={{ fontSize: 13, color: v("text3") }}>—</Typography>;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1,
        py: 0.35,
        borderRadius: "6px",
        fontSize: 12,
        fontWeight: 500,
        maxWidth: "100%",
        backgroundColor: v(`${hue}Soft`),
        color: v(`${hue}Ink`),
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: "2px", backgroundColor: v(hue), flexShrink: 0 }} />
      {label}
    </Box>
  );
}

TagCell.defaultProps = { label: null, hue: "blue" };
TagCell.propTypes = { label: PropTypes.node, hue: PropTypes.string };

export function ProgressCell({ value }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const color = pct >= 75 ? "#17b26a" : pct >= 40 ? "#f79009" : "#f04438";
  return (
    <Box display="flex" alignItems="center" gap={1} minWidth={110}>
      <Box flex={1} height={6} sx={{ borderRadius: 3, backgroundColor: v("hover"), overflow: "hidden" }}>
        <Box height="100%" sx={{ width: `${pct}%`, backgroundColor: color, borderRadius: 3, transition: "width .6s ease" }} />
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: v("text"), minWidth: 34, textAlign: "right" }}>{pct}%</Typography>
    </Box>
  );
}

ProgressCell.propTypes = { value: PropTypes.number.isRequired };

export function DateCell({ value }) {
  if (!value || value === "-") return <Typography sx={{ fontSize: 13, color: v("text3") }}>—</Typography>;
  return (
    <Box display="inline-flex" alignItems="center" gap={0.75} sx={{ color: v("text2"), fontSize: 13, whiteSpace: "nowrap" }}>
      <Icon sx={{ fontSize: "15px !important", color: v("text3") }}>event</Icon>
      {value}
    </Box>
  );
}

DateCell.defaultProps = { value: null };
DateCell.propTypes = { value: PropTypes.node };

export default DataGrid;
