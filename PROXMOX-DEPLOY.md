# Deploy FediWire to Proxmox LXC

## Current Production Environment

- **Container ID**: 123
- **Container IP**: 10.63.21.31 (vmbr1 bridge)
- **Public URL**: https://fediwire.kernel-panic.lol
- **Proxmox Host**: root@192.168.0.21
- **Reverse Proxy**: Caddy (Container ID 114)

## Quick Deploy (Code Changes)

When you make code changes and want to deploy them:

```bash
# 1. Build the app
npm run build

# 2. Create tarball
tar czf fediwire-dist.tar.gz -C dist .

# 3. Copy to container
scp fediwire-dist.tar.gz root@10.63.21.31:/tmp/

# 4. Extract on container
ssh root@10.63.21.31 "cd /var/www/fediwire && tar xzf /tmp/fediwire-dist.tar.gz && rm /tmp/fediwire-dist.tar.gz"

# 5. Verify deployment
curl -I https://fediwire.kernel-panic.lol/
```

That's it! No need to restart nginx - it serves static files.

## Initial Container Setup (Already Done)

This was the initial setup - only needed once:

### Prerequisites

You need your SSH public key. Get it with:

```bash
cat ~/.ssh/id_rsa.pub
```

### Step 1: Edit the deployment script

Open `deploy-to-proxmox.sh` and replace:
```bash
SSH_PUB_KEY="ssh-rsa AAAAB3... your-key-here"
```

With your actual public key.

### Step 2: Copy script to Proxmox host

```bash
scp deploy-to-proxmox.sh root@192.168.0.21:/root/
```

### Step 3: Run on Proxmox host

```bash
ssh root@192.168.0.21
bash /root/deploy-to-proxmox.sh
```

The script will output the container IP address.

### Step 4: Build and deploy the app

On your local machine:

```bash
# Build the app
npm run build

# Deploy to container
tar czf fediwire-dist.tar.gz -C dist .
scp fediwire-dist.tar.gz root@10.63.21.31:/tmp/
ssh root@10.63.21.31 "cd /var/www/fediwire && tar xzf /tmp/fediwire-dist.tar.gz"
```

### Step 5: Access your app

Open browser to `https://fediwire.kernel-panic.lol`

## Troubleshooting

### Can't SSH to container

Wait 30 seconds after creation, then try again:
```bash
ssh root@<CONTAINER_IP>
```

### Check container status

On Proxmox host:
```bash
pct status 100
pct enter 100
```

### View nginx logs

```bash
ssh root@<CONTAINER_IP>
journalctl -u nginx -f
```

### Container already exists

Change CTID in script:
```bash
CTID=101  # Use different number
```

## Manual alternative

If you prefer to do it manually via Proxmox web UI:

1. Go to https://192.168.0.21:8006
2. Create new LXC container
3. Use Ubuntu 22.04 template
4. Give it 256MB RAM, 1 core, 4GB disk
5. After creation, use web console to run commands from lxc-setup.sh
