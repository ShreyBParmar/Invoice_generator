import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signUp = async (req, res) => {

    try {
        console.log("SignUp request received");
        const {
            email,
            password
        } = req.body;

        console.log("Email:", email);

        // HASH PASSWORD

        const hashedPassword =
        await bcrypt.hash(password, 13);

        // INSERT USER

        const query = `
            INSERT INTO users
            (email, password)

            VALUES ($1, $2)

            RETURNING *
        `;

        const values = [
            email,
            hashedPassword
        ];

        const result =
        await pool.query(query, values);

        // GET INSERTED USER

        const user =
        result.rows[0];

        console.log("User created:", user.id);

        // CREATE JWT TOKEN

        const token = jwt.sign(

            {
                userId: user.id
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }
        );

        console.log("Token created:", token);

        res.status(201).json({

            success: true,

            message:
            "User created successfully",

            user,

            token
        });

    } catch (error) {

        console.log("SignUp error:", error.message);

        if(error.code === "23505") {
          return res.status(400).json({
            success: false,
            message: "Email already exists"
          });
        }

        res.status(500).json({
            success: false,
            message: "Server Error: " + error.message
        });
    }
};