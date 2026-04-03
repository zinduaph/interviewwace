import mongoose from 'mongoose';

const interviewPaymentSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        index: true
    },
    phoneNumber: {
        type: String,
        
    },
    amount: {
        type: Number,
        required: true,
        default: 49 // KSh 49 for basic plan
    },
    currency: {
        type: String,
        default: 'KES'
    },
    plan: {
        type: String,
        enum: ['basic', 'standard', 'premium', 'bulk'],
        default: 'basic'
    },
    interviewsAllowed: {
        type: Number,
        required: true,
        default: 1
    },
    interviewsUsed: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'expired'],
        default: 'pending'
    },
    // M-Pesa specific fields
    mpesaReceiptNumber: {
        type: String,
        default: null
    },
    mpesaTransactionId: {
        type: String,
        default: null
    },
    mpesaTransactionDate: {
        type: Date,
        default: null
    },
    checkoutRequestId: {
        type: String,
        default: null
    },
    merchantRequestId: { type: String },
    // Payment method
    paymentMethod: {
        type: String,
        enum: ['mpesa', 'card', 'manual'],
        default: 'mpesa'
    },
    // this is for paystack payment refrrence
    paystackReference: {
    type: String,
    unique: true
},
paystackTransactionId: {
    type: String
},

    // For manual verification
    notes: {
        type: String,
        default: ''
    },
    expiresAt: {
        type: Date,
        default: null // When the payment record expires (30 days typically)
    }
}, {
    timestamps: true
});

// Index for efficient queries
interviewPaymentSchema.index({ clerkId: 1, status: 1 });
interviewPaymentSchema.index({ createdAt: -1 });

// Virtual field to check if user can do interview
interviewPaymentSchema.virtual('canDoInterview').get(function() {
    return this.interviewsUsed < this.interviewsAllowed && this.status === 'completed';
});

// Method to use an interview
interviewPaymentSchema.methods.useInterview = function() {
    if (this.canDoInterview) {
        this.interviewsUsed += 1;
        return this.save();
    }
    throw new Error('No interviews remaining or payment not completed');
};

// Static method to find active payment for user
interviewPaymentSchema.statics.findActivePayment = async function(clerkId) {
    return await this.findOne({
        clerkId,
        status: 'completed',
        $or: [
            { expiresAt: { $gte: new Date() } },
            { expiresAt: null }
        ],
        interviewsUsed: { $lt: mongoose.Types.ObjectId ? '$interviewsAllowed' : '$interviewsAllowed' }
    }).sort({ createdAt: -1 });
};

const InterviewPayment = mongoose.model('InterviewPayment', interviewPaymentSchema);

export default InterviewPayment;
