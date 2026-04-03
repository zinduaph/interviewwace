import googleGenAI from "../config/AI.js";
import PaidInterview from "../model/interviewDatabase.js";
import InterviewPayment from "../model/interviewPayment.js";
import Demo from "../model/demo.js";
import User from "../model/user.js";
import { checkAndIncrementUsage } from "../utils/apilimit.js";
// Helper function to generate static questions (Basic Plan)
const generateStaticQuestions = async (jobRole, experienceLevel, company) => {
    //this is for checking the AI model request usage
    await checkAndIncrementUsage()
    const randomSeed = Math.floor(Math.random() * 100000);

    const prompt = ` seed: ${randomSeed}  
    You are a well-seasoned expert interviewer who has worked with multiple global companies. 
    Job Role: ${jobRole}
    Experience Level: ${experienceLevel || "entry-level"}
    ${company ? `Company Context: ${company}` : ''}

    Rules:
    - Generate EXACTLY 6 questions.
    - Questions must be SPECIFIC to the role.
    - Avoid generic questions.

    Question Types (MUST distribute exactly):
    - 2 technical questions (1 technical-concept, 1 technical-scenario)
    - 2 behavioral questions
    - 2 problem-solving questions

    Make the questions realistic and challenging.
    Provide detailed criteria for evaluating each answer.

    Return only valid JSON:
    [
     {"question": "question 1", "type": "technical", "category": "technical-concept", "criteria": "what to look for"},
     {"question": "question 2", "type": "technical", "category": "technical-scenario", "criteria": "what to look for"},
     {"question": "question 3", "type": "behavioral", "criteria": "what to look for"},
     {"question": "question 4", "type": "behavioral", "criteria": "what to look for"},
     {"question": "question 5", "type": "problem-solving", "criteria": "what to look for"},
     {"question": "question 6", "type": "problem-solving", "criteria": "what to look for"}
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
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
};

// Helper function to generate first chat question (Standard & Premium Plans)
const generateChatQuestion = async (jobRole, experienceLevel, questionType, context = "", previousQuestions = [] ) => {
     //this is for checking the AI model request usage
    await checkAndIncrementUsage()
    const typePrompts = {
        "technical-concept": "Ask a technical concept question specific to the role",
        "technical-scenario": "Ask a technical scenario-based question",
        "behavioral": "Ask a behavioral question using STAR method",
        "problem-solving": "Ask a practical problem-solving question"
    };

    const previousQuestionText =  previousQuestions.length > 0 ? 
    `\nQuestions already asked (DO NOT repeat or paraphrase these):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
     : "";


    const prompt = `You are an expert interviewer conducting a chat-based interview.

Job Role: ${jobRole}
Experience Level: ${experienceLevel || "entry-level"}

Ask ONE ${questionType} question.
${context ? `Previous context: ${context}` : ''}
${previousQuestionText}

${typePrompts[questionType] || "Ask a relevant interview question"}

Return ONLY valid JSON:
{"question": "the interview question", "type": "${questionType}", "criteria": "what to look for in the answer", "followUpGuidance": "what to ask in follow-up if needed"}
`;

    const response = await googleGenAI.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { 
                role: "system", 
                content: "You are an expert interviewer conducting a live chat interview. Always respond with valid JSON only." 
            },
            { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500
    });

    const text = response.choices[0].message.content;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    // Try to parse full response
    try {
        return JSON.parse(text);
    } catch {
        // Return default if parsing fails
        return { question: text, type: questionType, criteria: "Evaluate based on relevance" };
    }
};

// Helper function to generate follow-up question
const generateFollowUp = async (jobRole, previousAnswer, questionType) => {
    //this is for checking the AI model request usage
    await checkAndIncrementUsage()
    const prompt = `Based on the candidate's answer, ask ONE brief follow-up question, then ask a different
 question.

Job Role: ${jobRole}
Previous Answer: ${previousAnswer}
Question Type: ${questionType}

Keep the follow-up short and focused.
Do NOT repeat the original question.

Return ONLY valid JSON:
{"followUp": "the follow-up question", "intent": "why you're asking this follow-up"}
`;

    const response = await googleGenAI.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { 
                role: "system", 
                content: "You are an expert interviewer. Always respond with valid JSON only." 
            },
            { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
    });

    const text = response.choices[0].message.content;
    try {
        const jsonMatch = text.match(/\{"[^"]+"\s*:/);
        if (jsonMatch) {
            return JSON.parse(text);
        }
    } catch {
        return { followUp: "Can you elaborate more on that?", intent: "Get more details" };
    }
};

// Create paid interview based on plan type
export const createPaidInterview = async (req, res) => {
    const { 
        jobRole, experienceLevel, clerkId, paymentId, company, 
        plan, difficulty 
    } = req.body;
      
    try {
        // Validate required fields
        if (!jobRole) {
            return res.status(400).json({ message: "Job role is required" });
        }
        
        if (!paymentId) {
            return res.status(400).json({ message: "Payment ID is required for paid interviews" });
        }

        // Verify payment
        const payment = await InterviewPayment.findById(paystackTransactionId);
        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }
        
        if (payment.status !== 'completed') {
            return res.status(400).json({ error: "Payment not completed", paymentStatus: payment.status });
        }
        
        if (payment.interviewsUsed >= payment.interviewsAllowed) {
            return res.status(400).json({ error: "No interviews remaining on this payment" });
        }

        // This is to check how many inteviews the user has used
        const user = await User.findOne({ clerkId });
        if (user) {
         user.interviewsUsed += 1;
           await user.save();
               }


        // Validate plan type
        const validPlans = ['basic', 'standard', 'premium'];
        const selectedPlan = payment.plan
        
        if (!validPlans.includes(selectedPlan)) {
            return res.status(400).json({ error: "Invalid plan type" });
        }

       

        // Check for existing active interview
        const existingInterview = await PaidInterview.findActiveInterview(paymentId);
        if (existingInterview) {
            return res.json({
                success: true,
                interviewId: existingInterview._id,
                interviewMode: existingInterview.interviewMode,
                questions: existingInterview.questions,
                chatMessages: existingInterview.chatMessages,
                currentQuestionIndex: existingInterview.currentQuestionIndex,
                jobRole: existingInterview.jobRole,
                experienceLevel: existingInterview.experienceLevel,
                status: existingInterview.status,
                plan: existingInterview.plan,
                message: "Resuming existing interview"
            });
        }

        // Determine interview mode based on plan
        const interviewMode = selectedPlan === 'basic' ? 'static' : 'chat';
        
        let questions = [];
        let chatMessages = [];
        let firstQuestion = null;

        if (interviewMode === 'static') {
            // Basic Plan: Generate 6 static questions
            questions = await generateStaticQuestions(jobRole, experienceLevel, company);
        } else {
            // Standard & Premium: Start with first chat question
            const questionTypes = ['technical-concept', 'behavioral', 'problem-solving'];
            const firstType = questionTypes[0];
            firstQuestion = await generateChatQuestion(jobRole, experienceLevel, firstType, "", []);
            
            // Add initial AI question to chat
            chatMessages = [{
                role: "assistant",
                content: firstQuestion.question,
                isFollowUp: false,
                questionContext: firstType
            }];
        }

        // Create paid interview
        const paidInterview = new PaidInterview({
            clerkId: clerkId || null,
            paymentId,
            plan: selectedPlan,
            interviewMode,
            jobRole,
            company: company || "",
            experienceLevel: experienceLevel || 'entry-level',
            difficulty: difficulty || 'medium',
            questions: interviewMode === 'static' ? questions : [],
            chatMessages: interviewMode === 'chat' ? chatMessages : [],
            currentQuestionIndex: interviewMode === 'chat' ? 0 : 0,
            completedQuestions: [],
            maxFollowUps: 2, // Limit to avoid API overuse
            status: interviewMode === 'chat' ? 'in-progress-chat' : 'in-progress',
            startedAt: new Date()
        });

        await paidInterview.save();

        // Use one interview credit
        payment.interviewsUsed += 1;
        await payment.save();

        return res.json({
            success: true,
            interviewId: paidInterview._id,
            plan: selectedPlan,
            interviewMode,
            questions: interviewMode === 'static' ? paidInterview.questions : undefined,
            chatMessages: interviewMode === 'chat' ? paidInterview.chatMessages : undefined,
            currentQuestion: interviewMode === 'chat' ? firstQuestion : undefined,
            jobRole,
            experienceLevel: paidInterview.experienceLevel,
            status: paidInterview.status,
            message: interviewMode === 'chat' 
                ? "Chat interview started. Answer the question and AI will follow up." 
                : "Interview created with 6 questions. Submit all answers at once."
        });

    } catch (error) {
        console.error("Error creating paid interview:", error);
        if (error.message?.startsWith('GROQ_LIMIT_REACHED')) {
            return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
        }
        throw error;
    }
};

// Submit answer for chat interview (Standard & Premium plans)
export const submitChatAnswer = async (req, res) => {
    // FIX #5: Consider adding auth check here, e.g.:
    // if (interview.userId.toString() !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const { interviewId, answer } = req.body;

    try {
        if (!interviewId || !answer) {
            return res.status(400).json({ error: "interviewId and answer are required" });
        }

        const interview = await PaidInterview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        if (interview.interviewMode !== 'chat') {
            return res.status(400).json({ error: "This is not a chat interview" });
        }

        // Check if interview is already completed
        if (interview.status === 'submitted' || interview.status === 'completed' || interview.status === 'evaluated') {
            return res.status(400).json({ error: "Interview is already completed" });
        }

       
        // Schema migration: ensure completedQuestions is always an array
        if (typeof interview.completedQuestions === 'string') {
            try {
                interview.completedQuestions = JSON.parse(interview.completedQuestions);
            } catch (e) {
                interview.completedQuestions = [];
            }
        }
        if (!Array.isArray(interview.completedQuestions)) {
            interview.completedQuestions = [];
        }
        interview.markModified('completedQuestions');

        // Add user's answer to chat history
        interview.chatMessages.push({
            role: "user",
            content: answer,
            isFollowUp: false
        });

        // FIX #5: Use find() + reverse() instead of findLast() for Node <18 compatibility
        const currentQuestion = [...interview.chatMessages]
            .reverse()
            .find(m => m.role === 'assistant' && !m.isFollowUp);

        // Capture lastCompleted BEFORE the push to correctly detect follow-up vs main answer
        const lastCompleted = interview.completedQuestions[interview.completedQuestions.length - 1];

        if (currentQuestion?.isFollowUp && lastCompleted) {
            // Follow-up answer: append to the existing completed question entry
            lastCompleted.followUpCount += 1;
            lastCompleted.answer += `\nFollow-up: ${answer}`;
        } else {
            // Main question answer: push a new completed question entry
            interview.completedQuestions.push({
                question: currentQuestion?.content || "",
                type: currentQuestion?.questionContext || "interview",
                answer: answer,
                feedback: null,
                score: null,
                followUpCount: 0
            });
        }

         
        // FIX #1 & #2: Re-read lastCompleted AFTER the push so follow-up generation
        // always references the correct (most recent) entry, not a stale one.
        const updatedLastCompleted = interview.completedQuestions[interview.completedQuestions.length - 1];

        const totalQuestionsAsked = interview.chatMessages.filter(m => m.role === 'assistant').length;
        const isLastAnswer = totalQuestionsAsked >= 9;


        const canContinue = interview.canContinueChat();

        let nextMessage = null;
        let shouldContinue = false;

           if (isLastAnswer) {
            // ✅ 9th answer just saved — don't generate anything more, just close out
            shouldContinue = false;
            nextMessage = null;
        } else if (canContinue) {
            // Generate a follow-up for the current answer
            const previousQuestions = interview.chatMessages
                .filter(m => m.role === 'assistant' && !m.isFollowUp)
                .map(m => m.content);

            const followUpData = await generateFollowUp(
                interview.jobRole,
                answer,
                updatedLastCompleted.type
            );

            nextMessage = {
                role: "assistant",
                content: followUpData.followUp,
                isFollowUp: true,
                questionContext: updatedLastCompleted.type
            };

            interview.chatMessages.push(nextMessage);
            shouldContinue = true;
        } else {
            // No follow-up — advance to next main question if available
            if (interview.currentQuestionIndex >= 2) {
                shouldContinue = false;
                nextMessage = null;
            } else {
                interview.currentQuestionIndex += 1;

                if (interview.currentQuestionIndex < 3) {
                    const QUESTION_TYPES = ['technical-concept', 'technical-scenario', 'behavioral'];
                    const nextType = QUESTION_TYPES[interview.currentQuestionIndex];

                    const previousQuestions = interview.chatMessages
                        .filter(m => m.role === 'assistant' && !m.isFollowUp)
                        .map(m => m.content);

                    const nextQ = await generateChatQuestion(
                        interview.jobRole,
                        interview.experienceLevel,
                        nextType,
                        "",
                        previousQuestions
                    ) 
                    nextMessage = {
                        role: "assistant",
                        content: nextQ.question,
                        isFollowUp: false,
                        questionContext: nextType
                    };

                    interview.chatMessages.push(nextMessage);
                    shouldContinue = true;
                }
            }
        }       

        // Determine completion before saving so we only save once
        const isInterviewComplete = isLastAnswer || (!shouldContinue && interview.currentQuestionIndex >= 2);

        // FIX #3 & #4: Set status before the single save() call to avoid a
        // double-save race condition and prevent premature 'submitted' on errors
        // (errors above would have thrown and been caught before reaching here).
        if (isInterviewComplete) {
            interview.status = 'submitted';
        }

        // FIX #4: Single save instead of two sequential saves
        await interview.save();

        return res.json({
            success: true,
            interviewId: interview._id,
            feedback: null,
            score: null,
            chatMessages: interview.chatMessages,
            nextQuestion: shouldContinue ? nextMessage : null,
            canContinue: shouldContinue,
            completedCount: interview.completedQuestions.length,
            // FIX: totalQuestions reflects actual questions asked, not a hardcoded
            // estimate, since follow-up count varies per session.
            totalQuestions: interview.chatMessages.filter(m => m.role === 'assistant').length,
            status: interview.status,
            isComplete: isInterviewComplete
        });

    } catch (error) {
        console.error("Error submitting chat answer:", error);
        if (error.message?.startsWith('GROQ_LIMIT_REACHED')) {
            return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
        }
        throw error;
    }
};
// Submit static interview answers (Basic plan)
export const submitStaticAnswers = async (req, res) => {
    const { interviewId, answers } = req.body;

    try {
        if (!interviewId || !answers) {
            return res.status(400).json({ error: "interviewId and answers are required" });
        }

        const interview = await PaidInterview.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        if (interview.interviewMode !== 'static') {
            return res.status(400).json({ error: "Use chat submission for this interview" });
        }

        // Process each answer with detailed feedback
        const feedbackResults = [];
        
        for (let i = 0; i < interview.questions.length; i++) {
            const question = interview.questions[i];
            const answer = answers[i] || "";
            
            if (!answer.trim()) {
                feedbackResults.push({
                    questionIndex: i,
                    feedback: "No answer provided.",
                    score: 0,
                    analysis: "No answer"
                });
                continue;
            }

            const feedbackPrompt = `Evaluate this interview answer with VERY DETAILED feedback.

Job Role: ${interview.jobRole}
Question: ${question.question}
Type: ${question.type}
Candidate's Answer: ${answer}

Provide:
- Score: 0-100
- Detailed feedback (at least 2-3 sentences)
- Key strengths in answer
- Areas to improve

Return ONLY valid JSON:
{"feedback": "very detailed feedback", "score": number, "strengths": ["s1"], "improvements": ["i1"]}`;

            try {
                const response = await googleGenAI.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { 
                            role: "system", 
                            content: "You are an expert interviewer providing very detailed feedback. Always respond with valid JSON only." 
                        },
                        { role: "user", content: feedbackPrompt }
                    ],
                    temperature: 0.6,
                    max_tokens: 1500
                });

                const text = response.choices[0].message.content;
                const feedbackData = JSON.parse(text.match(/\{[\s\S]*\}/) || text);
                
                feedbackResults.push({
                    questionIndex: i,
                    feedback: feedbackData.feedback,
                    score: feedbackData.score,
                    strengths: feedbackData.strengths,
                    improvements: feedbackData.improvements
                });

            } catch (aiError) {
                feedbackResults.push({
                    questionIndex: i,
                    feedback: "Unable to evaluate answer.",
                    score: 50,
                    analysis: "AI error"
                });
            }
        }

        // Update questions with answers and feedback
        for (const result of feedbackResults) {
            interview.questions[result.questionIndex].answer = answers[result.questionIndex] || "";
            interview.questions[result.questionIndex].feedback = result.feedback;
            interview.questions[result.questionIndex].score = result.score;
        }

        interview.status = 'submitted';
        interview.submittedAt = new Date();
        interview.completedAt = new Date();
        
        if (interview.startedAt) {
            interview.duration = Math.round((interview.completedAt - interview.startedAt) / 60000);
        }

        await interview.save();

        // Generate overall evaluation
        const evalPrompt = `Provide comprehensive evaluation for this interview.

Job Role: ${interview.jobRole}
Experience Level: ${interview.experienceLevel}

Questions and Answers:
${interview.questions.map((q, i) => `
${i + 1}. ${q.question} (${q.type})
   Answer: ${q.answer}
   Score: ${q.score}/100
   Feedback: ${q.feedback}
`).join('\n')}

Overall Score: ${interview.totalScore}/100

Provide VERY DETAILED feedback with:
- Overall assessment (2-3 sentences)
- Key strengths (at least 3)
- Areas for improvement (at least 3)
- Recommendations (at least 3)

Return ONLY valid JSON:
{"overallFeedback": "string", "strengths": ["s1", "s2"], "areasForImprovement": ["a1", "a2"], "recommendations": ["r1", "r2"]}`;

        try {
            const response = await googleGenAI.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { 
                        role: "system", 
                        content: "You are an expert career coach. Always respond with valid JSON only." 
                    },
                    { role: "user", content: evalPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });

            const text = response.choices[0].message.content;
            const evalData = JSON.parse(text.match(/\{[\s\S]*\}/) || text);

            interview.overallFeedback = evalData.overallFeedback;
            interview.strengths = evalData.strengths;
            interview.areasForImprovement = evalData.areasForImprovement;
            interview.recommendations = evalData.recommendations;
            interview.status = 'completed';
            
            await interview.save();
        } catch (evalError) {
            console.error("Error generating evaluation:", evalError);
        }

        return res.json({
            success: true,
            interviewId: interview._id,
            feedbackResults,
            totalScore: interview.totalScore,
            overallFeedback: interview.overallFeedback,
            strengths: interview.strengths,
            areasForImprovement: interview.areasForImprovement,
            recommendations: interview.recommendations,
            status: interview.status
        });

    } catch (error) {
        console.error("Error submitting static answers:", error);
        if (error.message?.startsWith('GROQ_LIMIT_REACHED')) {
            return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
        }
        throw error;
    }
};

// Get paid interview by paymentId
export const getPaidInterviewByPaymentId = async (req, res) => {
    const { paymentId } = req.params;
    
    try {
        const interview = await PaidInterview.findOne({ paymentId })
        
        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' })
        }
        
        // Find the last assistant message that is not a follow-up (the current question)
        const chatMessages = interview.chatMessages || []
        let nextQuestion = null
        for (let i = chatMessages.length - 1; i >= 0; i--) {
            if (chatMessages[i].role === 'assistant' && !chatMessages[i].isFollowUp) {
                nextQuestion = chatMessages[i]
                break
            }
        }
        
        res.json({
            success: true,
            interviewId: interview._id,
            jobRole: interview.jobRole,
            interviewMode: interview.interviewMode,
            questions: interview.questions,
            chatMessages: chatMessages,
            currentQuestionIndex: interview.currentQuestionIndex,
            nextQuestion: nextQuestion,
            canContinue: interview.canContinueChat(),
            status: interview.status
        })
    } catch (error) {
        console.error('Error fetching interview:', error)
        res.status(500).json({ success: false, message: 'Failed to fetch interview' })
    }
}

// Get paid interview by ID (legacy)
export const getPaidInterview = async (req, res) => {
    const { id } = req.params;

    try {
        const interview = await PaidInterview.findById(id).populate('paymentId');
        
        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        return res.json(interview);
    } catch (error) {
        console.error("Error getting paid interview:", error);
        return res.status(500).json({ error: "Failed to get interview" });
    }
};

// Get user's paid interviews
export const getUserPaidInterviews = async (req, res) => {
    const { clerkId } = req.params;

    try {
        const interviews = await PaidInterview.find({ clerkId })
            .sort({ createdAt: -1 })
            .populate('paymentId');
        
        return res.json(interviews);
    } catch (error) {
        console.error("Error getting user paid interviews:", error);
        return res.status(500).json({ error: "Failed to get interviews" });
    }
};

// End chat interview early
export const endChatInterview = async (req, res) => {
    const { interviewId } = req.body;

    try {
        const interview = await PaidInterview.findById(interviewId);
        
        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        if (interview.interviewMode !== 'chat') {
            return res.status(400).json({ error: "Not a chat interview" });
        }

        // FIRST: Evaluate each answer and get individual scores
        for (let i = 0; i < interview.completedQuestions.length; i++) {
            const q = interview.completedQuestions[i];
            
            const scorePrompt = `Evaluate this interview answer and provide a score.

Job Role: ${interview.jobRole}
Question: ${q.question}
Answer: ${q.answer}

Return ONLY valid JSON with a score from 0-100:
{"score": number}`;

            try {
                const response = await googleGenAI.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { 
                            role: "system", 
                            content: "You are an expert interviewer providing scores. Always respond with valid JSON only." 
                        },
                        { role: "user", content: scorePrompt }
                    ],
                    temperature: 0.6,
                    max_tokens: 200
                });

                const text = response.choices[0].message.content;
                const scoreData = JSON.parse(text.match(/\{[\s\S]*\}/) || text);
                
                // Update the score for this question
                interview.completedQuestions[i].score = scoreData.score || 50;
            } catch (scoreError) {
                console.error("Error calculating score:", scoreError);
                interview.completedQuestions[i].score = 50; // Default score on error
            }
        }

        // THEN: Generate overall evaluation
        const evalPrompt = `Evaluate this chat-based interview comprehensively.

Job Role: ${interview.jobRole}
Experience Level: ${interview.experienceLevel}

Questions and Answers:
${interview.completedQuestions.map((q, i) => `
${i + 1}. ${q.question} (${q.type})
   Answer: ${q.answer}
   Score: ${q.score}/100
`).join('\n')}

Overall Score: (will be calculated automatically)

Provide detailed feedback with overall assessment, strengths, areas for improvement, and recommendations.

Return ONLY valid JSON:
{"overallFeedback": "string", "strengths": ["s1"], "areasForImprovement": ["a1"], "recommendations": ["r1"]}`;

        try {
            const response = await googleGenAI.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { 
                        role: "system", 
                        content: "You are an expert career coach. Always respond with valid JSON only." 
                    },
                    { role: "user", content: evalPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });

            const text = response.choices[0].message.content;
            const evalData = JSON.parse(text.match(/\{[\s\S]*\}/) || text);

            interview.overallFeedback = evalData.overallFeedback;
            interview.strengths = evalData.strengths;
            interview.areasForImprovement = evalData.areasForImprovement;
            interview.recommendations = evalData.recommendations;
        } catch (evalError) {
            console.error("Error generating evaluation:", evalError);
        }

        interview.status = 'completed';
        interview.completedAt = new Date();
        
        if (interview.startedAt) {
            interview.duration = Math.round((interview.completedAt - interview.startedAt) / 60000);
        }

        // The pre-save hook will now calculate totalScore from completedQuestions scores
        await interview.save();

        return res.json({
            success: true,
            interviewId: interview._id,
            totalScore: interview.totalScore,
            overallFeedback: interview.overallFeedback,
            strengths: interview.strengths,
            areasForImprovement: interview.areasForImprovement,
            recommendations: interview.recommendations,
            completedQuestions: interview.completedQuestions.length,
            status: interview.status
        });

    } catch (error) {
        console.error("Error ending chat interview:", error);
        if (error.message?.startsWith('GROQ_LIMIT_REACHED')) {
            return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
        }
        throw error;
    }
};

// Legacy basic interview (free demo)
export const basicInterview = async (req, res) => {
    const { jobRole, experienceLevel, clerkId } = req.body;
      
    try {
        if (!jobRole) {
            return res.status(400).json({ message: "Job role is required" });
        }
        
        const randomSeed = Math.floor(Math.random() * 100000);

        const prompt = ` seed: ${randomSeed}  
        You are an expert interviewer. 
        Job Role: ${jobRole}
        Experience Level: ${experienceLevel || "entry-level"}

        Generate EXACTLY 6 questions (2 technical, 2 behavioral, 2 problem-solving).

        Return valid JSON:
        [
         {"question": "q1", "type": "technical"},
         {"question": "q2", "type": "behavioral"},
         {"question": "q3", "type": "behavioral"},
         {"question": "q4", "type": "technical"},
         {"question": "q5", "type": "problem solving"},
         {"question": "q6", "type": "problem solving"}
        ]`;

        const response = await googleGenAI.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are an expert interviewer. Respond with valid JSON only." },
                { role: "user", content: prompt }
            ],
            temperature: 0.9,
            max_tokens: 2000
        });

        const text = response.choices[0].message.content;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

        const basicInterview = new Demo({
            clerkId: clerkId || null,
            jobRole,
            experienceLevel: experienceLevel || 'entry-level',
            questions,
            status: "in-progress"
        });

        await basicInterview.save();

        return res.json({
            success: true,
            interviewId: basicInterview._id,
            questions: basicInterview.questions,
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

// Legacy submit
export const submitanswers = async (req, res) => {
    const { interviewId, answers, clerkId } = req.body;

    try {
        if (!interviewId || !answers) {
            return res.status(400).json({ error: "interviewId and answers are required" });
        }
        
        const interview = await Demo.findById(interviewId);
        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        for (let i = 0; i < Math.min(answers.length, interview.questions.length); i++) {
            interview.questions[i].answer = answers[i] || "";
        }

        interview.status = "completed";
        interview.completedAt = new Date();
        await interview.save();

        return res.json({
            success: true,
            interviewId: interview._id,
            status: interview.status
        });
        
    } catch (error) {
        console.error("Error submitting answers:", error);
        if (error.message?.startsWith('GROQ_LIMIT_REACHED')) {
            return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
        }
        throw error;
    }
}
