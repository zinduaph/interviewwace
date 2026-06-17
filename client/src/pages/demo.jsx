import { useState, useEffect } from 'react';
import { Sparkles, Briefcase, TrendingUp, ArrowRight, Loader2, Trophy, AlertTriangle, Lock } from 'lucide-react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { useNavigate } from 'react-router-dom';
import { useUser, SignInButton } from '@clerk/react';
import toast from 'react-hot-toast';
import { backendUrl } from '../App';

const Demo = () => {
    const navigate = useNavigate();
    const { user, isLoaded, isSignedIn } = useUser();
    const [jobRole, setJobRole] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('entry-level');
    const [interviewId, setInterviewId] = useState(null);
    const [questions, setQuestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [checkingDemo, setCheckingDemo] = useState(true);
    const [canDoFreeDemo, setCanDoFreeDemo] = useState(true);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [completed, setCompleted] = useState(false);
    const [finalResult, setFinalResult] = useState(null);
    const [clerkId, setClerkId] = useState(null);
    const [demosRemaining, setDemosRemainig] = useState(3);

    // this is for analyzing the user behavior on demo page
   

    // Check if user can do free demo on mount
    useEffect(() => {
        // Wait for Clerk to load
        if (!isLoaded) return;
        checkFreeDemoEligibility();

        // Check for pending demo results on initial load (if signed in)
        if (isSignedIn && user?.id) {
            (async () => {
                try {
                    const pendingInterviewId = localStorage.getItem('lastInterviewId') && localStorage.getItem('demoCompleted');
                    if (pendingInterviewId && !completed && !finalResult) {
                        const res = await fetch(`${backendUrl}/api/demo/${localStorage.getItem('lastInterviewId')}`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data?.status === 'completed') {
                                // Associate with user account
                                await fetch(`${backendUrl}/api/demo/associate`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ interviewId: data._id, clerkId: user.id })
                                });
                                setClerkId(user.id);
                                checkFreeDemoEligibility();

                                const totalScore = data.totalScore || (data.questions || []).reduce((s, q) => s + (q.score || 0), 0);
                                const maxScore = (data.questions?.length || 2) * 10;
                                const percentage = Math.round((totalScore / maxScore) * 100) || 0;

                                setInterviewId(data._id);
                                setQuestions(data.questions || []);
                                setCompleted(true);
                                setFinalResult({
                                    totalScore,
                                    maxScore,
                                    percentage,
                                    jobRole: data.jobRole,
                                    experienceLevel: data.experienceLevel,
                                    questions: data.questions || [],
                                    completedAt: data.completedAt
                                });
                            }
                        }
                    }
                } catch (err) {
                    console.error('Failed to recover pending interview:', err);
                }
            })();
        }
    }, [isLoaded, isSignedIn, user?.id, completed, finalResult]);

    const checkFreeDemoEligibility = async () => {
        setCheckingDemo(true);
        try {
            // Use Clerk's user object if signed in
            const userClerkId = isSignedIn && user ? user.id : null;
           
            
            if (userClerkId) {
                setClerkId(userClerkId);
                
                const response = await fetch(`${backendUrl}/api/demo/check-free-demo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clerkId: userClerkId })
                });
                const data = await response.json();
                if(data.demosRemaining !== undefined){
                    setDemosRemainig(data.demosRemaining)
                }
                
                if (!data.canDoFreeDemo) {
                    setCanDoFreeDemo(false);
                    if (!data.isSubscribed) {
                        setShowPricingModal(true);
                    }
                }
            }
            // If not logged in, allow demo (canDoFreeDemo stays true)
        } catch (error) {
            console.error('Error checking demo eligibility:', error);
        }
        setCheckingDemo(false);
    };

    const handleStartDemo = async () => {
        if (!jobRole.trim()) return;
        
        // Reset any old demo state before starting a new run
        localStorage.removeItem('demoCompleted');
        localStorage.removeItem('lastInterviewId');
        setFinalResult(null);
        setCompleted(false);

        // Check if user can do demo
        if (!canDoFreeDemo && !showPricingModal) {
            setShowPricingModal(true);
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch(`${backendUrl}/api/demo/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobRole, experienceLevel, questionCount: 2 })
            });
            const data = await response.json();
            
            if (data.success) {
                setInterviewId(data.interviewId);
                localStorage.setItem('lastInterviewId', data.interviewId);
                setQuestions(data.questions?.slice(0, 2) || []);
                setCurrentQuestion(0);
                setAnswers({});
            } else {
                toast.error('failed to generate questions');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('failed to start interview');
        }
        setLoading(false);
    };

    const handleAnswer = (answer) => {
        setAnswers({ ...answers, [currentQuestion]: answer });
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleFinishInterview = async () => {
        setSubmitting(true);

        try {
            const response = await fetch(`${backendUrl}/api/demo/save-answers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    interviewId, 
                    answers: questions.map((_, i) => answers[i] || ''),
                    clerkId: clerkId || (isSignedIn && user?.id)
                })
            });

            const effectiveClerkId = clerkId || (isSignedIn && user?.id);
            if (effectiveClerkId) {
                try {
                    await fetch(`${backendUrl}/api/demo/increment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ clerkId: effectiveClerkId })
                    });
                } catch (err) {
                    console.error('Error incrementing demo:', err);
                }
            }

            const data = await response.json();

            if (data.success) {
                const totalScore = data.feedbackResults.reduce((sum, r) => sum + (r.score || 0), 0);
                const maxScore = questions.length * 10;
                const percentage = Math.round((totalScore / maxScore) * 100);

                const updatedQuestions = questions.map((q, i) => ({
                    ...q,
                    answer: answers[i] || '',
                    feedback: data.feedbackResults[i]?.feedback || '',
                    score: data.feedbackResults[i]?.score || 0
                }));

                setFinalResult({
                    totalScore,
                    maxScore,
                    percentage,
                    jobRole,
                    experienceLevel,
                    questions: updatedQuestions,
                    completedAt: new Date()
                });
                setCompleted(true);
                
                // Store flag for sign-in recovery
                localStorage.setItem('demoCompleted', 'true');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit answers');
        }

        setSubmitting(false);
    };

    const handleGoToPricing = () => {
        navigate('/pricing');
    };

    const restartInterview = () => {
        setJobRole('');
        setInterviewId(null);
        setQuestions(null);
        setCurrentQuestion(0);
        setAnswers({});
        setCompleted(false);
        setFinalResult(null);
        localStorage.removeItem('demoCompleted');
        localStorage.removeItem('lastInterviewId');
        
        // Reset the sign-in recovery flow too
        setClerkId(null);
        setCanDoFreeDemo(true);
        setShowPricingModal(false);
        
        // Check again if they can do free demo
        checkFreeDemoEligibility();
    };

    // If the user signs in after completing the demo while signed-out,
    // fetch the saved interview so we can immediately show detailed results.
    useEffect(() => {
        if (!isSignedIn || !interviewId || !completed) return;

        (async () => {
            try {
                // Re-associate interview with signed-in user if it was done while signed out
                if (user?.id && interviewId) {
                    await fetch(`${backendUrl}/api/demo/associate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ interviewId, clerkId: user.id })
                    });
                }

                const res = await fetch(`${backendUrl}/api/demo/${interviewId}`);
                if (!res.ok) return;
                const data = await res.json();

                const totalScore = data.totalScore || (data.questions || []).reduce((s, q) => s + (q.score || 0), 0);
                const maxScore = (data.questions?.length || questions?.length || 2) * 10;
                const percentage = data.percentage || (maxScore ? Math.round((totalScore / maxScore) * 100) : 0);

                const updatedQuestions = (data.questions || questions || []).map((q) => ({ ...q }));

                setFinalResult({
                    totalScore,
                    maxScore,
                    percentage,
                    jobRole: data.jobRole || jobRole,
                    experienceLevel: data.experienceLevel || experienceLevel,
                    questions: updatedQuestions,
                    completedAt: data.completedAt || new Date()
                });

                // If user just signed in, check demo eligibility again
                setClerkId(user.id);
                checkFreeDemoEligibility();
            } catch (err) {
                console.error('Failed to fetch interview after sign-in:', err);
            }
        })();
    }, [isSignedIn, interviewId, completed, questions, jobRole, experienceLevel]);

    // Show results page
    if (completed && finalResult) {
        return (
            <>
                <div className="bg-black min-h-screen">
                    <Navbar />
                    <div className="pt-24 pb-16 px-4">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <Trophy className="w-20 h-20 text-[#EFBF04] mx-auto mb-4" />
                                <h1 className="text-4xl font-bold text-white mb-2">Interview Complete!</h1>
                                <p className="text-gray-400">{finalResult.jobRole} - {finalResult.experienceLevel}</p>
                            </div>

                            {isSignedIn ? (
                                <>
                                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 mb-8">
                                        <div className="text-center">
                                            <div className="text-6xl font-bold text-[#EFBF04] mb-2">
                                                {finalResult.percentage}%
                                            </div>
                                            <div className="text-gray-400 mb-4">
                                                Score: {finalResult.totalScore} / {finalResult.maxScore}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Completed on {new Date(finalResult.completedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-4">Your Answers & Feedback</h2>
                                        {finalResult.questions.map((q, index) => (
                                            <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 bg-[#EFBF04]/20 rounded-full flex items-center justify-center text-[#EFBF04] font-bold">
                                                            {index + 1}
                                                        </span>
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${q.type === 'technical' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                            {q.type}
                                                        </span>
                                                    </div>
                                                    <span className="text-[#EFBF04] font-bold">{q.score}/10</span>
                                                </div>
                                                <p className="text-white font-medium mb-2">{q.question}</p>
                                                <p className="text-gray-400 text-sm mb-3">Your answer: {q.answer || '(No answer)'}</p>
                                                <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                                                    <p className="text-green-400 text-sm"><span className="font-semibold">Feedback:</span> {q.feedback}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-4">
                                        <button onClick={restartInterview} className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-[#EFBF04] text-sm font-medium transition cursor-pointer">
                                            Try another demo
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 mb-8 text-center">
                                    <p className="text-gray-300 mb-6">You completed the demo! Sign up for free to unlock your score and detailed feedback.</p>
                                    <SignInButton mode="modal">
                                        <button className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-[#EFBF04] text-sm font-medium transition cursor-pointer">
                                            Sign In to View Feedback
                                        </button>
                                    </SignInButton>
                                </div>
                            )}
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    // Show pricing modal
    if (showPricingModal) {
        return (
            <>
                <div className="bg-black min-h-screen">
                    <Navbar />
                    <div className="pt-24 pb-16 px-4">
                        <div className="max-w-md mx-auto text-center">
                            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8">
                                <Lock className="w-16 h-16 text-[#EFBF04] mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-4">Free Demo Used</h2>
                                <p className="text-gray-400 mb-6">
                                    You've already used your free demo interview. Upgrade to a paid plan to practice more and get detailed feedback.
                                </p>
                                <button 
                                    onClick={handleGoToPricing}
                                    className="w-full bg-gradient-to-r from-[#EFBF04] to-yellow-500 text-black font-bold py-4 px-6 rounded-xl hover:from-yellow-400 hover:to-yellow-400 transition-all"
                                >
                                    View Pricing Plans
                                </button>
                                
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    return (
        <>
            <div className="bg-black min-h-screen">
                <Navbar />
                
                {/* Hero Section */}
                <div className="relative pt-20 pb-16 px-4 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#EFBF04]/20 to-transparent rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-900/20 to-transparent rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-[#EFBF04]/10 border border-[#EFBF04]/30 rounded-full px-4 py-2 mb-6">
                            <Sparkles className="w-4 h-4 text-[#EFBF04]" />
                            <span className="text-[#EFBF04] text-sm font-medium">
                                {canDoFreeDemo ? 'Free Demo Interview' : 'Practice Interview'}
                            </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                            Practice for Your <span className="text-[#EFBF04]">Dream Job</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                            Get personalized interview questions powered by AI. Practice answering and build confidence before your big interview.
                        </p>
                    </div>
                </div>

                {/* Input Form */}
                {!questions && (
                    <div className="px-4 pb-20">
                        <div className="max-w-md mx-auto">
                            {checkingDemo ? (
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 text-center">
                                    <Loader2 className="w-8 h-8 text-[#EFBF04] animate-spin mx-auto mb-4" />
                                    <p className="text-gray-400">Checking eligibility...</p>
                                </div>
                            ) : (
                                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-[#EFBF04]/5">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-white font-medium mb-2">
                                                <Briefcase className="inline w-4 h-4 mr-2" />
                                                Target Job Role
                                            </label>
                                            <input 
                                                type="text" 
                                                value={jobRole}
                                                onChange={(e) => setJobRole(e.target.value)}
                                                placeholder="e.g. Software Engineer, Marketing Manager"
                                                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#EFBF04] focus:ring-1 focus:ring-[#EFBF04] outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-white font-medium mb-2">
                                                <TrendingUp className="inline w-4 h-4 mr-2" />
                                                Experience Level
                                            </label>
                                            <select 
                                                value={experienceLevel}
                                                onChange={(e) => setExperienceLevel(e.target.value)}
                                                className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#EFBF04] focus:ring-1 focus:ring-[#EFBF04] outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="entry-level">Entry Level (0-2 years)</option>
                                                <option value="mid-level">Mid Level (2-5 years)</option>
                                                <option value="senior-level">Senior Level (5+ years)</option>
                                            </select>
                                        </div>

                                        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-yellow-400 font-medium text-sm">Quick Demo</p>
                                                    <p className="text-yellow-300/70 text-xs mt-1">
                                                        Practice with just two interview questions in this demo.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-gray-500 text-sm">
                                            We'll generate 2 personalized questions based on your role.
                                        </p>

                                        <button 
                                            onClick={handleStartDemo}
                                            disabled={!jobRole.trim() || loading}
                                            className="w-full bg-gradient-to-r from-[#EFBF04] to-yellow-500 text-black font-bold py-4 px-6 rounded-xl hover:from-yellow-400 hover:to-yellow-400 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Generating Questions...
                                                </>
                                            ) : (
                                                <>
                                                    {canDoFreeDemo ? 'Start Free Demo' : 'Start Practice'}
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 bg-[#EFBF04]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">🎯</span>
                                    </div>
                                    <h3 className="text-white font-semibold">AI-Powered</h3>
                                    <p className="text-gray-500 text-sm">Smart questions</p>
                                </div>
                                <div className="text-center p-4">
                                    <div className="w-12 h-12 bg-[#EFBF04]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">⚡</span>
                                    </div>
                                    <h3 className="text-white font-semibold">Fast Practice</h3>
                                    <p className="text-gray-500 text-sm">Only 2 questions</p>
                                </div>
                        <div className="text-center p-4">
                       <div className="w-12 h-12 bg-[#EFBF04]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">🎁</span>
                              </div>
                              <h3 className="text-white font-semibold">{demosRemaining} Left</h3>
                               <p className="text-gray-500 text-sm">Free demos</p>
                                  </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* Questions Section */}
                {questions && (
                    <div className="px-4 pb-20">
                        <div className="max-w-2xl mx-auto">
                                        <div className="mb-6 rounded-xl p-4 bg-gray-900/50 border border-gray-800">
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-400 text-sm">Question {currentQuestion + 1} of {questions.length}</p>
                                    <p className="text-[#EFBF04] font-medium">{questions[currentQuestion]?.type}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#EFBF04] to-yellow-500 transition-all duration-500"
                                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Question Card */}
                            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 mb-6">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-10 h-10 bg-[#EFBF04]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-[#EFBF04] font-bold">{currentQuestion + 1}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl text-white mt-3 font-medium">
                                            {questions[currentQuestion]?.question}
                                        </h3>
                                    </div>
                                </div>

                                {/* Answer Textarea */}
                                <textarea
                                    value={answers[currentQuestion] || ''}
                                    onChange={(e) => handleAnswer(e.target.value)}
                                    placeholder="Type your answer here..."
                                    rows={5}
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#EFBF04] focus:ring-1 focus:ring-[#EFBF04] outline-none transition-all resize-none"
                                ></textarea>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between gap-4">
                                <button 
                                    onClick={prevQuestion}
                                    disabled={currentQuestion === 0}
                                    className="px-6 py-3 border border-gray-700 text-white rounded-xl hover:border-[#EFBF04] hover:text-[#EFBF04] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                
                                {currentQuestion < questions.length - 1 ? (
                                    <button 
                                        onClick={nextQuestion}
                                        className="px-6 py-3 bg-[#EFBF04] text-black font-semibold rounded-xl hover:bg-yellow-400 transition-all"
                                    >
                                        Next Question
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleFinishInterview}
                                        disabled={submitting}
                                        className="px-6 py-3 bg-gradient-to-r from-[#EFBF04] to-yellow-500 text-black font-semibold rounded-xl hover:from-yellow-400 hover:to-yellow-400 transition-all flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Finish & Get Feedback
                                                <Trophy className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Progress Info */}
                            <div className="mt-6 text-center text-gray-500 text-sm">
                                <p>Answered: {Object.keys(answers).length} / {questions.length} questions</p>
                            </div>
                        </div>
                    </div>
                )}

                <Footer />
            </div>
        </>
    )
}
export default Demo
