# Codebase Analysis

## Backend Services

### Common Patterns
Both services share a similar architecture:
*   **Framework:** Express.js
*   **Metrics:** `prom-client` integration exposing metrics at `/metrics`.
*   **Health Check:** Simple `/health` endpoint returning a string.
*   **Configuration:** Environment variables loaded via `dotenv`.

### `user-service`
*   **Path:** `apps/user-service`
*   **Database:** MongoDB (via Mongoose).
*   **Status:** Functional. Connects to `MONGO_URL` env var.
*   **Docker:** 
    *   Exposes port 4000.
    *   Depends on `mongo` service in `docker-compose`.

### `order-service` (Critical Finding)
*   **Path:** `apps/order-service`
*   **Database:** Implemented with **MongoDB (Mongoose)** but infrastructure provisions **PostgreSQL**.
*   **Code Evidence (`server.js`):**
    ```javascript
    const mongoose = require("mongoose");
    // ...
    mongoose.connect(process.env.MONGO_URL)
    ```
*   **Infrastructure Evidence (`docker-compose.yml`):**
    ```yaml
    order-service:
      build: ./apps/order-service
      depends_on:
        - postgres
    ```
*   **Analysis:** This is a **mismatch**. The code expects MongoDB, but the orchestration layer provides Postgres. This service will likely fail to start or crash when trying to connect if `MONGO_URL` points to a Postgres instance, or if `MONGO_URL` is missing and it expects a Postgres connection string.

## Frontend
*   **Path:** `apps/frontend`
*   **Structure:** Standard Vite + React template.
*   **Key Files:**
    *   `src/App.jsx`: Contains the default "count" state and logos.
    *   `vite.config.js`: Standard configuration.
*   **Missing Integrations:**
    *   No API clients (Axios/Fetch) configured.
    *   No routing (React Router) setup.
    *   No calls to `user-service` or `order-service`.

## Infrastructure & Configuration

### Docker Compose
*   **Services:** `mongo`, `postgres`, `user-service`, `order-service`, `frontend`.
*   **Networking:** default bridge network (implicit).
*   **Ports:**
    *   Mongo: 27017
    *   Postgres: 5432
    *   User Service: 4000
    *   Order Service: 5000
    *   Frontend: 3000 (Host) -> 80 (Container)

### Kubernetes
*   **Manifests:** Located in `k8s/<service-name>`.
*   **Deployment (`k8s/user-service/deployment.yaml`):**
    *   Kind: Deployment
    *   Replicas: 1
    *   Image: `anand1110/atlas-user-service:latest` (Indicates images are pushed to Docker Hub).
    *   Ports: Container port 4000.
    *   Env Vars: Expects `MONGO_URL`.
*   **Service:** Type `ClusterIP` (verified from standard patterns, assumed from file size).

## Terraform
*   Directory `infrastructure/terraform` is **empty**. This indicates infrastructure-as-code is planned but not started.
