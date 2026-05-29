# PostgreSQL Image & Invoice Data Storage Guide

## Overview
This guide explains how to store invoice data and images in PostgreSQL, including best practices and architecture decisions.

**Note:** Tables are created manually in pgAdmin 4. Refer to [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md#-installation--setup) for SQL schema.

---

## 1. Database Schema Design

### Storage Approach
We use **two complementary approaches** for storing images in PostgreSQL:

#### **Approach 1: File Path Storage (Recommended - Currently Used)**
- Store the **file path/URL** in the database
- Files stored on **server file system** or **cloud storage** (S3, Cloudinary, etc.)
- Database: `logoUrl` VARCHAR(500) and `logoMimeType` VARCHAR(100)

#### **Approach 2: Binary Data Storage (Bytea)**
- Store **actual image bytes** in the database
- Use PostgreSQL's `BYTEA` type for binary data
- Not recommended for large files due to performance impact

### Current Schema (Path-Based)
```sql
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    -- ... other fields ...
    logo_url VARCHAR(500),           -- Path to logo: /uploads/logo-123456.jpg
    logo_mime_type VARCHAR(100),     -- MIME type: image/jpeg
    -- ... other fields ...
);
```

### Alternative Schema (Binary - For Reference)
```sql
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    -- ... other fields ...
    logo_data BYTEA,                 -- Binary image data
    logo_mime_type VARCHAR(100),     -- MIME type
    -- ... other fields ...
);
```

---

## 2. Invoice Data Storage Structure

### Full Invoice Schema with Relations
```
invoices
├── id (Primary Key)
├── user_id (Foreign Key → users)
├── business_id (Foreign Key → business)
├── client_id (Foreign Key → clients)
├── invoice_number (Unique)
├── title, description, notes
├── language, currency
├── logo_url, logo_mime_type
├── amounts (subtotal, tax_amount, discount_amount, total_amount)
├── status, payment_status
├── created_at, updated_at
└── Relations:
    ├── invoice_items (Line items)
    ├── invoice_taxes (Tax configurations)
    ├── invoice_discounts (Discount configurations)
    └── invoice_payments (Payment records)
```

---

## 3. File Upload Best Practices

### A. File Storage Location
```
Backend/
├── public/
│   └── uploads/
│       ├── logo-1716206400000-123456789.jpg
│       ├── logo-1716206500000-987654321.png
│       └── ...
├── server.js
└── ...
```

### B. Filename Strategy
```javascript
const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
const ext = path.extname(file.originalname);
const name = path.basename(file.originalname, ext);
const filename = `${name}-${uniqueSuffix}${ext}`;
// Result: logo-1716206400000-123456789.jpg
```

### C. File Validation
```javascript
// Allowed MIME types
const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// File size limit
const maxSize = 5 * 1024 * 1024; // 5MB

// Validate before processing
if (!allowedMimes.includes(file.mimetype)) {
  throw new Error("Invalid file type");
}
if (file.size > maxSize) {
  throw new Error("File too large");
}
```

---

## 4. Image Storage Methods Comparison

### Method 1: Local File System (Current Implementation)
**Pros:**
- ✅ Simple to implement
- ✅ Fast file access
- ✅ Low storage cost
- ✅ Easy to backup

**Cons:**
- ❌ Not scalable across multiple servers
- ❌ Requires manual backup strategy
- ❌ Server storage limits

**Use Case:** Small to medium applications, development, single-server deployments

### Method 2: Cloud Storage (AWS S3, Google Cloud, Azure)
**Pros:**
- ✅ Highly scalable
- ✅ Global distribution
- ✅ Built-in CDN support
- ✅ Automatic backups
- ✅ Multi-server compatible

**Cons:**
- ❌ Additional cost
- ❌ Slightly more latency
- ❌ API rate limits

**Use Case:** Production, enterprise, multi-server deployments

### Method 3: Database Binary Storage (BYTEA)
**Pros:**
- ✅ Single backup source
- ✅ ACID transactions
- ✅ No file system management

**Cons:**
- ❌ Slower performance
- ❌ Increased database size
- ❌ Higher memory usage
- ❌ Not recommended for large files

**Use Case:** Small, non-critical images only

---

## 5. Implementation: Local File System

### Step 1: Install Multer
```bash
npm install multer
```

### Step 2: Configure in Routes
```javascript
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/invoices", upload.single("logo"), createInvoice);
```

### Step 3: Server Configuration
```javascript
// In server.js
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb' }));
```

### Step 4: Save to Database
```javascript
const invoice = await prisma.invoice.create({
  data: {
    // ... other fields ...
    logoUrl: logoFile ? `/uploads/${logoFile.filename}` : null,
    logoMimeType: logoFile ? logoFile.mimetype : null,
  },
});
```

---

## 6. Implementation: AWS S3 Cloud Storage

### Step 1: Install AWS SDK
```bash
npm install aws-sdk
```

### Step 2: Configure AWS
```javascript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `invoices/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const result = await s3.upload(params).promise();
  return result.Location; // Returns S3 URL
};
```

### Step 3: Use in Controller
```javascript
const logoUrl = logoFile ? await uploadToS3(logoFile) : null;

const invoice = await prisma.invoice.create({
  data: {
    // ... other fields ...
    logoUrl,
    logoMimeType: logoFile ? logoFile.mimetype : null,
  },
});
```

---

## 7. Database Binary Storage (BYTEA) Example

### Schema
```sql
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    logo_data BYTEA,
    logo_mime_type VARCHAR(100),
    -- ... other fields ...
);
```

### Prisma Schema
```prisma
model Invoice {
  id          Int
  logoData    Bytes?    @map("logo_data") // BYTEA in PostgreSQL
  logoMimeType String?
  // ... other fields ...
}
```

### Upload Controller
```javascript
const invoice = await prisma.invoice.create({
  data: {
    // ... other fields ...
    logoData: logoFile ? logoFile.buffer : null,
    logoMimeType: logoFile ? logoFile.mimetype : null,
  },
});
```

### Retrieve and Send
```javascript
const invoice = await prisma.invoice.findUnique({
  where: { id: invoiceId },
});

res.set('Content-Type', invoice.logoMimeType);
res.send(invoice.logoData);
```

---

## 8. Frontend Integration

### Upload and Preview
```javascript
const handleLogoChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large');
      return;
    }

    setLogoFile(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};
```

### Submit with FormData
```javascript
const formData = new FormData();
formData.append('logo', logoFile);
formData.append('invoiceData', JSON.stringify(invoicePayload));

const response = await fetch('/api/invoices', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

---

## 9. Data Retrieval

### Get Invoice with Logo
```javascript
const invoice = await prisma.invoice.findUnique({
  where: { id: invoiceId },
  include: {
    items: true,
    taxes: true,
    discounts: true,
  },
});

// logoUrl will be something like: /uploads/logo-1716206400000-123456789.jpg
// Frontend can display: <img src={invoice.logoUrl} />
```

---

## 10. Database Transactions for Data Integrity

### Create Invoice with Relations
```javascript
const invoice = await prisma.$transaction(async (tx) => {
  // Create invoice
  const inv = await tx.invoice.create({
    data: {
      // ... invoice data ...
    },
  });

  // Create items
  await tx.invoiceItem.createMany({
    data: items.map((item) => ({
      invoiceId: inv.id,
      // ... item data ...
    })),
  });

  // Create taxes
  if (taxName) {
    await tx.invoiceTax.create({
      data: {
        invoiceId: inv.id,
        // ... tax data ...
      },
    });
  }

  return inv;
});
```

---

## 11. Performance Optimization

### Add Database Indexes
```sql
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
```

### Pagination
```javascript
const invoices = await prisma.invoice.findMany({
  where: { userId },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

### Select Only Required Fields
```javascript
const invoices = await prisma.invoice.findMany({
  select: {
    id: true,
    invoiceNumber: true,
    totalAmount: true,
    status: true,
    logoUrl: true,
    client: { select: { email: true, organizationName: true } },
  },
});
```

---

## 12. Security Best Practices

### 1. File Upload Validation
```javascript
// Whitelist MIME types
const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Limit file size
const maxSize = 5 * 1024 * 1024; // 5MB

// Validate extension
const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
```

### 2. Secure File Names
```javascript
// Don't use original filename
const uniqueFileName = `${Date.now()}-${randomUUID()}.${ext}`;
```

### 3. Access Control
```javascript
// Verify user owns the invoice before returning
const invoice = await prisma.invoice.findFirst({
  where: {
    id: invoiceId,
    userId: req.user.id, // Match current user
  },
});
```

### 4. Environment Variables
```bash
# .env
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=xxx
JWT_SECRET=xxx
```

---

## 13. Troubleshooting

### Issue: "Cannot find module multer"
```bash
npm install multer --save
```

### Issue: "ENOENT: no such file or directory" for uploads
```javascript
// Create directory recursively
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
```

### Issue: File upload larger than 50MB
```javascript
// Increase limit in express
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb' }));
```

### Issue: S3 permission denied
```bash
# Check AWS credentials in .env
# Verify S3 bucket policy allows uploads
# Check IAM user permissions
```

---

## 14. Summary

| Aspect | Local FS | S3 Cloud | Database |
|--------|----------|----------|----------|
| **Setup Complexity** | Easy | Medium | Easy |
| **Scalability** | Low | High | Low |
| **Cost** | Low | Medium | High |
| **Performance** | Fast | Medium | Slow |
| **Best For** | Dev, Small | Production, Enterprise | Small files |
| **Multi-Server** | ❌ | ✅ | ✅ |
| **Backup** | Manual | Auto | Yes |

**Current Implementation:** Local File System (Great for development/small deployments)

**Recommended for Production:** AWS S3 or similar cloud storage

---

## 15. Next Steps

1. **Test the logo upload** with various file types and sizes
2. **Implement cleanup** of old logo files when invoice is deleted
3. **Add image optimization** (compress on upload)
4. **Migrate to cloud storage** (S3) for production
5. **Implement image resizing** for different display sizes
6. **Add image caching** headers for performance

---

## Resources
- [Multer Documentation](https://github.com/expressjs/multer)
- [Prisma Database Guide](https://www.prisma.io/docs/)
- [PostgreSQL BYTEA Type](https://www.postgresql.org/docs/current/datatype-binary.html)
- [AWS S3 Upload](https://docs.aws.amazon.com/sdk-for-javascript/)
- [OWASP File Upload Security](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)