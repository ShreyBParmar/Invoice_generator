import pool from "../config/db.js";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";

const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

const sendInvoiceEmail = async ({ to, invoiceNumber, title, totalAmount, clientName, invoiceDate, dueDate, items = [], currency, purchaseOrder, notes, subtotal, taxAmount, discountAmount }) => {
  if (!to) {
    console.log("No client email provided for invoice email.");
    return;
  }

  const smtpFrom = process.env.SMTP_USER;
  console.log("SMTP config:", {
    smtpHost: process.env.SMTP_HOST ? "configured" : "missing",
    smtpPort: process.env.SMTP_PORT ? "configured" : "missing",
    smtpUser: process.env.SMTP_USER ? "configured" : "missing",
    smtpFrom: smtpFrom ? "configured" : "missing",
  });

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !smtpFrom) {
    console.warn("SMTP is not configured. Skipping invoice email.");
    return;
  }

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB");
  };

  const itemsRows = items && items.length > 0 ? items.map((item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.description || "-"}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity ?? "-"}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.rate != null ? Number(item.rate).toFixed(2) : "-"}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.amount != null ? Number(item.amount).toFixed(2) : "-"}</td>
      </tr>
    `).join("") : "";

  const itemsTable = itemsRows ? `
      <h3 style="margin-bottom: 8px;">Invoice Items</h3>
      <table style="border-collapse: collapse; width: 100%; max-width: 700px; margin-bottom: 16px;">
        <thead>
          <tr>
            <th style="padding: 8px; border: 1px solid #ddd; background: #f7f7f7; text-align: left;">Description</th>
            <th style="padding: 8px; border: 1px solid #ddd; background: #f7f7f7; text-align: center;">Qty</th>
            <th style="padding: 8px; border: 1px solid #ddd; background: #f7f7f7; text-align: right;">Rate</th>
            <th style="padding: 8px; border: 1px solid #ddd; background: #f7f7f7; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    ` : "";

  try {
    const info = await mailTransporter.sendMail({
      from: smtpFrom,
      to,
      subject: `Invoice ${invoiceNumber} created`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 700px;">
          <h2 style="color: #1a202c;">Invoice Created</h2>
          <p>Hello ${clientName || "there"},</p>
          <p>Your invoice <strong>${invoiceNumber}</strong> has been created successfully. Here are the details:</p>
          <table style="border-collapse: collapse; width: 100%; max-width: 700px; margin-bottom: 16px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 160px;">Title</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${title || "Invoice"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Invoice Date</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(invoiceDate)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Due Date</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(dueDate)}</td>
            </tr>
            ${purchaseOrder ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Purchase Order</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${purchaseOrder}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Subtotal</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${Number(subtotal || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Tax Amount</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${Number(taxAmount || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Discount Amount</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${Number(discountAmount || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Total Amount</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${currency ? currency + " " : ""}${Number(totalAmount || 0).toFixed(2)}</td>
            </tr>
          </table>
          ${itemsTable}
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
          <br>
          <p>Thank you for doing business with us.</p>
        </div>
      `,
    });
    console.log("Nodemailer email sent", info);
  } catch (error) {
    console.error("Invoice email failed:", error);
    throw error;
  }
};

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB");
  };
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
    let clientEmail = null;
    let selectedClientName = null;

    if (parsedData.clientId) {
      const clientRow = await client.query(
        `SELECT id, organization_name, first_name, last_name, email FROM clients WHERE id = $1 AND user_id = $2 LIMIT 1`,
        [parsedData.clientId, userId]
      );

      if (clientRow.rows.length === 0) {
        return res.status(400).json({ success: false, message: "Selected client is invalid or does not belong to you." });
      }

      const clientRowData = clientRow.rows[0];
      clientId = clientRowData.id;
      clientEmail = clientRowData.email;
      selectedClientName = clientRowData.organization_name || `${clientRowData.first_name || ""} ${clientRowData.last_name || ""}`.trim();
    } else {
      const clientName = (parsedData.clientName && parsedData.clientName.trim() !== '') ? parsedData.clientName.trim() : 'Default Client';
      const clientSearch = await client.query(
        `SELECT id, email, organization_name, first_name, last_name FROM clients WHERE user_id = $1 AND (organization_name = $2 OR first_name = $2 OR last_name = $2) LIMIT 1`,
        [userId, clientName]
      );

      if (clientSearch.rows.length > 0) {
        const clientRowData = clientSearch.rows[0];
        clientId = clientRowData.id;
        clientEmail = clientRowData.email;
        selectedClientName = clientRowData.organization_name || `${clientRowData.first_name || ""} ${clientRowData.last_name || ""}`.trim();
      } else {
        // Create a default client for this user
        const newClient = await client.query(
          `INSERT INTO clients (user_id, client_type, organization_name, email)
           VALUES ($1, $2, $3, $4) RETURNING id, email`,
          [userId, 'organization', clientName, `client_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`]
        );
        clientId = newClient.rows[0].id;
        clientEmail = newClient.rows[0].email;
        selectedClientName = clientName;
        console.log('Created new client for invoice:', clientName, 'ID:', clientId);
      }
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

    const resolvedClientEmail = parsedData.clientEmail || clientEmail || null;
    const emailRecipient = resolvedClientEmail || parsedData.clientEmail || null;
    const emailName = selectedClientName || parsedData.clientName || null;

    console.log("Resolved invoice email recipient info:", {
      parsedDataClientEmail: parsedData.clientEmail || null,
      dbClientEmail: clientEmail || null,
      emailRecipient,
      emailName,
      clientId: parsedData.clientId || null,
      clientName: parsedData.clientName || null,
    });

    if (emailRecipient) {
      try {
        await sendInvoiceEmail({
          to: emailRecipient,
          invoiceNumber: parsedData.invoiceNumber,
          title: parsedData.title,
          totalAmount: parsedData.finalTotal,
          clientName: emailName,
          invoiceDate: parsedData.invoiceDate,
          dueDate: parsedData.dueDate,
          items: parsedData.items,
          currency: parsedData.currency,
          purchaseOrder: parsedData.purchaseOrder,
          notes: parsedData.notes,
          subtotal: parsedData.subtotal,
          taxAmount: parsedData.taxAmount,
          discountAmount: parsedData.discountAmount
        });
      } catch (mailError) {
        console.error("Invoice email sending failed:", mailError);
      }
    } else {
      console.warn("No recipient email available for invoice notification.");
    }

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
