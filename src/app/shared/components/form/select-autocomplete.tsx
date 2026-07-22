// SelectAutocomplete.jsx
// Searchable provider select with auto-display of provider details.
// Props:
//   value        – selected provider object or null
//   onChange     – (providerObj | null) => void

/*
  06-22-26
  =========
  TODO: add "OTHER" option for adding a provider that is not listed: address, NASBA ID, website, etc
  TODO: Invetigate on how to handle old/legacy provider/s - ie old course records w/ old/legacy providers <> updated db table data

  07-20-26
  =========
  Added keyboard navigation (arrow up/down to highlight, enter to select),
  matching the interaction pattern from the w3schools autocomplete reference.
*/

import { useState, useEffect, useRef } from "react";
import { supabase } from '../../../supabase/supabase'

import '../../styles/forms/select-autocomplete.css';


export default function SelectAutocomplete({ value, onChange }) {
  const [query, setQuery]                 = useState(value?.name ?? "");
  const [results, setResults]             = useState([]);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef                      = useRef(null);
  const optionRefs                        = useRef([]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync input if parent clears selection
  useEffect(() => {
    if (!value) setQuery("");
    else setQuery(value.name);
  }, [value]);

  // Keep the highlighted option scrolled into view as it changes
  useEffect(() => {
    if (highlightedIndex < 0) return;
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const search = async (text) => {
    if (!text.trim()) {
      setResults([]);
      setOpen(false);
      setHighlightedIndex(-1);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("providers")
      .select("id, name, address, website, registry_id, nasba_id")
      .ilike("name", `%${text}%`)
      .order("name")
      .limit(8);

    if (!error) setResults(data ?? []);
    setLoading(false);
    setOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInput = (e) => {
    const text = e.target.value;
    setQuery(text);
    if (value) onChange(null); // clear selection when user retypes
    search(text);
  };

  const handleSelect = (provider) => {
    onChange(provider);
    setQuery(provider.name);
    setResults([]);
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setResults([]);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!open || loading || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case "Enter":
        if (highlightedIndex > -1 && results[highlightedIndex]) {
          e.preventDefault();
          handleSelect(results[highlightedIndex]);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="provider-autocomplete" ref={containerRef}>
      {/* Search input */}
      <div className="pac-input-wrap">
        <input
          type="text"
          className="form-input field-input"
          placeholder="Search provider name..."
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => query && !value && setOpen(results.length > 0)}
          autoComplete="off"
          aria-label="Provider name"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-activedescendant={
            highlightedIndex > -1 && results[highlightedIndex]
              ? `pac-option-${results[highlightedIndex].id}`
              : undefined
          }
          role="combobox"
        />
        {value && (
          <button
            type="button"
            className="pac-clear-btn"
            onClick={handleClear}
            aria-label="Clear provider"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <ul className="pac-dropdown" role="listbox">
          {loading && (
            <li className="pac-option pac-option--meta">Searching…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="pac-option pac-option--meta">No providers found</li>
          )}
          {!loading &&
            results.map((p, index) => (
              <li
                key={p.id}
                id={`pac-option-${p.id}`}
                ref={(el) => (optionRefs.current[index] = el)}
                className={
                  "pac-option" +
                  (index === highlightedIndex ? " pac-option--active" : "")
                }
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={() => handleSelect(p)}
              >
                <span className="pac-option-name">{p.name}</span>
                {p.address && (
                  <span className="pac-option-meta">{p.address}</span>
                )}
              </li>
            ))}
        </ul>
      )}

      {/* Provider detail display panel */}
      {value && (
        <div className="provider-detail-panel">
          <div className="pdp-row">
            <span className="pdp-label">Address</span>
            <span className="pdp-value">{value.address || "—"}</span>
          </div>
          <div className="pdp-row">
            <span className="pdp-label">Website</span>
            <span className="pdp-value">
              {value.website ? (
                <a href={value.website} target="_blank" rel="noopener noreferrer">
                  {value.website}
                </a>
              ) : "—"}
            </span>
          </div>
          <div className="pdp-row">
            <span className="pdp-label">Registry ID</span>
            <span className="pdp-value">{value.registry_id || "—"}</span>
          </div>
          <div className="pdp-row">
            <span className="pdp-label">NASBA Number</span>
            <span className="pdp-value">{value.nasba_id || "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
