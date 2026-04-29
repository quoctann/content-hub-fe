import { adminLogin } from '@/services/admin.service';
import { useAuthStore } from '@/stores/auth.store';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await adminLogin({ username, password });
      setTokens(res.access_token, res.refresh_token, res.expires_in);
      navigate('/admin/dashboard', { replace: true });
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-center text-foreground mb-2">Admin Portal</h1>
        <p className="text-center text-muted-foreground text-sm mb-8">
          Sign in to manage your content
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="admin-username"
              className="block text-sm font-semibold mb-2 text-foreground"
            >
              Username
            </label>
            <input
              id="admin-username"
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-semibold mb-2 text-foreground"
            >
              Password
            </label>
            <input
              id="admin-password"
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div
              className="bg-destructive/10 border border-destructive/30 rounded-md px-4 py-3 text-destructive text-sm flex items-center gap-2"
              role="alert"
            >
              <span>⚠</span> <span>{error}</span>
            </div>
          )}

          <button
            id="admin-login-btn"
            className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 mt-6"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
            ) : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
