import { verifyToken } from "@clerk/backend";



async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    // Remove "Bearer " prefix
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    // Verify the token and extract the payload
    const  payload  = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      audience: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    });

    if (!payload.sub) {
      return res.status(401).json({ message: 'Invalid token: no userId (sub)' });
    }

    req.clerkId = payload.sub;
    // console.log(req.userId);
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
}

export { authMiddleware };

