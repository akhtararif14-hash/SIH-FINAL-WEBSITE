// app/api/chat/route.js
// Ported directly from the original server.js's /chat endpoint.
// Reads GROQ_API_KEY and GEMINI_API_KEY from environment variables —
// set these in Vercel's dashboard (Project Settings -> Environment Variables).
export const runtime = 'nodejs';

import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import knowledgeBase from '@/lib/knowledge-base.json';

const SIMILARITY_THRESHOLD = 0.5;
const TOP_K = 3;

// Clients are created lazily (inside the request handler, not at module
// load time) so a missing env var fails a single request with a clear
// error instead of crashing the entire build/deploy.
function getClients() {
  return {
    ai: new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }),
    groq: new Groq({ apiKey: process.env.GROQ_API_KEY }),
  };
}

function cosineSimilarity(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function embedQuery(query, ai) {
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: query,
    config: { taskType: 'RETRIEVAL_QUERY' },
  });
  return result.embeddings[0].values;
}

function retrieveTopChunks(queryEmbedding) {
  const scored = knowledgeBase.map((chunk) => ({
    text: chunk.text,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, TOP_K);
}

async function answerQuestion(question, { ai, groq }) {
  const queryEmbedding = await embedQuery(question, ai);
  const topChunks = retrieveTopChunks(queryEmbedding);
  const goodMatches = topChunks.filter((c) => c.score >= SIMILARITY_THRESHOLD);

  if (goodMatches.length === 0) {
    return "I don't have information about that. Please ask something related to business schemes or financial planning.";
  }

  const context = goodMatches.map((c) => c.text).join('\n\n');
  const systemPrompt = `You are a financial and business advisory assistant for rural micro-entrepreneurs in India.
Answer using ONLY the context below. If it doesn't fully answer the question, say what you can and note the gap.
Never invent scheme details that aren't in the context.

Context:
${context}`;

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ],
  });

  return response.choices[0].message.content;
}

export async function POST(request) {
  try {
    const { question } = await request.json();
    if (!question) {
      return Response.json({ error: 'Missing "question"' }, { status: 400 });
    }
    const clients = getClients();
    const answer = await answerQuestion(question, clients);
    return Response.json({ answer });
  } catch (err) {
    console.error('Error in /api/chat:', err.message);
    return Response.json({ error: 'Something went wrong on the server' }, { status: 500 });
  }
}
