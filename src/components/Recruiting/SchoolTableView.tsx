"use client";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import type { School } from "@/context/AppContext";
import StatusBadge from "@/components/Common/StatusBadge";

type Column = "school" | "division" | "status" | "coach" | "lastContact" | "response" | "notes";
type SortDir = "asc" | "desc";

const COLUMNS: { key: Column; label: string; minWidth: number; fsWidth?: number | string }[] = [
  { key: "school",      label: "School",       minWidth: 140, fsWidth: 220 },
  { key: "division",    label: "Division",     minWidth: 80,  fsWidth: 100 },
  { key: "status",      label: "Status",       minWidth: 100, fsWidth: 120 },
  { key: "coach",       label: "Coach",        minWidth: 120, fsWidth: 160 },
  { key: "lastContact", label: "Last contact", minWidth: 100, fsWidth: 120 },
  { key: "response",    label: "Response",     minWidth: 80,  fsWidth: 90  },
  { key: "notes",       label: "Notes",        minWidth: 160, fsWidth: undefined },
];

const STATUS_ORDER: Record<string, number> = {
  Committed: 5, Offered: 4, Visited: 3, Contacted: 2, Interested: 1, Declined: 0,
};

const STATUS_OPTIONS = ["Interested", "Contacted", "Visited", "Offered", "Committed", "Declined"];

function getFieldKey(col: Column): keyof School | null {
  if (col === "school")      return "name";
  if (col === "division")    return "division";
  if (col === "status")      return "status";
  if (col === "coach")       return "coach";
  if (col === "lastContact") return "lastContact";
  if (col === "notes")       return "notes";
  return null;
}

function getCellValue(school: School, col: Column): string {
  if (col === "school")      return school.name;
  if (col === "division")    return school.division;
  if (col === "status")      return school.status;
  if (col === "coach")       return school.coach || "—";
  if (col === "lastContact") return school.lastContact;
  if (col === "notes")       return school.notes;
  return "";
}

// ── Inline cell ───────────────────────────────────────────────────

interface CellProps {
  school: School;
  col: Column;
  isEditing: boolean;
  editValue: string;
  onEditValue: (v: string) => void;
  onStartEdit: () => void;
  onCommit: () => void;
  onCancel: () => void;
  isFirst?: boolean;
}

function EditableCell({ school, col, isEditing, editValue, onEditValue, onStartEdit, onCommit, onCancel, isFirst }: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing) {
      if (col === "status") {
        selectRef.current?.focus();
      } else {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
  }, [isEditing, col]);

  const cellPad: React.CSSProperties = { padding: "10px 12px" };
  const inputStyle: React.CSSProperties = {
    border: "1px solid #1A6B3C", borderRadius: 4,
    padding: "2px 6px", fontFamily: "inherit",
    fontSize: col === "school" ? 13 : 12,
    fontWeight: col === "school" ? 600 : 400,
    width: "100%", outline: "none",
  };
  const stopClick = (e: React.MouseEvent) => e.stopPropagation();
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onCommit();
    if (e.key === "Escape") onCancel();
  };

  if (isEditing && col === "status") {
    return (
      <td style={cellPad}>
        <select
          ref={selectRef}
          value={editValue}
          onChange={e => onEditValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onCommit}
          onClick={stopClick}
          style={{ ...inputStyle, padding: "3px 6px" }}
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
    );
  }

  if (isEditing && col !== "response") {
    return (
      <td style={cellPad}>
        <input
          ref={inputRef}
          value={editValue}
          onChange={e => onEditValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onCommit}
          onClick={stopClick}
          style={inputStyle}
        />
      </td>
    );
  }

  if (col === "school") {
    return (
      <td style={cellPad} onDoubleClick={onStartEdit}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6, background: "#f0f0f0", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 700, color: "#555",
          }}>
            {school.abbr.slice(0, 4)}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111", whiteSpace: "nowrap" }}>
            {school.name}
          </span>
        </div>
      </td>
    );
  }

  if (col === "status") {
    return (
      <td style={cellPad} onDoubleClick={onStartEdit}>
        <StatusBadge status={school.status} />
      </td>
    );
  }

  if (col === "response") {
    const has = STATUS_ORDER[school.status] >= 3; // Visited or above
    return (
      <td style={{ ...cellPad, textAlign: "center", fontSize: 13, color: has ? "#1A6B3C" : "#bbb" }}>
        {has ? "✓" : "—"}
      </td>
    );
  }

  // All other text columns
  const val = getCellValue(school, col);
  const isNotes = col === "notes";
  return (
    <td
      style={cellPad}
      onDoubleClick={onStartEdit}
      title={isNotes ? school.notes : undefined}
    >
      <span style={{
        fontSize: 12, color: val === "—" ? "#bbb" : "#555",
        display: isNotes ? "block" : undefined,
        overflow: isNotes ? "hidden" : undefined,
        textOverflow: isNotes ? "ellipsis" : undefined,
        whiteSpace: isNotes ? "nowrap" : undefined,
        maxWidth: isNotes ? 200 : undefined,
      }}>
        {val}
      </span>
    </td>
  );
}

// ── Main table ────────────────────────────────────────────────────

export default function SchoolTableView({ fullscreen }: { fullscreen?: boolean } = {}) {
  const { schools, selectedSchoolId, selectSchool, updateSchool } = useApp();
  const [sortCol, setSortCol] = useState<Column>("status");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editing, setEditing] = useState<{ schoolId: string; col: Column } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const sorted = [...schools].sort((a, b) => {
    let cmp = 0;
    if (sortCol === "status") {
      cmp = (STATUS_ORDER[b.status] ?? 0) - (STATUS_ORDER[a.status] ?? 0);
    } else if (sortCol === "school") {
      cmp = a.name.localeCompare(b.name);
    } else if (sortCol === "division") {
      cmp = a.division.localeCompare(b.division);
    } else if (sortCol === "coach") {
      cmp = (a.coach || "—").localeCompare(b.coach || "—");
    } else if (sortCol === "lastContact") {
      cmp = a.lastContact.localeCompare(b.lastContact);
    } else if (sortCol === "response") {
      cmp = (STATUS_ORDER[b.status] >= 3 ? 1 : 0) - (STATUS_ORDER[a.status] >= 3 ? 1 : 0);
    } else if (sortCol === "notes") {
      cmp = a.notes.localeCompare(b.notes);
    }
    // Status default is desc; others default asc
    return sortDir === "asc" ? -cmp : cmp;
  });

  const handleSort = (col: Column) => {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir(col === "status" ? "desc" : "asc");
    }
  };

  const startEdit = (schoolId: string, col: Column) => {
    if (col === "response") return;
    const school = schools.find(s => s.id === schoolId);
    if (!school) return;
    setEditing({ schoolId, col });
    setEditValue(getCellValue(school, col));
  };

  const commitEdit = () => {
    if (!editing) return;
    const field = getFieldKey(editing.col);
    if (field) updateSchool(editing.schoolId, { [field]: editValue });
    setEditing(null);
  };

  const cancelEdit = () => setEditing(null);

  const handleExport = () => {
    const headers = ["School", "Division", "Status", "Coach", "Last Contact", "Response", "Notes"];
    const rows = schools.map(s => [
      s.name, s.division, s.status,
      s.coach || "—", s.lastContact,
      STATUS_ORDER[s.status] >= 3 ? "Yes" : "No",
      s.notes,
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scoutly-recruiting-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto", maxHeight: fullscreen ? undefined : 400, overflowY: fullscreen ? undefined : "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafaf8", borderBottom: "1px solid #e8e8e8" }}>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    minWidth: fullscreen && col.fsWidth ? col.fsWidth : col.minWidth,
                    width: fullscreen && col.key === "notes" ? undefined : undefined,
                    padding: "8px 12px",
                    fontSize: 11, fontWeight: 700,
                    color: sortCol === col.key ? "#1A6B3C" : "#999",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    textAlign: "left",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                    borderBottom: "none",
                  }}
                >
                  {col.label}
                  {sortCol === col.key && (
                    <span style={{ marginLeft: 4, fontSize: 10 }}>
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(school => {
              const isSelected = selectedSchoolId === school.id;
              const isHovered = hoveredRow === school.id;
              return (
                <tr
                  key={school.id}
                  onClick={() => selectSchool(school.id)}
                  onMouseEnter={() => setHoveredRow(school.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    borderBottom: "1px solid #f5f5f5",
                    background: isSelected ? "#E8F5EE" : isHovered ? "#fafaf8" : "#fff",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                >
                  {COLUMNS.map(col => (
                    <EditableCell
                      key={col.key}
                      school={school}
                      col={col.key}
                      isEditing={editing?.schoolId === school.id && editing?.col === col.key}
                      editValue={editValue}
                      onEditValue={setEditValue}
                      onStartEdit={() => startEdit(school.id, col.key)}
                      onCommit={commitEdit}
                      onCancel={cancelEdit}
                    />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f5f5f5" }}>
        <span style={{ fontSize: 11, color: "#999", fontStyle: "italic" }}>
          Double-click any cell to edit
        </span>
        <button
          onClick={handleExport}
          style={{
            border: "1px solid #ddd", borderRadius: 20,
            padding: "5px 12px", fontSize: 11, fontWeight: 600,
            color: "#555", background: "none", cursor: "pointer",
          }}
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}
