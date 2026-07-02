import pool from "../config/db.js";

export const getAllInvoices = async (req, res) => {
  try {

const userId = req.user?.id || req.userId;

    const query = `
      SELECT
        invoices.id,
        invoices.invoice_number,
        invoices.invoice_date,
        invoices.due_date,
        invoices.payment_status,
        invoices.total_amount,

        clients.organization_name,
        clients.first_name,
        clients.last_name

      FROM invoices

      JOIN clients
      ON invoices.client_id = clients.id

      WHERE invoices.user_id = $1

      ORDER BY invoices.created_at DESC;
        
    `;
    
    const result = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      invoices: result.rows
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};