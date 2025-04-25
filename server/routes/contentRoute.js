
import express from "express"
const router = express.Router();
import {generatePlan, editPlan} from "../services/llmService.js"


import {authMiddleware} from "../middleware/authmiddleware.js"
import  prisma  from "../prisma/index.js";


async function getOrCreateUser(clerkId) {
  let user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    user = await prisma.user.create({ data: { clerkId } });
  }
  return user;
}

// router.post('/create-user',async(req,res)=>{
//   const {clerkId} = req.body;
//  const user = await prisma.user.create({ data: { clerkId } });
//   return user;
// })

router.post('/generate-plan', 
  authMiddleware,
  async (req, res) => {
    const { platform, contentPillars, frequency, tone, goal,startDate,endDate } = req.body;
    const user = await getOrCreateUser(req.clerkId);
    const userId = user.id
    const rawPosts = await generatePlan({ platform, contentPillars, frequency, tone, goal,startDate,endDate });
  
    const plan = await prisma.plan.create({
      data: {
        platform,
        contentPillars,
        frequency,
        tone,
        goal,
        userId,
        posts: {
          create: rawPosts.map(post => ({
            id: post.id,
            date: new Date(post.date),
            title: post.title,
            description: post.description,
            type: post.type,
          }))
        }
      },
      include: { posts: true }
    });
  
    res.json(plan);
  });

router.post('/edit-plan', async (req, res) => {
  const { planId, instructions } = req.body;
  const existingPlan = getPlan(planId);
  if (!existingPlan) return res.status(404).json({ error: 'Plan not found' });

  const updatedPlan = await editPlan(existingPlan, instructions);
  updatePlan(planId, updatedPlan);
  res.json({ planId, updatedPlan });
});

router.get('/my-plan/:id',authMiddleware,async(req,res)=>{
  const planId=req.params.id
  const plan = await prisma.plan.findUnique({where:{id:planId},
    include :{
    posts: true, // Include the related posts
  }})
  res.json(plan);
})

router.get('/myplans', authMiddleware, async (req, res) => {
  try {
    const clerkId = req.clerkId;

    // Ensure user exists or is created
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      user = await prisma.user.create({ data: { clerkId } });
    }

    // Fetch plans (which will be empty if new user)
    const plans = await prisma.plan.findMany({
      where: { userId: user.id },
      include: { posts: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/edit-post/:postId', authMiddleware, async (req, res) => {
  const clerkId = req.clerkId;
  const { postId } = req.params;
  const { title, description, type, date } = req.body;

  // Get user
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Check if post belongs to the user
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { plan: true },
  });

  if (!post || post.plan.userId !== user.id) {
    return res.status(403).json({ error: 'Not allowed to edit this post' });
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      description,
      type,
      date: new Date(date),
    },
  });

  res.json(updated);
});

// routes/plans.js
router.delete('/delete-plan/:planId', authMiddleware, async (req, res) => {
  const { planId } = req.params;
  const clerkId = req.clerkId;

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== user.id) {
    return res.status(403).json({ error: 'Not allowed to delete this plan' });
  }

  await prisma.plan.delete({ where: { id: planId } });
  res.json({ success: true, message: 'Plan deleted successfully' });
});

// routes/posts.js
router.delete('/delete-post/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const clerkId = req.clerkId;

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { plan: true },
  });

  if (!post || post.plan.userId !== user.id) {
    return res.status(403).json({ error: 'Not allowed to delete this post' });
  }

  await prisma.post.delete({ where: { id: postId } });
  res.json({ success: true, message: 'Post deleted successfully' });
});


export  default router
