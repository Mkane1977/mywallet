# MyWallet – Budgeting App (Spring Boot + PostgreSQL)

MyWallet is a budgeting backend application built with Spring Boot and PostgreSQL.  
It provides authentication (email/password), transaction management, and financial summaries.

This project follows clean layered architecture patterns used in real-world backend systems.

---

##  Current Features (Milestone – Auth + Core Setup)

### Authentication
- Register with email, name, password
- Login with email + password
- BCrypt password hashing
- Validation via Jakarta Bean Validation
- Swagger/OpenAPI documentation

### Backend Setup
- Spring Boot 4
- PostgreSQL
- Flyway migrations
- Docker support
- Clean Controller → Service → Repository structure

---

##  Architecture

Frontend (planned)
↓
Spring Boot REST API
↓
PostgreSQL Database

---

##  Tech Stack

- Java 17+
- Spring Boot
- Spring Data JPA
- PostgreSQL
- Flyway
- Maven
- Docker
- Swagger (springdoc-openapi)
- BCrypt
---

##  Project Structure

```
backend/
├── src/main/java/com/mywallet
│   ├── config
│   │   └── CorsConfig
│   ├── controller
│   │   ├── AuthController
│   │   └── RootController
│   ├── domain
│   │   └── User
│   ├── dto
│   │   └── auth
│   │       ├── RegisterRequest
│   │       ├── LoginRequest
│   │       └── AuthResponse
│   ├── exception
│   │   └── GlobalExceptionHandler
│   ├── repository
│   │   └── UserRepository
│   ├── service
│   │   ├── auth
│   │   │   └── AuthService
│   │   └── impl
│   │       └── AuthServiceImpl
│   └── AppApplication
│
├── src/main/resources
│   ├── application.properties
│   └── db/migration
│       ├── V1__create_users.sql
│       └── V4_add_password_hash_to_users.sql
│
├── pom.xml
└── docker-compose.yml

```

---

# 🐳 Running with Docker (Recommended)

## Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

Database configuration:

- Database: `mywalletDB`
- Username: `expense_user`
- Password: `test`
- Port: `5432`

Verify:

```bash
docker ps
```

---

# ▶ Running the Backend

From the project root:

```bash
mvn -f backend/pom.xml spring-boot:run
```

Application runs at:

```
http://localhost:8080
```

---

#  Swagger API Docs

Once running, open:

```
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON:

```
http://localhost:8080/v3/api-docs
```

---

#  Authentication Endpoints

## Register

POST `/api/auth/register`

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

## Login

POST `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Accounts are enabled immediately upon registration (email verification not implemented in this milestone).

---

#  Development Notes

- Flyway manages all schema migrations.
- Do NOT edit old migration files.
- New DB changes must be added as new migration versions.
- Passwords are stored as BCrypt hashes.

---

#  Reset Database (Development Only)

To wipe the database:

```bash
docker compose down -v
docker compose up -d
```

---

#  Milestone Status (Feb 20)

- Backend structure complete
- Postgres + Flyway working
- Swagger API contract defined
- DTOs + validation implemented
- Auth-lite complete

