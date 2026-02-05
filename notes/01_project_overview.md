# Project Overview: Atlas

**Atlas** is a microservices-based platform designed with a GitOps approach. The project is structured as a monorepo containing multiple services, a frontend application, and infrastructure configurations.

## Purpose & Motivation
The project appears to be an educational or experimental platform built by **Anand Chaurasia**. The stated motivation is simple: "Just building because I wanted to." It aims to demonstrate a microservices architecture orchestrated via Kubernetes (and likely Helm) with a React frontend.

## Technology Stack

### Backend Services
The backend is built using **Node.js (Express)**.
*   **User Service (`apps/user-service`):**
    *   **Runtime:** Node.js
    *   **Database:** MongoDB
    *   **Key Dependencies:** `express`, `mongoose`, `prom-client` (for Prometheus metrics).
    *   **Port:** 4000
*   **Order Service (`apps/order-service`):**
    *   **Runtime:** Node.js
    *   **Database:** PostgreSQL
    *   **Key Dependencies:** `express`, `mongoose`, `prom-client`.
    *   **Port:** 5000
    *   *Note:* Interestingly, `order-service` seems to require `mongoose` in its `package.json` but the `docker-compose.yml` links it to a `postgres` container. The `server.js` I read earlier for `order-service` also had `mongoose.connect`, which suggests a copy-paste error or a mismatch between intent (Postgres) and implementation (Mongo code). *Verification Needed.*

### Frontend
*   **Application:** `apps/frontend`
*   **Framework:** React (bootstrapped with Vite)
*   **Language:** JavaScript (JSX)
*   **State:** Currently exists as a default starter template (Counter app). It is **not connected** to the backend services yet.
*   **Port:** 3000 (mapped to 80 internally)

### Infrastructure & DevOps
*   **Containerization:** Docker (Dockerfiles present in all apps).
*   **Orchestration:**
    *   **Local:** `docker-compose.yml` handles local development, spinning up mongo, postgres, and the three apps.
    *   **Production/Cluster:** Kubernetes (`k8s/` directory).
*   **GitOps/Configuration:**
    *   `k8s/` contains raw manifests (`deployment.yaml`, `service.yaml`) for services.
    *   `k8s/helm-charts` suggests an intent to use Helm for packaging.
    *   `infrastructure/terraform` exists but is currently empty.
    *   `gitops/` directory exists (contents pending deep dive, likely ArgoCD or Flux configs).
*   **Monitoring:**
    *   `grafana-datasource.yaml` in root suggests Grafana integration.
    *   `prom-client` in services indicates Prometheus metrics scraping.

## Directory Structure
*   `apps/`: Source code for services and frontend.
*   `infrastructure/`: Infrastructure as Code (Terraform - empty).
*   `k8s/`: Kubernetes manifests and Helm charts.
*   `gitops/`: GitOps configurations.
*   `notes/`: Documentation (this directory).
