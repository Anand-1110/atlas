# Project History & Progress

## Timeline and Key Milestones
The project began as an individual initiative by **Anand Chaurasia**. The development history is relatively short, focusing on establishing the foundational services.

### Key Commits & Actions (Chronological)
1.  **Initial Commit (`88fd7e2`):**
    *   Project initialization.
    *   Basic repository structure setup.
2.  **Configuration (`1197678`):**
    *   Added `.gitignore` to prevent committing unnecessary files (likely `node_modules`, standard IDE configs).
3.  **Frontend Initialization (`13e2fb2`):**
    *   Created the `apps/frontend` directory.
    *   Bootstrapped a React application using **Vite**.
    *   *Status:* The frontend is currently in its default state (Vite + React starter).
4.  **User Service Implementation (`fe44631`):**
    *   Added `apps/user-service`.
    *   Implemented basic Express server.
    *   Added MongoDB connection logic (via Mongoose).
    *   Added Prometheus metrics middleware.

## Current Progress Status

### Completed
-   [x] **Repository Structure:** Monorepo setup with `apps` and `infrastructure` folders.
-   [x] **Backend Skeleton:**
    -   `user-service`: Running, connected to Mongo, exporting metrics.
    -   `order-service`: Running, connected to Postgres (but with potential code mismatch, see Code Analysis), exporting metrics.
-   [x] **Local Orchestration:** `docker-compose.yml` is fully defined to start all services and databases.
-   [x] **Kubernetes Basics:** Deployment and Service manifests exist for the services.

### In Progress / Partially Done
-   [/] **Frontend:** Project exists but contains no custom business logic or connection to backends.
-   [/] **Infrastructure:**
    -   Kubernetes manifests are present but may need hardening (e.g., config maps, secrets).
    -   Helm charts directory exists but content needs verification.
-   [/] **GitOps:** Directory exists, but specific workflows (ArgoCD/Flux) are not fully documented or implemented.

### Not Started
-   [ ] **Terraform:** Directory is empty.
-   [ ] **Service Inter-communication:** No evidence of `order-service` talking to `user-service` or vice versa.
-   [ ] **Auth/Security:** No authentication mechanism (JWT, OAuth) detected in `user-service`.
