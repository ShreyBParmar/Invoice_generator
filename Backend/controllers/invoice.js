import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

// ============================================
// CREATE INVOICE WITH LOGO
// ============================================
export const createInvoice = async (req, res) => {
  try {
    const { invoiceData } = req.body;
    const userId = req.user?.id; // From auth middleware
    const logoFile = req.file; // From multer middleware

    // Validate required fields
    if (!invoiceData || !invoiceData.clientName) {
      return res.status(400).json({
        success: false,
        message: "Missing required invoice data",
      });
    }

    // Parse invoice data if it's a string
    const parsedInvoiceData = typeof invoiceData === 'string' 
      ? JSON.parse(invoiceData) 
      : invoiceData;

    // Prepare logo URL
    let logoUrl = null;
    let logoMimeType = null;

    if (logoFile) {
      logoUrl = `/uploads/${logoFile.filename}`;
      logoMimeType = logoFile.mimetype;
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        invoiceNumber: parsedInvoiceData.invoiceNumber,
        invoiceDate: new Date(parsedInvoiceData.invoiceDate),
        dueDate: new Date(parsedInvoiceData.dueDate),
        title: parsedInvoiceData.title,
        description: parsedInvoiceData.description,
        notes: parsedInvoiceData.notes,
        language: parsedInvoiceData.language,
        currency: parsedInvoiceData.currency,
        purchaseOrder: parsedInvoiceData.purchaseOrder,
        logoUrl,
        logoMimeType,
        subtotal: parseFloat(parsedInvoiceData.subtotal),
        taxAmount: parseFloat(parsedInvoiceData.taxAmount || 0),
        discountAmount: parseFloat(parsedInvoiceData.discountAmount || 0),
        totalAmount: parseFloat(parsedInvoiceData.finalTotal),
        status: "draft",
        paymentStatus: "unpaid",
      },
    });

    // Create invoice items
    if (parsedInvoiceData.items && Array.isArray(parsedInvoiceData.items)) {
      await prisma.invoiceItem.createMany({
        data: parsedInvoiceData.items.map((item, index) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          amount: parseFloat(item.amount),
          itemOrder: index,
        })),
      });
    }

    // Create tax if configured
    if (parsedInvoiceData.taxName && parsedInvoiceData.taxAmount) {
      await prisma.invoiceTax.create({
        data: {
          invoiceId: invoice.id,
          taxName: parsedInvoiceData.taxName,
          taxAmount: parseFloat(parsedInvoiceData.taxAmount),
        },
      });
    }

    // Create discount if configured
    if (parsedInvoiceData.discountName && parsedInvoiceData.discountAmount) {
      await prisma.invoiceDiscount.create({
        data: {
          invoiceId: invoice.id,
          discountName: parsedInvoiceData.discountName,
          discountAmount: parseFloat(parsedInvoiceData.discountAmount),
        },
      });
    }

    // Fetch complete invoice with relations
    const completeInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        items: true,
        taxes: true,
        discounts: true,
        payments: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: completeInvoice,
    });
  } catch (error) {
    console.error("Create Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating invoice",
      error: error.message,
    });
  }
};

// ============================================
// GET INVOICE BY ID
// ============================================
export const getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user?.id;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: parseInt(invoiceId),
        userId,
      },
      include: {
        items: true,
        taxes: true,
        discounts: true,
        payments: true,
        client: true,
        business: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Get Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching invoice",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE INVOICE
// ============================================
export const updateInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { invoiceData } = req.body;
    const userId = req.user?.id;
    const logoFile = req.file;

    // Verify ownership
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: parseInt(invoiceId),
        userId,
      },
    });

    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Delete old logo if new one is uploaded
    if (logoFile && existingInvoice.logoUrl) {
      const oldLogoPath = path.join(process.cwd(), "public", existingInvoice.logoUrl);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    const parsedInvoiceData = typeof invoiceData === 'string' 
      ? JSON.parse(invoiceData) 
      : invoiceData;

    const logoUrl = logoFile ? `/uploads/${logoFile.filename}` : existingInvoice.logoUrl;
    const logoMimeType = logoFile ? logoFile.mimetype : existingInvoice.logoMimeType;

    const updatedInvoice = await prisma.invoice.update({
      where: { id: parseInt(invoiceId) },
      data: {
        title: parsedInvoiceData.title,
        description: parsedInvoiceData.description,
        notes: parsedInvoiceData.notes,
        language: parsedInvoiceData.language,
        currency: parsedInvoiceData.currency,
        purchaseOrder: parsedInvoiceData.purchaseOrder,
        logoUrl,
        logoMimeType,
        subtotal: parseFloat(parsedInvoiceData.subtotal),
        taxAmount: parseFloat(parsedInvoiceData.taxAmount || 0),
        discountAmount: parseFloat(parsedInvoiceData.discountAmount || 0),
        totalAmount: parseFloat(parsedInvoiceData.finalTotal),
        updatedAt: new Date(),
      },
      include: {
        items: true,
        taxes: true,
        discounts: true,
        payments: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Update Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating invoice",
      error: error.message,
    });
  }
};

// ============================================
// DELETE INVOICE
// ============================================
export const deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user?.id;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: parseInt(invoiceId),
        userId,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Delete logo file
    if (invoice.logoUrl) {
      const logoPath = path.join(process.cwd(), "public", invoice.logoUrl);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    // Delete invoice (cascades to items, taxes, discounts, payments)
    await prisma.invoice.delete({
      where: { id: parseInt(invoiceId) },
    });

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Delete Invoice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting invoice",
      error: error.message,
    });
  }
};

// ============================================
// GET ALL INVOICES FOR USER
// ============================================
export const getUserInvoices = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    const total = await prisma.invoice.count({ where });

    return res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get User Invoices Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching invoices",
      error: error.message,
    });
  }
};