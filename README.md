# Atlas - Production-Ready Microservices Platform

A complete, production-grade microservices architecture with Kubernetes, GitOps, CI/CD, monitoring, and observability.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Services](#services)
- [Infrastructure](#infrastructure)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Observability](#monitoring--observability)
- [Testing](#testing)
- [Accessing Services](#accessing-services)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

Atlas is a microservices-based application demonstrating modern cloud-native development practices including:

- **Microservices Architecture** - Independent, scalable services
- **Kubernetes Orchestration** - Container orchestration with KIND
- **GitOps Deployment** - ArgoCD for automated deployments
- **CI/CD Pipeline** - GitHub Actions for continuous integration
- **Observability** - Prometheus, Grafana, and structured logging
- **Database Persistence** - MongoDB and PostgreSQL
- **API Gateway** - NGINX Ingress for traffic routing

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NGINX Ingress                             │
│                  (atlas.local - Port 80)                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│  User Service  │      │ Order Service   │
│  (Port 4000)   │      │  (Port 5000)    │
└───────┬────────┘      └────────┬────────┘
        │                        │
    ┌───▼────┐              ┌───▼──────┐
    │ MongoDB│              │PostgreSQL│
    └────────┘              └──────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Monitoring Stack                               │
│                                                                  │
│  ┌────────────┐      ┌────────────┐      ┌──────────────┐     │
│  │ Prometheus │─────▶│  Grafana   │      │   Winston    │     │
│  │  (Metrics) │      │(Dashboards)│      │  (Logging)   │     │
│  └────────────┘      └────────────┘      └──────────────┘     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   GitOps & CI/CD                                 │
│                                                                  │
│  GitHub ─▶ Actions ─▶ Build ─▶ Test ─▶ GHCR ─▶ ArgoCD ─▶ K8s  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### **Backend Services**
- Node.js v18
- Express.js v5
- Mongoose (MongoDB ODM)
- PostgreSQL client

### **Infrastructure**
- Kubernetes (KIND - Kubernetes in Docker)
- Docker & Docker Compose
- NGINX Ingress Controller
- Helm Charts

### **Databases**
- MongoDB v7
- PostgreSQL v16

### **CI/CD & GitOps**
- GitHub Actions
- ArgoCD v2.11
- GitHub Container Registry (GHCR)

### **Monitoring & Logging**
- Prometheus v2.52
- Grafana v11.0
- Winston (Structured logging)
- prom-client (Metrics)

### **Testing**
- Jest v30
- Supertest v7

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

**Required:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (v20.10+)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (v1.28+)
- [KIND](https://kind.sigs.k8s.io/docs/user/quick-start/) (v0.20+)
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)

**Optional:**
- [Helm](https://helm.sh/docs/intro/install/) (v3.12+)
- [ArgoCD CLI](https://argo-cd.readthedocs.io/en/stable/cli_installation/)

**Verify Installation:**
```powershell
docker --version
kubectl version --client
kind --version
node --version
npm --version
```

---

## 🚀 Quick Start

### **Step 1: Clone Repository**

```bash
git clone https://github.com/Anand-1110/atlas.git
cd atlas
```

---

### **Step 2: Create Kubernetes Cluster**

```powershell
# Create KIND cluster
kind create cluster --name atlas-cluster --config k8s/kind-config.yaml

# Verify cluster
kubectl cluster-info
kubectl get nodes
```

**Expected output:**
```
NAME                          STATUS   ROLES           AGE   VERSION
atlas-cluster-control-plane   Ready    control-plane   1m    v1.27.3
```

---

### **Step 3: Install NGINX Ingress**

```powershell
# Install Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for Ingress to be ready
kubectl wait --namespace ingress-nginx `
  --for=condition=ready pod `
  --selector=app.kubernetes.io/component=controller `
  --timeout=90s
```

---

### **Step 4: Deploy Databases**

```powershell
# Create namespaces
kubectl create namespace databases

# Deploy MongoDB
kubectl apply -f k8s/databases/mongo-pvc.yaml
kubectl apply -f k8s/databases/mongo-deployment.yaml
kubectl apply -f k8s/databases/mongo-service.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/databases/postgres-pvc.yaml
kubectl apply -f k8s/databases/postgres-deployment.yaml
kubectl apply -f k8s/databases/postgres-service.yaml

# Verify
kubectl get pods -n databases
```

**Wait for pods to be Running** (~30 seconds)

---

### **Step 5: Deploy Microservices**

```powershell
# Deploy User Service
kubectl apply -f k8s/user-service/deployment.yaml
kubectl apply -f k8s/user-service/service.yaml

# Deploy Order Service
kubectl apply -f k8s/order-service/deployment.yaml
kubectl apply -f k8s/order-service/service.yaml

# Verify
kubectl get pods
kubectl get svc
```

---

### **Step 6: Setup Ingress**

```powershell
# Install Ingress
helm install atlas-ingress k8s/helm-charts/ingress/

# Verify
kubectl get ingress
```

**Add to hosts file:**

**Windows:** `C:\Windows\System32\drivers\etc\hosts`
```
127.0.0.1 atlas.local
```

**Linux/Mac:** `/etc/hosts`
```
127.0.0.1 atlas.local
```

---

### **Step 7: Install ArgoCD**

```powershell
# Create ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# Get admin password
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```

**Port-forward ArgoCD:**
```powershell
kubectl port-forward -n argocd svc/argocd-server 8080:443
```

**Access:** https://localhost:8080
- Username: `admin`
- Password: (from command above)

---

### **Step 8: Deploy Applications via ArgoCD**

```powershell
# Create ArgoCD applications
kubectl apply -f k8s/argocd/argocd-app-user-service.yaml
kubectl apply -f k8s/argocd/argocd-app-order-service.yaml

# Verify in ArgoCD UI
# https://localhost:8080
```

---

### **Step 9: Install Monitoring Stack**

```powershell
# Create monitoring namespace
kubectl create namespace monitoring

# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring

# Verify
kubectl get pods -n monitoring
```

**Port-forward Grafana:**
```powershell
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

**Access:** http://localhost:3000
- Username: `admin`
- Password: `prom-operator`

---

### **Step 10: Test the Services**

**Via Ingress:**
```powershell
# User Service
curl http://atlas.local/users/health

# Order Service
curl http://atlas.local/orders/health
```

**Direct access:**
```powershell
# Port-forward User Service
kubectl port-forward svc/user-service 4000:4000

# Port-forward Order Service
kubectl port-forward svc/order-service 5000:5000

# Test
curl http://localhost:4000/health
curl http://localhost:5000/health
```

---

## 📁 Project Structure

```
atlas/
├── apps/                          # Microservices source code
│   ├── user-service/
│   │   ├── server.js              # Main application
│   │   ├── logger.js              # Winston logger
│   │   ├── models/                # MongoDB models
│   │   ├── tests/                 # Jest tests
│   │   ├── package.json
│   │   └── Dockerfile
│   └── order-service/
│       ├── server.js
│       ├── logger.js
│       ├── models/                # PostgreSQL models
│       ├── tests/
│       ├── package.json
│       └── Dockerfile
│
├── k8s/                           # Kubernetes manifests
│   ├── user-service/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── order-service/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── databases/
│   │   ├── mongo-deployment.yaml
│   │   ├── mongo-service.yaml
│   │   ├── postgres-deployment.yaml
│   │   └── postgres-service.yaml
│   ├── argocd/
│   │   ├── argocd-app-user-service.yaml
│   │   └── argocd-app-order-service.yaml
│   ├── monitoring/
│   │   ├── prometheus-values.yaml
│   │   ├── grafana-dashboard-configmap.yaml
│   │   └── servicemonitors/
│   ├── helm-charts/
│   │   └── ingress/
│   │       ├── Chart.yaml
│   │       ├── values.yaml
│   │       └── templates/
│   └── kind-config.yaml
│
├── .github/
│   └── workflows/                 # CI/CD pipelines
│       ├── ci-user-service.yml
│       └── ci-order-service.yml
│
├── architecture/                  # Documentation
│   ├── System_Architecture_Overview.md
│   └── Detailed_Service_Control_Flow.md
│
├── notes/                         # Project notes
│   └── 01_project_overview.md
│
└── README.md                      # This file
```

---

## 🎪 Services

### **User Service** (`apps/user-service`)

**Purpose:** User management microservice

**Tech Stack:**
- Node.js + Express
- MongoDB (Mongoose)
- Winston logging
- Prometheus metrics

**Endpoints:**
```
GET    /health               # Health check
GET    /users                # List all users
GET    /users/:id            # Get user by ID
POST   /users                # Create user
PUT    /users/:id            # Update user
DELETE /users/:id            # Delete user
GET    /metrics              # Prometheus metrics
```

**Environment Variables:**
```env
PORT=4000
MONGO_URL=mongodb://atlas-mongo:27017/users
LOG_LEVEL=info
```

---

### **Order Service** (`apps/order-service`)

**Purpose:** Order management microservice

**Tech Stack:**
- Node.js + Express
- PostgreSQL
- Winston logging
- Prometheus metrics

**Endpoints:**
```
GET    /health               # Health check
GET    /orders               # List all orders
GET    /orders/:id           # Get order by ID
POST   /orders               # Create order
PUT    /orders/:id           # Update order
DELETE /orders/:id           # Delete order
GET    /metrics              # Prometheus metrics
```

**Environment Variables:**
```env
PORT=5000
POSTGRES_HOST=atlas-postgres
POSTGRES_PORT=5432
POSTGRES_DB=orders
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
LOG_LEVEL=info
```

---

## 🏗️ Infrastructure

### **Kubernetes Resources**

**Deployments:**
- `user-service`: 2 replicas
- `order-service`: 2 replicas
- `atlas-mongo`: 1 replica (StatefulSet recommended for production)
- `atlas-postgres`: 1 replica (StatefulSet recommended for production)

**Services:**
- `user-service`: ClusterIP (4000)
- `order-service`: ClusterIP (5000)
- `atlas-mongo`: ClusterIP (27017)
- `atlas-postgres`: ClusterIP (5432)

**Ingress:**
- Hostname: `atlas.local`
- Routes:
  - `/users/*` → user-service:4000
  - `/orders/*` → order-service:5000

**Resource Limits:**
```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**

**Trigger:** Push to `main` branch with changes in service directory

**Workflow Steps:**

1. **Checkout Code**
   - Clone repository
   - Checkout commit SHA

2. **Setup Docker Buildx**
   - Enable advanced Docker features
   - Configure build caching

3. **Login to GHCR**
   - Authenticate to GitHub Container Registry
   - Uses automatic `GITHUB_TOKEN`

4. **Build Docker Image**
   - Build with commit SHA as tag
   - Cache layers for faster rebuilds
   - Tag as `latest` and `<commit-sha>`

5. **Run Tests**
   - Install dependencies (`npm ci`)
   - Run Jest tests
   - Generate coverage report
   - **Fail workflow if tests fail**

6. **Push to Registry**
   - Push to `ghcr.io/anand-1110/user-service:<sha>`
   - Push to `ghcr.io/anand-1110/user-service:latest`

7. **Update Kubernetes Manifest**
   - Update `image:` in deployment.yaml
   - Change to new commit SHA tag

8. **Commit & Push**
   - Commit updated manifest
   - Push back to repository
   - **Triggers ArgoCD sync!**

**Typical Duration:** ~2-3 minutes

---

### **GitOps with ArgoCD**

**How it Works:**

```
Developer → Git Push → GitHub Actions → Docker Build → GHCR
                                             ↓
                                    Update deployment.yaml
                                             ↓
                                      Git commit & push
                                             ↓
ArgoCD (polls Git every 3 min) → Detects change → Syncs to Kubernetes
                                             ↓
                                    Kubernetes deploys new pods
```

**ArgoCD Applications:**
- `user-service`: Syncs `k8s/user-service/`
- `order-service`: Syncs `k8s/order-service/`

**Sync Policy:**
- Manual sync (can enable auto-sync)
- Self-heal enabled
- Prune resources enabled

---

## 📊 Monitoring & Observability

### **Prometheus**

**Metrics Collected:**
- HTTP request count & latency
- Active connections
- Memory & CPU usage
- Custom business metrics

**Access:**
```powershell
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
```
**URL:** http://localhost:9090

**Example Queries:**
```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

---

### **Grafana**

**Dashboards:**
1. **Kubernetes Cluster Overview**
   - Node metrics
   - Pod status
   - Resource utilization

2. **User Service Dashboard**
   - Request rate
   - Response time
   - Error rate
   - Active users

3. **Order Service Dashboard**
   - Order creation rate
   - Processing time
   - Failed orders

**Access:**
```powershell
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```
**URL:** http://localhost:3000
- Username: `admin`
- Password: `prom-operator`

---

### **Logging**

**Winston Structured Logging:**

```javascript
logger.info('User created', { 
  userId: user._id, 
  email: user.email 
});
```

**Log Levels:**
- `error` - Application errors
- `warn` - Warning messages
- `info` - General information
- `debug` - Detailed debugging (dev only)

**View Logs:**
```powershell
# User Service logs
kubectl logs -l app=user-service --tail=100 -f

# Order Service logs
kubectl logs -l app=order-service --tail=100 -f

# Filter by level
kubectl logs -l app=user-service | Select-String "error"
```

---

## 🧪 Testing

### **Running Tests**

**User Service:**
```bash
cd apps/user-service
npm test
```

**With coverage:**
```bash
npm test -- --coverage
```

**Coverage Report:**
- HTML: `apps/user-service/coverage/lcov-report/index.html`
- Terminal summary included

**Current Coverage:** 25% (placeholder tests)
**Target:** 80%+

---

### **Test Structure**

```javascript
// apps/user-service/server.test.js
describe('User Service', () => {
  test('placeholder test passes', () => {
    expect(true).toBe(true);
  });
  
  test('health check returns correct structure', () => {
    const mockResponse = {
      status: 'healthy',
      version: '3.0',
      service: 'user-service',
      timestamp: expect.any(String)
    };
    
    expect(mockResponse).toHaveProperty('status');
    expect(mockResponse.version).toBe('3.0');
  });
});
```

---

## 🌐 Accessing Services

### **Option 1: Via Ingress (Recommended)**

**Requirements:** Add `127.0.0.1 atlas.local` to hosts file

```bash
# User Service
curl http://atlas.local/users/health

# Order Service  
curl http://atlas.local/orders/health

# Create user
curl -X POST http://atlas.local/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

---

### **Option 2: Port Forwarding**

```powershell
# User Service
kubectl port-forward svc/user-service 4000:4000

# Order Service (in new terminal)
kubectl port-forward svc/order-service 5000:5000

# Test
curl http://localhost:4000/health
curl http://localhost:5000/health
```

---

### **Option 3: ArgoCD UI**

```powershell
kubectl port-forward -n argocd svc/argocd-server 8080:443
```

**URL:** https://localhost:8080
- View application status
- See deployment history
- Manual sync
- View events and logs

---

### **Option 4: Grafana Dashboards**

```powershell
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

**URL:** http://localhost:3000
- Real-time metrics
- Service health
- Performance graphs

---

## 💻 Development Workflow

### **Making Changes to Services**

**1. Edit Code:**
```bash
# Make changes to service
code apps/user-service/server.js
```

**2. Run Tests Locally:**
```bash
cd apps/user-service
npm test
```

**3. Commit & Push:**
```bash
git add .
git commit -m "feat: Add new endpoint"
git push origin main
```

**4. Monitor CI/CD:**
- **GitHub Actions:** https://github.com/Anand-1110/atlas/actions
- Watch build and tests
- See Docker image push

**5. Verify Deployment:**
- **ArgoCD:** https://localhost:8080
- Watch auto-sync
- See new pods rolling out

**6. Test in Kubernetes:**
```bash
# Check new pods
kubectl get pods | Select-String "user-service"

# Test endpoint
curl http://atlas.local/users/health
```

**Total time:** ~5-6 minutes from commit to production!

---

### **Local Development**

**Run services locally:**

```bash
# User Service
cd apps/user-service
npm install
npm start

# In browser
http://localhost:4000/health
```

**With local databases:**
```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongo mongo:7

# Start PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password --name postgres postgres:16

# Update .env
MONGO_URL=mongodb://localhost:27017/users
POSTGRES_HOST=localhost
```

---

## 🔧 Troubleshooting

### **Pods Not Starting**

```powershell
# Check pod status
kubectl get pods

# Describe pod for events
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>

# Check if image exists
kubectl describe pod <pod-name> | Select-String "Image:"
```

**Common Issues:**
- ImagePullBackOff → Check image name and registry
- CrashLoopBackOff → Check logs for errors
- Pending → Check resource availability

---

### **Database Connection Errors**

```powershell
# Check database pods
kubectl get pods -n databases

# Test MongoDB connection
kubectl exec -it <mongo-pod> -- mongosh

# Test PostgreSQL connection
kubectl exec -it <postgres-pod> -- psql -U admin -d orders
```

**Common Issues:**
- Connection refused → Check service names
- Authentication failed → Verify credentials
- Database not found → Check initialization

---

### **Ingress Not Working**

```powershell
# Check ingress
kubectl get ingress

# Describe for events
kubectl describe ingress atlas-ingress

# Check Ingress controller
kubectl get pods -n ingress-nginx
```

**Checklist:**
- ✅ Hosts file updated?
- ✅ Ingress controller running?
- ✅ Services responding?
- ✅ Using correct hostname?

---

### **ArgoCD Sync Issues**

```powershell
# Check ArgoCD applications
kubectl get applications -n argocd

# View ArgoCD logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller

# Manual sync
argocd app sync user-service
```

---

### **GitHub Actions Failures**

**Check workflow logs:**
1. Go to: https://github.com/Anand-1110/atlas/actions
2. Click failed workflow
3. Expand failed step
4. Review error message

**Common Issues:**
- Tests failed → Fix code and re-run
- Docker build failed → Check Dockerfile
- Permission denied → Check workflow permissions in repo settings

---

## 📚 Additional Resources

**Documentation:**
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [ArgoCD Docs](https://argo-cd.readthedocs.io/)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Tutorials](https://grafana.com/tutorials/)

**Project Documentation:**
- [Architecture Overview](architecture/System_Architecture_Overview.md)
- [Service Control Flow](architecture/Detailed_Service_Control_Flow.md)
- [Project Notes](notes/01_project_overview.md)

---

## 🤝 Contributing

**To contribute:**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes
4. Run tests (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

**Code Standards:**
- Write tests for new features
- Maintain >80% code coverage
- Follow existing code style
- Update documentation

---

## 📄 License

This project is created for educational and portfolio purposes.

---

## 👤 Author

**Anand**
- GitHub: [@Anand-1110](https://github.com/Anand-1110)
- Project: [Atlas](https://github.com/Anand-1110/atlas)

---

## 🎉 Acknowledgments

Built with:
- Node.js & Express
- Kubernetes & Docker
- ArgoCD & GitHub Actions
- Prometheus & Grafana
- MongoDB & PostgreSQL

---

## 📊 Project Stats

- **Lines of Code:** ~5,000+
- **Services:** 2 microservices
- **Databases:** 2 (MongoDB, PostgreSQL)
- **Test Coverage:** 25% (growing)
- **Deployment Time:** <6 minutes (automated)
- **Uptime:** High availability with rolling updates

---

**🚀 Ready to deploy cloud-native microservices!**
