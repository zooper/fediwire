# FediWire Deployment Guide

## Quick Deploy

```bash
./deploy.sh
```

## Manual Deployment Steps

1. **Build the production version:**
   ```bash
   npm run build
   ```

2. **Deploy to server:**
   ```bash
   scp -r dist/* root@10.63.21.31:/var/www/fediwire/
   ```

3. **Reload nginx:**
   ```bash
   ssh root@10.63.21.31 "systemctl reload nginx"
   ```

## Server Configuration

- **Server**: 10.63.21.31 (LXC container)
- **Web root**: `/var/www/fediwire/`
- **Nginx config**: `/etc/nginx/sites-available/fediwire`
- **Public URL**: https://fediwire.kernel-panic.lol/
- **Reverse proxy**: Caddy (on separate server)

## Cache Issues

If changes don't appear after deployment:

1. **Browser cache**: Hard refresh with `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Caddy cache**: Restart Caddy on the proxy server:
   ```bash
   systemctl restart caddy
   ```

## Nginx Cache Headers

The nginx config is set up to:
- Cache JS/CSS files for 1 year (they have content hashes in filenames)
- Never cache HTML files (to get new asset references immediately)
- This ensures updates are picked up quickly while still benefiting from caching

## Development Server

For local testing before deployment:

```bash
npm run dev
```

Server runs at: http://localhost:5174/

**Always test locally before deploying to production!**
