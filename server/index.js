
import express from "express"
import cors from "cors"
import dotenv from 'dotenv';
import contentRoute from "./routes/contentRoute.js"
import instagramRoute from "./routes/instagramRoute.js"
import clerkRoute from "./routes/clerkRoute.js"
dotenv.config();

const app = express();

// Parse application/json
app.use(express.json({ limit: "1mb" }))

const port = process.env.PORT || 5000

app.use(cors({
    origin:"*"
}))

app.get('/',(req,res)=>{
    res.json("Hello");
})

app.use('/api/plan-route',contentRoute)

app.use('/api/instagram',instagramRoute)
app.use('/api/webhook',clerkRoute)
// Only listen locally if not running on Vercel

  
    app.listen(port, () => {
      console.log(`Server running locally on http://localhost:${port}`);
    });

  

  