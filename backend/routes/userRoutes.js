import express from 'express';
import { 
    syncUser, 
    getUser, 
    getAllUsers, 
    updateSubscription, 
    incrementInterviews, 
    AdminLogin,
    getUserInterviews
} from '../controller/userController.js';

const router = express.Router();

// Webhook endpoint - syncs user from Clerk (no auth needed, verified by webhook)
router.post('/sync',  syncUser);

// Get user by Clerk ID
router.get('/:clerkId', getUser);

// Admin login
router.post('/admin',AdminLogin);

// Get all users (admin)
router.get('/', getAllUsers);

// Get user interviews with payment details (admin)
router.get('/:clerkId/interviews', getUserInterviews);

// Update subscription
router.put('/:clerkId/subscription', updateSubscription);

// Increment interview count
router.put('/:clerkId/interviews', incrementInterviews);

export default router;
