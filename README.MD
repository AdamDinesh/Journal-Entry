# Financial Journal Entry Management System

A full-stack application for creating, viewing, and managing financial journal entries. It supports multiple debit and credit lines, balanced-entry validation, account validation, audit logging, and atomic database transactions.

## Features

- View active accounts from Account Master
- Create journal entries with multiple debit and credit lines
- Dynamically add and remove journal entry lines
- Show real-time debit and credit totals
- Validate that total debit equals total credit
- Validate that selected accounts exist and are active
- Create header, lines, and audit log in one database transaction
- Roll back the complete transaction if any database operation fails
- List journal entries with pagination
- Search journal entries by narration
- Filter journal entries by date range
- View journal entry details with account information and audit history
- Backend input validation using Zod
- Centralized error handling
- Parameterized SQL queries

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Sonner (toasts)

### Backend

- Node.js
- Express.js
- Zod
- mssql

### Database

- Microsoft SQL Server / Azure SQL Database

## Project Structure

```text
project/
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   ├── clear.sql
│   │   └── runSql.js
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/
│       ├── app.js
│       └── server.js
│
└── frontend/
    └── src/
        ├── api/
        │   └── journalApi.js
        ├── components/
        │   ├── AuditLogs.jsx
        │   ├── JournalEntryForm.jsx
        │   ├── JournalEntryHeader.jsx
        │   ├── JournalEntryLine.jsx
        │   ├── JournalEntryTable.jsx
        │   ├── Pagination.jsx
        │   └── utils.jsx
        ├── hooks/
        │   └── useDebounce.js
        ├── pages/
        │   ├── CreateJournalEntryPage.jsx
        │   ├── JournalEntriesListPage.jsx
        │   └── JournalEntryDetailPage.jsx
        ├── App.jsx
        ├── index.css
        └── main.jsx
```

## Database Design

The application uses four main tables:

- **AccountMaster** — stores account code, name, type, and active status.
- **JournalEntryHeader** — stores entry-level information such as date, narration, total debit, and total credit.
- **JournalEntryLines** — stores individual debit and credit lines associated with a journal entry.
- **AuditLogs** — records journal entry creation activity.

`JournalEntryHeader` and `JournalEntryLines` have a one-to-many relationship. `JournalEntryLines` and `AuditLogs` both reference `JournalEntryHeader` via foreign key.

A database-level `CHECK` constraint on `JournalEntryHeader` (`TotalDebit = TotalCredit`) enforces the balanced-entry rule even if application-level validation were ever bypassed.

## Journal Entry Creation Flow

```text
Client (React Form)
        |
        v
POST /api/journal-entries
        |
        v
Validate Request (Zod)
        |
        v
Calculate Debit & Credit Totals
        |
        +-- Not Balanced --> Return 422
        |
        v
Begin MSSQL Transaction
        |
        v
Validate Accounts
(Exists + Active)
        |
        +-- Invalid --> Rollback Transaction
        |
        v
Insert Journal Entry Header
        |
        v
Insert Journal Entry Lines
        |
        v
Insert Audit Log
        |
        v
Commit Transaction
        |
        v
Return 201 Created

Any database failure
        |
        v
Rollback Transaction
        |
        v
Return Error Response
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Microsoft SQL Server or Azure SQL Database
- Git

### Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`:
```
PORT=5000
NODE_ENV=development
DB_SERVER=your-server.database.windows.net
DB_DATABASE=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
FRONTEND_URL=http://localhost:5173
```
Do not commit real database credentials.

### Database Setup

Create the tables:

```bash
npm run db:schema
```

Insert sample Account Master data:

```bash
npm run db:seed
```

To clear development data, if needed:

```bash
npm run db:clear
```

### Run the Backend

```bash
npm run dev
```

The backend runs by default at `http://localhost:5000`.

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

VITE_API_URL=http://localhost:5000

Start the frontend:

```bash
npm run dev
```

Vite typically runs at `http://localhost:5173`.

## API Endpoints

| Method | Endpoint                   | Description                                          |
| ------ | -------------------------- | ---------------------------------------------------- |
| GET    | `/api/accounts`            | Get active accounts                                  |
| POST   | `/api/journal-entries`     | Create a journal entry                               |
| GET    | `/api/journal-entries`     | List journal entries with pagination and filters     |
| GET    | `/api/journal-entries/:id` | Get a journal entry with its lines and audit history |

### Journal Entry List Filters

Example:

GET /api/journal-entries?page=1&limit=10&search=rent&from=2026-09-01&to=2026-09-10

Supported query parameters:

- `page` — page number
- `limit` — records per page
- `search` — narration search
- `from` — starting entry date
- `to` — ending entry date

### Sample Create Journal Entry Request

```json
{
  "entryDate": "2026-09-10",
  "narration": "Office rent payment",
  "lines": [
    {
      "accountId": 7,
      "type": "DEBIT",
      "amount": 10000
    },
    {
      "accountId": 2,
      "type": "CREDIT",
      "amount": 10000
    }
  ]
}
```

The backend calculates debit and credit totals from the submitted lines rather than trusting totals from the client.

## Validation and Business Rules

- Entry date is required.
- At least two journal lines are required.
- Every line requires a valid account, debit/credit type (`type`), and positive amount.
- `type` must be `DEBIT` or `CREDIT`.
- Total debit must equal total credit.
- Referenced accounts must exist.
- Referenced accounts must be active.

Frontend validation provides immediate feedback, while the backend remains the source of truth for validation and business rules.

## Database Transaction Handling

Journal entry creation is atomic. After request validation, the backend begins an MSSQL transaction and:

1. Validates the accounts.
2. Inserts the `JournalEntryHeader`.
3. Inserts all `JournalEntryLines`.
4. Inserts the `AuditLogs` record.
5. Commits the transaction.

If any operation fails, the transaction is rolled back so partial journal data is not stored.

## Error Handling

The backend uses centralized error handling and returns consistent error responses.

```json
{
  "error": {
    "message": "Total debit must equal total credit"
  }
}
```

Parameterized MSSQL queries are used for all database inputs to reduce SQL injection risk.
