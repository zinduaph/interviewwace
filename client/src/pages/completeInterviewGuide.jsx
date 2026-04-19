import Navbar from "../components/navbar";

const InterviewGuide = () => {
    return (
        <>
        <div className="min-h-screen bg-black">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1 bg-[#EFBF04]/20 text-[#EFBF04] rounded-full text-sm font-medium mb-4">
                        For Beginners
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        The Complete Interview Guide
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Everything you need to know — from preparation to landing your dream job
                    </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8 hover:bg-gray-900/70 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#EFBF04] rounded-xl flex items-center justify-center text-black font-bold text-xl">
                            1
                        </div>
                        <h2 className="font-bold text-2xl text-[#EFBF04]">Understanding the Interview Process</h2>
                    </div>
                    <p className="text-gray-400 mb-4">Most interviews follow a simple structure:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                        {["Introduction and small talk", "Questions about your background", "Skills and experience evaluation", "Behavioral questions", "Your chance to ask questions"].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-white">
                                <span className="w-2 h-2 bg-[#EFBF04] rounded-full"></span>
                                {item}
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-400 mt-4 italic">Understanding this flow helps you stay calm and confident.</p>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8 hover:bg-gray-900/70 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-[#EFBF04] rounded-xl flex items-center justify-center text-black font-bold text-xl">
                            2
                        </div>
                        <h2 className="font-bold text-2xl text-[#EFBF04]">How to Prepare for an Interview</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <h3 className="text-[#EFBF04] font-bold text-xl mb-2">Research the Company</h3>
                            <p className="text-gray-300">Know what the company does, its mission, and its values. This shows genuine interest.</p>
                        </div>
                        
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <h3 className="text-[#EFBF04] font-bold text-xl mb-2">Understand the Job Role</h3>
                            <p className="text-gray-300">Read the job description carefully and match your skills to what they need.</p>
                        </div>
                        
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <h3 className="text-[#EFBF04] font-bold text-xl mb-2">Prepare Common Questions</h3>
                            <ul className="text-white space-y-2 mt-2">
                                <li>• Tell me about yourself</li>
                                <li>• Why should we hire you?</li>
                                <li>• What are your strengths and weaknesses?</li>
                            </ul>
                        </div>
                        
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <h3 className="text-[#EFBF04] font-bold text-xl mb-2">Practice Your Answers</h3>
                            <p className="text-gray-300">Practice speaking your answers out loud. Confidence comes from repetition.</p>
                        </div>
                        
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                            <h3 className="text-[#EFBF04] font-bold text-xl mb-2">Prepare Your Documents</h3>
                            <ul className="text-white space-y-2 mt-2">
                                <li>• CV/Resume</li>
                                <li>• Certificates</li>
                                <li>• Portfolio (if applicable)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-[#EFBF04]/10 border border-[#EFBF04]/30 rounded-2xl p-8 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-[#EFBF04] rounded-xl flex items-center justify-center text-black font-bold text-xl">
                            3
                        </div>
                        <h2 className="font-bold text-2xl text-[#EFBF04]">What Recruiters Are Really Looking For</h2>
                    </div>
                    <p className="text-gray-300 mb-4">Recruiters are not just looking for skills. They are evaluating:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: "Confidence", desc: "How you present yourself" },
                            { title: "Communication", desc: "How clearly you express ideas" },
                            { title: "Attitude", desc: "Willingness to learn and grow" },
                            { title: "Problem-solving", desc: "How you approach challenges" },
                            { title: "Cultural fit", desc: "Whether you match the company environment" },
                        ].map((item, i) => (
                            <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                <span className="text-[#EFBF04] font-bold">{item.title}</span>
                                <p className="text-gray-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-300 mt-4 font-medium">Even if you lack experience, showing these qualities can set you apart.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {[
                        { num: "4", title: "How to Behave", items: ["Dress appropriately", "Arrive on time", "Greet politely", "Maintain eye contact", "Sit upright"] },
                        { num: "5", title: "Answer Effectively", items: ["Use the STAR method", "Situation - context", "Action - what you did", "Result - what happened"] },
                        { num: "6", title: "Avoid Mistakes", items: ["Don't lack preparation", "Avoid vague answers", "Stay confident", "Never speak negatively", "Ask questions"] },
                    ].map((section, i) => (
                        <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:bg-gray-900/70 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-[#EFBF04] rounded-lg flex items-center justify-center text-black font-bold">
                                    {section.num}
                                </div>
                                <h2 className="font-bold text-lg text-[#EFBF04]">{section.title}</h2>
                            </div>
                            <ul className="text-gray-300 space-y-2">
                                {section.items.map((item, j) => (
                                    <li key={j} className="flex items-start gap-2">
                                        <span className="text-[#EFBF04] mt-1">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8 hover:bg-gray-900/70 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-[#EFBF04] rounded-xl flex items-center justify-center text-black font-bold text-xl">
                            7
                        </div>
                        <h2 className="font-bold text-2xl text-[#EFBF04]">Questions You Should Ask the Interviewer</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            "What does success look like in this role?",
                            "What are the biggest challenges in this position?",
                            "What opportunities for growth are available?"
                        ].map((q, i) => (
                            <div key={i} className="flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                                <span className="text-[#EFBF04]">💬</span>
                                <span className="text-white font-medium">{q}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-400 mt-4">Asking questions shows interest and professionalism.</p>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-[#EFBF04] rounded-xl flex items-center justify-center text-black font-bold text-xl">
                            8
                        </div>
                        <h2 className="font-bold text-2xl text-[#EFBF04]">After the Interview</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#EFBF04]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">📧</div>
                            <h3 className="text-white font-bold mb-2">Follow Up</h3>
                            <p className="text-gray-400 text-sm">Send a thank-you message or email within 24 hours.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#EFBF04]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">🤔</div>
                            <h3 className="text-white font-bold mb-2">Reflect</h3>
                            <p className="text-gray-400 text-sm">Think about what went well and what you can improve.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#EFBF04]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">📈</div>
                            <h3 className="text-white font-bold mb-2">Keep Practicing</h3>
                            <p className="text-gray-400 text-sm">Every interview is a learning experience.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#EFBF04] rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-black mb-4">Final Tip: Practice Makes Perfect</h2>
                    <p className="text-black/80 text-lg mb-4">
                        The difference between candidates who succeed and those who fail is preparation and practice. The more you practice, the more confident and natural you become.
                    </p>
                    <p className="text-black font-bold text-xl">Start practicing interview questions today and improve your chances of getting hired!</p>
                </div>
            </div>
        </div>
        </>
    )
}
export default InterviewGuide;