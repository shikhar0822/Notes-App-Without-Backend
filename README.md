# RLS Demo — Row Level Security with PostgreSQL & Node.js

This project demonstrates how **Row Level Security (RLS)** in PostgreSQL can replace traditional backend authorization logic.

Instead of filtering data in Node.js, access control is enforced directly at the database level — making the system more secure and scalable.

## Project Structure

```
rls-demo/
 ├── db/
 │   └── schema.sql
 ├── server/
 │   └── app.js
 ├── .env
 ├── package.json
 └── README.md
```

## Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (v14+)

## Setup

### 1. Create the database

```bash
createdb rls_demo
```

### 2. Run the schema

```bash
psql -d rls_demo -f db/schema.sql
```

This creates the `users` and `notes` tables, enables RLS on `notes`, sets up the access policies, and seeds two test users.

### 3. Configure environment

Update `.env` with your PostgreSQL connection string:

```
DATABASE_URL=postgresql://user:password@localhost:5432/rls_demo
```

### 4. Install dependencies & start

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`.

## How to Test

### Create a note as User 1

```bash
curl -X POST http://localhost:3000/notes \
  -H "x-user-id: 11111111-1111-1111-1111-111111111111" \
  -H "Content-Type: application/json" \
  -d '{"content": "User1 secret note"}'
```

### Fetch notes as User 1

```bash
curl http://localhost:3000/notes \
  -H "x-user-id: 11111111-1111-1111-1111-111111111111"
```

Returns User 1's notes.

### Fetch notes as User 2

```bash
curl http://localhost:3000/notes \
  -H "x-user-id: 22222222-2222-2222-2222-222222222222"
```

Returns **empty** — even though data exists in the database.

## What This Proves

- No `if (user.id === note.userId)` in backend code
- Security enforced at the DB level via RLS policies
- Even if the API has bugs, data stays protected
