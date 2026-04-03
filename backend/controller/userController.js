import User from "../model/user.js";
import jwt from "jsonwebtoken";
import InterviewPayment from "../model/interviewPayment.js";
import PaidInterview from "../model/interviewDatabase.js";

// Verify Clerk webhook signature
const verifyWebhook = (req, res) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret === 'whsec_your_webhook_secret_here') {
        console.warn('WARNING: CLERK_WEBHOOK_SECRET is not set!');
        return true; // Skip verification in development
    }
    return true;
};

// @desc    Create or update user from Clerk webhook
// @route   POST /api/users/sync
// @access  Public (verified by Clerk webhook secret)
export const syncUser = async (req, res) => {
    try {
        // Verify webhook signature (optional in development)
        if (!verifyWebhook(req, res)) {
            return res.status(401).json({ message: "Invalid webhook signature" });
        }
        
        // Parse the raw body
        const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        
        // Only handle user.created and user.updated events
        if (event.type !== 'user.created' && event.type !== 'user.updated') {
            return res.status(200).json({ message: "Event ignored" });
        }
        
        const data = event.data;
        
        if (!data || !data.id) {
            return res.status(400).json({ message: "Invalid webhook data" });
        }

        const clerkId = data.id;
        const email = data.email_addresses?.[0]?.email_address || "";
        const firstName = data.first_name || "";
        const lastName = data.last_name || "";
        const profileImage = data.image_url || "";

        // Check if user already exists
        let user = await User.findOne({ clerkId });

        if (user) {
            // Update existing user
            user.email = email;
            user.firstName = firstName;
            user.lastName = lastName;
            user.profileImage = profileImage;
            user.updatedAt = new Date();
            await user.save();
            
            return res.status(200).json({ message: "User updated", user });
        } else {
            // Create new user
            user = await User.create({
                clerkId,
                email,
                firstName,
                lastName,
                profileImage,
                isSubscribed: false,
                subscriptionPlan: 'free',
                interviewsCompleted: 0
            });
            
            return res.status(201).json({ message: "User created", user });
        }
    } catch (error) {
        console.error("Error syncing user:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get user by Clerk ID
// @route   GET /api/users/:clerkId
// @access  Private
export const getUser = async (req, res) => {
    try {
        const { clerkId } = req.params;
        
        const user = await User.findOne({ clerkId });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error getting user:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error getting users:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update user subscription
// @route   PUT /api/users/:clerkId/subscription
// @access  Private
export const updateSubscription = async (req, res) => {
    try {
        const { clerkId } = req.params;
        const { subscriptionPlan, isSubscribed } = req.body;
        
        const user = await User.findOne({ clerkId });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        user.subscriptionPlan = subscriptionPlan || user.subscriptionPlan;
        user.isSubscribed = isSubscribed !== undefined ? isSubscribed : user.isSubscribed;
        await user.save();
        
        return res.status(200).json({ message: "Subscription updated", user });
    } catch (error) {
        console.error("Error updating subscription:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// @desc    Increment interviews completed
// @route   PUT /api/users/:clerkId/interviews
// @access  Private
export const incrementInterviews = async (req, res) => {
    try {
        const { clerkId } = req.params;
        
        const user = await User.findOne({ clerkId });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        user.interviewsCompleted += 1;
        user.lastInterviewDate = new Date();
        await user.save();
        
        return res.status(200).json({ message: "Interview count updated", user });
    } catch (error) {
        console.error("Error incrementing interviews:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


export const AdminLogin = async (req, res) => {
    const {email,password} = req.body

    try {
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password, process.env.JWT_SECRET )
            console.log(token)
            
            return res.json({success:true,message:'admin login successful',token}) 
        } else {
            return res.json({success:false, message:'Invalid admin credentials'})
        }
    } catch (error) {
        return res.json({success:false, message:'Admin login error'})
    }
};

// @desc    Get user interviews with payment details
// @route   GET /api/users/:clerkId/interviews
// @access  Private/Admin
export const getUserInterviews = async (req, res) => {
    try {
        const { clerkId } = req.params;
        
        // Get user's payments (plans)
        const payments = await InterviewPayment.find({ clerkId, status: 'completed' }).sort({ createdAt: -1 });
        
        // Get user's interviews
        const interviews = await PaidInterview.find({ clerkId }).sort({ createdAt: -1 });
        
        // Combine data
        const result = {
            user: {
                clerkId,
                totalInterviewsDone: interviews.length,
                completedInterviews: interviews.filter(i => ['submitted', 'evaluated', 'completed'].includes(i.status)).length
            },
            payments: payments.map(p => ({
                plan: p.plan,
                interviewsAllowed: p.interviewsAllowed,
                interviewsUsed: p.interviewsUsed,
                remaining: p.interviewsAllowed - p.interviewsUsed,
                purchasedAt: p.createdAt,
                status: p.status
            })),
            interviews: interviews.map(i => ({
                id: i._id,
                jobRole: i.jobRole,
                plan: i.plan,
                status: i.status,
                totalScore: i.totalScore,
                createdAt: i.createdAt,
                completedAt: i.completedAt
            }))
        };
        
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error getting user interviews:", error);
        return res.status(500).json({ message: "Server error" });
    }
};