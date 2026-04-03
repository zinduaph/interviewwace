import { BrainCircuit, Target, TrendingUp } from 'lucide-react';
import './content.css';

const Content = () => {
    const features = [
        {
            icon: <BrainCircuit size={23} />,
            title: "AI-Powered Questions",
            description: "Our advanced AI analyzes your target position to generate personalized interview questions that match exactly what employers are looking for."
        },
        {
            icon: <Target size={23} />,
            title: "Position-Specific Prep",
            description: "From software engineering to marketing — our AI adapts to any industry and role you're pursuing."
        },
        {
            icon: <TrendingUp size={23} />,
            title: "Track your progress",
            description: "Review your answers, get feedback, and watch your confidence grow with every practice session"
        }
    ];

    return (
        <div className="mt-10 px-4">
            <div className="text-center flex flex-col gap-2">
                <span className="text-[#EFBF04] text-2xl font-bold">features</span>
                <h1 className="text-3xl font-semibold md:text-6xl text-white">
                    why <span className="text-[#EFBF04]">interviewwace</span>?
                </h1>
                <h2 className="text-white">Everything you need to walk in prepared and walkout hired</h2>
            </div>

            <div className="flex flex-wrap mt-12 justify-center gap-6">
                {features.map((feature, index) => (
                    <div key={index} className="card">
                        <div className="content">
                            {/* Front - Icon and Title */}
                            <div className="front">
                                <div className="feature-icon">
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                            </div>

                            {/* Back - Description */}
                            <div className="back">
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Content;