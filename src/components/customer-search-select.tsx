"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const controlled = value !== undefined;
  const [internalId, setInternalId] = useState(defaultValue);
  const selectedId = controlled ? value : internalId;

  const selected = customers.find((c) => c.id === selectedId) || null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => matches(c, q));
  }, [customers, query]);

  function select(id: string) {
    if (!controlled) setInternalId(id);
    onChange?.(id);
    setQuery("");
    setOpen(false);
  }

  function clear() {
    if (!controlled) setInternalId("");
    onChange?.("");
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={selectedId} />

      {selected && !open ? (
        <div className="input flex items-center gap-2 py-0 pr-1">
          <button
            type="button"
            id={inputId}
            onClick={() => {
              setOpen(true);
              setQuery("");
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2.5 text-left"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="truncate">
              {labelOf(selected)}
            </span>
            <ChevronsUpDown
              className="h-4 w-4 shrink-0 text-[var(--muted)]"
              strokeWidth={2}
            />
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded-md p-2 text-[var(--muted)] hover:bg-[#f3ebe3] hover:text-slate-800"
            aria-label="Quitar cliente"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#7a6a5c]"
            strokeWidth={2.25}
          />
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setQuery("");
              }
              if (e.key === "Enter" && filtered.length === 1) {
                e.preventDefault();
                select(filtered[0].id);
              }
            }}
            className="input pl-10"
            placeholder={
              selected ? labelOf(selected) : placeholder
            }
          />
        </div>
      )}

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[var(--border)] bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-[var(--muted)]">
              Sin coincidencias
            </li>
          ) : (
            filtered.map((c) => (
              <li key={c.id} role="option" aria-selected={c.id === selectedId}>
                <button
                  type="button"
                  onClick={() => select(c.id)}
                  className={`flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-[#fbf7f2] ${
                    c.id === selectedId ? "bg-[#f3ebe3]" : ""
                  }`}
                >
                  <span className="font-medium text-slate-800">{c.name}</span>
                  {c.taxId ? (
                    <span className="text-xs text-[var(--muted)]">
                      {c.taxId}
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {required && !selectedId ? (
        // Native form validation fallback for browsers that ignore hidden required
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
