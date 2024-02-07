import React, { FC, useState, KeyboardEvent, useRef } from 'react';

interface SearchBoxProps {
  onSearch: (val: string) => void;
}

const SearchBox: FC<SearchBoxProps> = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const suggestionClickedRef = useRef(false);

  const suggestions = ['what are errors', 'find slow users', 'see k8s correlations'];

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
      onSearch(inputValue);
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setIsFocused(false);
  };

  const handleSearchClick = () => {
    onSearch(inputValue.trim());
    setIsFocused(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    suggestionClickedRef.current = true;
    setInputValue(suggestion);
    onSearch(suggestion);
    setIsFocused(false);
  };

  const handleBlur = () => {
    if (suggestionClickedRef.current) {
      suggestionClickedRef.current = false;
    } else {
      setIsFocused(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 flex flex-col items-center relative mb-10">
      <div className="w-full flex items-center p-4 bg-gray-100">
        <input
          type="text"
          placeholder="How do I..."
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          value={inputValue}
          className="flex-1 border px-3 py-2 mr-2 focus:outline-none"
        />
        <button onClick={handleSearchClick} className="cta-button px-3 py-2 mr-2 rounded-lg">
          Search
        </button>
        <button onClick={handleClear} className="clear-button px-3 py-2 rounded-lg">
          Clear
        </button>
      </div>
      {isFocused && (
        <div className="flex flex-row justify-around w-full p-4 bg-gray-100 absolute bottom-0 transform translate-y-full">
          {suggestions.map(suggestion => (
            <span
              key={suggestion}
              onMouseDown={() => suggestionClickedRef.current = true} // Using onMouseDown as it fires before onBlur
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer font-bold text-[#0278CD] hover:underline"
            >
              {suggestion}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;