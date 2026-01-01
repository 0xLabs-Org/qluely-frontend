"use client";
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push('/checkout');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign up');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 420, padding: 28, borderRadius: 12, background: '#fff', boxShadow: '0 10px 30px rgba(2,6,23,0.08)' }}>
        <h2 style={{ margin: '0 0 12px', color: '#000' }}>Create account</h2>
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
            <div style={{ marginBottom: 6, color: '#000' }}>Username</div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              required
              style={{ width: '100%', padding: 10, color: '#000', background: '#fff', border: '1px solid #cfcfcf', borderRadius: 6, boxSizing: 'border-box', fontSize: 14 }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,116,255,0.12)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 10, color: '#000' }}>
            <div style={{ marginBottom: 6, color: '#000' }}>Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              style={{ width: '100%', padding: 10, color: '#000', background: '#fff', border: '1px solid #cfcfcf', borderRadius: 6, boxSizing: 'border-box', fontSize: 14 }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,116,255,0.12)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
            />
          </label>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <button type="submit" style={{ width: '100%', padding: 10, background: '#0b74ff', color: '#fff', border: 'none' }}>Create account</button>
        </form>
        <p style={{ marginTop: 12, color: '#000' }}>Already have an account? <a href="/signin">Sign in</a></p>
      </div>
    </div>
  );
}
