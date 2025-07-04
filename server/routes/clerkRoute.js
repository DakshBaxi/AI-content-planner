// routes/webhooks.js
import express from "express"
import Webhook from "svix"

import  prisma  from "../prisma/index.js";


import  SUBSCRIPTION_PLANS  from "../config/subscriptionPlans.js"

const router = express.Router();

router.post('/clerk', express.raw({type: 'application/json'}), async (req, res) => {
  const payload = req.body;
  const signature = req.headers['svix-signature'];
  
  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
  let event;
  
  try {
    event = webhook.verify(payload, signature);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Invalid signature');
  }
  
  console.log('Received webhook event:', event.type);
  
  try {
    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionChange(event.data);
        break;
        
      case 'subscription.deleted':
      case 'subscription.canceled':
        await handleSubscriptionCancellation(event.data);
        break;
        
      default:
        console.log('Unhandled event type:', event.type);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function handleSubscriptionChange(subscriptionData) {
  const { user_id: clerkId, plan_id, id: subscriptionId, status } = subscriptionData;
  
  // Determine the plan type based on Clerk's plan_id
  let planType = 'free';
  if (plan_id === 'pro') planType = 'pro';

  
  const planConfig = SUBSCRIPTION_PLANS[planType];
  
  // Update user in database
  await prisma.user.upsert({
    where: { clerkId },
    update: {
      subscriptionId,
      subscriptionPlan: planType,
      subscriptionStatus: status,
      isSubscribed: status === 'active' && planType !== 'free',
      generationLimit: planConfig.generationLimit,
      // Reset generation count when upgrading (optional)
      generationCount: 0,
      lastReset: new Date()
    },
    create: {
      clerkId,
      subscriptionId,
      subscriptionPlan: planType,
      subscriptionStatus: status,
      isSubscribed: status === 'active' && planType !== 'free',
      generationLimit: planConfig.generationLimit,
      generationCount: 0,
      lastReset: new Date()
    }
  });
  
  console.log(`Updated user ${clerkId} to ${planType} plan with ${planConfig.generationLimit} tokens`);
}

async function handleSubscriptionCancellation(subscriptionData) {
  const { user_id: clerkId } = subscriptionData;
  
  // Revert to free plan
  await prisma.user.update({
    where: { clerkId },
    data: {
      subscriptionId: null,
      subscriptionPlan: 'free',
      subscriptionStatus: 'canceled',
      isSubscribed: false,
      generationLimit: SUBSCRIPTION_PLANS.free.generationLimit,
      generationCount: 0, // Reset count
      lastReset: new Date()
    }
  });
  
  console.log(`Reverted user ${clerkId} to free plan`);
}

export default router