import { PineconeClient, Vector } from 'pinecone-client';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Pinecone
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || '';
const MODEL = "text-embedding-3-large";
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || '';
const PINECONE_BASE_URL = process.env.PINECONE_BASE_URL || '';

const pinecone = new PineconeClient({
  apiKey: PINECONE_API_KEY,
  baseUrl: PINECONE_BASE_URL,
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});


// Function to create embeddings using OpenAI
async function createEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: MODEL,
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error creating embeddings:', error);
    throw error;
  }
}

async function queryPinecone(queryText: string) {
  try {
    console.log('Querying Pinecone with text:', queryText);
    const embedding = await createEmbeddings(queryText);
    console.log('Embedding created:', embedding);

    const response = await fetch(`${PINECONE_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PINECONE_API_KEY,
      },
      body: JSON.stringify({
        vector: embedding,
        topK: 9,
        includeMetadata: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const queryResponse = await response.json();
    console.log('Pinecone query response:', queryResponse);
    const documents = processPineconeResponse(queryResponse);
    console.log('Processed documents:', documents);
    return documents;
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw error;
  }
}

// Function to format Pinecone data for the prompt
function formatPineconeData(similarDocuments: Document[]) {
  let formattedData = "";
  for (const doc of similarDocuments) {
    formattedData += `Source: ${doc.url}, Date: ${doc.date}\n Title: ${doc.title}, Content: ${doc.assistant}\n`;
  }
  return formattedData;
}

// Extract Url from PC response
function processPineconeResponse(queryResponse: any) {
  const similarDocuments: Document[] = [];
  for (const match of queryResponse.matches || []) {
    const metadata = match.metadata || {};
    similarDocuments.push({
      id: match.id,
      score: match.score,
      assistant: metadata.assistant || "No text metadata",
      url: metadata.url || "",
      date: metadata.date || "No date provided",
      title: metadata.title || "No title provided",
    });
  }
  return similarDocuments;
}

interface Document {
  id: string;
  score: number;
  assistant: string;
  url: string;
  date: string;
  title: string;
}

export { queryPinecone, formatPineconeData, createEmbeddings };