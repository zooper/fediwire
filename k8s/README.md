# Kubernetes Deployment for FediWire

## Prerequisites

- Kubernetes cluster
- kubectl configured
- Docker registry access (or use local image)
- Ingress controller (nginx, traefik, etc.)

## Quick Deploy

### 1. Build and push image

```bash
# Build the image
docker build -t fediwire:latest .

# Tag for your registry (optional)
docker tag fediwire:latest your-registry.com/fediwire:latest

# Push to registry (optional)
docker push your-registry.com/fediwire:latest
```

### 2. Update ingress.yaml

Edit `k8s/ingress.yaml` and change:
- `host:` to your domain
- `ingressClassName:` to match your ingress controller
- Uncomment TLS section if using HTTPS

### 3. Deploy to Kubernetes

```bash
# Using kubectl
kubectl apply -f k8s/

# Or using kustomize
kubectl apply -k k8s/
```

### 4. Verify deployment

```bash
# Check pods
kubectl get pods -l app=fediwire

# Check service
kubectl get svc fediwire

# Check ingress
kubectl get ingress fediwire
```

## Configuration Options

### Scaling

Adjust replicas in `deployment.yaml`:
```yaml
spec:
  replicas: 3  # Change this number
```

### Resource Limits

Modify in `deployment.yaml`:
```yaml
resources:
  requests:
    memory: "32Mi"
    cpu: "10m"
  limits:
    memory: "128Mi"
    cpu: "100m"
```

### Custom Domain

Update `ingress.yaml`:
```yaml
rules:
- host: your-domain.com
```

## Using Local Image (No Registry)

If deploying to a local cluster (minikube, kind, k3s):

```bash
# Build image in cluster context
docker build -t fediwire:latest .

# For minikube
minikube image load fediwire:latest

# For kind
kind load docker-image fediwire:latest

# Then deploy
kubectl apply -f k8s/
```

## HTTPS with cert-manager

1. Install cert-manager
2. Create ClusterIssuer for Let's Encrypt
3. Uncomment TLS section in `ingress.yaml`
4. Uncomment cert-manager annotation

## Health Checks

The deployment includes:
- **Liveness probe**: Restarts pod if unhealthy
- **Readiness probe**: Removes from service if not ready

## Monitoring

Access logs:
```bash
kubectl logs -l app=fediwire -f
```

## Cleanup

```bash
kubectl delete -f k8s/
```
