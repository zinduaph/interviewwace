import googleGenAI from "../config/AI.js";
import Demo from "../model/demo.js";
import User from "../model/user.js";
import { checkAndIncrementUsage } from "../utils/apilimit.js";

// Check if user can do free demo
export const checkFreeDemo = async (req, res) => {
    const { clerkId } = req.body;
    const FREE_DEMO_LIMIT = 3
    try {
        if (!clerkId) {
            // Not logged in - allow demo
            return res.json({ canDoFreeDemo: true, reason: "not_logged_in" });
        }
        
        const user = await User.findOne({ clerkId });
        
        if (!user) {
            // New user - allow free demo
            return res.json({ canDoFreeDemo: true, reason: "new_user" });
        }
        
        if (user.hasUsedFreeDemo && user.freeDemosUsed === 0) {
            user.freeDemosUsed = 1;
            await user.save()
        }

        // calculate the user demos used
        const demoRemaining = FREE_DEMO_LIMIT - user.freeDemosUsed
             if(user.freeDemosUsed >= FREE_DEMO_LIMIT) {
                return res.json({
                    canDoFreeDemo: false,
                reason: "limit_reached",
                demosUsed: user.freeDemosUsed,
                demosRemaining: 0,
                isSubscribed: user.isSubscribed,
                subscriptionPlan: user.subscriptionPlan
                })
             }
                 // still has demos left
                 return res.json({
                     canDoFreeDemo: true,
            reason: "demos_available",
            demosUsed: user.freeDemosUsed,
            demoRemaining
                 })
       
    } catch (error) {
        console.error("Error checking free demo:", error);
        return res.json({ canDoFreeDemo: true, reason: "error" });
    }
};

// this API is to keep track of the demos the user has used
 export const incrementDemo = async (req,res) => {
    const {clerkId} = req.body
    const FREE_DEMO_LIMIT = 3
    try {
        if (!clerkId) {
             return res.json({message:"user not loggedin"})
        }

        const user = await User.findOne({clerkId})
        if(!user) {
            return res.json({message:"user does not exist"})
        }

        if(user.freeDemosUsed >= FREE_DEMO_LIMIT){
            res.json({message:"already reached limit"})
        }
        user.freeDemosUsed += 1
        user.hasUsedFreeDemo = true
        await user.save()
        return res.json({
            success: true,
            demosUsed: user.freeDemosUsed,
            demosRemaining: FREE_DEMO_LIMIT - user.freeDemosUsed
        });
    } catch (error) {
         console.error("Error incrementing free demo:", error);
        return res.status(500).json({ error: "Failed to update demo count" });
    }
}

// Generate 6 interview questions based on job role
export const generateQuestions = async (req, res) => {
    const { jobRole, experienceLevel, clerkId } = req.body;

    try {
        if (!jobRole) {
            return res.status(400).json({ error: "Job role is required" });
        }

        const randomSeed = Math.floor(Math.random() * 100000);
        // this for checking the API usage
        checkAndIncrementUsage

       const prompt = `
       Seed: ${randomSeed}
You are an expert interviewer creating UNIQUE interview questions.

Job Role: ${jobRole}
Experience Level: ${experienceLevel || "entry-level"}

Rules:
- Generate EXACTLY 4 questions.
- Questions must be SPECIFIC to the role.
- Avoid generic questions like:
  "What is ${jobRole}?"
  "Tell me about yourself"
  "What are your strengths?"

Question Types (use EXACTLY these values for the "type" field):
1 technical
2 technical
3 behavioral
4 behavioral

Make the questions practical and realistic.

Return ONLY valid JSON:

[
 {"question": "question 1", "type": "technical"},
 {"question": "question 2", "type": "technical"},
 {"question": "question 3", "type": "behavioral"},
 {"question": "question 4", "type": "behavioral"}
]
`;

        const response = await googleGenAI.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { 
                    role: "system", 
                    content: "You are an expert interviewer helping job candidates prepare for interviews. Always respond with valid JSON only." 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.9,
            max_tokens: 2000
        });

        const text = response.choices[0].message.content;

        let questions;
        try {
            // Extract JSON from response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
            } else {
                questions = JSON.parse(text);
            }
        } catch (parseError) {
            console.error("Failed to parse AI response:", text);
            return res.status(500).json({ 
                error: "Failed to generate questions. Please try again." 
            });
        }

        // Save interview to database
        const newInterview = new Demo({
            clerkId: clerkId || null,
            jobRole,
            experienceLevel: experienceLevel || 'entry-level',
            questions,
            status: "in-progress"
        });

        await newInterview.save();

        return res.json({
            success: true,
            interviewId: newInterview._id,
            questions: newInterview.questions,
            jobRole,
            experienceLevel
        });

    } catch (error) {
        console.error("Error generating questions:", error);
        if (error.message?.startsWith('GROQ_LIMIT_REACHED')) {
            return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
        }
        throw error;
    }
};

// Submit all answers and get feedback for all at once
export const submitAllAnswers = async (req, res) => {
    const { interviewId, answers, clerkId } = req.body;

    try {
        if (!interviewId || !answers) {
            return res.status(400).json({ 
                error: "interviewId and answers are required" 
            });
        }

        const interview = await Demo.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        // Process each answer with AI
        const feedbackResults = [];
        
        for (let i = 0; i < interview.questions.length; i++) {
            const question = interview.questions[i];
            const answer = answers[i];
            
            if (!answer || !answer.trim()) {
                // No answer provided, give 0 score
                feedbackResults.push({
                    questionIndex: i,
                    feedback: "No answer provided.",
                    score: 0,
                    analysis: "No answer",
                    missing_concepts: []
                });
                continue;
            }

            const feedbackPrompt = `Evaluate this interview answer and return ONLY raw JSON.

Question: "${question.question}"
Type: ${question.type}

Candidate's Answer: "${JSON.stringify(answer)}"

Evaluate using this rubric:
0-1 = completely incorrect or irrelevant
2-3 = poor understanding
4-5 = partial understanding
6-7 = decent answer but missing key concepts
8-9 = strong answer
10 = perfect expert answer

If the answer is nonsense or extremely short, score between 0-2.

Keep analysis and feedback under 25 words.

Return ONLY valid JSON:
{"analysis":"short evaluation","missing_concepts":["concept1"],"feedback":"constructive feedback","score": number}`;

            try {
                const response = await googleGenAI.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { 
                            role: "system", 
                            content: "You are a strict interviewer providing brutal but constructive feedback. Always respond with valid JSON only, no markdown code blocks." 
                        },
                        { role: "user", content: feedbackPrompt }
                    ],
                    temperature: 0.6,
                    max_tokens: 2000
                });

                const text = response.choices[0].message.content.trim();
                let feedbackData;
                
                try {
                    feedbackData = JSON.parse(text);
                } catch (err) {
                    // Try regex extraction
                    const scoreMatch = text.match(/"score"\s*:\s*(\d+(?:\.\d+)?)/);
                    const feedbackMatch = text.match(/"feedback"\s*:\s*"([^"]+)"/);
                    const analysisMatch = text.match(/"analysis"\s*:\s*"([^"]+)"/);
                    const conceptsMatch = text.match(/"missing_concepts"\s*:\s*\[([^\]]+)\]/);
                    
                    if (scoreMatch && feedbackMatch) {
                        feedbackData = {
                            analysis: analysisMatch ? analysisMatch[1] : "Extracted via fallback",
                            missing_concepts: conceptsMatch ? conceptsMatch[1].split(',').map(s => s.trim().replace(/"/g, '')) : [],
                            feedback: feedbackMatch[1],
                            score: parseFloat(scoreMatch[1])
                        };
                    } else {
                        throw new Error('Could not extract data');
                    }
                }

                feedbackResults.push({
                    questionIndex: i,
                    feedback: feedbackData.feedback,
                    score: feedbackData.score,
                    analysis: feedbackData.analysis,
                    missing_concepts: feedbackData.missing_concepts || []
                });

            } catch (aiError) {
                console.error(`Error processing question ${i}:`, aiError);
                feedbackResults.push({
                    questionIndex: i,
                    feedback: "Unable to evaluate answer automatically.",
                    score: 0,
                    analysis: "AI error",
                    missing_concepts: []
                });
            }
        }

        // Update all questions with answers and feedback
        const totalScore = feedbackResults.reduce((sum, r) => sum + (r.score || 0), 0);
        
        for (const result of feedbackResults) {
            const answer = answers[result.questionIndex];
            interview.questions[result.questionIndex].answer = answer || "";
            interview.questions[result.questionIndex].feedback = result.feedback;
            interview.questions[result.questionIndex].score = result.score;
        }

        // Mark interview as completed
        interview.totalScore = totalScore;
        interview.status = "completed";
        interview.completedAt = new Date();

        await interview.save();

        // If user is logged in and this is their first demo, mark it as used
        if (clerkId) {
            const user = await User.findOne({ clerkId });
            if (user && !user.hasUsedFreeDemo) {
                user.hasUsedFreeDemo = true;
                user.interviewsCompleted = (user.interviewsCompleted || 0) + 1;
                user.lastInterviewDate = new Date();
                await user.save();
            } else if (user) {
                user.interviewsCompleted = (user.interviewsCompleted || 0) + 1;
                user.lastInterviewDate = new Date();
                await user.save();
            }
        }

        return res.json({
            success: true,
            feedbackResults
        });

    } catch (error) {
        console.error("Error submitting all answers:", error);
        if (error.message?.startsWith('GROQ_LIMIT_REACHED')) {
            return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
        }
        throw error;
    }
};

// Complete interview and get final score
export const completeInterview = async (req, res) => {
    const { interviewId } = req.body;

    try {
        const interview = await Demo.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        // Calculate total score
        const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
        const maxScore = interview.questions.length * 10;
        const percentage = Math.round((totalScore / maxScore) * 100);

        interview.totalScore = totalScore;
        interview.status = "completed";
        interview.completedAt = new Date();

        await interview.save();

        return res.json({
            success: true,
            totalScore,
            maxScore,
            percentage,
            jobRole: interview.jobRole,
            experienceLevel: interview.experienceLevel,
            questions: interview.questions,
            completedAt: interview.completedAt
        });

    } catch (error) {
        console.error("Error completing interview:", error);
        return res.status(500).json({ error: "Failed to complete interview" });
    }
};

// Get interview by ID
export const getInterview = async (req, res) => {
    const { id } = req.params;

    try {
        const interview = await Demo.findById(id);
        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        return res.json(interview);
    } catch (error) {
        console.error("Error getting interview:", error);
        return res.status(500).json({ error: "Failed to get interview" });
    }
};

// Get all interviews for a user
export const getUserInterviews = async (req, res) => {
    const { clerkId } = req.params;

    try {
        const interviews = await Demo.find({ clerkId })
            .sort({ createdAt: -1 });
        return res.json(interviews);
    } catch (error) {
        console.error("Error getting user interviews:", error);
        return res.status(500).json({ error: "Failed to get interviews" });
    }
};
