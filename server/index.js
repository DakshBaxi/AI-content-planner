
import express from "express"
import cors from "cors"

import contentRoute from "./routes/contentRoute.js"
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Parse application/json
app.use(express.json());

const port = process.env.PORT || 5000

app.use(cors({
    origin:"*"
}))

app.get('/',(req,res)=>{
    res.send("Hello");
})

app.use('/api/plan-route',contentRoute)

app.listen(port,(req,res)=>{
    console.log(
        `Server is running on ${port}`
    )
})