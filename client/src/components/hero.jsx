

import './hero.css';
import { Link } from 'react-router-dom';
const Hero = () => {
    return (
        <>
        <div className="relative min-h-screen flex items-center mt-3 justify-center overflow-hidden">
            {/* Animated Pattern Background */}
            <div className="hero-pattern"></div>
            {/* Gradient Overlay for text readability */}
            <div className="hero-overlay"></div>
            
            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center m-auto gap-4 px-4">
                <div className="border flex justify-center items-center w-60 md:w-80 border-gray-200 rounded-full p-2">
                  <h1 className=" text-[#EFBF04] text-sm md:text-base">AI powered interview preparation</h1>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-bold text-white text-center">Ace your next <span className="text-[#EFBF04]">interview</span> with confidence</h2>

                <p className="text-gray-300 text-center max-w-lg  md:text-base">Enter the position you're interviewing for and let our AI generate tailored questions to help you prepare.
                     Built for graduates ready to land their dream role.</p>

                     <div className='flex flex-col md:flex-row gap-2'>
            <Link to='/pricing'>    <button className='bg-[#EFBF04] w-40 md:w-60 text-black p-2 font-semibold rounded-md hover:cursor-pointer'>start practicing</button></Link>
                 <Link to='/demo'><button className='bg-transparent w-40 md:w-60 border-2 border-[#EFBF04] p-2 text-[#EFBF04] hover:bg-[#EFBF04] hover:text-black'>Try demo</button></Link>
            </div>

            </div>

            

        </div>
        </>
    )
}
export default Hero;