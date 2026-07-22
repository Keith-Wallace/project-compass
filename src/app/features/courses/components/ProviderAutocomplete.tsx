// ProviderAutocomplete.jsx
// Searchable provider select with auto-display of provider details.
// Props:
//   value        – selected provider object or null
//   onChange     – (providerObj | null) => void

/*
  06-22-26
  =========
  TODO: add "OTHER" option for adding a provider that is not listed: address, NASBA ID, website, etc
  TODO: Invetigate on how to handle old/legacy provider/s - ie old course records w/ old/legacy providers <> updated db table data
*/

import { useState, useEffect, useRef } from "react";
import { supabase } from '../../../supabase/supabase'

export default function ProviderAutocomplete({ value, onChange }) {
  const [query, setQuery]       = useState(value?.name ?? "");
  const [results, setResults]   = useState([]);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const containerRef            = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
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

  const search = async (text) => {
    if (!text.trim()) {
      setResults([]);
      setOpen(false);
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
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setResults([]);
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
          onFocus={() => query && !value && setOpen(results.length > 0)}
          autoComplete="off"
          aria-label="Provider name"
          aria-expanded={open}
          aria-haspopup="listbox"
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
            results.map((p) => (
              <li
                key={p.id}
                className="pac-option"
                role="option"
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
