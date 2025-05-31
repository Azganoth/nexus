# Nexus

### _Seu universo, em um só lugar._

Nexus is a link aggregation platform designed for developers, content creators, and freelancers to consolidate their online presence into a single, beautifully organized public profile.

[Live](https://nexusapp.fly.dev)

---

## ✨ Key Features

- **Centralized Link Hub:** Add, edit, and manage all your important links—social media, portfolios, projects, and contacts—in one place.
- **Profile Customization:** Personalize your profile with a custom avatar, display name, and biography. Control your profile's visibility by setting it to public or private.
- **Drag-and-Drop Reordering:** Easily reorder your links with a smooth drag-and-drop interface.
- **Real-time Dashboard Preview:** Instantly see how your changes look on your public profile with a live preview right in your dashboard.
- **Link Visibility Control:** Toggle the visibility of individual links, allowing you to keep some private without deleting them.
- **Security First:** Built with security in mind, featuring JWT-based authentication with Refresh Token Rotation, secure `httpOnly` cookies, and rate limiting.
- **Data Portability:** Export all of your account data to a JSON file at any time.

## 🚀 Tech Stack

The project is a full-stack TypeScript monorepo built with a modern and robust tech stack:

- **Monorepo:** pnpm + Turborepo
- **Frontend:** Next.js, React, TailwindCSS, SWR
- **Backend:** Node.js, Express.js, Prisma
- **Database:** PostgreSQL
- **Deployment:** Docker, Fly.io
- **CI/CD:** GitHub Actions
- **Testing:** Jest, React Testing Library, Supertest

## ⚡ Getting Started

Follow these instructions to set up the project for local development.

### 1. Prerequisites

- **Node.js:** `v22.x` or higher.
- **pnpm:** `v10.7.1` or higher (the project uses `corepack` to enforce this version).
- **Docker:** Required for running the local PostgreSQL database.

### 2. Installation & Setup

1.  **Clone the repository:**

    ```sh
    git clone [https://github.com/Azganoth/nexus.git](https://github.com/Azganoth/nexus.git)
    cd nexus
    ```

2.  **Enable Corepack** (if not already enabled) to use the correct `pnpm` version:

    ```sh
    corepack enable
    ```

3.  **Install dependencies** from the root of the monorepo:

    ```sh
    pnpm install
    ```

4.  **Set up environment variables:**

    - Copy `apps/api/env.example` to `apps/api/.env`.
    - Copy `apps/web/env.example` to `apps/web/.env`.
    - Update the `DATABASE_URL` in `apps/api/.env` to point to the Docker container:
      `DATABASE_URL="postgresql://dev:dev@localhost:5432/nexus-dev"`

5.  **Start and seed the database:**

    ```sh
    # Start the PostgreSQL Docker container
    pnpm db:start

    # Apply the database schema
    pnpm db:push

    # Seed the database with sample data
    pnpm db:seed
    ```

6.  **Run the development servers:**
    ```sh
    pnpm dev
    ```

### 3. Verification

- The **Frontend** will be available at `http://localhost:3002`.
- The **Backend API** will be available at `http://localhost:3001`.
- You can explore the database using **Prisma Studio**: `pnpm db:studio`.

## 🌐 Live Demo

- **Production Frontend:** [`https://nexusapp.fly.dev`](https://nexusapp.fly.dev)
- **Production API:** [`https://nexusapp-api.fly.dev`](https://nexusapp-api.fly.dev)
