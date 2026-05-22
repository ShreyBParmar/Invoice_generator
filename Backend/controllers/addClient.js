import pool from "../config/db.js"

export const addClient=async(req,res)=>{
    try{
        const {
            organizationName, 
            firstname, 
            lastname, 
            email, 
            website, 
            currency, 
            language, 
            address1, 
            address2, 
            postalcode, 
            state, 
            city, 
            country, 
            phone_number, 
            fax_number,
            tax_id,
            clientType} = req.body;

         const query = `
            INSERT INTO clients
            (client_type, organization_name, first_name,last_name, email,  website_url, currency, language_select, address1, address2, city, state_name, postal_code , country, phone_number, fax_number, tax_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        `;

        const values = [
            clientType,
            organizationName, 
            firstname, 
            lastname, 
            email, 
            website, 
            currency, 
            language, 
            address1, 
            address2, 
            city,
            state,
            postalcode, 
            country, 
            phone_number, 
            fax_number,
            tax_id
        ];

        const result = await pool.query(query, values);

         res.status(201).json({
            success: true,
            message: "Client created successfully",
            user: result.rows[0]
        });
    } catch(error){
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}