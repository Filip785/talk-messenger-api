import { Router } from 'express';
import UserRouter from './Users';
import FriendRouter from './Friends';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/friends', FriendRouter);

// Export the base-router
export default router;
