
import express  from 'express'
import axios from 'axios'
// import { authMiddleware } from '../middleware/authmiddleware'
const router = express.Router()
import dotenv from 'dotenv';
dotenv.config();

const appId = process.env.INSTAGRAM_APP_ID 
const redirectUri = process.env.INSTAGRAM_REDIRECT_URI 
// const redirectUri = "http://localhost:5000/api/instagram/redirect-url"
const scope = 'user_profile,user_media'



router.get('/oauth/authorise',async(req,res)=>{
    const authUrl = `https://api.instagram.com/oauth/authorize` +
    `?client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scope}` +
    `&response_type=code`
  return res.redirect(authUrl)
})

router.get('/redirect-url',async(req,res)=>{
    const access_token = req.query.code
    res.json({
        "acess-token":access_token
    })

})

export  default router