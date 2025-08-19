
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
    const { platform, contentPillars, frequency, tone, goal,startDate,endDate, model } = req.body;
    
    const user = await getOrCreateUser(req.clerkId);
    if(!user.proModel&&model==="pro"){
      return res.status(414).json({
        message:"You dont have pro subscription"
      })
    }
    const userId = user.id;
        // Check if monthly reset is needed
    const now = new Date();
    const lastReset = new Date(user.lastReset);
    const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                            (now.getMonth() - lastReset.getMonth());
    
    if (monthsSinceReset >= 1) {
      // Reset monthly tokens
      await prisma.user.update({
        where: { id: user.id },
        data: {
          generationCount: 0,
          lastReset: now
        }
      });
      
      user.generationCount = 0;
      user.lastReset = now;
    }
    if(user.generationCount>user.generationLimit){
      res.status(403).json("Limit reached. Upgrade to continue.");
    }
    const rawPosts = await generatePlan({ platform, contentPillars, frequency, tone, goal,startDate,endDate,model });
  
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
    await prisma.user.update({
      where: { id:userId },
      data: { generationCount: { increment: 1 } },
    })
  
    res.json(plan);
  });

  router.post('/edit-plan', authMiddleware, async (req, res) => {
    const clerkId = req.clerkId
    let user = await prisma.user.findUnique({ where: { clerkId } });
    const { planId, instructions } = req.body;

        // Check if monthly reset is needed
    const now = new Date();
    const lastReset = new Date(user.lastReset);
    const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                            (now.getMonth() - lastReset.getMonth());
    
    if (monthsSinceReset >= 1) {
      // Reset monthly tokens
      await prisma.user.update({
        where: { id: user.id },
        data: {
          generationCount: 0,
          lastReset: now
        }
      });
      
      user.generationCount = 0;
      user.lastReset = now;
    }

    // const userId = user.id
    if(user.generationCount>user.generationLimit){
      res.status(403).json("Limit reached. Upgrade to continue.");
    }
    try {
      // 1. Fetch existing plan
      const existingPlan = await prisma.plan.findUnique({
        where: { id: planId },
      });
  
      if (!existingPlan) {
        return res.status(404).json({ error: 'Plan not found' });
      }
  
      // 2. Delete old posts
      await prisma.post.deleteMany({
        where: { planId },
      });
  
      // 3. Generate updated plan + posts via LLM
      const { platform, contentPillars, frequency, tone, goal, rawPosts } = await editPlan(existingPlan, instructions);
  
      // 4. Update plan and create posts in one go
      const updatedPlan = await prisma.plan.update({
        where: { id: planId },
        data: {
          platform,
          contentPillars,
          frequency,
          tone,
          goal,
          posts: {
            create: rawPosts.map((post) => ({
              id: post.id, // Optional: only include if you're using a custom ID
              date: new Date(post.date),
              title: post.title,
              description: post.description,
              type: post.type,
            })),
          },
        },
        include: { posts: true },
      });
      await prisma.user.update({
        where: { clerkId },
        data: { generationCount: { increment: 1 } },
      })
  
      res.json({ planId, updatedPlan });
    } catch (error) {
      console.error('Error editing plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  router.post('/create-custom-post/:planId',authMiddleware, async (req, res) => {
    const clerkId = req.clerkId;
    const { planId } = req.params;
    const { title, description, type, date } = req.body;
  
    try {
      // Get user
      const user = await prisma.user.findUnique({ where: { clerkId:clerkId } });
      if (!user) return res.status(404).json({ error: 'User not found' });
  
      // Get plan and check ownership
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      });
  
      if (!plan || plan.userId !== user.id) {
        return res.status(403).json({ error: 'Not allowed to add post to this plan' });
      }
  
      // Create new custom post
      const newPost = await prisma.post.create({
        data: {
          title,
          description,
          type,
          date: new Date(date),
          planId: plan.id,
        },
      });
  
      res.status(201).json(newPost);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
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

router.get("/user/usage", authMiddleware,async (req, res) => {
  try {
    const clerkId = req.clerkId
    let user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) return res.status(400).json({ error: "Missing user " })
    return res.json({
      count: user.generationCount,
      limit: user.generationLimit,
    })
  } catch (err) {
    console.error("Fetch usage error:", err)
    res.status(500).json({ error: "Failed to fetch usage" })
  }
})
router.get("/user/model", authMiddleware,async (req, res) => {
  try {
    const clerkId = req.clerkId
    let user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) return res.status(400).json({ error: "Missing user " })
    return res.json({
      proModel: user.proModel,
    })
  } catch (err) {
    console.error("Fetch usage error:", err)
    res.status(500).json({ error: "Failed to fetch usage" })
  }
})



router.post('/submitEnterpriseForm',authMiddleware, async (req, res) => {
  const user = await getOrCreateUser(req.clerkId);
  const userId = user.id;
  const formdata = req.body;

  try {
    const enterprise = await prisma.enterprise.create({
      data: {
        name: formdata.name,
        email: formdata.email,
        message: formdata.message,
        user: {
          connect: { id: userId },  // 👈 connect the user properly
        },
      },
    });

    res.json({ success: true, enterprise });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


export  default router
