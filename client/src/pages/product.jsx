import { BrainCircuit, Target, Zap, Shield, Clock, TrendingUp } from "lucide-react"
import Navbar from "../components/navbar"
import Footer from "../components/footer"

const Product = () => {
    const features = [
        {
            icon: <BrainCircuit size={28} />,
            title: "AI-Powered Questions",
            description: "Our advanced AI generates personalized interview questions based on your target role and industry."
        },
        {
            icon: <Target size={28} />,
            title: "Role-Specific Prep",
            description: "From software engineering to marketing - get questions tailored to your exact career path."
        },
        {
            icon: <Zap size={28} />,
            title: "Instant Feedback",
            description: "Receive real-time feedback on your responses with actionable tips to improve."
        },
        {
            icon: <Shield size={28} />,
            title: "Interview Confidence",
            description: "Practice as much as you want until you feel confident walking into any interview."
        },
        {
            icon: <Clock size={28} />,
            title: "24/7 Availability",
            description: "Practice anytime, anywhere. No scheduling needed - just start when you're ready."
        },
        {
            icon: <TrendingUp size={28} />,
            title: "Track Progress",
            description: "Monitor your improvement over time with detailed performance analytics."
        }
    ]

    const steps = [
        {
            number: "01",
            title: "Enter Your Target Role",
            description: "Tell us the position you're interviewing for - from entry-level to executive roles."
        },
        {
            number: "02",
            title: "AI Generates Questions",
            description: "Our AI analyzes thousands of real interview patterns to create relevant questions."
        },
        {
            number: "03",
            title: "Practice & Get Feedback",
            description: "Answer questions and receive instant feedback on how to improve your responses."
        },
        {
            number: "04",
            title: "Ace Your Interview",
            description: "Walk in confident and prepared to land your dream job."
        }
    ]

    return (
        <>
            <div className="bg-black min-h-screen">
                <Navbar />

                {/* Hero Section */}
                <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                    <span className="text-[#EFBF04] text-lg font-semibold uppercase tracking-wider">Our Product</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mt-2">Master Your <span className="text-[#EFBF04]">Interview</span> Skills</h1>
                    <p className="text-gray-300 text-base md:text-lg mt-4 max-w-2xl">
                        InterviewWace uses advanced AI to help you practice for interviews and land your dream job. 
                        Get personalized questions, instant feedback, and become interview-ready in no time.
                    </p>
                    <div className="flex gap-4 mt-8">
                        <a href="/pricing" className="bg-[#EFBF04] text-black font-semibold py-3 px-8 rounded-full hover:bg-[#d4a700] transition-colors duration-300">
                            Get Started
                        </a>
                        <a href="#how-it-works" className="border border-[#EFBF04] text-[#EFBF04] font-semibold py-3 px-8 rounded-full hover:bg-[#EFBF04] hover:text-black transition-colors duration-300">
                            Learn More
                        </a>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="px-4 py-12 max-w-6xl mx-auto">
                    <h2 className="text-2xl md:text-4xl font-bold text-white text-center mb-12">Why Choose <span className="text-[#EFBF04]">InterviewWace</span>?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-[#EFBF04] transition-colors duration-300">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#EFBF04] to-orange-500 rounded-lg flex items-center justify-center text-black mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How It Works */}
                <div id="how-it-works" className="px-4 py-12 bg-gray-900/30">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl md:text-4xl font-bold text-white text-center mb-4">How It <span className="text-[#EFBF04]">Works</span></h2>
                        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Get started in minutes with our simple 4-step process</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {steps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full border-2 border-[#EFBF04] flex items-center justify-center mb-4">
                                        <span className="text-2xl font-bold text-[#EFBF04]">{step.number}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                                    <p className="text-gray-400 text-sm">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tariji Promo Section */}
                <div className="px-4 py-16 max-w-4xl mx-auto">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-[#EFBF04] rounded-2xl p-8 md:p-12 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Want to Sell <span className="text-[#EFBF04]">Digital Products</span>?
                        </h2>
                        <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                            Check out Tariji - our sister platform for selling digital products. 
                            Create, sell, and grow your digital business with ease.
                        </p>
                        <a 
                            href="https://tariji.co.ke" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#EFBF04] text-black font-semibold py-3 px-8 rounded-full hover:bg-[#d4a700] transition-colors duration-300"
                        >
                            Visit Tariji
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="px-4 py-16 text-center">
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Ready to <span className="text-[#EFBF04]">Ace</span> Your Interview?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join thousands of graduates who have improved their interview skills with InterviewWace.</p>
                    <a href="/pricing" className="bg-[#EFBF04] text-black font-semibold py-4 px-10 rounded-full hover:bg-[#d4a700] transition-colors duration-300 text-lg">
                        Start Practicing Now
                    </a>
                </div>

                <Footer />
            </div>
        </>
    )
}

export default Product
