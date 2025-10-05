import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const Userschema =  new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
    lowercase:true,
    unique:true,
  },
  password:{
    type:String,
    required:true,
  },
  expenses:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"money"
    }
  ],
  income:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"money"
    }
  ],
  refreshtoken:{
    type:String,
  }
},{timestamps:true})

Userschema.pre("save",async function(next){
  if(!this.isModified("password"))return next()
  this.password = bcrypt.hash(this.password,10)
})

Userschema.methods.isPasswordCorrect = async function(password){
  return bcrypt.compare(password,this.password)
}

Userschema.methods.AccessTokenGenerate = function(){
  return jwt.sign({
    _id:this.id,
    email:this.email,
    name:this.name
  },
process.env.ACCESS_TOKEN,
{
  expiresIn:process.env.ACCESS_TOKEN_EXPIRY
}
)}

Userschema.methods.RefreshTokenGenerate = function(){
  return jwt.sign({
    _id:this.id,
    email:this.email,
    name:this.name
  },
process.env.REFRESH_TOKEN,
{
  expiresIn:process.env.REFRESH_TOKEN_EXPIRY
}
)}
export const user = mongoose.model("user",Userschema)