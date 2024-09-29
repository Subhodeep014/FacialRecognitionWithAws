import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import registerRouter from './routes/register.route.js'
const PORT = process.env.PORT || 3000 ;
dotenv.config();
const app = express();
app.use(express.json())
app.use(cors());

app.use("/api/add", registerRouter)
app.listen(PORT, ()=>{
    console.log(`App is running on port ${PORT}`)
})
