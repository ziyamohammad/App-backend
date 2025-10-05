import { user } from "../models/User.models.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";
import nodemailer from "nodemailer"

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

function generateotp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
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

const resetpassword  = asynchandler(async(req,res)=>{
    const {email} = req.body 

if(!email){
    throw new Apierror(400,"Please enter all the fields")
}

const loginuser = await user.findOne({
    $or:[{email}]
})

if(!loginuser){
    throw new Apierror(400,"User not found with this email")
}

const otp = generateotp()
req.session.otp = otp
req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
req.session.email = email
const transporter = nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
       user: process.env.USER,
       pass: process.env.PASS,
    }
})

const mailoptions = {
    to:email,
    from:"ziya7376502028@gmail.com",
    subject:"Income Tracker verification Mail",
    text:`The otp for verifying is ${otp}`
}



transporter.sendMail(mailoptions,(error,info)=>{
    if(error){
        console.error("Email send error:", error);
      return res.status(400).json(new Apierror(400, "Mail not sent"));
    }
    else{
        res.status(200)
        .json(new Apiresponse(201,"Otp sent successfully",otp))
    }
})


})

const verifypassword = asynchandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    throw new Apierror(400, "OTP is required");
  }

  if (!req.session?.otp || !req.session?.otpExpiry) {
    throw new Apierror(400, "No OTP session found");
  }

  if (Date.now() > req.session.otpExpiry) {
    req.session.otp = null;
    req.session.otpExpiry = null;
    throw new Apierror(401, "OTP expired");
  }


  if (otp === req.session.otp) {
    req.session.otp = null;
    req.session.otpExpiry = null;
    return res
      .status(200)
      .json(new Apiresponse(200, "OTP verified successfully"));
  } else {
    throw new Apierror(400, "Invalid OTP");
  }
});

const password = asynchandler(async(req,res)=>{
    try {
        const{newpassword}=req.body 
        
        if(!newpassword){
            throw new Apierror(404,"Please enter the password")
        }
        
        const email = req.session.email
        const loginuser = await user.findOne({email})
        if(!loginuser){
            throw new Apierror(404,"User not found")
        }

        const samepass = await loginuser.isPasswordCorrect(newpassword)

        if(samepass){
            throw new Apierror(400,"Password already in use")
        }
    
        loginuser.password = newpassword
        await loginuser.save({validateBeforeSave:false})

         req.session.destroy();

        res.status(200)
        .json(new Apiresponse(201,"Passord updated successfully"))
    } catch (error) {
        console.log(error)
    }
})

export {registeruser,loginuser,resetpassword,verifypassword,password}