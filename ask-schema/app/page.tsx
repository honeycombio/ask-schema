'use client'

import React, { useState, useEffect, FC } from 'react';
import SearchBox from './components/SearchBox';
import ResultsBox from './components/ResultsBox';
import DatasetDropdown from './components/DatasetDropdown';

const Home: FC = () => {
  const fetchDatasets = async () => {
    const response = await fetch('/api/hny/', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const datasets = data.datasets;

    setDatasets(datasets);
    handleDatasetChange(datasets[0]);
  }

  const [datasets, setDatasets] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDataset, setSelectedDataset] = useState<string>('');

  const handleSearch = (input: string) => {
    setSearchTerm(input);
  };

  const handleClear = () => {
    setSearchTerm('');
  }

  const handleDatasetChange = (dataset: string) => {
    setSelectedDataset(dataset);
  };

  useEffect(() => {
    fetchDatasets();
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-row justify-center items-center mb-4">
        <h1 className="text-3xl font-bold text-white">Honeycomb Schema Search 5000</h1>
        <div className="ml-4">
          <DatasetDropdown datasets={datasets} onChange={handleDatasetChange} />
        </div>
      </div>
      <SearchBox onSearch={handleSearch} />
      {searchTerm && selectedDataset && <ResultsBox searchTerm={searchTerm} dataset={selectedDataset} onClear={handleClear} />}
    </div>
  );
}

export default Home;