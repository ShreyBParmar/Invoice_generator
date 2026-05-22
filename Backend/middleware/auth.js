import jwt from "jsonwebtoken";

export const auth =
(req, res, next) => {

   try {
      const authHeader =
      req.headers.authorization;

      console.log("Auth header: ",req.headers.authorization);
      

      if(!authHeader){

         return res.status(401).json({
            message:"No token"
         });
      }

      // EXTRACT TOKEN

      const token =
      authHeader.split(" ")[1];
console.log(
"TOKEN:",
token
);
      // VERIFY TOKEN

      const decoded =
      jwt.verify(
         token,
         process.env.JWT_SECRET
      );

      // STORE USER ID

      req.userId =
      decoded.userId;

      next();

   } catch(error){

      res.status(401).json({
         message:"Invalid token"
      });
   }
};