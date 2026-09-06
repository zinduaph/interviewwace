import express from 'express';
import User from '../model/user.js';
import Protection from '../model/dataModel.js';
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

// Data protecction endpoint
router.post('/dataprotection', async (req,res) => {
  const {clerkId} = req.body;
  try {
    const exists = await User.findOne({clerkId});
    
    if(!exists){
        return res.json({success:false, message:"Clerk ID is required"})
    }

    const dataProtection = new Protection({
        clerkId,
        termsAccepted: true,
        termsAcceptedAt: new Date()
    })

    await dataProtection.save();

    res.json({success:true, message:"Data protection record created"})
  } catch (error){
    console.error("Error creating data protection record:", error);
    res.status(500).json({success:false, message:"Internal server error"})
  }
})

router.get('/accepted/:clerkId', async (req, res) => {
    const {clerkId} = req.params;
    try{
    const record = await Protection.findOne({clerkId});

    if(!record){
        return res.json({message:"No record found, user has not accepted terms"})
    } else {
        return res.json({message:"User has accepted terms", termsAcceptedAt: record.termsAcceptedAt})
    }


    } catch (error){
        console.error("Error fetching data protection record:", error);
        res.status(500).json({success:false, message:"Internal server error"})
    }
})

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
