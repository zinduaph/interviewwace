import InterviewPayment from "../model/interviewPayment.js";
import User from "../model/user.js";
import { isNgrokUrl } from "../utils/ngrok-config.js";
import axios from "axios";



// Mpesa Access token
const getAccessToken = async () => {
    const consumerKey = process.env.SAFARICOM_CONSUMER_KEY;
    const consumerSecret = process.env.SAFARICOM_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        throw new Error('Failed to get access token');
    }
};


const formatPhoneNumber = (phone) => {
    let formatted = phone.replace(/[\s\-+]/g, '');
    if (formatted.startsWith('0')) {
        formatted = '254' + formatted.substring(1);
    }
    if (!formatted.startsWith('254')) {
        formatted = '254' + formatted;
    }
    return formatted;
};

// Check if user can do paid interview
export const checkPaidInterviewEligibility = async (req, res) => {
    const { clerkId } = req.body;

    try {
        if (!clerkId) {
            return res.json({ 
                canDoInterview: false, 
                reason: "not_logged_in",
                interviewsRemaining: 0 
            });
        }

        const user = await User.findOne({ clerkId });

        if (!user) {
            return res.json({ 
                canDoInterview: false, 
                reason: "user_not_found",
                interviewsRemaining: 0 
            });
        }

        // Check if user has paid interviews remaining
        const remaining = user.interviewsAllowed - user.interviewsUsed;
        
        if (remaining > 0) {
            return res.json({ 
                canDoInterview: true, 
                reason: "has_credits",
                interviewsRemaining: remaining,
                interviewsUsed: user.interviewsUsed,
                interviewsAllowed: user.interviewsAllowed
            });
        }

        // No credits - check for pending payments
        const pendingPayment = await InterviewPayment.findOne({
            clerkId,
            status: 'pending'
        });

        if (pendingPayment) {
            return res.json({ 
                canDoInterview: false, 
                reason: "payment_pending",
                interviewsRemaining: 0,
                interviewsAllowed:pendingPayment.interviewsAllowed,
                interviewsUsed:pendingPayment.interviewsUsed,
                paymentId: pendingPayment._id
            });
        }

        return res.json({ 
            canDoInterview: false, 
            reason: "no_credits",
            interviewsRemaining: 0,
            interviewsUsed: user.interviewsUsed,
            interviewsAllowed: user.interviewsAllowed
        });

    } catch (error) {
        console.error("Error checking interview eligibility:", error);
        return res.json({ 
            canDoInterview: true, 
            reason: "error", 
            interviewsRemaining: 1 
        }); // Allow on error
    }
};

// Create payment record (initiate M-Pesa)
export const initiatePayment = async (req, res) => {
    const { clerkId, phoneNumber, plan = 'basic' } = req.body;

    try {
        if (!clerkId || !phoneNumber) {
            return res.status(400).json({ 
                error: "clerkId and phoneNumber are required" 
            });
        }

        // Define plan credits
        const plans = {
            basic: { amount: 1, interviews: 1 },
            standard: { amount: 99, interviews: 3 },
            premium: { amount: 199, interviews: 6 }
        };

        const planInfo = plans[plan] || plans.basic;

        // formatting phone number
             const formattedPhone = formatPhoneNumber(phoneNumber)
        // Create payment record
        const payment = new InterviewPayment({
            clerkId,
            phoneNumber: formattedPhone,
            plan,
            amount: planInfo.amount,
            interviewsAllowed: planInfo.interviews,
            interviewsUsed: 0,
            status: 'pending'
        });
        console.log(payment)
        

        // TODO: Here you would integrate with M-Pesa STK Push
        // For now, we'll create a pending payment that can be manually confirmed

        // get Mpesa Access token
        const accessToken = await getAccessToken()

        // Prepare STK Push
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const shortCode = process.env.BUSINESS_SHORT_CODE;
        const passkey = process.env.PASS_KEY;
        const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');
         
        // building the callback url using ngrok for local testing
        const ngrokUrl =  process.env.NGROK_URL ? isNgrokUrl() : null
        
        // If ngrok is not running, return error
        if (ngrokUrl) {
            return res.status(400).json({ error: 'Ngrok is not running. Please restart the server.' });
        }

        const callbackPath = '/api/payment/mpesa-callback'
        const callbackUrl = `${'https://anya-nonstable-jared.ngrok-free.dev'}${callbackPath}`

        const stkPushRequest = {
             BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: planInfo.amount,
            PartyA: formattedPhone,
            PartyB: shortCode,
            PhoneNumber: formattedPhone,
            CallBackURL: callbackUrl,
            AccountReference: plan.charAt(0).toUpperCase() + plan.slice(1),
            TransactionDesc: `Interview ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`
        }

        // Send STK Push
        console.log('STK Push Request:', JSON.stringify(stkPushRequest, null, 2));
        console.log('Access Token:', accessToken);
        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            stkPushRequest,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('STK Push Response:', JSON.stringify(response.data, null, 2));

        if(response.data.ResponseCode === "0"){
            payment.checkoutRequestId = response.data.CheckoutRequestID
            payment.merchantRequestId = response.data.MerchantRequestID
            // save payment
            await payment.save()
            return res.json({
            success: true,
            paymentId: payment._id,
            amount: planInfo.amount,
            interviewsAllowed: planInfo.interviews,
            message: "Payment initiated. You will receive an M-Pesa prompt."
        });
        } else {
            payment.status = 'failed'
            await payment.save()

            return res.status(400).json({
                success: false,
                message: 'Failed to initiate payment. Please try again.'
            });
        }


        

    } catch (error) {
        console.error("Error initiating payment:", error);
        return res.status(500).json({ error: "Failed to initiate payment" });
    }
};

// Confirm payment (webhook from M-Pesa or manual)


// Use an interview credit
export const useInterviewCredit = async (req, res) => {
    const { clerkId } = req.body;

    try {
        const user = await User.findOne({ clerkId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const remaining = user.interviewsAllowed - user.interviewsUsed;

        if (remaining <= 0) {
            return res.status(400).json({ 
                error: "No interviews remaining",
                interviewsRemaining: 0 
            });
        }

        // Increment used count
        user.interviewsUsed += 1;
        await user.save();

        return res.json({
            success: true,
            interviewsRemaining: user.interviewsAllowed - user.interviewsUsed,
            interviewsUsed: user.interviewsUsed,
            interviewsAllowed: user.interviewsAllowed
        });

    } catch (error) {
        console.error("Error using interview credit:", error);
        return res.status(500).json({ error: "Failed to use interview credit" });
    }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
    const { clerkId } = req.params;

    try {
        const payments = await InterviewPayment.find({ clerkId })
            .sort({ createdAt: -1 });

        return res.json(payments);
    } catch (error) {
        console.error("Error getting payment history:", error);
        return res.status(500).json({ error: "Failed to get payment history" });
    }
};

// M-Pesa callback webhook (for STK Push)
export const mpesaCallback = async (req, res) => {
    try {
        const { Body } = req.body;

        if (!Body || !Body.stkCallback) {
            return res.status(400).json({ error: "Invalid callback" });
        }

        const callback = Body.stkCallback;
        const checkoutRequestId = callback.CheckoutRequestID;
        const resultCode = callback.ResultCode;
        const resultDesc = callback.ResultDesc;

        // Find payment by checkout request ID
        const payment = await InterviewPayment.findOne({ checkoutRequestId });

        if (!payment) {
            console.log("Payment not found for callback:", checkoutRequestId);
            return res.json({ status: "ok" });
        }

        if (resultCode === 0) {
            // Success
            const mpesaReceipt = callback.CallbackMetadata?.Item?.find(
                item => item.Name === 'MpesaReceiptNumber'
            );

            payment.status = 'completed';
            payment.mpesaReceiptNumber = mpesaReceipt?.Value;
            payment.mpesaTransactionId = checkoutRequestId;
            payment.mpesaTransactionDate = new Date();
            payment.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
            await payment.save();

            // Update user credits
            const user = await User.findOne({ clerkId: payment.clerkId });
            if (user) {
                user.interviewsAllowed += payment.interviewsAllowed;
                await user.save();
            }

            console.log("Payment confirmed:", payment._id);
        } else {
            // Failed
            payment.status = 'failed';
            payment.notes = resultDesc;
            await payment.save();
            
            console.log("Payment failed:", resultDesc);
        }

        return res.json({ status: "ok" });

    } catch (error) {
        console.error("M-Pesa callback error:", error);
        return res.status(500).json({ error: "Callback processing failed" });
    }
};

// Manual payment confirmation (for testing or manual verification)
export const manualConfirmPayment = async (req, res) => {
    const { paymentId, notes } = req.body;

    try {
        const payment = await InterviewPayment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        payment.status = 'completed';
        payment.notes = notes || 'Manually confirmed';
        payment.mpesaTransactionDate = new Date();
        payment.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        await payment.save();

        // Update user credits
        const user = await User.findOne({ clerkId: payment.clerkId });
        if (user) {
            user.interviewsAllowed += payment.interviewsAllowed;
            await user.save();
        }

        return res.json({
            success: true,
            message: "Payment manually confirmed!",
            interviewsAllowed: payment.interviewsAllowed
        });

    } catch (error) {
        console.error("Manual confirmation error:", error);
        return res.status(500).json({ error: "Failed to confirm payment" });
    }
};

// Check payment status by paymentId
export const getPaymentStatus = async (req, res) => {
    const { paymentId } = req.params;

    try {
        const payment = await InterviewPayment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({ 
                success: false,
                error: "Payment not found" 
            });
        }

        return res.json({
            success: true,
            paymentId: payment._id,
            status: payment.status,
            plan: payment.plan,
            amount: payment.amount,
            interviewsAllowed: payment.interviewsAllowed,
            interviewsUsed: payment.interviewsUsed,
            interviewsRemaining: payment.interviewsAllowed - payment.interviewsUsed,
            createdAt: payment.createdAt,
            completedAt: payment.mpesaTransactionDate
        });

    } catch (error) {
        console.error("Error checking payment status:", error);
        return res.status(500).json({ 
            success: false,
            error: "Failed to check payment status" 
        });
    }
};

const forntendUrl = process.env.FRONTEND_URL
// paystack API route using axios
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export const initializePaystack = async (req, res) => {
    const { email, amount, plan, clerkId} = req.body;
    try {
        console.log('Paystack init request:', { email, amount, plan });
        console.log('Paystack key exists:', !!PAYSTACK_SECRET_KEY);
        
        if (!email || !amount) {
            return res.status(400).json({ error: 'Email and amount are required' });
        }
        
        // Paystack minimum amount is 100 KES (10000 kobo)
        
        const payment = new InterviewPayment({
            clerkId,
            plan,
            amount:amount /100,// convert from kobo
             interviewsAllowed: plan === 'basic' ? 1 : plan === 'standard' ? 3 : 6,
    status: 'pending',
              paystackReference: ''
        })
        await payment.save()
        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            {
                email,
                amount: amount,
                currency: 'KES',
                callback_url: `${forntendUrl}/interviewPage?paymentId=${payment._id}`,
                metadata:{
                    clerkId,
                    plan
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        payment.paystackReference = response.data.data.reference
        await payment.save()
        return res.json({ authorizationUrl: response.data.data.authorization_url, paymentId: payment._id });
    } catch (error) {
        console.error('Paystack error:', error.response?.data || error.message);
        return res.status(400).json({ error: error.response?.data?.message || error.message });
    }
};


// In backend/controller/paymentController.js



// Paystack webhook - confirms payment and activates plan
export const paystackWebhook = async (req, res) => {
    
     const secret = process.env.PAYSTACK_SECRET_KEY;
const hash = req.headers['x-paystack-signature'];

const crypto = await import('crypto');



// ✅ Ensure body exists
if (!req.body) {
    console.log("❌ No body received");
    return res.status(400).send("No body");
}

// ✅ Convert raw buffer to string (IMPORTANT)
const rawBody = Buffer.isBuffer(req.body)
    ? req.body.toString()
    : JSON.stringify(req.body);

// ✅ Generate hash using EXACT raw body
const generatedHash = crypto.createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

// ✅ Compare signatures
if (hash !== generatedHash) {
    console.log("❌ Invalid signature");
    return res.status(401).json({ error: "Invalid signature" });
}

// ✅ Parse JSON AFTER verification
const event = JSON.parse(rawBody);

    // Only process successful charge events
    if (event.event === 'charge.success') {
        const { reference, amount, customer, metadata } = event.data;
        
        try {
            // Find the payment record by reference
            const payment = await InterviewPayment.findOne({ 
                paystackReference: reference 
            });

            if (!payment) {
                console.log("Payment not found:", reference);
                return res.json({ status: "received" });
            }

            // Check if already processed
            if (payment.status === 'completed') {
                return res.json({ status: "already processed" });
            }

            // Update payment status to completed
            payment.status = 'completed';
            payment.paystackTransactionId = event.data.id;
            payment.mpesaTransactionDate = new Date();
            await payment.save();

            // Update user's interview credits in database
            const user = await User.findOne({ clerkId: payment.clerkId });
            if (user) {
                // Add the purchased interviews to user's allowance
                user.interviewsAllowed += payment.interviewsAllowed;
                
                // Optionally activate subscription
                user.isSubscribed = true;
                user.subscriptionPlan = payment.plan;
                
                await user.save();
                
                console.log(`Payment confirmed for user ${payment.clerkId}: +${payment.interviewsAllowed} interviews`);
            }

            return res.json({ status: "success" });

        } catch (error) {
            console.error("Webhook processing error:", error);
            return res.status(500).json({ error: "Processing failed" });
        }
    }

    // Return 200 for other events we don't handle
    res.json({ status: "received" });
};

// Get payment by Paystack reference
export const getPaymentByReference = async (req, res) => {
    const { reference } = req.params;
    try {
        const payment = await InterviewPayment.findOne({ paystackReference: reference });
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        return res.json({ paymentId: payment._id, status: payment.status });
    } catch (error) {
        console.error('Error fetching payment by reference:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
