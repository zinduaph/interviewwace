import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { Trophy, ArrowLeft } from 'lucide-react';

const DemoDone = () => {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get interview ID from URL params or localStorage
    const interviewId = localStorage.getItem('lastInterviewId');
    
    if (interviewId) {
      getInterview(interviewId);
    } else {
      setError('No interview found');
      setLoading(false);
    }
  }, []);

  const getInterview = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/demo/:${id}`);
      if (response.data) {
        setInterview(response.data);
      } else {
        setError('Interview not found');
      }
    } catch (err) {
      console.error('Error fetching interview:', err);
      setError('Failed to load interview results');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 px-4 text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <a href="/demo" className="text-[#EFBF04] hover:underline">
            Start a new interview
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  const totalScore = interview?.questions?.reduce((sum, q) => sum + (q.score || 0), 0) || 0;
  const maxScore = (interview?.questions?.length || 0) * 10;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Trophy and Title */}
          <div className="text-center mb-8">
            <Trophy className="w-20 h-20 text-[#EFBF04] mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Interview Complete!</h1>
            <p className="text-gray-400">{interview?.jobRole} - {interview?.experienceLevel}</p>
          </div>

          {/* Score Card */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-[#EFBF04] mb-2">
                {percentage}%
              </div>
              <div className="text-gray-400 mb-4">
                Score: {totalScore} / {maxScore}
              </div>
              <div className="text-sm text-gray-500">
                Completed on {interview?.completedAt ? new Date(interview.completedAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Questions & Answers */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Your Answers & Feedback</h2>
            {interview?.questions?.map((q, index) => (
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
                  <span className="text-[#EFBF04] font-bold">{q.score || 0}/10</span>
                </div>
                <p className="text-white font-medium mb-2">{q.question}</p>
                <p className="text-gray-400 text-sm mb-3">Your answer: {q.answer || '(No answer)'}</p>
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                  <p className="text-green-400 text-sm"><span className="font-semibold">Feedback:</span> {q.feedback || 'No feedback available'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <a 
              href="/demo" 
              className="flex-1 bg-gradient-to-r from-[#EFBF04] to-yellow-500 text-black font-bold py-4 px-6 rounded-xl hover:from-yellow-400 hover:to-yellow-400 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Practice Again
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DemoDone;
