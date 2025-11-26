#!/bin/bash
# FediWire Proxmox LXC Deployment Script
# Run this ON your Proxmox host (192.168.0.21)

set -e

CTID=100  # Container ID - change if needed
HOSTNAME="fediwire"
MEMORY=256
CORES=1
DISK_SIZE=4
TEMPLATE="ubuntu-22.04-standard_22.04-1_amd64.tar.zst"

# Your SSH public key - REPLACE THIS
SSH_PUB_KEY="ssh-rsa AAAAB3... your-key-here"

echo "=== FediWire Proxmox LXC Deployment ==="

# Check if template exists, download if needed
if ! pveam list local | grep -q "$TEMPLATE"; then
    echo "Downloading Ubuntu template..."
    pveam update
    pveam download local "$TEMPLATE"
fi

# Create container
echo "Creating LXC container $CTID..."
pct create $CTID local:vztmpl/$TEMPLATE \
  --hostname $HOSTNAME \
  --memory $MEMORY \
  --cores $CORES \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --storage local-lvm \
  --rootfs local-lvm:$DISK_SIZE \
  --unprivileged 1 \
  --features nesting=1 \
  --start 1

# Wait for container to start
sleep 5

# Setup SSH key
echo "Adding SSH public key..."
pct exec $CTID -- mkdir -p /root/.ssh
pct exec $CTID -- bash -c "echo '$SSH_PUB_KEY' >> /root/.ssh/authorized_keys"
pct exec $CTID -- chmod 700 /root/.ssh
pct exec $CTID -- chmod 600 /root/.ssh/authorized_keys

# Install and configure inside container
echo "Setting up Nginx..."
pct exec $CTID -- bash <<'SETUP_SCRIPT'
set -e

# Update system
apt-get update
apt-get upgrade -y
apt-get install -y nginx curl openssh-server

# Enable SSH
systemctl enable ssh
systemctl start ssh

# Create app directory
mkdir -p /var/www/fediwire

# Configure Nginx
cat > /etc/nginx/sites-available/fediwire <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/fediwire;
    index index.html;

    server_name _;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/fediwire /etc/nginx/sites-enabled/fediwire
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx
systemctl enable nginx

echo "Container setup complete!"
SETUP_SCRIPT

# Get container IP
CT_IP=$(pct exec $CTID -- ip -4 addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')

echo ""
echo "=== Deployment Complete! ==="
echo "Container ID: $CTID"
echo "Container IP: $CT_IP"
echo "SSH Access: ssh root@$CT_IP"
echo ""
echo "Next steps:"
echo "1. Build app locally: npm run build"
echo "2. Deploy files: scp -r dist/* root@$CT_IP:/var/www/fediwire/"
echo "3. Access app: http://$CT_IP"
echo ""
