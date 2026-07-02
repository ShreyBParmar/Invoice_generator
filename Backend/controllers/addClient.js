import pool from "../config/db.js"

export const addClient=async(req,res)=>{
    try{
                console.log("ADD CLIENT USER ID:", req.user?.id);
console.log("REQ USER:", req.user);
console.log("REQ USERID:", req.userId);

        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const {
            organizationName, 
            firstname, 
            lastname, 
            email, 
            website_url, 
            currency, 
            language, 
            address1, 
            address2, 
            postalcode, 
            state, 
            city, 
            country, 
            phone, 
            fax,
            tax_id,
            clientType} = req.body;

         const query = `
            INSERT INTO clients
            (user_id, client_type, organization_name, first_name, last_name, email, website_url, currency, language, address1, address2, city, state, postal_code, country, phone, fax, tax_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *
        `;

        const values = [
            userId,
            clientType,
            organizationName, 
            firstname, 
            lastname, 
            email, 
            website_url, 
            currency, 
            language, 
            address1, 
            address2, 
            city,
            state,
            postalcode, 
            country, 
            phone, 
            fax,
            tax_id
        ];

        const result = await pool.query(query, values);



         res.status(201).json({
            success: true,
            message: "Client created successfully",
            data: result.rows[0]
        });
    } catch(error){
        console.error("Add Client Error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
}