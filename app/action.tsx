import 'server-only';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

import { createAI, createStreamableUI, getMutableAIState } from 'ai/rsc';
import OpenAI from 'openai';
import {
  spinner,
  BotCard,
  BotMessage,
  FederalRegisterDocuments,
  FredChart,
  GoogleCSEResults,
} from '@/components/llm-stocks';

import {
  runAsyncFnWithoutBlocking,
  runOpenAICompletion,
} from '@/lib/utils';
import { z } from 'zod';
import { FederalRegisterDocumentsSkeleton } from '@/components/llm-stocks/federal-register-documents-skeleton';
import { FredChartSkeleton } from '@/components/llm-stocks/fred-chart-skeleton';
import { GoogleCSEResultsSkeleton } from '@/components/llm-stocks';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

async function submitUserMessage(content: string) {
  'use server';

  const aiState = getMutableAIState<typeof AI>();
  aiState.update([
    ...aiState.get(),
    {
      role: 'user',
      content,
    },
  ]);

  const reply = createStreamableUI(
    <BotMessage className="items-center">{spinner}</BotMessage>,
  );

  const completion = runOpenAICompletion(openai, {
    model: 'gpt-4-0125-preview',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `Today is ${format(new Date(), 'MMMM d, yyyy')}. You are ALFRED and you are a highly informed advisor in federal policy, legislation, regulation, politics, and all things in the housing-regulatory sphere. As a leading advisor, you help users find recent federal agency documents and releases using the Federal Register API, display economic data charts using the FRED API, perform custom searches using Google Custom Search Engine, and provide general clarity and understanding.

To search for Federal Register documents, use the \`searchFederalRegisterDocuments\` function and provide the necessary parameters.
To display FRED data charts, use the \`getFredData\` function and provide the series identifier and other required parameters.
Use CSE for finding breaking news and content related to the user's message just as a researcher would. To perform custom searches, use the \`googleCSESearch\` function and provide the required parameters. 

If the user's request cannot be fulfilled by the available functions, provide a helpful response explaining the limitations and offer alternative suggestions.`,
      },
      ...aiState.get().map((info: any) => ({
        role: info.role,
        content: info.content,
        name: info.name,
      })),
    ],
    functions: [
      {
        name: 'searchFederalRegisterDocuments',
        description: "Search all Federal Register documents published since 1994.  Specify agencies like this 'consumer-financial-protection-bureau' or 'defense-department' or 'energy-department'.",
        parameters: z.object({
          format: z.enum(['json']),
          fields: z.array(z.string()).optional(),
          per_page: z.number().int().min(1).max(1000).default(20),
          page: z.number().int().optional(),
          order: z.enum(['relevance', 'newest', 'oldest', 'executive_order_number']).optional(),
          'conditions[term]': z.string().optional(),
          'conditions[publication_date][is]': z.string().optional(),
          'conditions[publication_date][year]': z.string().optional(),
          'conditions[publication_date][gte]': z.string().optional(),
          'conditions[publication_date][lte]': z.string().optional(),
          'conditions[effective_date][is]': z.string().optional(),
          'conditions[effective_date][year]': z.string().optional(),
          'conditions[effective_date][gte]': z.string().optional(),
          'conditions[effective_date][lte]': z.string().optional(),
          'conditions[agencies][]': z.array(z.string()).optional(),
          'conditions[type][]': z.array(z.string()).optional(),
          'conditions[presidential_document_type][]': z.array(z.string()).optional(),
          'conditions[president][]': z.array(z.string()).optional(),
          'conditions[docket_id]': z.string().optional(),
          'conditions[regulation_id_number]': z.string().optional(),
          'conditions[sections][]': z.array(z.string()).optional(),
          'conditions[topics][]': z.array(z.string()).optional(),
          'conditions[significant]': z.string().optional(),
          'conditions[cfr][title]': z.number().int().optional(),
          'conditions[cfr][part]': z.number().int().optional(),
          'conditions[near][location]': z.string().optional(),
          'conditions[near][within]': z.number().int().optional(),
        }),
      },
      {
        name: 'getFredData',
        description: `Fetches data from the FRED API based on the provided series identifier. Available series identifiers include:
      1. 'UNRATE' for the unemployment rate.
      2. 'GDPC1' for real GDP.
      3. 'A939RX0Q048SBEA' for real GDP per capita.
      4. 'RSAHORUSQ156S' is the homeownership rate in the US.
      5. 'TMBACBW027SBOG' for Mortgage-Backed Securities (MBS).
      6. 'OBMMIFHA30YF' for the FHA Mortgage Index.
      7. 'BOAAAHORUSQ156N' for the Black homeownership rate in the US.
      8. 'RRVRUSQ156N' for rental vacancy rate.
      9. 'CPILFESL' for inflation.
      10. 'MORTGAGE30US' for the 30-year mortgage rate.`,
        parameters: z.object({
          series_id: z.string(),
          api_key: z.string().default('16c1cfd49650bb8fcec9b307c7a02674'),
          file_type: z.enum(['json', 'xml', 'text']).default('json'),
          realtime_start: z.string().optional(),
          realtime_end: z.string().optional(),
          limit: z.number().int().min(1).max(100000).optional(),
          offset: z.number().int().min(0).optional(),
          sort_order: z.enum(['asc', 'desc']).optional(),
          observation_start: z.string().optional(),
          observation_end: z.string().optional(),
          units: z.enum(['lin', 'chg', 'ch1', 'pch', 'pc1', 'pca', 'cch', 'cca', 'log']).optional(),
          frequency: z.enum([
            'd',
            'w',
            'bw',
            'm',
            'q',
            'sa',
            'a',
            'wef',
            'weth',
            'wew',
            'wetu',
            'wem',
            'wesu',
            'wesa',
            'bwew',
            'bwem',
          ]).optional(),
          aggregation_method: z.enum(['avg', 'sum', 'eop']).optional(),
          output_type: z.enum(['1', '2', '3', '4']).optional(),
          vintage_dates: z.string().optional(),
        }),      
      },
      {
        name: 'googleCSESearch',
        description: "Perform searches using Google Custom Search Engine. The search can be customized with various parameters, including date restrictions, language, and file types.",
        parameters: z.object({
          q: z.string().describe("Search query string."),
          cx: z.string().describe("USE e244adfcb1c0049fe"),
          dateRestrict: z.string().describe("Restricts results to URLs based on date. Format: 'd[number]', 'w[number]', 'm[number]', 'y[number]'.").optional(),
          lr: z.string().describe("Restricts the search to documents written in a particular language.").optional(),
          cr: z.string().describe("Country restrict for the search results.").optional(),
          num: z.number().int().min(1).max(10).default(10).describe("Number of search results to return (1-10)."),
          start: z.number().int().describe("The index of the first result to return.").optional(),
          fileType: z.string().describe("Restricts results to files of a specified extension.").optional(),
          sort: z.string().describe("The sort expression to apply to the results.").optional(),
        }),
      },
    ],
    temperature: 0,
  });

  completion.onTextContent((content: string, isFinal: boolean) => {
    reply.update(
      <BotMessage>
        <ReactMarkdown>{content}</ReactMarkdown>
      </BotMessage>
    );
    if (isFinal) {
      reply.done();
      aiState.done([...aiState.get(), { role: 'assistant', content }]);
    }
  });

  completion.onFunctionCall(
    'searchFederalRegisterDocuments',
    async (params) => {
      reply.update(
        <BotCard>
          <FederalRegisterDocumentsSkeleton />
        </BotCard>,
      );

      const response = await fetch(
        `https://www.federalregister.gov/api/v1/documents.json?${new URLSearchParams(
          Object.entries(params).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        )}`,
      );
      const data = await response.json();

      reply.done(
        <BotCard>
          <FederalRegisterDocuments documents={data.results} />
        </BotCard>,
      );

      aiState.done([
        ...aiState.get(),
        {
          role: 'function',
          name: 'searchFederalRegisterDocuments',
          content: JSON.stringify(data),
        },
      ]);
    },
  );

  
  completion.onFunctionCall('getFredData', async (params) => {
    reply.update(
      <BotCard>
        <FredChartSkeleton />
      </BotCard>,
    );
  
    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?${new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      )}`,
    );
    const data = await response.json();
  
    // Extract the series ID from the params
    const seriesId = params.series_id;
  
    reply.done(
      <BotCard>
        <FredChart data={data.observations} indicator={seriesId} />
      </BotCard>,
    );
  
    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'getFredData',
        content: JSON.stringify(data),
      },
    ]);
  });

  // Add the new function handler for 'googleCSESearch'
  completion.onFunctionCall('googleCSESearch', async (params) => {
    console.log('Google CSE Search Params:', params);
  
    reply.update(
      <BotCard>
        <GoogleCSEResultsSkeleton />
      </BotCard>,
    );
  
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=e244adfcb1c0049fe&${new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      )}`,
    );
    const data = await response.json();
    console.log('Google CSE Search Response:', data);

    reply.done(
      <BotCard>
        <GoogleCSEResults response={data} />
      </BotCard>,
    );
  
    aiState.done([
      ...aiState.get(),
      {
        role: 'function',
        name: 'googleCSESearch',
        content: JSON.stringify(data),
      },
    ]);
  });

  return {
    id: Date.now(),
    display: reply.value,
  };
}  

// Define necessary types and create the AI.

const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    submitUserMessage,
  },
  initialUIState,
  initialAIState,
});




