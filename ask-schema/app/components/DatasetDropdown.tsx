import React, { FC, ChangeEvent } from 'react';

interface DatasetDropdownProps {
  datasets: string[];
  onChange: (selectedDataset: string) => void;
}

const DatasetDropdown: FC<DatasetDropdownProps> = ({ datasets: datasets, onChange }) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <select onChange={handleChange} className="p-2 border rounded-md bg-white">
      {datasets.map(dataset => (
        <option key={dataset} value={dataset}>
          {dataset}
        </option>
      ))}
    </select>
  );
};

export default DatasetDropdown;
