import pool from "../config/db.js"

export const account = async(req,res) =>{
    try{
        const { firstname,lastname,companyname,address,website,postalcode ,state,taxid,city,country}=req.body;

         const query = `
            INSERT INTO account
            (firstname,lastname,company_name,address,website_url,postal_code ,state_name,tax_id,city,country)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const values = [
            firstname,
            lastname,
            companyname || null,
            address,
            website || null,
            postalcode ,
            state || null,
            taxid || null,
            city,
            country
        ];

        const result = await pool.query(query, values);

         res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: result.rows[0]
        });
    }
    catch(error){
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}