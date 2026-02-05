# 🌍 ATLAS PROJECT — MASTER ARCHITECTURE OVERVIEW

ATLAS is a production-style microservices platform running on Kubernetes.

## 🧱 HIGH LEVEL SYSTEM DIAGRAM
*   **Source:** GitHub -> Docker Images -> KIND Kubernetes
*   **Services:** `user-service` (Mongo), `order-service` (Postgres)
*   **Observability:** Prometheus, Grafana, Loki

## 🧾 MASTER PROJECT STATUS

```json
{
  "project": "ATLAS",
  "status": "in-progress",
  "components": {
    "services": {
      "user-service": { "language": "Node.js", "prometheusScraped": false },
      "order-service": { "language": "Node.js", "prometheusScraped": false }
    },
    "databases": {
      "mongodb": { "running": true },
      "postgres": { "running": true }
    }
  }
}
```

## 🛠️ ROADMAP: WHAT IS LEFT TO EXECUTE

### Phase 1: Observability & Basics
1.  **Add Prometheus Scraping:** Create ServiceMonitor/config for `user-service:4000` and `order-service:5000`.
2.  **Grafana Dashboards:** CPU, Memory, Request Count, Error Rate.
3.  **Structured Logging:** Winston/Pino.

### Phase 2: Core Logic
4.  **Database Fix:** Align Order Service to use PostgreSQL (Infrastructure) or Mongo (Code) - *Decision: Use Postgres to match Infra.*
5.  **API Routes:** Implement User and Order CRUD.

### Phase 3: Infrastructure
6.  **Persistent Volumes:** Add PVCs.
7.  **Ingress Controller:** Expose `api.atlas.com`.
8.  **CI/CD:** GitHub Actions.
9.  **Security:** JWT, Secrets, TLS.

## 🧠 PHILOSOPHY
*   Declarative Deployments
*   Metrics First
*   GitOps Ready
