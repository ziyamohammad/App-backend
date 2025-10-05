import { user } from "../models/User.models.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";

const accessrefreshtoken = async(id) =>{
    const loggedinuser = await user.findById(id)
    if(!loggedinuser){
        throw new Apierror(500,"Something went wrong")
    }
    const accessToken = await loggedinuser.AccessTokenGenerate()
    const refreshToken = await loggedinuser.RefreshTokenGenerate()
    loggedinuser.refreshtoken=refreshToken
    loggedinuser.save({validateBeforeSave:false})
    return ({accessToken,refreshToken})
}
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

const loginuser = asynchandler(async(req,res)=>{
    const{email,password} = req.body 
    if(!email || !password){
        throw new Apierror(400,"All fields are mandatory")
    }
    const loginuser = await user.findOne({
        $or:[{email}]
    })
    if(!loginuser){
        throw new Apierror(300,"User not registered")
    }

    const passwordcheck = await loginuser.isPasswordCorrect(password)
    if(!passwordcheck){
        throw new Apierror(404,"Incorrect Password")
    }

    const{accessToken:accessToken , refreshToken:refreshToken}=await accessrefreshtoken(loginuser._id)

    res
    .status(200)
    .json(new Apiresponse(201,"User logged in successfully",loginuser))
})

export {registeruser,loginuser}