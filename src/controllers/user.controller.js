
import { user } from "../models/User.models.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { asynchandler } from "../utils/Asynchandler.js";
import sgMail from "@sendgrid/mail";
import jwt from "jsonwebtoken"

const accessrefreshtoken = async(id) =>{
    const loggedinuser = await user.findById(id)
    if(!loggedinuser){
        throw new Apierror(500,"Something went wrong")
    }
    const jwt_secret = await loggedinuser.TokenGenerate()
    return (jwt_secret)
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

    const jwt_secret=await accessrefreshtoken(loginuser._id)

  res.status(200).json(
    new Apiresponse(200, {
      jwt_secret,
    }, "User logged in successfully")
  );
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
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: email,
  from: "mohammad2311061@akgec.ac.in", // must be verified in SendGrid
  subject: "Income Tracker verification Mail",
  text: `Your OTP for verification is ${otp}. It is valid for 5 minutes.`,
};

try {
  await sgMail.send(msg);
  res.status(200).json(new Apiresponse(201, "OTP sent successfully", otp));
} catch (error) {
  console.error("Email send error:", error);
  res.status(400).json(new Apierror(400, "Mail not sent"));
}

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

const amountadd = asynchandler(async(req,res)=>{
    const {amount , title , category ,token ,effect} = req.body 
    if(!amount || !title || !category || !token ||!effect){
       throw new Apierror(404,"Please enter all the fields")
    }

  const currentuser = jwt.verify(token,process.env.ACCESS_TOKEN)
  if (!currentuser) {
    throw new Apierror(401, "Unauthorized user");
  }

  const email = currentuser.email
  const loguser = await user.findOne({email})
  if(!loguser){
    throw new Apierror(400,"User not found")
  }
   if(effect==="income"){
     loguser.income.push({ amount, title, category }); 
   await loguser.save({ validateBeforeSave: false }); 
   res.status(200).json( new Apiresponse(200, loguser.income, "Income added successfully") );
   }
   else{
    loguser.expenses.push({ amount, title, category }); 
   await loguser.save({ validateBeforeSave: false }); 
   res.status(200).json( new Apiresponse(200, loguser.expenses, "Income added successfully") );
   }
   
})

const token = asynchandler(async(req,res)=>{
  const {token} = req.body 
  if(!token){
    throw new Apierror(404,"All fields are required")
  }
  const user1 = jwt.verify(token,process.env.ACCESS_TOKEN)
  const email = user1.email

  const loginuser = await user.findOne({email})
  if(!loginuser){
    throw new Apierror(400,"user not found")
  }

  res
  .status(200)
  .json(new Apiresponse(201,"User details found",loginuser))

})

export {registeruser,loginuser,resetpassword,verifypassword,token,password,amountadd}