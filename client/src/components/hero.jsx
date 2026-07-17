

import './hero.css';
import { Link } from 'react-router-dom';
import main from '../assets/Hero.webp'
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
                

                <div className='flex flex-col gap-3 md:flex-row'>
                    <div> <img src={main} className='rounded-md' width={400} alt="" /></div>

                    <div className='mt-4'>
                        <h2 className="text-3xl md:text-5xl font-bold text-white text-center">practice interviews. <br /> <span className='text-[#EFBF04]'>Land the job</span></h2>
                    </div>
                </div>
                
                

                <p className="text-gray-300 text-lg text-relaxed text-center mt-4 max-w-lg ">The only interview prep platform built for <span className='font-bold'>kenyan graduates and job seekers </span>.practice real questions asked by 
                    safaricom,equity, KCB bank,NGOs and more- with insatnt AI feedback.free to start
                
                    .</p>

                     <div className='flex flex-col md:flex-row gap-2'>
            <Link to='/interview'>    <button className='bg-[#EFBF04] w-40 md:w-60 text-black p-2 font-semibold rounded-md hover:cursor-pointer'>start practicing</button></Link>
                 <Link to='/demo'><button className='bg-transparent w-40 md:w-60 border-1 rounded-md border-[#EFBF04] p-2 text-[#EFBF04] hover:bg-[#EFBF04] hover:text-black'>Try demo</button></Link>
            </div>

            </div>

            

        </div>
        </>
    )
}
export default Hero;