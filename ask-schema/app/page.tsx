'use client'

import React, { useState, FC } from 'react';
import SearchBox from './components/SearchBox';
import ResultsBox from './components/ResultsBox';

const Home: FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearch = (input: string, dataset: string) => {
    setSearchTerm(input);
  };

  const handleClear = () => {
    setSearchTerm('');
  }

  const dataset = "frontend";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-white">Honeycomb Schema Search 5000</h1>
      <SearchBox onSearch={handleSearch} />
      {searchTerm && <ResultsBox searchTerm={searchTerm} dataset={dataset} onClear={handleClear} />}
    </div>
  );
}

export default Home;