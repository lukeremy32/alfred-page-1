// components/llm-stocks/google-cse-results.tsx

'use client';

import { useActions, useUIState } from 'ai/rsc';
import type { AI } from '../../app/action';

interface SearchResult {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  pagemap?: {
    [key: string]: any;
  };
}

interface GoogleCSEResponse {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
  context: {
    title: string;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items?: SearchResult[];
}

export function GoogleCSEResults({ response }: { response: GoogleCSEResponse }) {
    const [, setMessages] = useUIState<typeof AI>();
    const { submitUserMessage } = useActions<typeof AI>();
  
    if (!response.items || response.items.length === 0) {
      return <div>No search results found.</div>;
    }
  
    const getFaviconUrl = (link: string) => {
      const domain = new URL(link).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}`;
    };
  
    return (
      <div className="flex flex-col gap-2 pb-4 mb-4 overflow-y-scroll text-sm sm:flex-row">
        {response.items.map(result => (
          <a
            key={result.link}
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 p-2 text-left rounded-lg cursor-pointer bg-[#1B174E] hover:bg-[#2B2464] sm:w-52"
            onClick={async (e) => {
              e.preventDefault();
              const response = await submitUserMessage(`View search result ${result.link}`);
              setMessages(currentMessages => [...currentMessages, response]);
              window.open(result.link, '_blank');
            }}
          >
            <div className="flex items-center gap-2">
              <img
                src={getFaviconUrl(result.link)}
                alt="Favicon"
                className="w-4 h-4"
              />
              <div
                className="text-zinc-300 bold"
                dangerouslySetInnerHTML={{ __html: result.htmlTitle }}
              />
            </div>
            <div className="text-xs text-zinc-400">{result.displayLink}</div>
            <div
              className="text-sm text-zinc-500"
              dangerouslySetInnerHTML={{ __html: result.htmlSnippet }}
            />
          </a>
        ))}
      </div>
    );
  }