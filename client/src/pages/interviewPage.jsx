import { Briefcase, TrendingUp, Send, MessageCircle, CheckCircle, Clock, ArrowRight, ArrowLeft } from "lucide-react"
import { useState, useEffect , useRef} from "react"
import Navbar from "../components/navbar"
import { useLocation, useNavigate } from "react-router-dom"
import { useUser } from "@clerk/react"
import axios from "axios"
import { backendUrl } from "../App"
import toast from "react-hot-toast"

const InterviewPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useUser()
    
    const plan = location.state?.plan
    
    // Get paymentId from navigation state, query param, OR sessionStorage (for page reload support)
    const [paymentId, setPaymentId] = useState(() => {
        const urlParams = new URLSearchParams(location.search)
        return location.state?.paymentId || urlParams.get('paymentId') || sessionStorage.getItem('paymentId')
    })
    
    // Ensure paymentId is always available from sessionStorage if available
   
    
    const [experienceLevel, setExperienceLevel] = useState('entry-level')
    const [jobRole, setJobRole] = useState('')
    const [loading, setLoading] = useState(false)
    const [interview, setInterview] = useState(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [chatAnswer, setChatAnswer] = useState('')
    const [chatLoading, setChatLoading] = useState(false)
    const [feedback, setFeedback] = useState(null)
    const [interviewMode, setInterviewMode] = useState(null) // 'static' or 'chat'
    const [chatComplete, setChatComplete] = useState(false)
    const [pasteWarning, setPasteWaring] = useState(false)

    // Timer state - 90 seconds
        const [timeLeft, setTimeLeft] = useState(180);
        const [isTimerActive, setIsTimerActive] = useState(false);
        const [timeWarning, setTimeWarning] = useState(false);
        const timerRef = useRef(null);

    // Redirect if no paymentId (only after initial load)
    

    // Fetch existing interview on page load (for page reload support)
    useEffect(() => {
        let isMounted = true
        
        const fetchExistingInterview = async () => {
            if (paymentId && !interview && isMounted) {
                try {
                    const response = await axios.get(`${backendUrl}/api/interview/paid/payment/${paymentId}`)
                    
                    if (response.data.success && isMounted) {
                        // Check if interview is already completed/evaluated - show results instead
                        if (response.data.status === 'completed' || response.data.status === 'evaluated' || response.data.status === 'submitted') {
                            // Get the final evaluation
                            try {
                                const evalResponse = await axios.post(`${backendUrl}/api/interview/paid/end-chat`, {
                                    interviewId: response.data.interviewId
                                })
                                if (evalResponse.data.success && isMounted) {
                                    setFeedback(evalResponse.data)
                                }
                            } catch (evalError) {
                                console.error('Error getting evaluation:', evalError)
                            }
                        } else {
                            // Show active interview
                            setInterview({
                                ...response.data,
                                interviewId: response.data.interviewId
                            })
                            setInterviewMode(response.data.interviewMode)
                        }
                    }
                } catch (error) {
                    console.error('Error fetching existing interview:', error)
                }
            }
        }
        
        fetchExistingInterview()
        
        return () => { isMounted = false }
    }, [paymentId, interview])

    // Create interview when form is submitted
    const startInterview = async (e) => {
        e.preventDefault()
        if (!jobRole.trim()) {
            alert('Please enter a job role')
            return
        }
        
        setLoading(true)
        try {
            const response = await axios.post(`${backendUrl}/api/interview/paid/create`, {
                jobRole: jobRole,
                experienceLevel: experienceLevel,
                clerkId: user?.id,
                plan: plan || 'count down interview'
            })
            
            if (response.data.success) {
                // Clear any old paymentId and set the new one
             
                
                setInterview(response.data)
                setInterviewMode(response.data.interviewMode)
                
                // For chat mode, set up first question
                if (response.data.interviewMode === 'chat') {
                    setCurrentQuestionIndex(0)
                }
            }
        } catch (error) {
            console.error('Error creating interview:', error)
            toast.error('Failed to create interview. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Timer effect for static interview (Basic plan)
    useEffect(() => {
        if (interview && interviewMode === 'static' && isTimerActive) {
            setTimeLeft(120);
            setTimeWarning(false);
            
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleStaticTimeUp();
                        return 0;
                    }
                    if (prev <= 10) {
                        setTimeWarning(true);
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [currentQuestionIndex, interview, interviewMode, isTimerActive]);

    // Handle time up for static interview
    const handleStaticTimeUp = () => {
        const questions = interview.questions;
        if (currentQuestionIndex < questions.length - 1) {
            // Move to next question
            if (!answers[currentQuestionIndex]?.trim()) {
                setAnswers(prev => ({...prev, [currentQuestionIndex]: ''}));
            }
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Last question - submit
            if (!answers[currentQuestionIndex]?.trim()) {
                setAnswers(prev => ({...prev, [currentQuestionIndex]: ''}));
            }
            submitStaticAnswers();
        }
    };

    // Start timer when static interview begins
    useEffect(() => {
        if (interview && interviewMode === 'static') {
            setIsTimerActive(true);
            requestFullScreen();
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [interview, interviewMode]);

    // requesting full screen
    const requestFullScreen = async () => {
       try {
         if(document.documentElement.requestFullscreen){
            await document.documentElement.requestFullscreen()
        }
       } catch (error) {
        console.log('fullscreen not available')
       }
    }

    // exit fullscreen
    const exitFullScreen = async () => {
        try {
            if(document.fullscreenElement){
                await document.exitFullscreen()
            }
        } catch (error) {
            console.log('exitfullscren error')
        }
    }
         
    // Submit static answers (Basic plan)
    const submitStaticAnswers = async () => {
        setIsTimerActive(false)
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
        exitFullScreen()
        
        setLoading(true)
        try {
            // Convert answers object to array
            const answersArray = interview.questions.map((_, index) => 
                answers[index] || ''
            )
            
            const response = await axios.post(`${backendUrl}/api/interview/paid/submit-static`, {
                interviewId: interview.interviewId,
                answers: answersArray
            })
            
            if (response.data.success) {
                setFeedback(response.data)
            }
        } catch (error) {
            console.error('Error submitting answers:', error)
            alert('Failed to submit answers.')
        } finally {
            setLoading(false)
        }
    }

    // Submit chat answer (Standard/Premium plan)
    const submitChatAnswer = async (e) => {
        e.preventDefault()
        if (!chatAnswer.trim()) {
            alert('Please enter your answer')
            return
        }
        
        if (!interview?.interviewId) {
            alert('Interview not found. Please reload the page.')
            return
        }
        
        setChatLoading(true)
        try {
            const response = await axios.post(`${backendUrl}/api/interview/paid/submit-chat`, {
                interviewId: interview.interviewId,
                answer: chatAnswer
            })
            
            if (response.data.success) {
                // Update interview state with new messages and next question
                setInterview(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        chatMessages: response.data.chatMessages || prev.chatMessages || [],
                        nextQuestion: response.data.nextQuestion,
                        canContinue: response.data.canContinue
                    }
                })
                
                setChatAnswer('')
                
                // Check if interview ended - get final evaluation
                if (response.data.isComplete || (!response.data.canContinue && !response.data.nextQuestion)) {
                    // Get final evaluation - this is when interview is truly complete
                    getFinalEvaluation()
                }
            } else if (response.data.isComplete) {
                // Interview completed via limit check on backend
                getFinalEvaluation()
            } else {
                alert(response.data.message || 'Failed to submit answer')
            }
        } catch (error) {
            console.error('Error submitting chat answer:', error)
            alert('Failed to submit answer. Please try again.')
        } finally {
            setChatLoading(false)
        }
    }

    // Get final evaluation for chat interview
    const getFinalEvaluation = async () => {
        setChatComplete(true)
        try {
            const response = await axios.post(`${backendUrl}/api/interview/paid/end-chat`, {
                interviewId: interview.interviewId
            })
            
            if (response.data.success) {
                setFeedback(response.data)
                exitFullScreen()
                // Clear sessionStorage when interview is complete
                sessionStorage.removeItem('paymentId')
            }
        } catch (error) {
            console.error('Error getting evaluation:', error)
        }
    }

    // Reset interview state to start fresh
    const resetInterview = () => {
        sessionStorage.removeItem('paymentId')
        setInterview(null)
        setFeedback(null)
        setPaymentId(null)
        setJobRole('')
        setChatAnswer('')
        setAnswers({})
        setCurrentQuestionIndex(0)
        setChatComplete(false)
        setIsTimerActive(false)
        setTimeLeft(120)
        setTimeWarning(false)
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
    }

    // Render static interview (Basic plan)
    const renderStaticInterview = () => {
        const questions = interview.questions;
        const currentQ = questions[currentQuestionIndex];
        
        return (
        <div className="max-w-2xl mx-auto mt-8 p-4">
            {/* Timer */}
            <div className={`mb-6 rounded-xl p-4 flex items-center justify-between ${timeWarning ? 'bg-red-900/30 border border-red-800' : 'bg-gray-900/50 border border-gray-800'}`}>
                <div className="flex items-center gap-3">
                    <Clock className={`w-6 h-6 ${timeWarning ? 'text-red-400' : 'text-[#EFBF04]'}`} />
                    <div>
                        <p className="text-gray-400 text-sm">Time Remaining</p>
                        <p className={`text-2xl font-bold ${timeWarning ? 'text-red-400' : 'text-white'}`}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    <p className="text-[#EFBF04] font-medium">{currentQ?.type}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-[#EFBF04] to-yellow-500 transition-all duration-500"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Current Question */}
            <div className="mb-6 bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 bg-[#EFBF04]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#EFBF04] font-bold">{currentQuestionIndex + 1}</span>
                    </div>
                    <div>
                        <p className="text-white font-medium text-lg">{currentQ?.question}</p>
                    </div>
                </div>
                <span className="text-xs text-gray-400 uppercase ml-14">{currentQ?.type}</span>
                <textarea
                onPaste={(e) => {
                    e.preventDefault()
                    setPasteWaring(true)
                    // Hide warning after 3 seconds
            setTimeout(() => setPasteWaring(false), 3000);
                }}
                    value={answers[currentQuestionIndex] || ''}
                    onChange={(e) => setAnswers(prev => ({...prev, [currentQuestionIndex]: e.target.value}))}
                    placeholder="Type your answer here... (120 seconds)"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#EFBF04] focus:ring-1 focus:ring-[#EFBF04] outline-none mt-4 resize-none"
                    rows={5}
                />
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
                <button 
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 border border-gray-700 text-white rounded-xl hover:border-[#EFBF04] hover:text-[#EFBF04] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                </button>
                
                {currentQuestionIndex < questions.length - 1 ? (
                    <button 
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="px-6 py-3 bg-[#EFBF04] text-black font-semibold rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2"
                    >
                        Next Question
                        <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button 
                        onClick={submitStaticAnswers}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-[#EFBF04] to-yellow-500 text-black font-semibold rounded-xl hover:from-yellow-400 hover:to-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Finish & Get Feedback'}
                    </button>
                )}
            </div>

            {/* Progress Info */}
            <div className="mt-6 text-center text-gray-500 text-sm">
                <p>Answered: {Object.keys(answers).length} / {questions.length} questions</p>
            </div>
        </div>
    )}

    // Render chat interview (Standard/Premium plan)
    const renderChatInterview = () => (
        <div className="max-w-2xl mx-auto mt-8 p-4">
            {chatComplete && (
                <div className="mb-4 rounded-xl p-4 bg-[#EFBF04]/10 border border-[#EFBF04] text-[#EFBF04]">
                    Interview is complete. Retrieving your final feedback now...
                </div>
            )}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 mb-4 h-96 overflow-y-auto">
                {interview.chatMessages?.map((msg, index) => (
                    <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user' 
                                ? 'bg-[#EFBF04] text-black' 
                                : 'bg-gray-800 text-white'
                        }`}>
                            <MessageCircle className="inline w-4 h-4 mr-1" />
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Always show input field - no feedback during interview */}
            <div className="flex gap-2">
                <textarea
                    value={chatAnswer}
                    onChange={(e) => setChatAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    disabled={chatComplete}
                    className="flex-1 bg-black/50 border border-gray-700 h-30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#EFBF04] outline-none resize-none"
                    rows={3}
                />
                <button 
                    onClick={submitChatAnswer}
                    disabled={chatLoading || chatComplete}
                    className="bg-[#EFBF04] text-black p-3 rounded-lg hover:bg-[#d4a700] disabled:opacity-50"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    )

    // Render feedback/results
    const renderFeedback = () => (
        <div className="max-w-2xl mx-auto mt-8 p-4">
            <div className="bg-gray-900/50 border border-[#EFBF04] rounded-xl p-6">
                <div className="text-center mb-6">
                    <CheckCircle className="w-16 h-16 text-[#EFBF04] mx-auto mb-2" />
                    <h2 className="text-2xl text-[#EFBF04] font-semibold">Interview Complete!</h2>
                    <p className="text-4xl text-white font-bold mt-2">{feedback.totalScore}/100</p>
                </div>
                
                {feedback.overallFeedback && (
                    <div className="mb-4">
                        <h3 className="text-[#EFBF04] font-medium mb-2">Overall Feedback</h3>
                        <p className="text-gray-300">{feedback.overallFeedback}</p>
                    </div>
                )}
                
                {feedback.strengths?.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-[#EFBF04] font-medium mb-2">Strengths</h3>
                        <ul className="list-disc list-inside text-gray-300">
                            {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                )}
                
                {feedback.areasForImprovement?.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-[#EFBF04] font-medium mb-2">Areas to Improve</h3>
                        <ul className="list-disc list-inside text-gray-300">
                            {feedback.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                    </div>
                )}
                
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => {
                            resetInterview()
                            navigate('/pricing')
                        }}
                        className="w-full bg-[#EFBF04] text-black font-bold py-3 rounded-lg mt-4"
                    >
                        Start New Interview
                    </button>
                    <button 
                        onClick={() => {
                            sessionStorage.removeItem('paymentId')
                            navigate('/')
                        }}
                        className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg mt-2"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="bg-black min-h-screen">
            <Navbar />
            
            {!interview && !feedback && (
                <>
                    <h1 className="font-semibold text-white text-center mt-10 text-4xl">
                        start your <span className="text-[#EFBF04]">interview</span>
                    </h1>

                    <form onSubmit={startInterview} className="bg-gray-900/50 backdrop-blur-xl m-auto w-140 mt-20 border border-[#EFBF04] rounded-2xl p-8 shadow-2xl shadow-[#EFBF04]/5">
                        <div>
                            <div className="mb-3">
                                <label className="block text-white font-medium mb-2">
                                    <Briefcase className="inline w-4 h-4 mr-2"/>
                                    Target job role
                                </label>
                                <input type="text"
                                    placeholder="enter position applying for: eg marketing manager"
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
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
                                    <option value="senior">Senior Level (5+ years)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex justify-center mt-6">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="text-white cursor-pointer w-40 p-2 bg-[#EFBF04] rounded-md disabled:opacity-50"
                            >
                                {loading ? 'Starting...' : 'start interview'}
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* Show interview based on mode */}
            {interview && interviewMode === 'static' && !feedback && renderStaticInterview()}
            {interview && interviewMode === 'chat' && !feedback && renderChatInterview()}
            
            {/* Show feedback/results only when interview is truly complete */}
            {feedback && renderFeedback()}
        </div>
    )
}

export default InterviewPage
