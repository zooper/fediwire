#!/bin/bash
set -e

# FediWire LXC Container Setup Script
# This script sets up FediWire in an LXC container with Nginx

echo "=== FediWire LXC Setup ==="

# Update system
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "Installing Nginx and curl..."
apt-get install -y nginx curl

# Create app directory
echo "Creating app directory..."
mkdir -p /var/www/fediwire
cd /var/www/fediwire

# Download and extract built app
# You'll need to build locally and transfer, or build in container
echo "Ready to receive app files in /var/www/fediwire"

# Create Nginx config
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/fediwire << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/fediwire;
    index index.html;

    server_name _;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/fediwire /etc/nginx/sites-enabled/fediwire
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

echo ""
echo "=== Setup Complete! ==="
echo "Next steps:"
echo "1. Build the app locally: npm run build"
echo "2. Copy dist/* to this container: scp -r dist/* root@container-ip:/var/www/fediwire/"
echo "3. Access your app at: http://container-ip"
echo ""
