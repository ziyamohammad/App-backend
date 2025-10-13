import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const Moneyschema = new mongoose.Schema({
    amount:{
        type:Number,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    }
},{timestamps:true})

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
  expenses:[Moneyschema],
  income:[Moneyschema],
},{timestamps:true})

Userschema.pre("save",async function(next){
  if(!this.isModified("password"))return next()
  this.password =await bcrypt.hash(this.password,10)
})

Userschema.methods.isPasswordCorrect = async function(password){
  return bcrypt.compare(password,this.password)
}

Userschema.methods.TokenGenerate = function(){
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

export const user = mongoose.model("user",Userschema)