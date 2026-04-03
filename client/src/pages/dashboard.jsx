import { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { backendUrl } from '../App';
import axios from 'axios';
import { useUser } from '@clerk/react';

import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Star, 
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Calendar,
  MessageSquare,
  FileText,
  Zap,
  ThumbsUp,
  Lightbulb,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const [interviews, setInterviews] = useState([]);
  const [credits, setCredits] = useState({ remaining: 0, used: 0, allowed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedInterview, setExpandedInterview] = useState(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
  }, [isLoaded, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user eligibility/credits
      const eligibilityRes = await axios.post(`${backendUrl}/api/payment/check-eligibility`, {
        clerkId: user.id
      });
      
      if (eligibilityRes.data) {
        setCredits({
          remaining: eligibilityRes.data.interviewsRemaining || 0,
          used: eligibilityRes.data.interviewsUsed || 0,
          allowed: eligibilityRes.data.interviewsAllowed || 0
        });
      }

      // Fetch user's paid interviews
      const interviewsRes = await axios.get(`${backendUrl}/api/interview/paid/user/${user.id}`);
      setInterviews(interviewsRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // get users paid interview
  
  const toggleExpand = (interviewId) => {
    setExpandedInterview(expandedInterview === interviewId ? null : interviewId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'evaluated':
        return 'text-green-400';
      case 'in-progress':
      case 'in-progress-chat':
        return 'text-yellow-400';
      case 'submitted':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'completed':
      case 'evaluated':
        return 'bg-green-400/10 border-green-400/30';
      case 'in-progress':
      case 'in-progress-chat':
        return 'bg-yellow-400/10 border-yellow-400/30';
      case 'submitted':
        return 'bg-blue-400/10 border-blue-400/30';
      default:
        return 'bg-gray-400/10 border-gray-400/30';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'from-green-500/20 to-green-500/5';
    if (score >= 60) return 'from-yellow-500/20 to-yellow-500/5';
    if (score >= 40) return 'from-orange-500/20 to-orange-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInterviewTypeIcon = (mode) => {
    return mode === 'chat' ? <MessageSquare size={18} /> : <FileText size={18} />;
  };

  if (!isLoaded) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EFBF04]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Sign In Required</h2>
            <p className="text-gray-400">Please sign in to view your dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-8 pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            Welcome back, <span className="text-[#EFBF04]">{user.firstName || 'there'}!</span>
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Track your progress and ace your next interview</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#EFBF04]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchData}
              className="mt-4 px-6 py-2 bg-[#EFBF04] text-black rounded-full font-semibold hover:bg-[#d4a700] transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Credits Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-[#EFBF04]/20 to-[#EFBF04]/5 border border-[#EFBF04]/30 rounded-2xl p-6 hover:border-[#EFBF04]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,191,4,0.3)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EFBF04]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-[#EFBF04]/20 rounded-xl">
                      <Target className="text-[#EFBF04]" size={24} />
                    </div>
                    <span className="text-gray-400 font-medium">Interviews Left</span>
                  </div>
                  <div className="text-5xl font-bold text-white mb-2">
                    {credits.remaining}
                  </div>
                  <div className="text-gray-500 text-sm">
                    of {credits.allowed} total credits
                  </div>
                  <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#EFBF04] to-[#f5d142] transition-all duration-1000"
                      style={{ width: `${credits.allowed > 0 ? (credits.remaining / credits.allowed) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Completed Interviews Card */}
              <div className="group relative overflow-hidden border border-[#EFBF04] hover:shadow-[#EFBF04]/90 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <Trophy className="text-green-400" size={24} />
                    </div>
                    <span className="text-gray-400 font-medium">Completed</span>
                  </div>
                  <div className="text-5xl font-bold text-white mb-2">
                    {interviews.length }
                  </div>
                  <div className="text-gray-500 text-sm">
                    interviews practiced
                  </div>
                  <div className="mt-4 flex gap-1">
                    {[...Array(Math.min(credits.used, 6))].map((_, i) => (
                      <div key={i} className="w-2 h-6 bg-green-400/60 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Average Score Card */}
              <div className="group relative overflow-hidden bg-gray-900 border-2 border-[#EFBF04] rounded-2xl p-6 hover:shadow-[#EFBF04]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <TrendingUp className="text-purple-400" size={24} />
                    </div>
                    <span className="text-gray-400 font-medium">Avg. Score</span>
                  </div>
                  <div className="text-5xl font-bold text-white mb-2">
                    {interviews.length > 0 
                      ? Math.round(interviews.reduce((acc, i) => acc + (i.totalScore || 0), 0) / interviews.length)
                      : 0}%
                  </div>
                  <div className="text-gray-500 text-sm">
                    overall performance
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <Star className={credits.used >= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Interviews Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Your <span className="text-[#EFBF04]">Interviews</span>
                </h2>
                <button 
                  onClick={fetchData}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition loader"
                >
                  
                  Refresh
                </button>
              </div>

              {interviews.length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-[#EFBF04]/10 rounded-full flex items-center justify-center">
                    <Zap className="text-[#EFBF04]" size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No interviews yet</h3>
                  <p className="text-gray-400 mb-6">Start practicing to see your progress here</p>
                  <a 
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#EFBF04] text-black font-semibold rounded-full hover:bg-[#d4a700] transition hover:shadow-[0_0_20px_rgba(239,191,4,0.5)]"
                  >
                    Get Started
                    <ChevronRight size={20} />
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {interviews.map((interview, index) => (
                    <div 
                      key={interview._id}
                      className={`group relative overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-[#EFBF04]/50 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,191,4,0.15)] animate-fade-in ${expandedInterview === interview._id ? 'col-span-1' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Card Header - Always Visible */}
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            {/* Score Badge */}
                            {interview.totalScore > 0 && (
                              <div className={`hidden md:flex px-4 py-2 rounded-xl text-xl font-bold ${getScoreBg(interview.totalScore)} border ${getScoreColor(interview.totalScore)}`}>
                                {interview.totalScore}%
                              </div>
                            )}
                            
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-[#EFBF04]/10 rounded-lg">
                                  {getInterviewTypeIcon(interview.interviewMode)}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBg(interview.status)} ${getStatusColor(interview.status)}`}>
                                  {interview.status.replace('-', ' ')}
                                </span>
                                {interview.totalScore > 0 && (
                                  <span className={`md:hidden px-3 py-1 rounded-full text-sm font-bold ${getScoreBg(interview.totalScore)} border ${getScoreColor(interview.totalScore)}`}>
                                    {interview.totalScore}%
                                  </span>
                                )}
                              </div>
                              
                              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#EFBF04] transition-colors">
                                {interview.jobRole}
                              </h3>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {formatDate(interview.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  {interview.interviewMode === 'chat' ? <MessageSquare size={14} /> : <FileText size={14} />}
                                  {interview.interviewMode === 'chat' ? 'Chat Interview' : 'Static Interview'}
                                </span>
                                {interview.plan && (
                                  <span className="px-2 py-0.5 bg-[#EFBF04]/10 border border-[#EFBF04]/30 rounded-full text-[#EFBF04] text-xs">
                                    {interview.plan.charAt(0).toUpperCase() + interview.plan.slice(1)} Plan
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expand/Collapse Button */}
                          <button 
                            onClick={() => toggleExpand(interview._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
                          >
                            {expandedInterview === interview._id ? (
                              <>
                                <span className="hidden md:inline">Show Less</span>
                                <ChevronDown size={20} className="text-[#EFBF04]" />
                              </>
                            ) : (
                              <>
                                <span className="hidden md:inline">View Details</span>
                                <ChevronRight size={20} className="text-[#EFBF04]" />
                              </>
                            )}
                          </button>
                        </div>

                        {/* Expanded Content */}
                        {expandedInterview === interview._id && (
                          <div className="mt-6 pt-6 border-t border-gray-800 animate-fade-in">
                            {/* Questions and Answers */}
                            <div className="mb-6">
                              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-[#EFBF04]" />
                                Questions & Answers
                              </h4>
                              
                              <div className="space-y-4">
                                {/* For static interviews */}
                                {interview.questions && interview.questions.map((q, qIndex) => (
                                  <div key={qIndex} className="bg-black/30 border border-gray-800 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="text-[#EFBF04] font-medium text-sm">Q{qIndex + 1}</span>
                                      <span className={`px-2 py-0.5 rounded text-xs ${q.score >= 60 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        Score: {q.score || 0}/100
                                      </span>
                                    </div>
                                    <p className="text-white font-medium mb-2">{q.question}</p>
                                    {q.answer && (
                                      <div className="mt-2 pt-2 border-t border-gray-700">
                                        <p className="text-gray-400 text-sm mb-1">Your Answer:</p>
                                        <p className="text-gray-300">{q.answer}</p>
                                      </div>
                                    )}
                                    {q.feedback && (
                                      <div className="mt-2 pt-2 border-t border-gray-700">
                                        <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                                          <Lightbulb size={14} className="text-[#EFBF04]" />
                                          Feedback:
                                        </p>
                                        <p className="text-gray-300">{q.feedback}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}

                                {/* For chat interviews */}
                                {interview.completedQuestions && interview.completedQuestions.map((q, qIndex) => (
                                  <div key={qIndex} className="bg-black/30 border border-gray-800 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="text-[#EFBF04] font-medium text-sm">Q{qIndex + 1}</span>
                                      <span className={`px-2 py-0.5 rounded text-xs ${q.score >= 60 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        Score: {q.score || 0}/100
                                      </span>
                                    </div>
                                    <p className="text-white font-medium mb-2">{q.question}</p>
                                    {q.answer && (
                                      <div className="mt-2 pt-2 border-t border-gray-700">
                                        <p className="text-gray-400 text-sm mb-1">Your Answer:</p>
                                        <p className="text-gray-300">{q.answer}</p>
                                      </div>
                                    )}
                                    {q.feedback && (
                                      <div className="mt-2 pt-2 border-t border-gray-700">
                                        <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                                          <Lightbulb size={14} className="text-[#EFBF04]" />
                                          Feedback:
                                        </p>
                                        <p className="text-gray-300">{q.feedback}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Overall Feedback */}
                            {interview.overallFeedback && (
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                  <ThumbsUp size={18} className="text-[#EFBF04]" />
                                  Overall Feedback
                                </h4>
                                <div className="bg-gradient-to-r from-[#EFBF04]/10 to-transparent border border-[#EFBF04]/30 rounded-xl p-4">
                                  <p className="text-gray-300">{interview.overallFeedback}</p>
                                </div>
                              </div>
                            )}

                            {/* Strengths & Areas for Improvement */}
                            <div className="grid md:grid-cols-2 gap-4">
                              {interview.strengths && interview.strengths.length > 0 && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                  <h5 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                                    <CheckCircle size={16} />
                                    Strengths
                                  </h5>
                                  <ul className="space-y-2">
                                    {interview.strengths.map((strength, sIndex) => (
                                      <li key={sIndex} className="text-gray-300 text-sm flex items-start gap-2">
                                        <span className="text-green-400">•</span>
                                        {strength}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {interview.areasForImprovement && interview.areasForImprovement.length > 0 && (
                                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                                  <h5 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                                    <Lightbulb size={16} />
                                    Areas to Improve
                                  </h5>
                                  <ul className="space-y-2">
                                    {interview.areasForImprovement.map((area, aIndex) => (
                                      <li key={aIndex} className="text-gray-300 text-sm flex items-start gap-2">
                                        <span className="text-orange-400">•</span>
                                        {area}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {interview.recommendations && interview.recommendations.length > 0 && (
                                <div className="md:col-span-2 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                                  <h5 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                                    <Star size={16} />
                                    Recommendations
                                  </h5>
                                  <ul className="space-y-2">
                                    {interview.recommendations.map((rec, rIndex) => (
                                      <li key={rIndex} className="text-gray-300 text-sm flex items-start gap-2">
                                        <span className="text-purple-400">•</span>
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Collapsed Summary */}
                        {expandedInterview !== interview._id && (
                          <div className="mt-4 pt-4 border-t border-gray-800">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {interview.completedQuestions?.length || interview.questions?.filter(q => q.answer).length || 0} questions answered
                              </span>
                              {interview.overallFeedback && (
                                <p className="text-gray-400 text-sm line-clamp-1">
                                  "{interview.overallFeedback}"
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {credits.remaining > 0 && (
              <div className="bg-gradient-to-r from-[#EFBF04]/10 to-transparent border border-[#EFBF04]/30 rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Ready to practice?
                    </h3>
                    <p className="text-gray-400">
                      You have {credits.remaining} interview{credits.remaining !== 1 ? 's' : ''} remaining. Put your skills to the test!
                    </p>
                  </div>
                  <a 
                    href="/interviewPage"
                    className="flex items-center gap-2 px-8 py-4 bg-[#EFBF04] text-black font-bold rounded-full hover:bg-[#d4a700] transition-all hover:shadow-[0_0_30px_rgba(239,191,4,0.5)] hover:scale-105"
                  >
                    <Zap size={20} />
                    Start Interview
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
