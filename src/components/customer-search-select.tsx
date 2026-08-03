"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronsUpDown, Search, X } from "lucide-react";

export type CustomerOption = {
  id: string;
  name: string;
  taxId?: string | null;
};

function labelOf(c: CustomerOption) {
  return c.taxId ? `${c.name} (${c.taxId})` : c.name;
}

function matches(c: CustomerOption, q: string) {
  const hay = `${c.name} ${c.taxId || ""}`.toLowerCase();
  return hay.includes(q);
}

type MenuPos = { top: number; left: number; width: number; openUp: boolean };

export function CustomerSearchSelect({
  customers,
  name = "customerId",
  id,
  defaultValue = "",
  value,
  onChange,
  required = false,
  placeholder = "Buscar cliente por nombre o RNC…",
}: {
  customers: CustomerOption[];
  name?: string;
  id?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (id: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const listId = `${inputId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const controlled = value !== undefined;
  const [internalId, setInternalId] = useState(defaultValue);
  const selectedId = controlled ? value : internalId;
  const selected = customers.find((c) => c.id === selectedId) || null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<MenuPos | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => matches(c, q));
  }, [customers, query]);

  function updatePos() {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const maxH = 224;
    const spaceBelow = window.innerHeight - r.bottom - 8;
    const openUp = spaceBelow < Math.min(maxH, 160) && r.top > spaceBelow;
    setPos({
      top: openUp ? r.top - 4 : r.bottom + 4,
      left: r.left,
      width: r.width,
      openUp,
    });
  }

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePos();
    function onWin() {
      updatePos();
    }
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, filtered.length, query]);

  function select(nextId: string) {
    if (!controlled) setInternalId(nextId);
    onChange?.(nextId);
    setQuery("");
    setOpen(false);
  }

  function clear() {
    if (!controlled) setInternalId("");
    onChange?.("");
    setQuery("");
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function openMenu() {
    setOpen(true);
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
      setQuery("");
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menu =
    mounted && open && pos
      ? createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: 224,
              transform: pos.openUp ? "translateY(-100%)" : undefined,
              zIndex: 80,
            }}
            className="overflow-auto rounded-lg border border-[var(--border)] bg-white py-1 shadow-xl"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-[var(--muted)]">
                Sin coincidencias
              </li>
            ) : (
              filtered.map((c) => (
                <li
                  key={c.id}
                  role="option"
                  aria-selected={c.id === selectedId}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(c.id)}
                    className={`flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-[#fbf7f2] ${
                      c.id === selectedId ? "bg-[#f3ebe3]" : ""
                    }`}
                  >
                    <span className="truncate font-medium text-slate-800">
                      {c.name}
                    </span>
                    {c.taxId ? (
                      <span className="truncate text-xs text-[var(--muted)]">
                        {c.taxId}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={selectedId} />

      <div ref={triggerRef} className="input flex items-center gap-1 py-0 pr-1 pl-0">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-[#7a6a5c]"
            strokeWidth={2.25}
          />
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            value={open ? query : selected ? labelOf(selected) : ""}
            readOnly={!open}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (!open) openMenu();
            }}
            onClick={() => {
              if (!open) openMenu();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && open && filtered.length === 1) {
                e.preventDefault();
                select(filtered[0].id);
              }
              if (e.key === "ArrowDown" && !open) {
                e.preventDefault();
                openMenu();
              }
            }}
            className="w-full border-0 bg-transparent py-2.5 pr-2 pl-10 text-sm outline-none"
            placeholder={placeholder}
          />
        </div>
        {selected ? (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 rounded-md p-2 text-[var(--muted)] hover:bg-[#f3ebe3] hover:text-slate-800"
            aria-label="Quitar cliente"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>
        ) : (
          <button
            type="button"
            onClick={openMenu}
            className="shrink-0 rounded-md p-2 text-[var(--muted)] hover:bg-[#f3ebe3]"
            aria-label="Abrir lista"
          >
            <ChevronsUpDown className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {menu}

      {required && !selectedId ? (
        <input
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          value=""
          required
          onChange={() => {}}
        />
      ) : null}
    </div>
  );
}
