import { BrainCircuit, ChartBar, Target, TargetIcon, TrendingUp } from 'lucide-react';

const Content = () => {
    const features = [
        {
            icon: <TargetIcon size={23} />,
            title: "Enter your role & company",
            description: "Tell us what position you're applying for and which company — Safaricom, KCB, an NGO, a startup, anything. Our AI tailors every question to that exact context."
        },
        {
            icon: <ChartBar size={23} />,
            title: "Practice with real questions",
            description: "Get the actual questions Kenyan employers ask — competency-based, technical, and panel-style. Type your answers or use our chat interview format to simulate the real thing."
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
                <span className="text-[#EFBF04] text-2xl font-bold">How it works</span>
                <h1 className="text-3xl font-semibold md:text-6xl text-white">
                    From zero to interview ready <span className="text-[#EFBF04]">in three steps</span>!
                </h1>
                <h2 className="text-white">Everything you need to walk in prepared and walkout hired</h2>
            </div>

            <div className="flex flex-wrap mt-12 justify-center gap-6">
                {features.map((feature, index) => (
                    <div key={index} className="bg-black border border-[#EFBF04] rounded-lg p-6 text-center text-white max-w-sm">
                        <div className="mb-4 text-[#EFBF04]">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-300">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Content;