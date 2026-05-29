# Quick Start - pgAdmin 4 Setup

## Step-by-Step Setup Guide

### 1️⃣ Create Tables in pgAdmin 4

#### Open pgAdmin 4
```
1. Open pgAdmin 4
2. Connect to your PostgreSQL database (if not already connected)
3. Expand Databases
4. Select your database
5. Go to Tools → Query Tool
```

#### Copy & Execute SQL
Copy this SQL and paste it into the Query Tool:

```sql
-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BUSINESS TABLE
CREATE TABLE IF NOT EXISTS business (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255),
    is_individual BOOLEAN DEFAULT FALSE,
    vanity_url VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_type VARCHAR(50) NOT NULL,
    organization_name VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    fax_number VARCHAR(20),
    website_url VARCHAR(255),
    currency VARCHAR(10),
    language_select VARCHAR(50),
    address1 VARCHAR(255),
    address2 VARCHAR(255),
    city VARCHAR(100),
    state_name VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    tax_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACCOUNT TABLE
CREATE TABLE IF NOT EXISTS account (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(255),
    account_email VARCHAR(255),
    account_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES business(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    title VARCHAR(255) DEFAULT 'Invoice',
    description TEXT,
    notes TEXT,
    language VARCHAR(50) DEFAULT 'English (US)',
    currency VARCHAR(10) NOT NULL,
    purchase_order VARCHAR(100),
    logo_url VARCHAR(500),
    logo_mime_type VARCHAR(100),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    paid_at TIMESTAMP
);

-- INVOICE ITEMS TABLE
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    rate DECIMAL(12, 2) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    item_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVOICE TAXES TABLE
CREATE TABLE IF NOT EXISTS invoice_taxes (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    tax_name VARCHAR(100) NOT NULL,
    tax_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVOICE DISCOUNTS TABLE
CREATE TABLE IF NOT EXISTS invoice_discounts (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    discount_name VARCHAR(100) NOT NULL,
    discount_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVOICE PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS invoice_payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_business_id ON invoices(business_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_taxes_invoice_id ON invoice_taxes(invoice_id);
CREATE INDEX idx_invoice_discounts_invoice_id ON invoice_discounts(invoice_id);
CREATE INDEX idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_business_user_id ON business(user_id);
```

#### Execute
Click the **Execute** button (or press F5) to run the SQL.

✅ All tables and indexes will be created!

---

### 2️⃣ Update .env File

Edit `Backend/.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
JWT_SECRET=your_secret_key_here
PORT=5000
```

Replace:
- `username` - your PostgreSQL username
- `password` - your PostgreSQL password
- `your_database_name` - name of your database

---

### 3️⃣ Install Dependencies & Generate Prisma Client

```bash
cd Backend
npm install
npx prisma generate
```

---

### 4️⃣ Run the Backend Server

```bash
cd Backend
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
JWT_SECRET is configured
Database connected
Server running on port 5000
```

---

### 5️⃣ Test the Feature

1. Go to Frontend (new invoice page)
2. Click the **logo button** (circular gradient)
3. Select an image file
4. See preview in the button
5. Fill invoice details
6. Click **"Save Invoice"**

✅ Done! Invoice with logo should be saved to database.

---

## Verify Setup

### Check Database in pgAdmin 4
```sql
-- View all invoices
SELECT * FROM invoices;

-- View invoice with logo
SELECT id, invoice_number, logo_url, logo_mime_type FROM invoices WHERE id = 1;

-- View all created tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### Check Files Uploaded
```
Backend/public/uploads/
  ├── logo-1716206400000-123456789.jpg
  └── ... (more uploaded files)
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "password authentication failed" | Check DATABASE_URL credentials |
| "database does not exist" | Create database in pgAdmin 4 first |
| "relation does not exist" | Verify SQL was executed successfully |
| Tables not showing | Refresh pgAdmin 4 (F5) |
| "no such file or directory: uploads" | Will be created automatically on first upload |

---

## ✅ Checklist

- [ ] Tables created in pgAdmin 4
- [ ] .env file configured
- [ ] `npm install` completed
- [ ] `npx prisma generate` completed
- [ ] Backend server running (`npm start`)
- [ ] Logo upload working in frontend
- [ ] Invoice saved to database

All done! 🎉