import express from 'express';
import { 
    checkPaidInterviewEligibility,
    initiatePayment,
    useInterviewCredit,
    getPaymentHistory,
    mpesaCallback,
    manualConfirmPayment,
    getPaymentStatus,
    initializePaystack,
    paystackWebhook,
   
} from '../controller/paymentController.js';

const router = express.Router();

// Check if user can do paid interview
router.post('/check-eligibility', checkPaidInterviewEligibility);

// Initiate M-Pesa payment
router.post('/initiate', initiatePayment);

// paystack payment route
router.post('/paystack/init',initializePaystack)


// Use an interview credit
router.post('/use-credit', useInterviewCredit);

// Get payment history
router.get('/history/:clerkId', getPaymentHistory);

// M-Pesa callback webhook
router.post('/mpesa-callback', mpesaCallback);

// paystack webhook
router.post('/webhook' , express.raw({ type: 'application/json' }),paystackWebhook);

// Manual payment confirmation (for testing)
router.post('/manual-confirm', manualConfirmPayment);

// Get payment status by paymentId
router.get('/status/:paymentId', getPaymentStatus);

export default router;
