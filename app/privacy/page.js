// app/privacy/page.js
export default function PrivacyPage() {
  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--brown)' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--ink-muted)', marginBottom: 20 }}>Last updated: 2026</p>

      <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
        SriGen ("we", "our", "the app") helps micro-entrepreneurs get business and financial
        scheme guidance. This page explains what information we collect and how we use it.
      </p>

      <h2 style={{ fontSize: 18, color: 'var(--brown)', marginTop: 24 }}>Information We Collect</h2>
      <p style={{ lineHeight: 1.7 }}>
        When you sign in with Google, we receive your name, email address, and profile picture
        from Google to create and manage your account. We do not access your Google Drive,
        Gmail, or any other Google service data.
      </p>

      <h2 style={{ fontSize: 18, color: 'var(--brown)', marginTop: 24 }}>How We Use It</h2>
      <p style={{ lineHeight: 1.7 }}>
        Your account information is used solely to identify you within the app and personalize
        your experience (e.g. remembering your login). We do not sell or share your data with
        third parties.
      </p>

      <h2 style={{ fontSize: 18, color: 'var(--brown)', marginTop: 24 }}>Chat &amp; Voice Data</h2>
      <p style={{ lineHeight: 1.7 }}>
        Messages you send to the AI advisor and audio you record for voice input are sent to
        third-party AI providers (Groq, Google Gemini) solely to generate a response, and are
        not stored by us beyond your active session.
      </p>

      <h2 style={{ fontSize: 18, color: 'var(--brown)', marginTop: 24 }}>Contact</h2>
      <p style={{ lineHeight: 1.7 }}>
        For questions about this policy, reach out via the WhatsApp link in the app.
      </p>
    </div>
  );
}