// app/api/transcribe/route.js
// Ported from the original server.js's /transcribe endpoint (Groq Whisper).
// The browser's MediaRecorder produces webm audio, which Whisper accepts
// directly — no ffmpeg/format conversion needed, unlike the Expo app's m4a.
export const runtime = 'nodejs';

import Groq from 'groq-sdk';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return Response.json({ error: 'No audio file received' }, { status: 400 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3-turbo',
      temperature: 0,
      response_format: 'verbose_json',
    });

    return Response.json({ text: transcription.text });
  } catch (err) {
    console.error('Error in /api/transcribe:', err.message);
    return Response.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
