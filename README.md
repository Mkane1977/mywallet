
# MyWallet – Budgeting App (Spring Boot + PostgreSQL)

MyWallet is a simple full-stack budgeting application that allows users to track income and expenses, organize transactions into categories, and view monthly financial summaries.

This project is designed as a **clean, minimal MVP** following real-world backend architecture patterns used in enterprise applications.

---

## 🚀 Features (MVP)

- Create or retrieve user by email (upsert-style login)
- Create income and expense categories
- Add income and expense transactions
- View monthly transaction history
- View monthly summary:
  - Total income
  - Total expenses
  - Net balance
  - Spending by category

---

## 🏗 Architecture

Frontend (React - planned)
↓
Spring Boot REST API
↓
PostgreSQL Database


### Backend Stack
- Java 17+
- Spring Boot
- Spring Data JPA (Hibernate)
- PostgreSQL
- Maven

---

## 🗂 Project Structure



mywallet/
├── src/main/java/com/mywallet
│ ├── controller
│ ├── service
│ ├── service/impl
│ ├── repository
│ ├── model
│ └── dto
├── db/
│ └── mywalletDB_dump.sql
├── pom.xml
└── README.md


---

## 🛠 Setup Instructions

### Prerequisites

- Java 17+
- Maven
- PostgreSQL 14+
- Git

---

## 🐘 Database Setup (Local)

### 1. Create database and user

Open `psql` as a Postgres admin user:

```sql
CREATE USER expense_user WITH PASSWORD 'test';
CREATE DATABASE "mywalletDB" OWNER expense_user;

2. Restore database schema + dummy data

From the project root:

psql -h localhost -U expense_user -d mywalletDB < db/mywalletDB_dump.sql


Password:

test

3. Configure Spring Boot

In src/main/resources/application.properties:

spring.datasource.url=jdbc:postgresql://localhost:5432/mywalletDB
spring.datasource.username=expense_user
spring.datasource.password=test

▶ Running the Application

From the project root:

mvn spring-boot:run


or

./mvnw spring-boot:run


App runs at:

http://localhost:8080

🔗 API Endpoints (MVP)
Users
Method	Endpoint	Description
POST	/api/users/upsert	Create or retrieve user
GET	/api/users/by-email	Fetch user by email
Categories
Method	Endpoint	Description
POST	/api/categories	Create category
GET	/api/categories	List categories
Transactions
Method	Endpoint	Description
POST	/api/transactions	Add transaction
GET	/api/transactions	Get transactions for month
Monthly Summary
Method	Endpoint	Description
GET	/api/summary	Monthly totals + category breakdown
🧪 Example Requests
Create user
POST /api/users/upsert?email=test@email.com&username=TestUser

Create category
POST /api/categories

{
  "userId": 1,
  "name": "Food",
  "type": "EXPENSE"
}

Add transaction
POST /api/transactions

{
  "userId": 1,
  "categoryId": 2,
  "date": "2026-01-26",
  "amountCents": 1299,
  "direction": "EXPENSE",
  "note": "Lunch"
}

Monthly summary
GET /api/summary?userId=1&month=2026-01



🐳 Docker Setup (Recommended – Easiest Way to Run)

This project includes a Docker-based PostgreSQL setup so you can run the database without installing PostgreSQL locally.

Requirements

Docker Desktop

Start PostgreSQL using Docker

From the project root:

docker compose up -d


This will start PostgreSQL with:

Database: mywalletDB

Username: expense_user

Password: test

Port: 5432

Verify container is running
docker ps


You should see:

mywallet-postgres

Run the Spring Boot application
mvn spring-boot:run


The backend will start at:

http://localhost:8080

Reset the database (optional)

To wipe and recreate the database:

docker compose down -v
docker compose up -d


=======
# MyWallet – Local Development (IntelliJ Setup Guide)

This document explains how to run and develop the MyWallet backend locally using IntelliJ IDEA.

---

## 🛠 Requirements

- IntelliJ IDEA (Community or Ultimate)
- Java 17+
- Maven
- Docker Desktop

---

## 🐳 Database Setup (Docker – Recommended)

This project uses Docker to run PostgreSQL locally.

### Start PostgreSQL

From the project root:

```bash
docker compose up -d
>>>>>>> Stashed changes
