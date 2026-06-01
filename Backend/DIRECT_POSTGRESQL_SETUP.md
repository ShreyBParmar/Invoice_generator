# PostgreSQL Direct Connection - Migration Complete

## Overview
Successfully migrated from Prisma ORM to direct PostgreSQL queries. All data is now stored directly in the pgAdmin 4 database using raw SQL.

---

## Changes Made

### 1. ✅ Backend Controller - `controllers/invoice.js`

**Removed:**
- `import { PrismaClient } from "@prisma/client"`
- All Prisma model operations (create, findFirst, update, delete, etc.)

**Added:**
- `import pool from "../config/db.js"`
- Direct PostgreSQL queries using pool.query()
- Transaction management (BEGIN/COMMIT/ROLLBACK)
- Helper function `fetchInvoiceWithRelations()` for data aggregation

**Functions Updated:**
- `createInvoice()` - Uses INSERT with transaction
- `getInvoice()` - Uses SELECT queries
- `updateInvoice()` - Uses UPDATE with transaction
- `deleteInvoice()` - Uses DELETE with cascade
- `getUserInvoices()` - Uses SELECT with pagination

### 2. ✅ Routes File - `routes/invoiceRoutes.js`

**Status:** ✅ No changes needed (already uses only multer)
- No Prisma dependencies
- Multer configured for file uploads
- Routes properly connected to updated controllers

### 3. ✅ Database Configuration - `config/db.js`

**Status:** ✅ No changes needed (already set up correctly)
- Uses PostgreSQL Pool for connection management
- Reads from .env variables:
  - DB_USER
  - DB_HOST
  - DB_NAME
  - DB_PASSWORD
  - DB_PORT

### 4. ✅ Environment Variables - `.env`

**Already configured with:**
```env
DB_USER='postgres'
DB_HOST='localhost'
DB_NAME='invoice_db'
DB_PASSWORD='mydatatype'
DB_PORT='5430'
JWT_SECRET=Hardtofindnorguess#568
```

---

## How It Works Now

### Data Flow
```
Frontend (FormData with logo + invoiceData)
    ↓
Backend Route (POST /api/invoices)
    ↓
Multer Middleware (File validation & storage)
    ↓
Controller (Direct PostgreSQL queries)
    ↓
pgAdmin 4 Database (Direct SQL INSERT/UPDATE/DELETE)
```

### Creating an Invoice
1. User uploads logo + fills invoice details
2. FormData sent to `/api/invoices`
3. Multer saves logo file to `Backend/public/uploads/`
4. Controller executes SQL INSERT into invoices table
5. Controller inserts items, taxes, discounts (in same transaction)
6. On commit, fetches all related data using helper function
7. Returns complete invoice object as JSON

### Transaction Support
```javascript
BEGIN TRANSACTION
  → INSERT INTO invoices
  → INSERT INTO invoice_items (loop for each item)
  → INSERT INTO invoice_taxes (if configured)
  → INSERT INTO invoice_discounts (if configured)
COMMIT TRANSACTION
```

If any error occurs, ROLLBACK executes automatically.

---

## Database Access Pattern

### Example: Create Invoice
```javascript
// Execute directly with pool
const result = await pool.query(
  `INSERT INTO invoices (user_id, invoice_number, ...) 
   VALUES ($1, $2, ...) 
   RETURNING *`,
  [userId, invoiceNumber, ...]
);
const invoiceId = result.rows[0].id;
```

### Example: Fetch Invoice with Relations
```javascript
// Helper function aggregates data from multiple queries
const invoice = await fetchInvoiceWithRelations(invoiceId);
// Returns: { 
//   id, invoiceNumber, ...,
//   items: [...],
//   taxes: [...],
//   discounts: [...],
//   payments: [...],
//   client: {...},
//   business: {...}
// }
```

### Example: Update Invoice
```javascript
// Direct UPDATE query with parameterized input
await pool.query(
  `UPDATE invoices SET 
    title = $1, 
    currency = $2, 
    updated_at = CURRENT_TIMESTAMP
   WHERE id = $3 AND user_id = $4`,
  [title, currency, invoiceId, userId]
);
```

---

## Benefits of Direct PostgreSQL

✅ **No ORM Overhead** - Direct SQL execution is faster
✅ **Full Control** - Write optimized SQL queries
✅ **Direct Database Access** - Work directly with pgAdmin 4 data
✅ **Simpler Stack** - Fewer dependencies to manage
✅ **SQL Flexibility** - Use complex queries, transactions, aggregations
✅ **Better Performance** - No ORM translation layer

---

## Removed Dependencies

The following are no longer needed:
- Prisma Client ORM
- Prisma migrations
- Prisma schema generation

However, `@prisma/client` in package.json can be left or removed (currently kept if other projects use it).

---

## Database Pool Connection

### Connection Pooling
```javascript
// config/db.js
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

export default pool;
```

**Benefits:**
- Reuses connections efficiently
- Handles multiple concurrent requests
- Automatic connection cleanup
- Connection timeout management

### Proper Resource Cleanup
```javascript
const client = await pool.connect();
try {
  // Use client for queries
  await client.query('BEGIN');
  await client.query(...);
  await client.query('COMMIT');
} finally {
  client.release(); // Always release connection
}
```

---

## API Response Format

All endpoints return the same response structure:

```javascript
// Success Response (201/200)
{
  success: true,
  message: "Invoice created/updated/deleted successfully",
  data: {
    id: 1,
    user_id: 5,
    invoice_number: "INV-001",
    title: "Invoice",
    logo_url: "/uploads/logo-1716206400000-123456789.jpg",
    items: [...],
    taxes: [...],
    discounts: [...],
    payments: [...]
  }
}

// Error Response (400/404/500)
{
  success: false,
  message: "Error message describing the problem",
  error: "Detailed error info"
}
```

---

## Testing the Changes

### 1. Test Invoice Creation
```bash
curl -X POST http://localhost:5000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "logo=@path/to/image.jpg" \
  -F 'invoiceData={"invoiceNumber":"INV-001",...}'
```

### 2. Verify in pgAdmin 4
```sql
-- Check invoices table
SELECT * FROM invoices;

-- Check invoice items
SELECT * FROM invoice_items WHERE invoice_id = 1;

-- Check taxes
SELECT * FROM invoice_taxes WHERE invoice_id = 1;

-- Check uploaded logo file
-- Should exist at: Backend/public/uploads/logo-*.jpg
```

### 3. Test Invoice Retrieval
```bash
curl -X GET http://localhost:5000/api/invoices/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Handling

All controllers include comprehensive error handling:

```javascript
try {
  // Query execution
  const result = await pool.query(...);
  res.status(201).json({ success: true, data: result.rows[0] });
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({
    success: false,
    message: "Error message",
    error: error.message
  });
} finally {
  // Cleanup connections
  client.release();
}
```

---

## Transaction Safety

Critical operations use database transactions:

```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  // All operations here are atomic
  const invoiceResult = await client.query('INSERT INTO invoices ...');
  const itemsResult = await client.query('INSERT INTO invoice_items ...');
  const taxesResult = await client.query('INSERT INTO invoice_taxes ...');
  
  await client.query('COMMIT');
  // Success - all changes committed
} catch (error) {
  await client.query('ROLLBACK');
  // Error - all changes rolled back
} finally {
  client.release();
}
```

If any query fails, ROLLBACK automatically reverts all changes.

---

## Data Integrity

### Foreign Key Constraints
All relationships are enforced at database level:
```sql
user_id REFERENCES users(id) ON DELETE CASCADE
business_id REFERENCES business(id) ON DELETE CASCADE
client_id REFERENCES clients(id) ON DELETE CASCADE
invoice_id REFERENCES invoices(id) ON DELETE CASCADE
```

### On Delete Cascade
When an invoice is deleted, all related records are automatically deleted:
- invoice_items
- invoice_taxes
- invoice_discounts
- invoice_payments

### Parameterized Queries
All inputs are parameterized to prevent SQL injection:
```javascript
// ❌ Unsafe
const query = `SELECT * FROM invoices WHERE id = ${id}`;

// ✅ Safe
const query = `SELECT * FROM invoices WHERE id = $1`;
const result = await pool.query(query, [id]);
```

---

## Performance Notes

### Query Optimization
- Indexed columns: user_id, client_id, status, invoice_date
- Pagination implemented in getUserInvoices
- LEFT JOIN for optional client/business relationships
- ORDER BY indexes used for sorting

### Connection Pooling
- Pool maintains 10 idle connections by default
- Reuses connections for multiple requests
- Automatic reconnection on failure
- Prevents connection exhaustion

---

## Migration Summary

| Aspect | Before (Prisma) | After (Direct SQL) |
|--------|-----------------|-------------------|
| **ORM** | Prisma Client | Direct PostgreSQL |
| **Queries** | Prisma methods | pool.query() |
| **Transactions** | Prisma $transaction | BEGIN/COMMIT/ROLLBACK |
| **Relations** | Include option | Manual JOINs/queries |
| **Error Handling** | Prisma errors | PostgreSQL errors |
| **Performance** | ORM overhead | Direct execution |
| **Dependencies** | @prisma/client | pg only |

---

## Files Modified

1. ✅ `Backend/controllers/invoice.js` - **Completely rewritten**
   - Removed Prisma imports
   - Added pool.query() operations
   - Implemented transactions
   - Added helper function

2. ✅ `Backend/routes/invoiceRoutes.js` - **No changes needed**
   - Already uses only multer
   - No Prisma dependencies

3. ✅ `Backend/config/db.js` - **No changes needed**
   - Already configured for pool connections
   - Reads correct .env variables

4. ✅ `Backend/.env` - **Already configured**
   - Has all required DB_* variables
   - Already has JWT_SECRET

---

## Next Steps

1. ✅ Run backend: `npm start`
2. ✅ Test invoice creation with logo upload
3. ✅ Verify data in pgAdmin 4
4. ✅ Monitor logs for SQL errors
5. Consider adding:
   - SQL query logging for debugging
   - Connection pool monitoring
   - Query performance metrics

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "connect ECONNREFUSED" | Check DB_* env vars match pgAdmin 4 settings |
| "relation does not exist" | Verify all tables created in pgAdmin 4 |
| "syntax error in SQL" | Check parameterized query format |
| "permission denied" | Verify PostgreSQL user has table permissions |
| "client already released" | Check finally block executes client.release() |

---

**Migration Status:** ✅ **COMPLETE**
**Database:** Direct PostgreSQL via pgAdmin 4
**Connection:** Pool-based with transactions
**ORM:** None (Direct SQL)

---

*Updated: May 29, 2026*