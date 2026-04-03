import express from 'express';
import { 
    createPaidInterview, 
    submitStaticAnswers,
    submitChatAnswer,
    getPaidInterview, 
    getPaidInterviewByPaymentId,
    getUserPaidInterviews,
    endChatInterview,
    basicInterview,
    submitanswers
} from '../controller/interview.js';

const router = express.Router();

// ==================== PAID INTERVIEW ROUTES ====================

// Create paid interview (supports plan: basic, standard, premium)
router.post('/paid/create', createPaidInterview);

// Submit static answers (Basic plan - 6 questions at once)
router.post('/paid/submit-static', submitStaticAnswers);

// Submit chat answer (Standard & Premium plans - one at a time)
router.post('/paid/submit-chat', submitChatAnswer);

// End chat interview early and get evaluation
router.post('/paid/end-chat', endChatInterview);

// Get paid interview by ID
router.get('/paid/:id', getPaidInterview);

// Get paid interview by paymentId
router.get('/paid/payment/:paymentId', getPaidInterviewByPaymentId);

// Get all paid interviews for a user
router.get('/paid/user/:clerkId', getUserPaidInterviews);

// ==================== LEGACY/BASIC INTERVIEW ROUTES ====================

// Create basic interview (free demo)
router.post('/basic', basicInterview);

// Submit answers for basic interview
router.post('/submit', submitanswers);

export default router;
