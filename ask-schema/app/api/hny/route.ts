import { NextRequest, NextResponse } from 'next/server'
import path from 'path';
import fs from 'fs';

type Dataset = {
  name: string;
  description: string;
  slug: string;
  expand_json_depth: number;
  created_at: string;
  last_written: string;
  regular_columns_count: number;
};

const directoryPath = path.join(__dirname, '../../../../../data');

function writeDatasetsToFile(datasets: string[]) {
  fs.writeFileSync(path.join(directoryPath, 'datasets.json'), JSON.stringify(datasets));
}

function readDatasetsFromFile() {
  const data = fs.readFileSync(path.join(directoryPath, 'datasets.json'), 'utf8');
  return JSON.parse(data);
}

function datasetsFileExists() {
  return fs.existsSync(path.join(directoryPath, 'datasets.json'));
}

export async function GET(request: NextRequest) {
  const apikey = process.env.HNY_API_KEY
  if (!apikey) {
      return NextResponse.error()
  }

  if (datasetsFileExists()) {
    const datasets = readDatasetsFromFile();
    return NextResponse.json({ datasets: datasets })
  }

  const response = await fetch('https://api.honeycomb.io/1/datasets', {
    headers: {
      'X-Honeycomb-Team': apikey
    }
  });

  const data: Dataset[] = await response.json();
  let datasets = data.map((dataset) => dataset.slug);

  writeDatasetsToFile(datasets);

  return NextResponse.json({ datasets: datasets })
}