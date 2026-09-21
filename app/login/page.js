'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthProvider';

function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/weak-password':
      return 'Password is too weak.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before finishing.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Already logged in? Bounce back home.
  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const validate = () => {
    if (!email.includes('@')) {
      setError('Enter a valid email');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (isSignup && name.trim().length === 0) {
      setError('Enter your name');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <div style={styles.card}>
        <h1 style={styles.title}>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
        <p style={styles.subtitle}>{isSignup ? 'Sign up to get started' : 'Log in to continue'}</p>

        <button type="button" style={styles.googleButton} onClick={handleGoogleSignIn} disabled={loading}>
          <span style={{ fontSize: 18 }}>G</span> Continue with Google
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? '…' : isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <button type="button" style={styles.switchBtn} onClick={() => setIsSignup((v) => !v)}>
          {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--card)',
    borderRadius: 'var(--radius-lg)',
    padding: 28,
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    marginTop: 24,
  },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--brown)', margin: '0 0 4px' },
  subtitle: { color: 'var(--ink-muted)', fontSize: 14, margin: '0 0 22px' },
  googleButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    border: '1px solid var(--tan)',
    background: 'var(--white)',
    color: 'var(--ink)',
    borderRadius: 10,
    padding: '12px 16px',
    fontWeight: 600,
    fontSize: 15,
  },
  divider: { display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' },
  dividerLine: { flex: 1, height: 1, background: 'var(--border)' },
  dividerText: { color: 'var(--ink-muted)', fontSize: 12.5 },
  input: {
    width: '100%',
    border: '1px solid var(--tan)',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 15,
    marginBottom: 12,
    background: '#faf6ef',
    color: 'var(--ink)',
  },
  error: { color: 'var(--danger)', fontSize: 13, margin: '0 0 10px' },
  button: {
    width: '100%',
    background: 'var(--forest)',
    color: 'var(--white)',
    border: 'none',
    borderRadius: 10,
    padding: '13px 16px',
    fontWeight: 700,
    fontSize: 15.5,
    marginTop: 4,
  },
  switchBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    background: 'none',
    border: 'none',
    color: 'var(--forest)',
    marginTop: 16,
    fontSize: 14,
    fontWeight: 600,
  },
};
