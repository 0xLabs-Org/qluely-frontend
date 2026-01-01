"use client";
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const searchParams = useSearchParams();
  const returnTo = (searchParams?.get('return_to') as string) || '/';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#0f172a 0%, #071032 100%)', padding: 24 }}>
      <div style={{ maxWidth: 920, width: '100%', display: 'flex', gap: 32, alignItems: 'stretch' }}>
        <aside style={{ flex: 1, color: '#fff', padding: 40, borderRadius: 12, background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))', boxShadow: '0 6px 20px rgba(2,6,23,0.6)' }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Upgrade to Pro</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 10 }}>Faster syncs, advanced reports, priority support — one simple upgrade.</p>

          <ul style={{ marginTop: 18, color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
            <li>Unlimited campaigns</li>
            <li>Priority email support</li>
            <li>Advanced analytics & CSV export</li>
          </ul>

          <div style={{ marginTop: 28 }}>
            <strong style={{ display: 'block', color: '#fff' }}>Already have an account?</strong>
            <p style={{ marginTop: 6, color: 'rgba(255,255,255,0.8)' }}>Sign in with your email to continue to checkout.</p>
          </div>
        </aside>

        <main style={{ width: 420, padding: 28, borderRadius: 12, background: '#fff', boxShadow: '0 10px 30px rgba(2,6,23,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ width: 64, height: 64, margin: '0 auto', background: '#0b74ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>Q</div>
            <h2 style={{ margin: '12px 0 6px' }}>Sign in to continue</h2>
            <p style={{ margin: 0, color: '#666' }}>Enter your email and we'll sign you in or create an account.</p>
          </div>

          <form method="post" action="/api/auth/login" style={{ marginTop: 18 }}>
            <input type="hidden" name="return_to" value={returnTo} />
            <label style={{ display: 'block', marginBottom: 10 }}>
              <span style={{ display: 'block', marginBottom: 6, color: '#333' }}>Email</span>
              <input name="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@company.com" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e6e6' }} />
            </label>

            <label style={{ display: 'block', marginBottom: 10 }}>
              <span style={{ display: 'block', marginBottom: 6, color: '#333' }}>Password</span>
              <input name="password" type="password" required placeholder="Choose a strong password" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e6e6' }} />
            </label>

            <button type="submit" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#0b74ff', color: '#fff', border: 'none', fontWeight: 600 }}>Sign in / Sign up</button>
          </form>

          

          <p style={{ marginTop: 18, textAlign: 'center', color: '#888', fontSize: 13 }}>By continuing you agree to our <a href="/terms" style={{ color: '#0b74ff' }}>Terms</a> and <a href="/privacy" style={{ color: '#0b74ff' }}>Privacy Policy</a>.</p>
        </main>
      </div>
    </div>
  );
}
