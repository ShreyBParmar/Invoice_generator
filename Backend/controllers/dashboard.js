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