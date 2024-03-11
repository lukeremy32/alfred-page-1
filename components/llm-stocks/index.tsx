// components/llm-stocks/index.tsx

'use client';

import dynamic from 'next/dynamic';
import { FredChartSkeleton } from './fred-chart-skeleton';
import { FederalRegisterDocumentsSkeleton } from './federal-register-documents-skeleton';
import { GoogleCSEResultsSkeleton } from './google-cse-results-skeleton';

export { spinner } from './spinner';
export { BotCard, BotMessage, SystemMessage } from './message';

const FredChart = dynamic(() => import('./fred-chart').then(mod => mod.FredChart), {
  ssr: false,
  loading: () => <FredChartSkeleton />,
});

const FederalRegisterDocuments = dynamic(
  () => import('./federal-register-documents').then(mod => mod.FederalRegisterDocuments),
  {
    ssr: false,
    loading: () => <FederalRegisterDocumentsSkeleton />,
  },
);

const GoogleCSEResults = dynamic(
  () => import('./google-cse-results').then(mod => mod.GoogleCSEResults),
  {
    ssr: false,
    loading: () => <GoogleCSEResultsSkeleton />,
  },
);

export { FredChart, FederalRegisterDocuments, GoogleCSEResults, GoogleCSEResultsSkeleton };
