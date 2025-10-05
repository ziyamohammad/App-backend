import express from "express"
import session from "express-session"
import cookieParser from "cookie-parser"

const app = express()

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.use(
  session({
    secret:"careconnect_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      httpOnly:true,
      secure:true,
      sameSite:"None",
      maxAge: 5 * 60 * 1000
     }, 
  })
);

import approuter from "./routes/register.router.js"

app.use("/api/v1/user",approuter)

export {app}