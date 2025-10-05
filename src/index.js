import { app } from "./app.js"
import dotenv from "dotenv"
import { connectdb } from "./database/dbconnect.js";

 dotenv.config({
    path:"./env"
 })
 const PORT = process.env.PORT;

 connectdb()
 .then(()=>{
    app.listen(PORT,()=>{
        console.log(`App is listening on Port ${PORT}`)
    })
 })
 .catch(()=>{
    console.log("something went wtong in connecting to MONGODB")
 })