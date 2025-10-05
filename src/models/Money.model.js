import mongoose from "mongoose"

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

export const money = mongoose.model("money",Moneyschema)
