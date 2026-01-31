# System Architecture Overview

This diagram represents the high-level context of the **Atlas** microservices platform running on Kubernetes (KIND cluster).

```mermaid
graph TB
    User((User))
    Admin((Admin/DevOps))

    subgraph "Atlas Platform - KIND Cluster"
        FE[Frontend Application\n(React/Vite)\nPort 3000]
        Gateway[API Gateway / Ingress\n(Planned)]
        Auth[User Service\n(Node.js + MongoDB)\nPort 4000]
        Order[Order Service\n(Node.js + PostgreSQL + Prisma)\nPort 5000]
    end

    User -->|Uses| FE
    Admin -->|Deploys/Monitors| FE
    
    FE -->|HTTP/REST| Auth
    FE -->|HTTP/REST| Order
    
    %% Conceptual Gateway flow
    FE -.->|Future| Gateway
    Gateway -.-> Auth
    Gateway -.-> Order
    
    classDef migrated fill:#9f9,stroke:#333,stroke-width:2px;
    class Order migrated
```

## Description
*   **User:** End-user interacting with the React Frontend.
*   **Admin/DevOps:** Manages deployments, monitors observability stack.
*   **Frontend:** Entry point (React + Vite), currently default template.
*   **User Service:** Handles authentication and user management (MongoDB + Mongoose).
*   **Order Service:** ✅ **Migrated to PostgreSQL + Prisma** - Handles orders with ACID transactions and type-safe queries.
*   **API Gateway:** Planned for centralized routing.

## Current State (Post-Migration)
*   ✅ Order Service successfully migrated to PostgreSQL with Prisma ORM
*   ✅ Running in KIND cluster with 2 replicas
*   ✅ Database migrations applied
*   ✅ Full CRUD operations implemented
