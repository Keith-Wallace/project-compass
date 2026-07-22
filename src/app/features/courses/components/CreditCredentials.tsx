/**
 * CredentialFocusSelect
 *
 * Multi-select for assigning a course_category_credits row (a subject /
 * field-of-study credit line) to one or more of the user's credentials.
 *
 * Per BRR-XXX:
 * - Defaults to ALL active user_credentials selected when a row is created.
 * - Optional — empty selection is a valid, saved state.
 * - Existing (pre-feature) rows are NOT backfilled; they render unassigned
 *   until the user opens the row and this component's default-select-all
 *   logic runs on first touch, or the user explicitly picks values.
 *
 * NOTE: assumes user_credentials has a human-readable label field. Adjust
 * `label` below if the display name actually comes from a joined table
 * (e.g. credentials catalog) rather than living directly on user_credentials.
 */

import { useEffect, useState } from 'react';

export interface UserCredentialOption {
  id: string;
  label: string; // e.g. credential nickname or "CPA - New York"
}

interface CredentialFocusSelectProps {
  /** All active credentials available to select from. */
  availableCredentials: UserCredentialOption[];
  /**
   * Currently selected credential ids for this row.
   * Pass `null` to signal "not yet initialized" — the component will
   * default to all-selected and call onChange once to sync parent state.
   */
  selectedIds: string[] | null;
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

export default function CredentialFocusSelect({
  availableCredentials,
  selectedIds,
  onChange,
  disabled = false,
}: CredentialFocusSelectProps) {
  // Default-to-all-selected on first mount for a new/unassigned row.
  useEffect(() => {
    if (selectedIds === null && availableCredentials.length > 0) {
      onChange(availableCredentials.map((c) => c.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableCredentials.length]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
    onChange(values);
  };

  return (
    <select
      multiple
      className="credential-focus-select"
      value={selectedIds ?? []}
      onChange={handleChange}
      disabled={disabled}
      aria-label="Credential Focus"
    >
      {availableCredentials.map((credential) => (
        <option key={credential.id} value={credential.id}>
          {credential.label}
        </option>
      ))}
    </select>
  );
}
