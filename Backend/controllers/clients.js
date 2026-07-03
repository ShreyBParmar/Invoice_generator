import pool from "../config/db.js";

export const getUserClients = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    const result = await pool.query(
      `
        SELECT id, client_type, organization_name, first_name, last_name, email
        FROM clients
        WHERE user_id = $1
        ORDER BY organization_name ASC, first_name ASC, last_name ASC
      `,
      [userId]
    );

    console.log("Get user clients result:", result.rows);

    res.status(200).json({
      success: true,
      clients: result.rows,
    });
  } catch (error) {
    console.error("Get user clients error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
