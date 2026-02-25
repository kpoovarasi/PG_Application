# PG Manager — System Architecture

> **Tech Stack**: Next.js 16 / React 19 (Frontend) · Python + FastAPI (Backend) · PostgreSQL (Database)

---

## 📐 High-Level System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client Layer — Browser"]
        direction TB
        U1["👤 Admin User"]
        U2["👤 Tenant User"]
    end

    subgraph FRONTEND["⚛️ Frontend — Next.js 16 / React 19 (TypeScript)"]
        direction TB
        AUTH["🔐 Auth Context\n(JWT / Session)"]

        subgraph ADMIN_PORTAL["Admin Portal"]
            AD["Dashboard\n(Analytics & Stats)"]
            AT["Tenant Management"]
            AR["Room Management"]
            AI["Invoice Management"]
            ATC["Ticket Management"]
            AM["Messaging Center"]
            AME["Menu Management"]
            AH["Holiday Management"]
        end

        subgraph TENANT_PORTAL["Tenant Portal"]
            TP["My Profile"]
            TR["My Room"]
            TI["My Invoices"]
            TTC["Raise Tickets"]
            TN["Notifications"]
            TME["View Menu"]
            TH["View Holidays"]
        end

        subgraph SHARED["Shared Layer"]
            SUI["shadcn/ui Components\n(Radix UI)"]
            SCH["Recharts\n(Analytics Charts)"]
            SHF["React Hook Form\n+ Zod Validation"]
        end
    end

    subgraph BACKEND["🐍 Backend — Python + FastAPI"]
        direction TB
        subgraph API["REST API Layer"]
            R_AUTH["POST /auth/login\nPOST /auth/logout\nPOST /auth/refresh"]
            R_PG["GET/POST /pgs\nGET/PUT/DELETE /pgs/:id"]
            R_ROOMS["GET/POST /rooms\nGET/PUT/DELETE /rooms/:id"]
            R_TENANTS["GET/POST /tenants\nGET/PUT/DELETE /tenants/:id"]
            R_INVOICES["GET/POST /invoices\nPUT /invoices/:id/status"]
            R_TICKETS["GET/POST /tickets\nPUT /tickets/:id/status"]
            R_MSGS["GET/POST /messages\nGET /messages/tenant/:id"]
            R_MENU["GET/PUT /menu"]
            R_HOLS["GET/POST /holidays\nDELETE /holidays/:id"]
            R_ASSETS["GET/POST /assets\nPUT /assets/:id"]
        end

        subgraph SERVICES["Service / Business Logic Layer"]
            S_AUTH["Auth Service\n(JWT + bcrypt)"]
            S_BILLING["Billing Service\n(Invoice Generation)"]
            S_NOTIF["Notification Service\n(Push/SMS/Email)"]
            S_REPORT["Reporting Service\n(Dashboard Analytics)"]
        end

        subgraph MIDDLEWARE["Middleware"]
            MW_AUTH["JWT Auth Middleware"]
            MW_RBAC["RBAC (admin / tenant)"]
            MW_CORS["CORS Middleware"]
            MW_LOG["Request Logger"]
        end
    end

    subgraph DB["🐘 Database — PostgreSQL"]
        direction TB
        TB_USERS[("users")]
        TB_PGS[("pgs")]
        TB_ROOMS[("rooms")]
        TB_ASSETS[("room_assets")]
        TB_TENANTS[("tenants")]
        TB_INVOICES[("invoices")]
        TB_TICKETS[("tickets")]
        TB_MESSAGES[("messages")]
        TB_MENU[("menu_items")]
        TB_HOLIDAYS[("holidays")]
    end

    U1 -->|HTTPS| FRONTEND
    U2 -->|HTTPS| FRONTEND
    FRONTEND -->|REST API / JSON\nHTTPS + JWT| BACKEND
    BACKEND -->|SQL\nSQLAlchemy ORM| DB
    AUTH --> ADMIN_PORTAL
    AUTH --> TENANT_PORTAL
    ADMIN_PORTAL --> SHARED
    TENANT_PORTAL --> SHARED
    API --> SERVICES
    SERVICES --> MIDDLEWARE
    MIDDLEWARE --> DB

    style CLIENT fill:#1e293b,color:#e2e8f0,stroke:#475569
    style FRONTEND fill:#1e3a5f,color:#e2e8f0,stroke:#3b82f6
    style BACKEND fill:#1a3c2a,color:#e2e8f0,stroke:#22c55e
    style DB fill:#3b1f5e,color:#e2e8f0,stroke:#a855f7
    style ADMIN_PORTAL fill:#1e3a5f,color:#bfdbfe,stroke:#60a5fa
    style TENANT_PORTAL fill:#1e3a5f,color:#bfdbfe,stroke:#60a5fa
    style SHARED fill:#243447,color:#bfdbfe,stroke:#475569
    style API fill:#1a3c2a,color:#bbf7d0,stroke:#4ade80
    style SERVICES fill:#1c3a2a,color:#bbf7d0,stroke:#4ade80
    style MIDDLEWARE fill:#243447,color:#bbf7d0,stroke:#475569
```

---

## 🗄️ Database Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string name
        string email
        string password_hash
        enum role "admin | tenant"
        timestamp created_at
    }

    PGS {
        uuid id PK
        string name
        string address
        int total_rooms
        int total_beds
        uuid owner_id FK
        timestamp created_at
    }

    ROOMS {
        uuid id PK
        uuid pg_id FK
        string room_number
        int floor
        enum type "AC | Non-AC"
        int capacity
        int occupants
        decimal rent
        enum status "available | occupied | maintenance"
    }

    ROOM_ASSETS {
        uuid id PK
        uuid room_id FK
        string name
        enum condition "good | fair | needs-repair"
        string assigned_to
    }

    TENANTS {
        uuid id PK
        uuid user_id FK
        uuid room_id FK
        string tenant_code
        string phone
        enum stay_type "monthly | daily"
        date join_date
        decimal rent_amount
        decimal security_deposit
        string emergency_contact
        string id_proof
        enum status "active | inactive"
    }

    INVOICES {
        uuid id PK
        uuid tenant_id FK
        string month
        decimal rent_amount
        decimal electricity
        decimal water
        decimal maintenance
        decimal total
        enum status "paid | pending | overdue"
        date due_date
        date paid_date
    }

    TICKETS {
        uuid id PK
        uuid tenant_id FK
        enum category "plumbing | electrical | wifi | furniture | cleaning | other"
        string subject
        text description
        enum status "open | in-progress | resolved | closed"
        enum priority "low | medium | high"
        timestamp created_at
        timestamp resolved_at
    }

    MESSAGES {
        uuid id PK
        uuid sent_by FK
        enum type "rent-reminder | holiday-notice | announcement"
        string title
        text content
        timestamp sent_at
        jsonb recipients "all | array of tenant IDs"
    }

    MENU_ITEMS {
        uuid id PK
        enum day "Monday..Sunday"
        string breakfast
        string lunch
        string dinner
    }

    HOLIDAYS {
        uuid id PK
        date date
        string name
        string description
    }

    USERS ||--o{ TENANTS : "has"
    USERS ||--o{ MESSAGES : "sends"
    PGS ||--|{ ROOMS : "contains"
    ROOMS ||--|{ ROOM_ASSETS : "has"
    ROOMS ||--o{ TENANTS : "houses"
    TENANTS ||--|{ INVOICES : "receives"
    TENANTS ||--|{ TICKETS : "raises"
```

---

## ⚛️ Frontend Component Architecture

```mermaid
graph TD
    APP["app/page.tsx\n(Root Entry)"]

    APP --> AP["AuthProvider\n(auth-context.tsx)"]
    AP --> LG["LoginPage\n(login-page.tsx)"]
    AP --> ADMIN["AdminPortal\n(admin-portal.tsx)"]
    AP --> TENANT["TenantPortal\n(tenant-portal.tsx)"]

    ADMIN --> AD2["AdminDashboard"]
    ADMIN --> AT2["AdminTenants"]
    ADMIN --> AR2["AdminRooms"]
    ADMIN --> AI2["AdminInvoices"]
    ADMIN --> ATC2["AdminTickets"]
    ADMIN --> AM2["AdminMessages"]
    ADMIN --> AME2["AdminMenu"]
    ADMIN --> AH2["AdminHolidays"]

    TENANT --> TP2["TenantProfile"]
    TENANT --> TR2["TenantRoom"]
    TENANT --> TI2["TenantInvoices"]
    TENANT --> TTC2["TenantTickets"]
    TENANT --> TN2["TenantNotifications"]
    TENANT --> TME2["TenantMenuView"]
    TENANT --> TH2["TenantHolidays"]

    subgraph SHARED2["Shared UI Library (components/ui — 57 components)"]
        SUI2["shadcn/ui (Radix UI)\nButton, Dialog, Table, Card,\nSelect, Form, Badge, Tabs, etc."]
        RCH["Recharts\nBar, Pie, Line Charts"]
        LR["Lucide React\nIcons"]
    end

    ADMIN --> SHARED2
    TENANT --> SHARED2

    style APP fill:#1e3a5f,color:#bfdbfe,stroke:#3b82f6
    style ADMIN fill:#134e34,color:#bbf7d0,stroke:#22c55e
    style TENANT fill:#3b1c1c,color:#fecaca,stroke:#ef4444
    style SHARED2 fill:#2d2a4a,color:#e9d5ff,stroke:#9333ea
```

---

## 🔄 Request Data Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Next.js Frontend
    participant MW as FastAPI Middleware
    participant API as FastAPI Route Handler
    participant SVC as Service Layer
    participant DB as PostgreSQL

    User->>FE: Interacts with UI
    FE->>MW: HTTP Request + JWT Token
    MW->>MW: Validate JWT
    MW->>MW: Check RBAC (admin/tenant)
    MW->>API: Forward authenticated request
    API->>SVC: Call business logic
    SVC->>DB: SQL Query (SQLAlchemy ORM)
    DB-->>SVC: Result Set
    SVC-->>API: Processed Data
    API-->>FE: JSON Response
    FE-->>User: Re-render UI
```

---

## 📦 Technology Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 16 + React 19 | SSR/SSG, Routing, App Router |
| **Language (FE)** | TypeScript | Type safety |
| **Styling** | TailwindCSS v4 | Utility-first CSS |
| **UI Components** | shadcn/ui (Radix UI) | Accessible component library |
| **Charts** | Recharts | Dashboard analytics |
| **Forms** | React Hook Form + Zod | Form validation |
| **Icons** | Lucide React | Icon set |
| **Backend Framework** | Python + FastAPI | REST API, async support |
| **ORM** | SQLAlchemy | Database queries |
| **Auth** | JWT + bcrypt | Stateless authentication |
| **Database** | PostgreSQL | Relational data storage |
| **Migrations** | Alembic | DB schema versioning |
| **Deployment (FE)** | Vercel | CDN + Serverless hosting |
| **Deployment (BE)** | Render / AWS ECS | Container-based backend |

---

## 🏗️ Domain Modules

| Module | Admin Capabilities | Tenant Capabilities |
|---|---|---|
| **Auth** | Login, role-based access | Login, session management |
| **PG Management** | CRUD for PGs | View assigned PG info |
| **Room Management** | Manage rooms, assets | View room & assets |
| **Tenant Management** | Onboard, view, manage tenants | View own profile |
| **Invoices** | Generate, track billing | View & pay invoices |
| **Tickets** | Manage, resolve tickets | Raise & track tickets |
| **Messaging** | Broadcast announcements | Receive notifications |
| **Menu** | Update weekly meal plan | View meal schedule |
| **Holidays** | Add/remove holidays | View holiday calendar |
