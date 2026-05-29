# Invoice Logo Upload & Image Storage - Implementation Summary

## 📋 Overview
Complete implementation of logo upload functionality for invoices with comprehensive PostgreSQL image storage guide.

---

## 🎯 Features Implemented

### 1. ✅ Logo Upload Feature
- Click on the logo button to open file selector
- Select image from device
- Live preview of selected image
- Display uploaded image in logo button
- Support for JPEG, PNG, GIF, WebP formats
- File size validation (max 5MB)
- MIME type validation

### 2. ✅ Database Schema Updates
- Added `logo_url` field to invoices table
- Added `logo_mime_type` field to invoices table
- Updated Prisma schema with complete models
- Added indexes for performance

### 3. ✅ Backend API
- File upload endpoint with multer
- Secure file validation and storage
- Integration with Prisma ORM
- Complete CRUD operations for invoices
- Automatic file cleanup on delete

### 4. ✅ Frontend Integration
- Logo file input handler
- Image preview before upload
- FormData submission with files
- API integration with authorization

---

## 📁 Files Modified/Created

### Frontend Changes
**File:** `Frontend/src/components/CreateInvocie.jsx`

Changes:
- Added `logoFile` and `logoPreview` state hooks
- Added `handleLogoChange()` function for file validation and preview
- Added `handleLogoButtonClick()` to trigger file input
- Updated logo button with click handler and image display
- Added hidden file input element
- Updated `handleSubmit()` to send FormData with logo file
- Added form validation before submission
- Updated API call to `/api/invoices` endpoint

### Backend Database Schema
**File:** `Backend/prisma/schema.prisma`    

Changes:
- Created complete Prisma schema with all models:
  - User model
  - Business model
  - Client model
  - Account model
  - Invoice model
  - InvoiceItem model
  - InvoiceTax model
  - InvoiceDiscount model
  - InvoicePayment model
- Added proper field mappings and relationships
- Added database indexes for performance

### Backend Controllers
**File:** `Backend/controllers/invoice.js` (NEW)

Functions:
- `createInvoice()` - Create invoice with logo and related data
- `getInvoice()` - Fetch single invoice by ID
- `updateInvoice()` - Update invoice with optional new logo
- `deleteInvoice()` - Delete invoice and cleanup logo file
- `getUserInvoices()` - Get all invoices for authenticated user with pagination

### Backend Routes
**File:** `Backend/routes/invoiceRoutes.js` (NEW)

Configuration:
- Multer disk storage configuration
- File filter for image validation
- File size limit (5MB)
- Routes:
  - `POST /api/invoices` - Create invoice
  - `GET /api/invoices` - Get user invoices
  - `GET /api/invoices/:invoiceId` - Get single invoice
  - `PUT /api/invoices/:invoiceId` - Update invoice
  - `DELETE /api/invoices/:invoiceId` - Delete invoice

### Server Configuration
**File:** `Backend/server.js`

Changes:
- Added file path imports for serving static files
- Added express.urlencoded middleware with 50MB limit
- Added static file serving for `/uploads` directory
- Imported and mounted invoice routes
- Updated middleware configuration

### Documentation
**File:** `Backend/POSTGRESQL_STORAGE_GUIDE.md` (NEW)

Comprehensive guide covering:
- Database schema design (3 approaches)
- Invoice data structure
- File upload best practices
- Comparison of storage methods (Local FS, AWS S3, Database Binary)
- Implementation examples for all methods
- Frontend integration examples
- Database transactions for data integrity
- Performance optimization techniques
- Security best practices
- Troubleshooting guide

---

## 🔧 Installation & Setup

### 1. Backend Dependencies
Multer is already installed in `package.json`. If not, run:
```bash
cd Backend
npm install multer
```

### 2. Create Uploads Directory
The application automatically creates `Backend/public/uploads/` directory on first file upload.

### 3. Create Tables in pgAdmin 4
Use the SQL schema provided below to create tables in pgAdmin 4:

**Copy and execute this SQL in pgAdmin 4 Query Tool:**

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

-- CREATE INDEXES
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

### 4. Prisma Client Generation
```bash
cd Backend
npx prisma generate
```

### 5. Environment Variables
Ensure `.env` file has:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
JWT_SECRET=your_secret_key
PORT=5000
```

### 6. Run Backend Server
```bash
cd Backend
npm install
npm start
# Or npm run dev (for development with nodemon)
```

### 7. Test in Frontend
- Click the **logo button** (circular gradient button)
- Select an image file
- See preview in button
- Fill invoice details
- Click **"Save Invoice"**

---

## 🚀 How It Works

### Frontend Flow
1. User clicks the logo button (circular button with gradient)
2. File input dialog opens
3. User selects an image file
4. Frontend validates:
   - File type (JPEG, PNG, GIF, WebP only)
   - File size (max 5MB)
5. Image preview displays in the logo button
6. User fills invoice details and clicks "Save Invoice"
7. FormData is created containing:
   - Logo file (binary)
   - Invoice data (JSON)
8. POST request sent to `/api/invoices` with authorization header

### Backend Flow
1. Request received at `/api/invoices`
2. Authentication middleware verifies JWT token
3. Multer processes file:
   - Validates MIME type
   - Checks file size
   - Stores in `Backend/public/uploads/` with unique name
4. Controller receives:
   - `req.file` - file object from multer
   - `req.body.invoiceData` - JSON invoice data
5. Creates invoice record with:
   - `logoUrl` - path to uploaded file
   - `logoMimeType` - image MIME type
6. Creates related records (items, taxes, discounts)
7. Returns complete invoice object as JSON

### Data Structure
```javascript
// Frontend sends
{
  logo: File,
  invoiceData: {
    invoiceNumber: "INV-001",
    title: "Invoice",
    clientName: "Client Name",
    items: [...],
    subtotal: 1000,
    taxAmount: 100,
    discountAmount: 50,
    finalTotal: 1050,
    // ... other fields
  }
}

// Database stores
{
  id: 1,
  invoiceNumber: "INV-001",
  logoUrl: "/uploads/logo-1716206400000-123456789.jpg",
  logoMimeType: "image/jpeg",
  subtotal: 1000.00,
  taxAmount: 100.00,
  // ... other fields
}

// Frontend displays
<img src={`http://localhost:5000/uploads/logo-123456789.jpg`} />
```

---

## 📊 Database Schema

### Invoices Table
```
id (Primary Key)
├── user_id (FK → users)
├── business_id (FK → business)
├── client_id (FK → clients)
├── invoice_number (Unique)
├── invoice_date, due_date
├── title, description, notes
├── language, currency
├── logo_url ⭐ NEW
├── logo_mime_type ⭐ NEW
├── subtotal, tax_amount, discount_amount, total_amount
├── status, payment_status
├── created_at, updated_at, sent_at, paid_at
└── Relations:
    ├── invoice_items (Line items)
    ├── invoice_taxes (Tax details)
    ├── invoice_discounts (Discount details)
    └── invoice_payments (Payment records)
```

---

## 🔐 Security Features

### File Upload Security
✅ MIME type validation (whitelist: jpeg, png, gif, webp)
✅ File size limit (5MB)
✅ Random filename generation (prevents overwrite, hides original)
✅ Directory isolation (files in `/public/uploads/`)
✅ Authentication required (JWT token validation)

### Database Security
✅ User ownership verification (userId matching)
✅ Foreign key constraints (referential integrity)
✅ SQL injection prevention (Prisma parameterized queries)
✅ Automatic file cleanup on invoice deletion

### API Security
✅ Authentication middleware on all invoice routes
✅ Authorization checks (user can only access own invoices)
✅ Input validation on form submission
✅ CORS enabled with appropriate headers

---

## 📝 Image Storage Options

### Option 1: Local File System (Current Implementation) ✅
**Best for:** Development, small deployments, single-server setups

Pros: Simple, fast, low cost
Cons: Not scalable, requires manual backup

Files stored in: `Backend/public/uploads/`

### Option 2: AWS S3 Cloud Storage (Recommended for Production)
**Best for:** Production, enterprise, multi-server deployments

Pros: Scalable, global CDN, auto-backup
Cons: Additional cost, API rate limits

Implementation in: `POSTGRESQL_STORAGE_GUIDE.md` (Section 6)

### Option 3: Database Binary Storage (BYTEA)
**Best for:** Small non-critical images only

Pros: Single backup, transactional
Cons: Slow, increases DB size, not recommended for large files

Implementation in: `POSTGRESQL_STORAGE_GUIDE.md` (Section 7)

---

## 🧪 Testing the Feature

### 1. Test Frontend
```
1. Navigate to "New Invoice"
2. Click the logo button (circular gradient button)
3. Select an image file (JPG, PNG, etc.)
4. Verify preview displays in the button
5. Fill in required fields (client name, date, etc.)
6. Click "Save Invoice"
```

### 2. Test API
```bash
# Create invoice with logo
curl -X POST http://localhost:5000/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "logo=@/path/to/image.jpg" \
  -F 'invoiceData={"invoiceNumber":"INV-001",...}'

# Get invoice
curl -X GET http://localhost:5000/api/invoices/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get invoice logo
curl http://localhost:5000/uploads/logo-1716206400000-123456789.jpg
```

### 3. Verify Database
```sql
SELECT id, invoice_number, logo_url, logo_mime_type 
FROM invoices 
WHERE id = 1;
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| File not uploading | Check MIME type, file size, server logs |
| Logo not displaying | Verify `logo_url` in DB, check file exists in `/uploads` |
| 404 on logo file | Ensure static middleware is configured correctly |
| Database error | Verify tables exist in pgAdmin 4, check database connection |
| Authentication fails | Verify JWT token, check token expiry |
| Permission denied on upload | Check folder permissions on `Backend/public/uploads/` |

---

## 📚 Full Documentation

For comprehensive information on PostgreSQL image storage, including:
- All 3 storage methods explained in detail
- Performance optimization
- Security best practices
- Database transactions
- Pagination examples
- Advanced configurations

**See:** `Backend/POSTGRESQL_STORAGE_GUIDE.md`

---

## 🎓 Learning Resources

- [Multer Documentation](https://github.com/expressjs/multer)
- [Prisma ORM Guide](https://www.prisma.io/docs/)
- [Express.js File Upload](https://expressjs.com/en/resources/middleware/multer.html)
- [PostgreSQL Binary Data](https://www.postgresql.org/docs/current/datatype-binary.html)
- [OWASP File Upload Security](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)

---

## ✨ Next Steps (Optional Enhancements)

1. **Image Compression**
   - Compress images on upload using `sharp` library
   - Create thumbnails for preview

2. **Cloud Migration**
   - Migrate to AWS S3 for production
   - Implement CDN for global distribution

3. **Advanced Features**
   - Multiple logo support per invoice
   - Logo gallery/library
   - Auto-crop functionality
   - Image optimization

4. **Performance**
   - Add caching headers for static files
   - Implement image resizing for different devices
   - Add database query optimization

5. **Monitoring**
   - Track upload success/failure rates
   - Monitor file storage usage
   - Implement cleanup jobs for unused files

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review `POSTGRESQL_STORAGE_GUIDE.md` for detailed explanations
3. Check server logs: `Backend/server.js` console output
4. Verify database migrations have been applied
5. Ensure all environment variables are correctly set

---

**Implementation Date:** May 29, 2026
**Status:** ✅ Complete and Ready for Testing
**Version:** 1.0.0