# Full Stack Engineering Assessment – Production TODO Application

Welcome to the Full Stack Engineering Assessment! This challenge evaluates your ability to build a **production-ready TODO application** with modern architecture patterns, authentication, database integration, and comprehensive testing.

---

## 🎯 Objective

Build a complete TODO application with:

- **Backend**: RESTful API using FastAPI with PostgreSQL/SQLite database, JWT authentication, and comprehensive testing
- **Frontend**: Next.js application with state management, authentication flow, optimistic updates, and error handling

---

## 📋 Detailed Requirements

Please check:

- [`/backend/README.md`](./backend/README.md) for detailed Backend requirements
- [`/frontend/README.md`](./frontend/README.md) for detailed Frontend requirements

---

## 🚀 Getting Started

To get the application up and running locally, follow these steps.

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) (recommended for easy setup)
- **OR**
- [Python 3.12+](https://www.python.org/downloads/) & [uv](https://github.com/astral-sh/uv) (for Backend)
- [Node.js 22+](https://nodejs.org/) & [npm](https://www.npmjs.com/) (for Frontend)

### 🐋 Option 1: Quick Start with Docker (Recommended)

1.  **Clone the repository**.
2.  **Ensure you have `.env` files**:
    - Backend: `cp backend/.env.example backend/.env`
    - Frontend: `cp frontend/.env.example frontend/.env.local`
3.  **Start all services**:
    ```bash
    docker compose up --build
    ```
3.  **Access the application**:
    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **Backend API**: [http://localhost:8000](http://localhost:8000)
    - **API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 💻 Option 2: Manual Development Setup

#### Backend Setup
1.  Navigate to the `/backend` directory.
2.  Follow the [Backend Setup Instructions](./backend/README.md).

#### Frontend Setup
1.  Navigate to the `/frontend` directory.
2.  Follow the [Frontend Setup Instructions](./frontend/README.md).

---

## 🧪 Running Tests

### Backend Tests
From the root directory:
```bash
cd backend && uv sync && uv run pytest
```

### Frontend Tests
From the root directory:
```bash
cd frontend && npm install && npm test
```

---

## 📖 Documentation

- [**Architecture & Trade-offs**](./ARCHITECTURE.md): Detailed explanation of the system design.
- [**API Documentation**](http://localhost:8000/docs): Interactive Swagger UI (available when backend is running).
- [**Frontend Components**](./frontend/README.md): Details on the UI implementation.

---

## 🚀 Submission Requirements

### Must Include:

1. **GitHub Repository** with:
   - Clear README with setup instructions
   - `.env.example` files for both frontend and backend
2. **Documentation**:
   - API documentation
   - Architecture decisions and trade-offs
3. **Tests**:
   - Test suites
   - Instructions to run tests

4. **Working Application**:
   - Both services run independently
   - Successful frontend-backend integration
   - All features functional

### Evaluation Criteria:

- **Code Quality** (30%): Clean, maintainable, well-structured code
- **Functionality** (25%): All required features working correctly
- **Architecture** (20%): Proper separation of concerns, scalable design
- **Testing** (15%): Comprehensive test coverage
- **Security** (10%): Authentication, validation, secure practices

---

Good luck! We're excited to see your solution. 🚀

**Questions?** Contact us via invitation email and we'll respond.
