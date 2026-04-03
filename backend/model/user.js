import mongoose  from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    profileImage: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // Additional fields for interviewwace
    isSubscribed: {
        type: Boolean,
        default: false
    },
    subscriptionPlan: {
        type: String,
        enum: ['free', 'basic', 'standard', 'premium', 'bulk'],
        default: 'free'
    },
    interviewsCompleted: {
        type: Number,
        default: 0
    },
    hasUsedFreeDemo: {
        type: Boolean,
        default: false
    },
    freeDemosUsed : {type:Number, default:0},
    // Paid interview credits
    interviewsAllowed: {
        type: Number,
        default: 0
    },
    interviewsUsed: {
        type: Number,
        default: 0
    },
    lastInterviewDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;