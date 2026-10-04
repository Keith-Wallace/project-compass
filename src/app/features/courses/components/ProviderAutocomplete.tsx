import { useEffect, useRef, useState } from 'react';
import { Autocomplete } from '@mantine/core';
import { type UseFormReturnType } from '@mantine/form';
import { supabase } from '../../../supabase/supabase';
import { type FormFieldName } from '../../../shared/components/form/Form';

import '../../../shared/styles/forms/select-autocomplete.css';

export interface Provider {
  id: string;
  name: string;
  address?: string | null;
  website?: string | null;
  registry_id?: string | null;
  nasba_id?: string | null;
}

interface ProviderAutocompleteProps<T> {
  form: UseFormReturnType<T>;
  // Bound to the provider's id (a plain string field on the form).
  name: FormFieldName<T>;
  // Edit mode: the provider record loaded async, after this component
  // has already mounted with nothing selected.
  initialProvider?: Provider | null;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ProviderAutocomplete<T>({
  form,
  name,
  initialProvider = null,
  label,
  placeholder = 'Search provider name...',
  disabled,
}: ProviderAutocompleteProps<T>) {
  const [query, setQuery] = useState(initialProvider?.name ?? '');
  const [results, setResults] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(initialProvider);
  const seededProviderId = useRef<string | null>(initialProvider?.id ?? null);

  // See FormDropzone: `name` may be a path string, so writes go through a
  // loosely typed view of the form rather than per-call casts.
  const looseForm = form as unknown as UseFormReturnType<Record<string, unknown>>;

  useEffect(() => {
    if (initialProvider && initialProvider.id !== seededProviderId.current) {
      seededProviderId.current = initialProvider.id;
      setSelectedProvider(initialProvider);
      setQuery(initialProvider.name);
    }
  }, [initialProvider]);

  const search = async (text: string) => {
    if (!text.trim()) {
      setResults([]);
      return;
    }
    const { data, error } = await supabase
      .from('providers')
      .select('id, name, address, website, registry_id, nasba_id')
      .ilike('name', `%${text}%`)
      .order('name')
      .limit(8);

    if (!error) setResults((data as Provider[] | null) ?? []);
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (selectedProvider) {
      setSelectedProvider(null);
      looseForm.setFieldValue(name, '');
    }
    search(value);
  };

  const handleOptionSubmit = (value: string) => {
    const match = results.find((p) => p.name === value);
    if (!match) return;
    setSelectedProvider(match);
    setQuery(match.name);
    looseForm.setFieldValue(name, match.id);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSelectedProvider(null);
    looseForm.setFieldValue(name, '');
  };

  return (
    <div className="provider-autocomplete">
      <Autocomplete
        label={label}
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onOptionSubmit={handleOptionSubmit}
        data={results.map((p) => p.name)}
        error={form.errors[name]}
        disabled={disabled}
        rightSection={
          selectedProvider ? (
            <button
              type="button"
              className="pac-clear-btn"
              onClick={handleClear}
              aria-label="Clear provider"
            >
              ✕
            </button>
          ) : undefined
        }
      />

      {selectedProvider && (
        <div className="provider-detail-panel">
          <div className="pdp-row">
            <span className="pdp-label">Address</span>
            <span className="pdp-value">{selectedProvider.address || '—'}</span>
          </div>
          <div className="pdp-row">
            <span className="pdp-label">Website</span>
            <span className="pdp-value">
              {selectedProvider.website ? (
                <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer">
                  {selectedProvider.website}
                </a>
              ) : (
                '—'
              )}
            </span>
          </div>
          <div className="pdp-row">
            <span className="pdp-label">Registry ID</span>
            <span className="pdp-value">{selectedProvider.registry_id || '—'}</span>
          </div>
          <div className="pdp-row">
            <span className="pdp-label">NASBA Number</span>
            <span className="pdp-value">{selectedProvider.nasba_id || '—'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
