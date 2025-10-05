import { user } from "../models/User.models.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";


const registeruser = asynchandler(async(req,res)=>{
    const{email,name,password} = req.body
    if(!email || !name || !password){
        throw new Apierror(400,"please enter all fields")
    }

    const existeduser = await user.findOne({
        $or:[{email}]
    })
    if(existeduser){
        throw new Apierror(300,"User already Exists")
    }

   const createduser= await user.create({
        email,
        name,
        password
    })

    const newuser = await user.findById(createduser._id).select("-password")

    if(!newuser){
        throw new Apierror(500,"Internal server error")
    }

    res
    .status(200)
    .json(new Apiresponse(201,newuser,"User created succesfully"))
})

export {registeruser}