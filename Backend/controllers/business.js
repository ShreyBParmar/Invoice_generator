import pool from "../config/db.js"

export const business=async(req,res)=>{
    try{
        const {
            user_id,    
            business_name,
            is_individual,
            vanity_url
        } = req.body;

    if(!vanity_url){
        return res.status(400).json({
            message:"Vanity URL required"
        });
    }

    const query = `
      INSERT INTO business
      (user_id,business_name, is_individual, vanity_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      user_id,
      business_name || null,
      is_individual,
      vanity_url
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      business: result.rows[0]
    });
    } catch(error){
         console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}