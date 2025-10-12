import { Apierror } from "../utils/Apierror.js";
import { asynchandler } from "../utils/Asynchandler.js";
import jwt from "jsonwebtoken"


const verifyjwt = asynchandler(async(req,res,next)=>{
    try{
       const token = req.headers?.authorization?.replace("Bearer ", "");
       if(!token){
        throw new Apierror(401,"Unauthorized user")
       }

       const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
       const existingUser = await user.findById(decoded._id);
    if (!existingUser) {
      throw new Apierror(401, "User not found");
    }

    // 4️⃣ Attach user info to req for later use
    req.user = existingUser;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    res.status(401).json({ message: "Invalid or missing access token" });
  }
})
export {verifyjwt}
