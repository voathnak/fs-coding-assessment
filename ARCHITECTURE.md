# Architecture Decisions and Trade-offs

This document outlines the architectural decisions and trade-offs made during the development of the Todo application.

## 🏗 Backend Architecture

### Framework: FastAPI
- **Decision**: Used FastAPI for the backend REST API.
- **Rationale**: High performance, native support for asynchronous programming, automatic OpenAPI/Swagger documentation, and excellent developer experience with Pydantic for data validation.
- **Trade-off**: Requires modern Python versions (3.12+) and careful management of asynchronous operations to avoid blocking the event loop.

### Database Persistence: SQLModel + SQLAlchemy + SQLite/PostgreSQL
- **Decision**: Used SQLModel (built on top of SQLAlchemy and Pydantic) for ORM and data validation.
- **Rationale**: SQLModel allows for a single source of truth for both database models and API schemas, reducing boilerplate and increasing type safety. SQLite is used for development/testing ease, while PostgreSQL is supported for production.
- **Trade-off**: SQLModel is still relatively new compared to pure SQLAlchemy, but it significantly simplifies the code for a project of this scope.

### Authentication: JWT (JSON Web Tokens)
- **Decision**: Implemented stateless JWT-based authentication.
- **Rationale**: Allows for a scalable, stateless backend. Tokens are signed with a secret key and contain user identification.
- **Trade-off**: Tokens cannot be easily revoked before expiration without additional complexity (e.g., token blacklisting), which was deemed unnecessary for this assessment scope.

### Repository/Service Pattern
- **Decision**: Implemented a Repository-Service-Router pattern.
- **Rationale**:
  - **Routers**: Handle HTTP concerns (routing, status codes, request/response models).
  - **Services**: Contain business logic (e.g., permission checks, complex transformations).
  - **Repositories**: Handle database interactions (CRUD operations, queries).
- **Trade-off**: Adds a layer of abstraction that might feel heavy for simple CRUD, but ensures better testability and separation of concerns as the application grows.

---

## 🎨 Frontend Architecture

### Framework: Next.js (App Router)
- **Decision**: Used Next.js with the latest App Router.
- **Rationale**: Provides a robust framework for building React applications with built-in routing, server-side rendering (SSR) capabilities, and optimized build processes.
- **Trade-off**: Higher learning curve compared to simple Vite-based React apps, but more representative of modern production environments.

### State Management: Context API
- **Decision**: Used React Context API for global state management (Auth, Todos, Toast notifications).
- **Rationale**: Sufficient for the application's complexity without the overhead of Redux or Zustand. Simplifies data sharing across components.
- **Trade-off**: Can lead to unnecessary re-renders if not optimized, but manageable for the current scope.

### Styling: Tailwind CSS
- **Decision**: Used Tailwind CSS for utility-first styling.
- **Rationale**: Rapid development, consistent design language, and excellent responsive design support out of the box.
- **Trade-off**: Class names can become long in JSX, but this is mitigated by using reusable components.

### UI Patterns: Optimistic Updates
- **Decision**: Implemented optimistic updates for todo operations (create, toggle complete, delete).
- **Rationale**: Provides a snappy, "instant" feel to the user interface by updating the UI before the server responds.
- **Trade-off**: Requires logic to "rollback" changes if the server request fails.

---

## ⚖️ Trade-offs & Future Improvements

1.  **Testing Depth**: 
    - **Current**: Comprehensive backend test suite (unit and integration).
    - **Future**: Add end-to-end (E2E) tests with Playwright or Cypress to verify the full user flow.
2.  **Infrastructure**:
    - **Current**: Docker Compose for easy local development.
    - **Future**: Implement CI/CD pipelines and deployment configurations for cloud environments (e.g., AWS, Vercel, Fly.io).
3.  **Real-time Features**:
    - **Current**: Polling or manual refresh (via optimistic updates).
    - **Future**: Implement WebSockets for real-time updates when multiple users/devices interact with the same account.
4.  **Complex Permissions**:
    - **Current**: Basic owner-only access.
    - **Future**: Role-based access control (RBAC) if the application evolves to include teams or organizations.
