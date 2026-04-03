import mongoose from "mongoose";

const demoSchema = new mongoose.Schema({
    clerkId: { type: String },
    jobRole: { type: String, required: true },
    experienceLevel: { type: String, required: false, default: 'entry-level' },
    questions: [
        {
            question: { type: String, required: true },
            type: { type: String, enum: ["technical", "behavioral" ,"problem-solving"], required: true },
            answer: { type: String, default: "" },
            feedback: { type: String, default: "" },
            score: { type: Number, default: 0 }
        }
    ],
    totalScore: { type: Number, default: 0 },
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});

export default mongoose.model('Demo', demoSchema);