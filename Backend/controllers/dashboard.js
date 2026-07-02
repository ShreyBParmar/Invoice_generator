import pool from "../config/db.js";

export const getDashboard =
async (req, res) => {

   try {

      const userId = req.user?.id || req.userId;

      const query = `
         SELECT *
         FROM business
         WHERE user_id = $1
      `;

      const result =
      await pool.query(query, [userId]);

      res.status(200).json({

         success: true,

         business:
         result.rows[0]

      });

   } catch(error){

      console.log(error);

      res.status(500).json({
         message:"Server Error"
      });
   }
};

/*
export const getDashboardStats = async (req, res) => { 
   try {
      
      const userId = req.user?.id || req.userId;

      console.log("userId:", userId);

      const query = `SELECT COUNT(*) AS count
FROM clients
WHERE user_id = $1`;

      const result = await pool.query(query, [userId]);        
      const allClientsRes = await pool.query(`SELECT id, user_id, organization_name, first_name, last_name FROM clients`);

      console.log(result.rows);
      
      res.status(200).json({
         success: true,
         totalClients: Number(result.rows[0].count),
         debug: {
            queriedUserId: userId,
            allClientsInDb: allClientsRes.rows
         }
      });
      
   } catch (error) {
      console.log(error);
      res.status(500).json({
         message: "Server Error",
         error: error.message
      });
   }
};
*/
export const getDashboardStats = async (req, res) => {
  try {

    const userId = req.user?.id || req.userId;
    console.log("Dashboard userId:", userId);

    const [
      clientsResult,
      invoicesResult,
      revenueResult
    ] = await Promise.all([

      pool.query(
        `SELECT COUNT(*) AS count
         FROM clients
         WHERE user_id = $1`,
        [userId]
      ),

      pool.query(
        `SELECT COUNT(*) AS count
         FROM invoices
         WHERE user_id = $1`,
        [userId]
      ),

      pool.query(
        `SELECT COALESCE(SUM(total_amount),0) AS revenue
         FROM invoices
         WHERE user_id = $1`,
        [userId]
      )

    ]);

    res.status(200).json({

      success: true,

      totalClients:
        Number(clientsResult.rows[0].count),

      totalInvoices:
        Number(invoicesResult.rows[0].count),

      totalRevenue:
        Number(revenueResult.rows[0].revenue)

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {

    const userId = req.user?.id || req.userId;

    const query = `
      SELECT
        TO_CHAR(invoice_date, 'Mon') AS month,
        EXTRACT(MONTH FROM invoice_date) AS month_number,
        COALESCE(SUM(total_amount), 0) AS revenue
      FROM invoices
      WHERE user_id = $1
      GROUP BY month, month_number
      ORDER BY month_number;
    `;

    const result = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      revenue: result.rows
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

export const getRecentInvoices = async (req, res) => {
  try {
    
    const userId = req.user?.id || req.userId;

    const query = `
      SELECT
        invoice_number,
        invoice_date,
        total_amount,
        payment_status,
        clients.organization_name,
        clients.first_name,
        clients.last_name
      FROM invoices
      JOIN clients
        ON invoices.client_id = clients.id
      WHERE invoices.user_id = $1
      ORDER BY invoices.created_at DESC
      LIMIT 5
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