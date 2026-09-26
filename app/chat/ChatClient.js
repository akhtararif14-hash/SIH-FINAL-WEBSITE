'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslate } from '@/lib/LanguageProvider';
import RichText from '@/components/RichText';
import Icon from '@/components/Icon';

export default function ChatClient() {
  const { t } = useTranslate();
  const searchParams = useSearchParams();
  const presetQuestion = searchParams.get('q');

  const [messages, setMessages] = useState([
    { id: '0', sender: 'bot', text: 'Hi! Ask me about business schemes or financial planning — by typing or speaking.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micSupported, setMicSupported] = useState(true);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const bottomRef = useRef(null);
  const sentPresetRef = useRef(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.mediaDevices?.getUserMedia) {
      setMicSupported(false);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (presetQuestion && !sentPresetRef.current) {
      sentPresetRef.current = true;
      sendMessage(presetQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetQuestion]);

  const sendMessage = async (textOverride) => {
    const textToSend = textOverride !== undefined ? textOverride : input;
    if (!textToSend.trim()) return;

    const userMessage = { id: Date.now().toString(), sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.text }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: data.answer || 'Something went wrong.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        transcribeAudio(blob);
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      alert('Microphone permission is required to use voice input.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async (blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.text) {
        await sendMessage(data.text);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), sender: 'bot', text: 'Could not understand the audio. Please try again.' },
        ]);
        setLoading(false);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'bot', text: `Voice error: ${err.message}` },
      ]);
      setLoading(false);
    }
  };

  return (
    // Width comes from .chat-wrap in globals.css so it can differ per screen size.
    <div className="page chat-wrap" style={{ display: 'flex', flexDirection: 'column' }}>
      <h1 style={styles.title}>{t('aiAdvisor')}</h1>

      <div className="chat-messages" style={styles.messages}>
        {messages.map((m) => (
          <div key={m.id} style={{ ...styles.bubbleRow, justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ ...styles.bubble, ...(m.sender === 'user' ? styles.userBubble : styles.botBubble) }}>
              {m.sender === 'user' ? m.text : <RichText text={m.text} />}
            </div>
          </div>
        ))}
        {loading && <div style={styles.loadingText}>Thinking…</div>}
        <div ref={bottomRef} />
      </div>

      <form
        style={styles.inputRow}
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chatPlaceholder')}
        />
        {micSupported && (
          <button
            type="button"
            style={{ ...styles.micButton, ...(isRecording ? styles.micButtonActive : {}) }}
            onClick={isRecording ? stopRecording : startRecording}
            title="Voice input"
          >
            <Icon name={isRecording ? 'stop' : 'mic'} size={19} />
          </button>
        )}
        <button type="submit" style={styles.sendButton}>
          {t('send')}
        </button>
      </form>
    </div>
  );
}

const styles = {
  title: { fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--brown)', margin: '0 0 12px' },
  messages: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingBottom: 16,
    paddingRight: 4,
    scrollBehavior: 'smooth',
  },
  bubbleRow: { display: 'flex' },
  bubble: {
    padding: '11px 15px',
    borderRadius: 14,
    fontSize: 14.5,
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  userBubble: {
    maxWidth: '78%',
    background: 'var(--forest)',
    color: 'var(--white)',
  },
  // Wider and light, because answers are structured and need to stay readable.
  botBubble: {
    maxWidth: '94%',
    background: 'var(--card)',
    color: 'var(--ink)',
    border: '1px solid var(--border)',
    borderLeft: '4px solid var(--leaf)',
  },
  loadingText: { color: 'var(--ink-muted)', fontSize: 13.5, fontStyle: 'italic' },
  inputRow: {
    display: 'flex',
    gap: 8,
    padding: '12px 0',
    borderTop: '1px solid var(--border)',
  },
  input: {
    flex: 1,
    border: '1px solid var(--tan)',
    borderRadius: 22,
    padding: '10px 16px',
    fontSize: 15,
    background: 'var(--card)',
    color: 'var(--ink)',
  },
  micButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    border: 'none',
    background: 'var(--leaf)',
    // Centres the SVG icon inside the round button.
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--forest-dark)',
    cursor: 'pointer',
  },
  micButtonActive: { background: 'var(--danger)', color: 'var(--white)' },
  sendButton: {
    background: 'var(--forest)',
    color: 'var(--white)',
    border: 'none',
    borderRadius: 22,
    padding: '0 20px',
    fontWeight: 700,
    fontSize: 14.5,
  },
};