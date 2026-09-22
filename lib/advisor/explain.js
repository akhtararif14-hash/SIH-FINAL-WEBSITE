// lib/advisor/explain.js
// Turns the numbers into a plain-language explanation.
// Gemini first (your GEMINI_API_KEY), Groq as a backup (your GROQ_API_KEY).
// The model only RECEIVES our numbers — it is told never to invent any.

import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

const LANGUAGE_NAMES = { en: 'English', hi: 'simple Hindi', ur: 'simple Urdu', bn: 'simple Bengali' };

export function buildPrompt(report, lang = 'en') {
  const top = report.ranked.filter((r) => r.eligible).slice(0, 3);
  const facts = {
    location: report.location.label,
    radiusMetres: report.radius,
    population: report.population,
    climateLast12Months: report.climate,
    nearbyAnchors: report.anchors,
    userBudgetRupees: report.budget || 'not given',
    topBusinesses: top.map((r) => ({
      name: r.name,
      score: r.score,
      demand: r.breakdown.demand,
      competition: r.breakdown.competition,
      existingCompetitors: r.competitorCount,
      mainDemandSources: r.breakdown.anchorParts.map((p) => `${p.count} ${p.label}`),
      risk: r.risk,
      setupCostRupees: r.setupCost,
      climateNote: r.breakdown.environmentReason,
      specialNote: r.note,
    })),
  };

  return `You are a friendly business advisor for small shop owners in India.
Write in ${LANGUAGE_NAMES[lang] || 'English'}. Use very simple words.

Use ONLY the facts in the JSON below. Never invent a number, shop name or statistic.
If something is missing, say it is not available.

For each of the top businesses (in order) write:
1. One line: why this place suits it (mention the real counts, e.g. "2 colleges, only 1 existing shop").
2. One line: the main risk (use the "risk" field; "high" means most customers come from one source, e.g. colleges close in vacations).
3. One line: a practical first step.
End with one sentence reminding the user these scores are estimates and they should visit the area at different times of day before investing.
Keep the whole answer under 220 words. Plain text, no markdown tables.

FACTS:
${JSON.stringify(facts, null, 2)}`;
}

async function withGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
    contents: prompt,
    config: { temperature: 0.3 },
  });
  const text = typeof res.text === 'function' ? res.text() : res.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

async function withGroq(prompt) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const res = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }],
  });
  return res.choices[0].message.content;
}

export async function explainReport(report, lang) {
  const prompt = buildPrompt(report, lang);
  try {
    return { text: await withGemini(prompt), model: 'gemini' };
  } catch (geminiErr) {
    console.warn('Gemini failed, trying Groq:', geminiErr.message);
    try {
      return { text: await withGroq(prompt), model: 'groq' };
    } catch (groqErr) {
      console.warn('Groq failed too:', groqErr.message);
      return { text: null, model: null };
    }
  }
}