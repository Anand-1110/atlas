# Detailed Service Control Flow

This diagram details the services, their dependencies, and the infrastructure backing them in the **KIND Kubernetes cluster**.

```mermaid
graph TD
    subgraph "Client Layer"
        Browser[Web Browser / Client]
    end

    subgraph "KIND Kubernetes Cluster"
        subgraph "Application Services"
            FE[Frontend Container\n(React/Vite)\nPort 3000:80]
            US[User Service\n(Node.js)\nPort 4000\n2 Replicas]
            OS[Order Service v2\n(Node.js + Prisma)\nPort 5000\n2 Replicas]
        end

        subgraph "Data Layer"
            Mongo[(MongoDB\n27017\nUser Data)]
            Postgres[(PostgreSQL\n5432\nOrder Data)]
        end
        
        subgraph "Observability Stack"
            Prom[Prometheus\n(Metrics Collection)]
            Graf[Grafana\n(Dashboards)]
            Loki[Loki\n(Log Aggregation)]
        end
    end

    %% Client Interactions
    Browser -->|HTTP| FE
    
    %% Service to Database Connections
    US -->|Mongoose ORM| Mongo
    OS -->|Prisma ORM\nACID Transactions| Postgres
    
    %% Monitoring (Planned)
    Prom -.->|Scrapes /metrics| US
    Prom -.->|Scrapes /metrics| OS
    Graf -->|Reads| Prom
    Graf -->|Queries Logs| Loki

    classDef production fill:#9f9,stroke:#333,stroke-width:2px;
    classDef planned fill:#99f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5;
    
    class OS,Postgres production
    class Prom,Graf,Loki planned
```

## Key Components

### ✅ User Service
*   **Database:** MongoDB (Mongoose ORM)
*   **Status:** Running, 2 replicas
*   **Endpoints:** `/health`, `/metrics`

### ✅ Order Service (Recently Migrated)
*   **Database:** PostgreSQL (Prisma ORM)
*   **Status:** Production-ready, 2 replicas
*   **Migration:** Completed migration from MongoDB to PostgreSQL
*   **Features:**
    *   ACID transactions
    *   Type-safe queries via Prisma
    *   Full CRUD API (`POST`, `GET`, `PUT`, `DELETE`)
*   **Endpoints:** `/health`, `/metrics`, `/orders`

### Data Layer
*   **MongoDB:** User data storage
*   **PostgreSQL:** Order data storage with relational integrity

### Observability (Partially Implemented)
*   **Prometheus:** Installed, scraping configuration pending
*   **Grafana:** Installed, connected to Loki
*   **Loki:** Installed, receiving logs

## Deployment Details
*   **Cluster Type:** KIND (Kubernetes in Docker)
*   **Image Management:** Images loaded via `kind load docker-image`
*   **Current Version:** `order-service:v2` (with Prisma)
*   **Networking:** ClusterIP services, internal communication
