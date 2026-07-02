import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {

  try {
    const {
      email,
      password
    } = req.body;

    const result =
    await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    
    const user =
    result.rows[0];

    if (!user) {

      return res.status(400).json({
        message: "Invalid Email"
      });

    }

    const isMatch =
    await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        message: "Invalid Password"
      });

    }

    const token = jwt.sign(

      {
        userId: user.id
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({

      success: true,

      token,

      user: {
        id: user.id,
        email: user.email
      }

    });

  } catch (error) {

    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }
};