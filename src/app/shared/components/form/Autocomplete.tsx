import { useState } from 'react';
import type { ChangeEvent } from 'react';

const styles = `
    ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    border: 1px solid #ccc;
    border-top: none;
    border-radius: 0 0 4px 4px;
    max-height: 200px;
    overflow-y: auto;
    }
    
    li {
    padding: 10px;
    cursor: pointer;
    }
    
    li:hover {
    background-color: #f0f0f0;
    }
`

interface AutocompleteProps {
  options: string[];
}

const Autocomplete = ({ options }: AutocompleteProps) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
 
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
  };
 
  const handleOptionSelect = (option: string) => {
    setInputValue(option);
    setFilteredOptions([]);
  };
 
  return (
    <>
    <style>{styles}</style>
    <div>
      <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type to search..."
      />
      {filteredOptions.length > 0 && (
          <ul>
          {filteredOptions.map((option) => (
              <li key={option} onClick={() => handleOptionSelect(option)}>
              {option}
              </li>
          ))}
          </ul>
      )}
    </div>
    </>
  );
};
 
export default Autocomplete;
