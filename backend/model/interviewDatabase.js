import mongoose from "mongoose";

// Question schema for static interviews (Basic plan)
const questionSchema = new mongoose.Schema({
    question: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ["technical", "behavioral", "problem-solving"], 
        required: true 
    },
    // Sub-category for more specific classification
    category: {
        type: String,
        enum: [ "technical","technical-concept", "technical-scenario", "behavioral", "problem-solving"],
        default: "technical"
    },
    answer: { 
        type: String, 
        default: "" 
    },
    feedback: { 
        type: String, 
        default: "" 
    },
    score: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 100
    },
    suggestedAnswer: {
        type: String,
        default: ""
    },
    criteria: {
        type: String,
        default: ""
    }
}, { _id: true });

// Chat message schema for interactive interviews (Standard & Premium plans)
const chatMessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    // Follow-up question if it's an AI message
    isFollowUp: {
        type: Boolean,
        default: false
    },
    // Related question for context
    questionContext: {
        type: String,
        default: ""
    }
}, { _id: true });

// Main interview schema
const paidInterviewSchema = new mongoose.Schema({
    clerkId: { 
        type: String, 
        required: true,
        index: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InterviewPayment',
        
    },
    // Plan type: basic, standard, premium
    plan: {
        type: String,
        enum: ['count down interview', 'chat interview', 'mock interview'],
        required: true
    },
    // Interview mode: static (all questions upfront) or chat (interactive)
    interviewMode: {
        type: String,
        enum: ['static', 'chat'],
        default: 'static'
    },
    jobRole: { 
        type: String, 
        required: true 
    },
    company: {
        type: String,
        default: ""
    },
    experienceLevel: { 
        type: String, 
        default: 'entry-level',
        enum: ['entry-level', 'mid-level', 'senior', 'lead', 'manager', 'executive']
    },
    // Static questions for Basic plan (6 questions: 2 technical, 2 behavioral, 2 problem-solving)
    questions: [questionSchema],
    // Current question index for chat mode
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    // Chat messages for Standard & Premium plans
    chatMessages: [chatMessageSchema],
    // Track completed questions in chat mode
    completedQuestions: [{
        question:{type: String},
        type: {type:String},
        answer: {type: String},
        feedback:{type: String},
        score: {type :Number},
        followUpCount: { type: Number, default: 0 }
    }],
    // Maximum follow-up questions per question (to limit API usage)
    maxFollowUps: {
        type: Number,
        default: 2 // Limit chat to avoid hitting API limits
    },
    // Overall score (0-100)
    totalScore: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 100
    },
    // Interview status
    status: { 
        type: String, 
        enum: ["in-progress", "in-progress-chat", "submitted", "evaluated", "completed"], 
        default: "in-progress" 
    },
    // Detailed feedback
    overallFeedback: {
        type: String,
        default: ""
    },
    strengths: [{
        type: String
    }],
    areasForImprovement: [{
        type: String
    }],
    recommendations: [{
        type: String
    }],
    // Timing
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: { 
        type: Date 
    },
    submittedAt: {
        type: Date
    },
    duration: {
        type: Number,
        default: 0 // in minutes
    },
    // Metadata
    language: {
        type: String,
        default: 'en'
    },
    // Version tracking
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Indexes
paidInterviewSchema.index({ clerkId: 1, status: 1 });
paidInterviewSchema.index({ paymentId: 1 });
paidInterviewSchema.index({ plan: 1 });
paidInterviewSchema.index({ createdAt: -1 });

// Pre-save hook to calculate total score
paidInterviewSchema.pre('save', async function() {
    if (this.questions && this.questions.length > 0) {
        // For static interviews (Basic plan)
        const totalScore = this.questions.reduce((sum, q) => sum + (q.score || 0), 0);
        this.totalScore = Math.round(totalScore / this.questions.length);
    } else if (this.completedQuestions && this.completedQuestions.length > 0) {
        // For chat interviews (Standard & Premium)
        const totalScore = this.completedQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
        this.totalScore = Math.round(totalScore / this.completedQuestions.length);
    }
});

// Method to submit static interview answers (Basic plan)
paidInterviewSchema.methods.submitStaticAnswers = async function() {
    this.status = 'submitted';
    this.submittedAt = new Date();
    this.completedAt = new Date();
    
    if (this.startedAt) {
        this.duration = Math.round((this.completedAt - this.startedAt) / 60000);
    }
    
    return this.save();
};

// Method to submit chat interview (Standard & Premium plans)
paidInterviewSchema.methods.submitChatInterview = async function() {
    this.status = 'submitted';
    this.submittedAt = new Date();
    this.completedAt = new Date();
    
    if (this.startedAt) {
        this.duration = Math.round((this.completedAt - this.startedAt) / 60000);
    }
    
    return this.save();
};

// Method to add chat message
paidInterviewSchema.methods.addChatMessage = async function(role, content, isFollowUp = false, questionContext = "") {
    this.chatMessages.push({
        role,
        content,
        isFollowUp,
        questionContext
    });
    return this.save();
};

// Method to check if chat can continue (limit to avoid API overuse)
paidInterviewSchema.methods.canContinueChat = function() {
    const MAX_TOTAL = 9;
    const totalAsked = this.chatMessages.filter(m => m.role === 'assistant').length;
    if (totalAsked >= MAX_TOTAL) return false;
    const lastQuestion = this.completedQuestions[this.completedQuestions.length - 1 ];
    if (!lastQuestion) return true;
    return lastQuestion.followUpCount < this.maxFollowUps;
};

// Method to evaluate interview
paidInterviewSchema.methods.evaluate = async function(feedbackData) {
    if (feedbackData.overallFeedback) {
        this.overallFeedback = feedbackData.overallFeedback;
    }
    if (feedbackData.strengths) {
        this.strengths = feedbackData.strengths;
    }
    if (feedbackData.areasForImprovement) {
        this.areasForImprovement = feedbackData.areasForImprovement;
    }
    if (feedbackData.recommendations) {
        this.recommendations = feedbackData.recommendations;
    }
    
    this.status = 'evaluated';
    this.completedAt = new Date();
    
    return this.save();
};

// Static method to find user's paid interviews
paidInterviewSchema.statics.findUserInterviews = async function(clerkId, limit = 10) {
    return await this.find({ clerkId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('paymentId');
};

// Static method to find active interview for payment
paidInterviewSchema.statics.findActiveInterview = async function(clerkId) {
    return await this.findOne({
        clerkId,
        status: { $in: ['in-progress', 'in-progress-chat', 'submitted'] }
    });
};

// Static method to find by plan type
paidInterviewSchema.statics.findByPlan = async function(clerkId, plan) {
    return await this.find({ clerkId, plan })
        .sort({ createdAt: -1 });
};

// Virtual for interview summary
paidInterviewSchema.virtual('summary').get(function() {
    const questionCount = this.questions?.length || this.completedQuestions?.length || 0;
    
    return {
        interviewId: this._id,
        jobRole: this.jobRole,
        experienceLevel: this.experienceLevel,
        plan: this.plan,
        interviewMode: this.interviewMode,
        status: this.status,
        totalScore: this.totalScore,
        questionsCount: questionCount,
        createdAt: this.createdAt,
        completedAt: this.completedAt
    };
});

// Ensure virtuals are included in JSON
paidInterviewSchema.set('toJSON', { virtuals: true });
paidInterviewSchema.set('toObject', { virtuals: true });

const PaidInterview = mongoose.model('PaidInterview', paidInterviewSchema);

export default PaidInterview;
