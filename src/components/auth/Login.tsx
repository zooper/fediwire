import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getAPI } from '../../api/mastodon';

const CLIENT_NAME = 'FediWire';
const REDIRECT_URI = window.location.origin + '/oauth/callback';
const SCOPES = 'read write follow push';

export default function Login() {
  const [instanceUrl, setInstanceUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setInstanceUrl: saveInstanceUrl, setAccessToken, setCurrentAccount } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Normalize instance URL
      let url = instanceUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Initialize API with instance URL
      const api = getAPI(url);

      // Register the app with the instance
      const appData = await api.registerApp(CLIENT_NAME, REDIRECT_URI, SCOPES);

      // Store app credentials in localStorage
      localStorage.setItem('mastodon_client_id', appData.client_id);
      localStorage.setItem('mastodon_client_secret', appData.client_secret);

      // Save instance URL
      saveInstanceUrl(url);

      // Redirect to authorization page
      const authUrl = new URL(`${url}/oauth/authorize`);
      authUrl.searchParams.set('client_id', appData.client_id);
      authUrl.searchParams.set('scope', SCOPES);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');

      window.location.href = authUrl.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to instance');
      setIsLoading(false);
    }
  };

  // Handle OAuth callback
  const handleOAuthCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) return;

    const storedInstanceUrl = localStorage.getItem('mastodon_instance');
    const clientId = localStorage.getItem('mastodon_client_id');
    const clientSecret = localStorage.getItem('mastodon_client_secret');

    if (!storedInstanceUrl || !clientId || !clientSecret) {
      setError('Missing OAuth credentials. Please try logging in again.');
      return;
    }

    setIsLoading(true);

    try {
      const api = getAPI(storedInstanceUrl);

      // Exchange authorization code for access token
      const tokenData = await api.getAccessToken(
        clientId,
        clientSecret,
        code,
        REDIRECT_URI
      );

      // Save access token
      setAccessToken(tokenData.access_token);
      api.setAccessToken(tokenData.access_token);

      // Verify credentials and get account info
      const account = await api.verifyCredentials();
      setCurrentAccount(account);

      // Clean up URL
      window.history.replaceState({}, document.title, '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete authentication');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for OAuth callback on mount
  useEffect(() => {
    if (window.location.pathname === '/oauth/callback' || window.location.search.includes('code=')) {
      handleOAuthCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-mirc-panel flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="irc-window p-8">
          <div className="text-center mb-8">
            <svg
              className="w-16 h-16 mx-auto text-mirc-blue mb-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>
            </svg>
            <h1 className="text-2xl font-bold text-mirc-blue">FediWire</h1>
            <p className="text-mirc-gray mt-2">
              Enter your Mastodon instance URL to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="instance" className="block text-sm font-medium text-mirc-text mb-2">
                Instance URL
              </label>
              <input
                id="instance"
                type="text"
                value={instanceUrl}
                onChange={(e) => setInstanceUrl(e.target.value)}
                placeholder="mastodon.social"
                className="irc-input w-full"
                disabled={isLoading}
                required
              />
              <p className="mt-2 text-xs text-mirc-gray">
                Examples: mastodon.social, fosstodon.org, mas.to
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !instanceUrl.trim()}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                'Connect'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-mirc-border">
            <p className="text-xs text-mirc-gray text-center">
              This app will request read and write access to your Mastodon account.
              Your credentials are never stored by this application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
