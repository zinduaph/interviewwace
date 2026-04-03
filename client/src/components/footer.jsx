import { Github, Instagram, Linkedin } from 'lucide-react';
import wace from '../assets/wace-2.png';

const Footer = () => {
    return (
        <>
        <div className='mt-25 p-6'>

            <div className="flex flex-col md:flex-row p-4 gap-6 md:justify-around">
              <div>
                  <p className="text-[#EFBF04] text-2xl md:text-4xl font-semibold">10K+</p>
                  <span className="text-gray-300">Graduates</span>
              </div>
                <div>
                    <p className="text-[#EFBF04] text-2xl md:text-4xl font-semibold">97%</p>
                    <span className="text-gray-300">success rate</span>
                </div>
                <div>
                    <p className="text-[#EFBF04] text-2xl md:text-4xl font-semibold">500+</p>
                    <span className="text-gray-300">Roles covered</span>
                </div>
                <div>
                    <p className="text-[#EFBF04] text-2xl md:text-4xl font-semibold">4.9 ⭐</p>
                    <span className="text-gray-300">Rating</span>
                </div>
            </div>
            
            <div className='flex flex-col mt-10 md:flex-row p-4  gap-6 md:gap-40 '>
                <div>
                    <img src={wace} alt="wace logo" width={70} height={60} />
                </div>
                <div>
                    <h1 className='text-2xl text-[#EFBF04]'>wace</h1>
                    <p className='text-gray-300 font-semibold'>Home</p>
                    <p className='text-gray-300 font-semibold'>Support</p>
                    <p className='text-gray-300 font-semibold'>Contact</p>
                </div>
                <div>
                    <h1 className='text-2xl text-[#EFBF04]'>Contact</h1>
                    <p className='text-gray-300 font-semibold'>tajirindirangu@gmail.com</p>
                    <p className='text-gray-300 font-semibold'>+254 746508463</p>
                </div>
                <div>
                    <h1 className='text-2xl text-[#EFBF04]'>follow us</h1>
                    <div className='flex flex-col gap-3 mt-2 md:flex-row'>
                    <Github size={24} className='text-[#EFBF04]'/>
                    <Linkedin size={24} className='text-[#EFBF04]'/>
                    <Instagram size={24} className='text-[#EFBF04]'/>
                    </div>
                    
                </div>
            </div>
            <p className='text-gray-300 text-center p-4'>© {new Date().getFullYear()} wace. All rights reserved.WAJINDIRA INVESTMENT LIMITED</p>
        </div>
        </>
    )
}
export default Footer;