'use client'

import React, { useEffect, useState, FC, useCallback } from 'react';
import { remark } from 'remark';
import html from 'remark-html';
import Loading from './Loading';

interface ResultsBoxProps {
  searchTerm: string;
  dataset: string;
  onClear: () => void;
}

interface UrlBoxProps {
  url: string;
}

const UrlBox: FC<UrlBoxProps> = ({ url }) => {
  if (!url) {
    return null;
  }
  const displayUrl = decodeURI(url)
    .trim()
    .split('/')
    .slice(-2)
    .join('/');

  return (
    <a
      href={url.trim()}
      target="_blank"
      rel="noopener noreferrer"
      className="px-2 py-1 m-1 text-blue-500 bg-white rounded"
    >
      {displayUrl}
    </a>
  );
};

const ResultsBox: FC<ResultsBoxProps> = ({ searchTerm, dataset, onClear }) => {
  const [result, setResult] = useState<string>('');
  const [urls, setUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCancellable, setIsCancellable] = useState<boolean>(false);
  const abortController = new AbortController();

  const fetchData = async () => {
    setLoading(true);
    setIsCancellable(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: searchTerm, dataset: dataset }),
        signal: abortController.signal,
      });
      const data = await res.json();
      setUrls(data.urls || []);

      // Use remark to convert markdown into HTML string
      const processedContent = await remark()
        .use(html)
        .process(data.content);
      const contentHtml = processedContent.toString();

      setResult(contentHtml);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
      setIsCancellable(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      fetchData();
    }
    return () => abortController.abort();
  }, [searchTerm]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 p-4 bg-gray-100">
      <h2 className="text-xl font-bold mb-2">{searchTerm}</h2>
      {loading && isCancellable ? (
        <div>
          <Loading />
          <button onClick={onClear} className="clear-button px-3 py-2 mr-2 rounded-lg">
            Cancel
          </button>
        </div>
      )
        : (
          <>
            <p dangerouslySetInnerHTML={{ __html: result }} />
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">See here for more info:</h2>
              <div className="flex flex-wrap">
                {urls.filter((url) => url !== undefined).map((url, index) => (
                  <UrlBox key={index} url={url} />
                ))}
              </div>
            </div>
            <div className="flex justify-start mt-4">
              <button onClick={fetchData} className="cta-button px-3 py-2 mr-2 rounded-lg">
                Ask Again
              </button>
              <button onClick={onClear} className="clear-button px-3 py-2 mr-2 rounded-lg">
                Clear
              </button>
            </div>
          </>
        )}
    </div>
  );
};

export default ResultsBox;