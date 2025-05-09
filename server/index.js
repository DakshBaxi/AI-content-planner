
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
    res.json("Hello");
})

app.use('/api/plan-route',contentRoute)

// Only listen locally if not running on Vercel

  
    app.listen(port, () => {
      console.log(`Server running locally on http://localhost:${port}`);
    });

  

  