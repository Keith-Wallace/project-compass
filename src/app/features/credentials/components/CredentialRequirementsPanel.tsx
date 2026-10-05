// src/app/features/credentials/components/CredentialRequirementsPanel.tsx
// Displays CPE requirements for a selected credential alongside the Add form.
// Shown after "Review Requirements" is clicked. Contains the Save button.

import { useId, type Ref } from 'react'
import type { CredentialWithOrg, RequirementRule } from '../api/credentials.queries'
import styles from '../styles/CredentialRequirementsPanel.module.css'

interface Props {
  credential: CredentialWithOrg
  rule: RequirementRule | null
  saving: boolean
  saveError: string | null
  onSave: () => void
  // Attached to the panel root so the page can move focus here after a review.
  panelRef?: Ref<HTMLDivElement>
}

// ---------------------------------------------------------------------------
// Small helper — only renders a row if the value is non-null
// ---------------------------------------------------------------------------

function RuleRow({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === undefined) return null
  return (
    <div className={styles.ruleRow}>
      <span className={styles.ruleLabel}>{label}</span>
      <span className={styles.ruleValue}>{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CredentialRequirementsPanel({
  credential,
  rule,
  saving,
  saveError,
  onSave,
  panelRef,
}: Props) {
  const headingId = useId()

  return (
    // tabIndex -1: focusable from script, but not a stop in the tab order.
    // role + aria-labelledby give the focused element a name to announce.
    <div
      ref={panelRef}
      className={styles.panel}
      role="region"
      aria-labelledby={headingId}
      tabIndex={-1}
    >

      {/* Credential identity */}
      <div className={styles.panelHeader}>
        <div className={styles.headerTop}>
          <span className={styles.abbr}>{credential.abbreviation}</span>
          <span className={styles.orgAbbr}>
            {credential.governing_authorities.abbreviation}
          </span>
        </div>
        <div className={styles.credName}>{credential.credential_name}</div>
        <div className={styles.orgName}>{credential.governing_authorities.governing_authority_name}</div>
      </div>

      {/* CPE Requirements */}
      <div className={styles.section}>
        <h3 id={headingId} className={styles.sectionTitle}>CPE Requirements</h3>

        {rule ? (
          <div className={styles.rules}>
            <RuleRow
              label="Renewal Cycle"
              value={rule.renewal_cycle_types?.renewal_cycle_name ?? rule.renewal_cycle}
            />
            <RuleRow
              label="Annual CPE Hours"
              value={rule.annual_cpe_hours !== null ? `${rule.annual_cpe_hours} hrs / year` : null}
            />
            <RuleRow
              label="Ethics Hours"
              value={rule.ethics_hours !== null ? `${rule.ethics_hours} hrs / cycle` : null}
            />
            <RuleRow
              label="Specialty Hours"
              value={
                rule.specialty_hours !== null
                  ? `${rule.specialty_hours} hrs${rule.specialty_description ? ` — ${rule.specialty_description}` : ''}`
                  : null
              }
            />
            <RuleRow
              label="Rolling Period Total"
              value={
                rule.rolling_period_hours !== null && rule.rolling_period_years !== null
                  ? `${rule.rolling_period_hours} hrs over ${rule.rolling_period_years} years`
                  : null
              }
            />
            <RuleRow
              label="Carryforward Allowed"
              value={rule.carryforward_hours !== null ? `Up to ${rule.carryforward_hours} hrs` : null}
            />
          </div>
        ) : (
          <p className={styles.noRules}>
            CPE requirement details for this credential are not yet available.
            You can still save and check back later.
          </p>
        )}
      </div>

      {/* Divider */}
      <hr className={styles.divider} />

      {/* Save error */}
      {saveError && (
        <p className={styles.saveError}>{saveError}</p>
      )}

      {/* Save action */}
      <button
        type="button"
        className={styles.btnSave}
        onClick={onSave}
        disabled={saving}
      >
        {saving ? 'Saving…' : 'Save Credential'}
      </button>
    </div>
  )
}
