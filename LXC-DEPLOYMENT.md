# FediWire LXC Container Deployment Guide

## Quick Start

### 1. Create LXC Container

```bash
# Create Ubuntu 22.04 container
lxc launch ubuntu:22.04 fediwire

# Or Debian
lxc launch images:debian/12 fediwire
```

### 2. Copy setup script to container

```bash
lxc file push lxc-setup.sh fediwire/root/
```

### 3. Run setup script in container

```bash
lxc exec fediwire -- bash /root/lxc-setup.sh
```

### 4. Build and deploy app

```bash
# Build locally
npm run build

# Copy to container
lxc file push -r dist/* fediwire/var/www/fediwire/
```

### 5. Access your app

```bash
# Get container IP
lxc list fediwire

# Access in browser
http://<container-ip>
```

## Alternative: All-in-one deployment

### Option A: Build inside container

```bash
# Install Node.js in container
lxc exec fediwire -- bash -c "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"
lxc exec fediwire -- apt-get install -y nodejs

# Copy project to container
lxc file push -r . fediwire/root/mastodon/

# Build in container
lxc exec fediwire -- bash -c "cd /root/mastodon && npm install && npm run build"

# Move to web root
lxc exec fediwire -- cp -r /root/mastodon/dist/* /var/www/fediwire/
```

### Option B: Pre-built container image

If you want to create a reusable image:

```bash
# After initial setup, publish as image
lxc publish fediwire --alias fediwire-app

# Deploy on other hosts
lxc launch fediwire-app my-fediwire-instance
```

## Configuration

### Port Forwarding (if using NAT)

```bash
# Forward host port 8080 to container port 80
lxc config device add fediwire fediwire-port proxy \
    listen=tcp:0.0.0.0:8080 connect=tcp:127.0.0.1:80
```

### Static IP Address

```bash
# Set static IP
lxc config device add fediwire eth0 nic \
    name=eth0 nictype=bridged parent=lxdbr0 \
    ipv4.address=10.x.x.x
```

### Resource Limits

```bash
# Set memory limit
lxc config set fediwire limits.memory 256MB

# Set CPU limit
lxc config set fediwire limits.cpu 1
```

### Auto-start on boot

```bash
lxc config set fediwire boot.autostart true
```

## HTTPS with Reverse Proxy

### Using nginx on host

```nginx
server {
    listen 443 ssl http2;
    server_name fediwire.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://<container-ip>;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Using Caddy on host

```caddy
fediwire.example.com {
    reverse_proxy <container-ip>:80
}
```

## Maintenance

### View logs

```bash
lxc exec fediwire -- journalctl -u nginx -f
```

### Update app

```bash
# Build new version locally
npm run build

# Push to container
lxc file push -r dist/* fediwire/var/www/fediwire/
```

### Container management

```bash
# Start container
lxc start fediwire

# Stop container
lxc stop fediwire

# Restart container
lxc restart fediwire

# Shell access
lxc exec fediwire -- bash

# Container info
lxc info fediwire
```

## Backup

```bash
# Snapshot
lxc snapshot fediwire backup-$(date +%Y%m%d)

# Export container
lxc export fediwire fediwire-backup.tar.gz

# Restore from snapshot
lxc restore fediwire backup-20250126
```

## Performance

The app is very lightweight:
- **RAM**: ~50-100MB (Nginx + static files)
- **CPU**: Minimal (only during requests)
- **Disk**: ~10-20MB for app files

Perfect for running multiple instances on one host!
