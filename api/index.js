import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import registerRouter from './routes/register.route.js'
import authRouter from './routes/auth.route.js'

const PORT = process.env.PORT || 3000 ;
dotenv.config();
const app = express();
app.use(express.json())
app.use(cors());

app.use("/api/add", registerRouter)
app.use("/api/get", authRouter)
app.listen(PORT, ()=>{
    console.log(`App is running on port ${PORT}`)
})
