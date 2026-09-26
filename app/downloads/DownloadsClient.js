'use client';
// app/downloads/DownloadsClient.js
// Every report the user saves appears here. Files stay in this browser, so
// they open even without internet, and nothing is uploaded anywhere.
//
// The report titles were written in the language the user had chosen when
// they saved, so this page shows them exactly as saved.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listFiles, deleteFile, downloadFile } from '@/lib/userFiles';
import { useTranslate } from '@/lib/LanguageProvider';
import { advisorT } from '@/lib/advisor/i18n';

export default function DownloadsClient() {
  const { t, lang } = useTranslate();
  const A = advisorT(lang);
  const [files, setFiles] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFiles(listFiles());
    setReady(true);
  }, []);

  const refresh = () => setFiles(listFiles());

  const open = (file) => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(file.html);
      w.document.close();
    }
  };

  return (
    <div className="page">
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          color: 'var(--brown)',
          margin: '0 0 6px',
        }}
      >
        {t('downloads')}
      </h1>
      <p style={{ color: 'var(--ink-muted)', marginTop: 0 }}>{A('dlSubtitle')}</p>

      {ready && files.length === 0 && (
        <div className="dl-empty">
          <div style={{ fontSize: 34 }}>📄</div>
          <h3 style={{ margin: '8px 0 4px' }}>{A('dlNoFiles')}</h3>
          <p style={{ color: 'var(--ink-muted)', margin: '0 0 14px' }}>{A('dlNoFilesSub')}</p>
          <Link href="/advisor" className="dl-btn primary">
            {A('dlGoAdvisor')}
          </Link>
        </div>
      )}

      {files.map((f) => (
        <div key={f.id} className="dl-row">
          <div className="dl-icon">📄</div>
          <div className="dl-text">
            <strong>{f.title}</strong>
            <span>
              {f.subtitle} · {new Date(f.createdAt).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="dl-actions">
            <button className="dl-btn" onClick={() => open(f)}>
              {A('dlOpen')}
            </button>
            <button className="dl-btn primary" onClick={() => downloadFile(f)}>
              {A('dlDownload')}
            </button>
            <button
              className="dl-btn danger"
              onClick={() => {
                deleteFile(f.id);
                refresh();
              }}
              aria-label={`${A('dlDelete')} ${f.title}`}
              title={A('dlDelete')}
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {files.length > 0 && (
        <p style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 14 }}>{A('dlFooter')}</p>
      )}
    </div>
  );
}