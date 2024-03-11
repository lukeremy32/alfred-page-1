'use client';

import { useActions, useUIState } from 'ai/rsc';
import type { AI } from '../../app/action';

interface Document {
  title: string;
  publication_date: string;
  document_number: string;
  // Add other relevant properties from the Federal Register API response
}

export function FederalRegisterDocuments({ documents }: { documents: Document[] }) {
  const [, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>();

  return (
    <div className="flex flex-col gap-2 pb-4 mb-4 overflow-y-scroll text-sm sm:flex-row">
      {documents.map(doc => (
        <button
          key={doc.document_number}
          className="flex flex-col gap-2 p-2 text-left rounded-lg cursor-pointer bg-[#311e46] hover:bg-[#4a3b6a] sm:w-52"
          onClick={async () => {
            const response = await submitUserMessage(`View document ${doc.document_number}`);
            setMessages(currentMessages => [...currentMessages, response]);
          }}
        >
          <div className="text-zinc-300 bold">{doc.title}</div>
          <div className="text-sm text-zinc-500">{doc.publication_date}</div>
          <div className="text-xs text-zinc-400">{doc.document_number}</div>
        </button>
      ))}
    </div>
  );
}
