import pool from "../config/db.js";
import path from "path";
import fs from "fs";

// CREATE INVOICE WITH LOGO
export const createInvoice = async (req, res) => {

  console.log("req.user:", req.user);
console.log("req.userId:", req.userId);   

  const client = await pool.connect();
 console.log("=== CREATE INVOICE ===");
console.log("req.user =", req.user);
console.log("req.userId =", req.userId);

let userId = req.user?.id || req.userId;

console.log("FINAL USER ID =", userId);
  let parsedData = null;
  
  try {
    const { invoiceData } = req.body;
    const logoFile = req.file;

    console.log('Create Invoice Request:', {
      userId,
      invoiceData,
      logoFile: logoFile ? { filename: logoFile.filename, mimetype: logoFile.mimetype } : null,
      bodyKeys: Object.keys(req.body)
    });

    if (!invoiceData) {
      return res.status(400).json({ success: false, message: "Missing invoice data" });
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    try {
      parsedData = typeof invoiceData === 'string' ? JSON.parse(invoiceData) : invoiceData;
      console.log('Parsed Invoice Data:', parsedData);
    } catch (parseErr) {
      console.error('JSON Parse Error:', parseErr);
      return res.status(400).json({ success: false, message: "Invalid invoice data format", error: parseErr.message });
    }

    // Validate required fields
    if (!parsedData.currency || parsedData.currency.trim() === '') {
      return res.status(400).json({ success: false, message: "Currency is required" });
    }

    let logoUrl = logoFile ? `/uploads/${logoFile.filename}` : null;
    let logoMimeType = logoFile ? logoFile.mimetype : null;

    await client.query('BEGIN');

    // Resolve client
    let clientId;
    const clientName = (parsedData.clientName && parsedData.clientName.trim() !== '') ? parsedData.clientName.trim() : 'Default Client';
    
    const clientSearch = await client.query(
      `SELECT id FROM clients WHERE user_id = $1 AND (organization_name = $2 OR first_name = $2 OR last_name = $2) LIMIT 1`,
      [userId, clientName]
    );

    if (clientSearch.rows.length > 0) {
      clientId = clientSearch.rows[0].id;
    } else {
      // Create a default client for this user
      const newClient = await client.query(
        `INSERT INTO clients (user_id, client_type, organization_name, email)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [userId, 'organization', clientName, `client_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`]
      );
      clientId = newClient.rows[0].id;
      console.log('Created new client for invoice:', clientName, 'ID:', clientId);
    }

    // Resolve business
    let businessId = null;
    const businessSearch = await client.query(
      `SELECT id FROM business WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    if (businessSearch.rows.length > 0) {
      businessId = businessSearch.rows[0].id;
    }

    console.log("userId =", userId);
console.log("businessId =", businessId);
console.log("clientId =", clientId);

    const invoiceResult = await client.query(
      `INSERT INTO invoices (user_id, business_id, client_id, invoice_number, invoice_date, due_date, title, description, notes, language, currency, purchase_order, logo_url, logo_mime_type, subtotal, tax_amount, discount_amount, total_amount, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *`,
      [userId, businessId, clientId, parsedData.invoiceNumber, parsedData.invoiceDate, parsedData.dueDate, parsedData.title, parsedData.description, parsedData.notes, parsedData.language, parsedData.currency, parsedData.purchaseOrder, logoUrl, logoMimeType, parseFloat(parsedData.subtotal), parseFloat(parsedData.taxAmount || 0), parseFloat(parsedData.discountAmount || 0), parseFloat(parsedData.finalTotal), "draft", "unpaid"]
    );

    const invoiceId = invoiceResult.rows[0].id;
    console.log('Invoice created with ID:', invoiceId);

    if (parsedData.items && Array.isArray(parsedData.items)) {
      for (let i = 0; i < parsedData.items.length; i++) {
        const item = parsedData.items[i];
        await client.query(
          `INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount, item_order) VALUES ($1, $2, $3, $4, $5, $6)`,
          [invoiceId, item.description, parseFloat(item.quantity), parseFloat(item.rate), parseFloat(item.amount), i]
        );
      }
      console.log('Added', parsedData.items.length, 'items');
    }

    if (parsedData.taxName && parsedData.taxAmount) {
      await client.query(
        `INSERT INTO invoice_taxes (invoice_id, tax_name, tax_amount) VALUES ($1, $2, $3)`,
        [invoiceId, parsedData.taxName, parseFloat(parsedData.taxAmount)]
      );
      console.log('Added tax');
    }

    if (parsedData.discountName && parsedData.discountAmount) {
      await client.query(
        `INSERT INTO invoice_discounts (invoice_id, discount_name, discount_amount) VALUES ($1, $2, $3)`,
        [invoiceId, parsedData.discountName, parseFloat(parsedData.discountAmount)]
      );
      console.log('Added discount');
    }

    await client.query('COMMIT');
    const completeInvoice = await fetchInvoiceWithRelations(invoiceId);

    return res.status(201).json({ success: true, message: "Invoice created successfully", data: completeInvoice });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error("Create Invoice Error:", error.message);
    console.error("Full Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Error creating invoice", 
      error: error.message,
      debug: {
        userId,
        reqUser: req.user,
        invoiceDataExists: !!req.body.invoiceData,
        parsedDataExists: !!parsedData
      }
    });
  } finally {
    client.release();
  }
};

// GET INVOICE BY ID
export const getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const ownershipResult = await pool.query('SELECT id FROM invoices WHERE id = $1 AND user_id = $2', [parseInt(invoiceId), userId]);

    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const invoice = await fetchInvoiceWithRelations(parseInt(invoiceId));

    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    console.error("Get Invoice Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching invoice", error: error.message });
  }
};

// UPDATE INVOICE
export const updateInvoice = async (req, res) => {
  const client = await pool.connect();
  try {
    const { invoiceId } = req.params;
    const { invoiceData } = req.body;
    const userId = req.user?.id;
    const logoFile = req.file;

    const existingResult = await client.query('SELECT logo_url FROM invoices WHERE id = $1 AND user_id = $2', [parseInt(invoiceId), userId]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const existingInvoice = existingResult.rows[0];

    if (logoFile && existingInvoice.logo_url) {
      const oldLogoPath = path.join(process.cwd(), "public", existingInvoice.logo_url);
      if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
    }

    const parsedData = typeof invoiceData === 'string' ? JSON.parse(invoiceData) : invoiceData;
    const logoUrl = logoFile ? `/uploads/${logoFile.filename}` : existingInvoice.logo_url;
    const logoMimeType = logoFile ? logoFile.mimetype : null;

    await client.query('BEGIN');

    await client.query(
      `UPDATE invoices SET title = $1, description = $2, notes = $3, language = $4, currency = $5, purchase_order = $6, logo_url = $7, logo_mime_type = COALESCE($8, logo_mime_type), subtotal = $9, tax_amount = $10, discount_amount = $11, total_amount = $12, updated_at = CURRENT_TIMESTAMP WHERE id = $13 AND user_id = $14`,
      [parsedData.title, parsedData.description, parsedData.notes, parsedData.language, parsedData.currency, parsedData.purchaseOrder, logoUrl, logoMimeType, parseFloat(parsedData.subtotal), parseFloat(parsedData.taxAmount || 0), parseFloat(parsedData.discountAmount || 0), parseFloat(parsedData.finalTotal), parseInt(invoiceId), userId]
    );

    await client.query('COMMIT');
    const updatedInvoice = await fetchInvoiceWithRelations(parseInt(invoiceId));

    return res.status(200).json({ success: true, message: "Invoice updated successfully", data: updatedInvoice });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error("Update Invoice Error:", error);
    return res.status(500).json({ success: false, message: "Error updating invoice", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE INVOICE
export const deleteInvoice = async (req, res) => {
  const client = await pool.connect();
  try {
    const { invoiceId } = req.params;
    const userId = req.user?.id;

    const invoiceResult = await client.query('SELECT id, logo_url FROM invoices WHERE id = $1 AND user_id = $2', [parseInt(invoiceId), userId]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const invoice = invoiceResult.rows[0];

    if (invoice.logo_url) {
      const logoPath = path.join(process.cwd(), "public", invoice.logo_url);
      if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
    }

    await client.query('BEGIN');
    await client.query('DELETE FROM invoices WHERE id = $1', [parseInt(invoiceId)]);
    await client.query('COMMIT');

    return res.status(200).json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error("Delete Invoice Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting invoice", error: error.message });
  } finally {
    client.release();
  }
};

// GET ALL INVOICES FOR USER
export const getUserInvoices = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE i.user_id = $1';
    let queryParams = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND i.status = $${paramCount}`;
      queryParams.push(status);
    }

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM invoices i ${whereClause}`, queryParams);
    const total = parseInt(countResult.rows[0].total);

    paramCount++;
    const invoicesResult = await pool.query(
      `SELECT i.*, c.organization_name, c.first_name, c.last_name, c.email as client_email FROM invoices i LEFT JOIN clients c ON i.client_id = c.id ${whereClause} ORDER BY i.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...queryParams, limitNum, offset]
    );

    const invoices = invoicesResult.rows;

    for (let invoice of invoices) {
      const itemsResult = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY item_order ASC', [invoice.id]);
      invoice.items = itemsResult.rows;
    }

    return res.status(200).json({ success: true, data: invoices, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    console.error("Get User Invoices Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching invoices", error: error.message });
  }
};

// HELPER FUNCTION
async function fetchInvoiceWithRelations(invoiceId) {
  const invoiceResult = await pool.query('SELECT * FROM invoices WHERE id = $1', [invoiceId]);
  const invoice = invoiceResult.rows[0];

  if (!invoice) return null;

  const itemsResult = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY item_order ASC', [invoiceId]);
  invoice.items = itemsResult.rows;

  const taxesResult = await pool.query('SELECT * FROM invoice_taxes WHERE invoice_id = $1', [invoiceId]);
  invoice.taxes = taxesResult.rows;

  const discountsResult = await pool.query('SELECT * FROM invoice_discounts WHERE invoice_id = $1', [invoiceId]);
  invoice.discounts = discountsResult.rows;

  const paymentsResult = await pool.query('SELECT * FROM invoice_payments WHERE invoice_id = $1', [invoiceId]);
  invoice.payments = paymentsResult.rows;

  if (invoice.client_id) {
    const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [invoice.client_id]);
    invoice.client = clientResult.rows[0] || null;
  }

  if (invoice.business_id) {
    const businessResult = await pool.query('SELECT * FROM business WHERE id = $1', [invoice.business_id]);
    invoice.business = businessResult.rows[0] || null;
  }

  return invoice;
}