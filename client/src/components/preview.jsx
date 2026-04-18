import { Link } from 'react-router-dom';
import './button.css'
const Preview = () => {
    return (
        <>
        <div className="mt-20">

         <div className="text-center w-90 md:w-full p-4">
                      <h1 className="text-gray-300 text-2xl font-semibold">Get to hear real stories from our graduates of how <span className="text-[#EFBF04] text-3xl">interviewwace</span> helped <br />
                them change their lives and land their dream jobs.
                 From overcoming interview anxiety to acing tough questions, <br />
                  these testimonials showcase the transformative power of our platform in boosting confidence and securing career success.
            </h1>
        </div>
        
        <div className=" m-auto flex  justify-center mt-4">
         <Link to='/completeInterviewGuide'>
         <button className="bg-[#EFBF04] shadow-lg shadow-[#EFBF04]/80 w-40 md:w-70 text-black text-center font-bold py-2 px-4 rounded hover:bg-[#d4a700] glow-button">
            Interview guide
        </button>
         </Link>

        </div>
 
        </div>
        </>
    )
}
export default Preview;