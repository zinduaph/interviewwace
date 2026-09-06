import express from 'express';
import multer from 'multer';

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

const cvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'cv'));
        }

        callback(null, true);
    }
});





// ==================== PAID INTERVIEW ROUTES ====================

// Create paid interview (supports plan: basic, standard, premium)
router.post('/paid/create', cvUpload.single('cv'), createPaidInterview);

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
