"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState('/checkout');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl((params.get('callbackUrl') as string) || '/checkout');
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push(callbackUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 420, padding: 28, borderRadius: 12, background: '#fff', boxShadow: '0 10px 30px rgba(2,6,23,0.08)' }}>
        <h2 style={{ margin: '0 0 12px', color: '#000' }}>Sign in</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 10, color: '#000' }}>
            <div style={{ marginBottom: 6, color: '#000' }}>Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              style={{ width: '100%', padding: 10, color: '#000', background: '#fff', border: '1px solid #cfcfcf', borderRadius: 6, boxSizing: 'border-box', fontSize: 14 }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,116,255,0.12)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 10, color: '#000' }}>
            <div style={{ marginBottom: 6, color: '#000' }}>Password</div>
            <div style={{ position: 'relative' }}>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                required
                style={{ width: '100%', padding: '10px 40px 10px 10px', color: '#000', background: '#fff', border: '1px solid #cfcfcf', borderRadius: 6, boxSizing: 'border-box', fontSize: 14 }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,116,255,0.12)')}
                onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <button type="submit" style={{ width: '100%', padding: 10, background: '#0b74ff', color: '#fff', border: 'none' }}>Sign in</button>
        </form>
        <p style={{ marginTop: 12, color: '#000' }}>Don&apos;t have an account? <a href="/signup">Sign up</a></p>
      </div>
    </div>
  );
}
