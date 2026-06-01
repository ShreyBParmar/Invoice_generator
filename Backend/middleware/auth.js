import jwt from "jsonwebtoken";

export const auth =
(req, res, next) => {

   try {
      const authHeader =
      req.headers.authorization;

      console.log("Auth header: ",req.headers.authorization);
      

      if(!authHeader){

         return res.status(401).json({
            message:"No token provided"
         });
      }

      
      // EXTRACT TOKEN

      const token =
      authHeader.split(" ")[1];
      
      if(!token) {
        return res.status(401).json({
           message:"Invalid token format"
        });
      }

console.log(
"TOKEN:",
token
);

console.log(
"JWT_SECRET:",
process.env.JWT_SECRET
);

      // VERIFY TOKEN

      const decoded =
      jwt.verify(
         token,
         process.env.JWT_SECRET
      );

      // STORE USER INFO

      req.user = {
        id: decoded.userId
      };
      req.userId = decoded.userId;

      next();

   } catch(error){

      console.log("JWT Error:", error.message);

      res.status(401).json({
         message:"Invalid token: " + error.message
      });
   }
};