// routes/webhooks.js
import express from "express"
import {Webhook} from "svix"

import  prisma  from "../prisma/index.js";


import  SUBSCRIPTION_PLANS  from "../config/subscriptionPlans.js"

const router = express.Router();

router.post('/clerk', express.raw({type: 'application/json'}), async (req, res) => {
  // Get the body
  const payload = req.body;
  console.log(payload);
  const body = JSON.stringify(payload)
  // Get the headers from Express request object
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers:', {
      svix_id: !!svix_id,
      svix_timestamp: !!svix_timestamp,
      svix_signature: !!svix_signature
    });
    return res.status(400).json({ error: "Error occurred -- no svix headers" });
  }
  
  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
  let event;
  
  try {
    event = webhook.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  // console.log('Received webhook event:', event.type);
  
  // try {
  //   switch (event.type) {
  //     case 'subscriptionItem.active':
  //       await handleSubscriptionActivated(event.data);
  //       break;
        
  //     case 'ubscriptionItem.updated':
  //       await handleSubscriptionUpdated(event.data);
  //       break;
        
  //     case 'subscriptionItem.canceled':
  //     case 'subscriptionItem.ended':
  //       await handleSubscriptionCancellation(event.data);
  //       break;
        
  //     case 'subscriptionItem.upcoming':
  //       await handleSubscriptionUpcoming(event.data);
  //       break;
        
  //     default:
  //       console.log('Unhandled event type:', event.type);
  //   }
    
  //   res.status(200).json({ message: 'Webhook processed successfully' });
  // } catch (error) {
  //   console.error('Error processing webhook:', error);
  //   res.status(500).json({ error: 'Internal Server Error' });
  // }
});

async function handleSubscriptionActivated(subscriptionData) {
  try {
    // Handle different possible field names for user ID
    const clerkId = subscriptionData.user_id || subscriptionData.userId || subscriptionData.subject;
    const {  id: subscriptionId, status } = subscriptionData;
    const plan_id = subscriptionData.plan.slug
    if (!clerkId) {
      console.error('No user ID found in subscription activation data:', subscriptionData);
      return;
    }
    
    console.log('Processing subscription activation:', {
      clerkId,
      plan_id,
      subscriptionId,
      status,
      rawData: subscriptionData // Log raw data for debugging
    });
    
    // Determine the plan type based on Clerk's plan_id
   let planType='free'
    if (plan_id && plan_id.includes('pro')){
      planType = 'pro';
    } 
    
    const planConfig = SUBSCRIPTION_PLANS[planType];
    
    if (!planConfig) {
      console.error('Unknown plan type:', planType);
      return;
    }
    
    // Update user in database - subscription is now active
    const updatedUser = await prisma.user.upsert({
      where: { clerkId },
      update: {
        subscriptionId,
        subscriptionPlan: planType,
        subscriptionStatus: 'active',
        isSubscribed: true,
        generationLimit: planConfig.generationLimit,
        // Reset generation count when activating subscription
        lastReset: new Date()
      },
      create: {
        clerkId,
        subscriptionId,
        subscriptionPlan: planType,
        subscriptionStatus: 'active',
        isSubscribed: true,
        generationLimit: planConfig.generationLimit,
        generationCount: 0,
        lastReset: new Date()
      }
    });
    
    console.log(`Activated subscription for user ${clerkId} to ${planType} plan with ${planConfig.generationLimit} tokens`);
    
  } catch (error) {
    console.error('Error handling subscription activation:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscriptionData) {
  try {
    // Handle different possible field names for user ID
    const clerkId = subscriptionData.user_id || subscriptionData.userId || subscriptionData.subject;
    const {  id: subscriptionId, status } = subscriptionData;
    const plan_id = subscriptionData.plan.slug
    if (!clerkId) {
      console.error('No user ID found in subscription update data:', subscriptionData);
      return;
    }
    
    console.log('Processing subscription update:', {
      clerkId,
      plan_id,
      subscriptionId,
      status,
      rawData: subscriptionData
    });
    
    // Determine the plan type based on Clerk's plan_id
    let planType = 'free';
    if (plan_id && plan_id.includes('pro')) planType = 'pro';
    
    const planConfig = SUBSCRIPTION_PLANS[planType];
    
    if (!planConfig) {
      console.error('Unknown plan type:', planType);
      return;
    }
    
    // Update user in database
    const updatedUser = await prisma.user.upsert({
      where: { clerkId },
      update: {
        subscriptionId,
        subscriptionPlan: planType,
        subscriptionStatus: status || 'active',
        isSubscribed: status === 'active' && planType !== 'free',
        generationLimit: planConfig.generationLimit,
        // Don't reset generation count on update, just change limits
        lastReset: new Date()
      },
      create: {
        clerkId,
        subscriptionId,
        subscriptionPlan: planType,
        subscriptionStatus: status || 'active',
        isSubscribed: status === 'active' && planType !== 'free',
        generationLimit: planConfig.generationLimit,
        generationCount: 0,
        lastReset: new Date()
      }
    });
    
    console.log(`Updated subscription for user ${clerkId} to ${planType} plan with ${planConfig.generationLimit} tokens`);
    
  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw error;
  }
}

async function handleSubscriptionCancellation(subscriptionData) {
  try {
    // Handle different possible field names for user ID
    const clerkId = subscriptionData.user_id || subscriptionData.userId || subscriptionData.subject;
    
    if (!clerkId) {
      console.error('No user ID found in cancellation data:', subscriptionData);
      return;
    }
    
    console.log('Processing subscription cancellation/end for user:', clerkId);
    console.log('Cancellation data:', subscriptionData);
    
    // Revert to free plan
    const updatedUser = await prisma.user.update({
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
    
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

async function handleSubscriptionUpcoming(subscriptionData) {
  try {
    // Handle different possible field names for user ID
    const clerkId = subscriptionData.user_id || subscriptionData.userId || subscriptionData.subject;
    const { plan_id, id: subscriptionId, period_start } = subscriptionData;
    
    if (!clerkId) {
      console.error('No user ID found in upcoming billing data:', subscriptionData);
      return;
    }
    
    console.log('Processing upcoming billing for user:', clerkId);
    console.log('Upcoming billing data:', subscriptionData);
    
    // Update next billing date if provided
    const updateData = {
      subscriptionStatus: 'active' // Ensure status is active for upcoming billing
    };
    
    if (period_start) {
      updateData.nextBillingDate = new Date(period_start);
    }
    
    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: updateData
    });
    
    console.log(`Updated upcoming billing info for user ${clerkId}`);
    
    // Optional: Send email notification to user about upcoming billing
    // await sendUpcomingBillingNotification(clerkId, next_billing_date);
    
  } catch (error) {
    console.error('Error handling upcoming billing:', error);
    throw error;
  }
}


export default router