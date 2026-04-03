import { GraduationCap, Lightbulb, User2, Users2 } from "lucide-react"
import Navbar from "../components/navbar";
import Footer from "../components/footer";


const About = () => {
    return (
        <>
        <div className="bg-black min-h-screen">
            <Navbar />

            <div className="flex flex-col gap-4 items-center justify-center px-4 py-16 max-w-4xl mx-auto text-center">
                <span className="text-[#EFBF04] text-lg font-semibold uppercase tracking-wider">Our Story</span>
                <h1 className="text-3xl md:text-5xl font-bold text-white">Empowering Graduates to <span className="text-[#EFBF04]">Succeed</span></h1>
                <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl">
                    Interviewwace was born from a simple observation: talented graduates often struggle not because they lack skills, but because they lack practice with real interview scenarios. We built an AI-powered platform that changes that.
                </p>
            </div>

            <div className="flex flex-col mt-10 md:flex-row p-4 gap-6 md:justify-around">

                <div className="flex flex-col gap-3  w-70 md:w-100 border border-[#EFBF04] rounded-md p-5 ">
                    <GraduationCap size={24} className="text-[#EFBF04]"  />
                    <h1 className="text-[#EFBF04] text-2xl">Built for Graduates</h1>
                    <p className="text-white">We understand the unique challenges that fresh graduates face when entering the job market.</p>
                </div>
                <div className="flex flex-col gap-3 w-70 md:w-100 border border-[#EFBF04] rounded-md p-5">
                    <Lightbulb size={24} className="text-[#EFBF04]" />
                    <h1 className="text-[#EFBF04] text-2xl">AI that adapts </h1>
                    <p className="text-white">Our AI learns from thousands of real interview patterns to ask the most relevant questions.</p>
                </div>
                <div className="flex flex-col gap-3 w-70 md:w-100 border border-[#EFBF04] rounded-md p-5">
                    <Users2 size={24} className="text-[#EFBF04]" />
                    <h1 className="text-[#EFBF04] text-2xl">community Driven</h1>
                    <p className="text-white">Join a community of ambitious graduates who are committed to landing their dream roles.</p>
                </div>
            </div>

            <div className="m-auto border border-gray-300 mt-10 p-4 rounded-md w-80 md:w-170">
                <div className="flex flex-col gap-3">
                    <h2 className="text-2xl text-center text-white">our <span className="text-[#EFBF04]">mission</span></h2>
                    <p className="text-gray-300 text-center">To democratize interview preparation and ensure every graduate — regardless of background, <br />
                         network, or resources — has the tools to present their best self in any interview setting</p>

                         <div className="flex justify-center">
                            <button className="bg-[#EFBF04] w-40 md:w-60 text-black font-bold py-2 px-4 rounded-md hover:bg-[#d4a700] transition-colors duration-300">
                            start practicing
                         </button>
                         </div>
                </div>
            </div>
           <Footer />
        </div>
        </>
    )
}
export default About;