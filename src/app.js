import express from "express"

const app = express()

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

import approuter from "./routes/register.router.js"

app.use("/api/v1/user",approuter)

export {app}