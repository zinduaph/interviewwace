import { Link } from 'react-router-dom';
import './button.css'
import growth from "../assets/download (2).webp"
const Preview = () => {
    const Testimonils = [
        {
            name:'grace wanjiku',
            story:'"I had a Safaricom interview in two days and had no idea how to answer competency questions. I practised on InterviewWace for three hours and walked in completely different. I got the job."',
            school:'university of nairobi',
            job:'safaricom'
        },
        {
            name:'Brian M',
            story:'"The technical interview practice is unlike anything else I found. I was applying for a data analyst role at KCB and the questions were exactly the type they asked. The AI feedback helped me structure my answers properly.',
            school: 'strathmore university',
            job:'KCB'
        }, {
            name:'Alice N',
            story:'"I kept failing at the interview stage even though I had good grades. After two weeks practising on InterviewWace I understood what I was doing wrong. Now I have an offer from an NGO in Nairobi."',
            school:'kenyatta university',
            job :'NGO'
        }
    ]
    return (
        <>
        <div className="mt-20">

         <div className="text-center w-90 md:w-full p-4">
            <h1 className='text-[#EFBF04] text-2xl font-bold'>Real stories</h1>
                      <h1 className="text-gray-300 text-2xl font-semibold">from our users who landed their dream jobs with our help
                
            </h1>
        </div>
        <div className='flex flex-col md:flex-row justify-between'>
          {Testimonils.map((testimonl, index) => (
            <div key={index} className="bg-gray-900 rounded-lg p-6 m-4 w-90 md:w-80 mx-auto">
                <p className='text-white font-normal'>{testimonl.story}</p>
                <div className='flex justify-between mt-3'>
                    <div>
                        <h1 className='text-white font-bold'>{testimonl.name}</h1>
                        <h2 className='text-gray-300'>{testimonl.school}</h2>
                    </div>
                    <div>
                        <p className='text-green-400'>{testimonl.job}</p>
                    </div>
                </div>

            </div>
          ))}
        </div>
        
        <div className=" m-auto flex  justify-center mt-4">
         <Link to='/completeInterviewGuide'>
         <button className="bg-[#EFBF04] shadow-lg shadow-[#EFBF04]/80 w-40 md:w-70 text-black text-center font-bold py-2 px-4 rounded hover:bg-[#d4a700] glow-button">
            Interview guide
        </button>
         </Link>

        </div>




        <div className='flex flex-col border border-gray-500 p-6 w-100 md:w-250 m-auto rounded-sm md:flex-row gap-3 justify-center mt-25'>
            <div>
                <img src={growth} className='rounded-md' width={250} alt="" />
            </div>

            <div className=''>
                <h1 className='text-gray-500 mt-4 font-semibold text-3xl md:text-4xl'>Plant you <span  className='text-[#EFBF04]'>career seed</span> today!</h1>
                <p className='text-white mt-3 text-lg'>Passing job interviews made easy by <span className='text-[#EFBF04]'>interviewwace</span></p>
            </div>
        </div>
                      <div className='mt-6 flex justify-center'>
                          <Link to='/interview'>    <button className='bg-[#EFBF04] w-40 md:w-60 text-black p-2 font-semibold rounded-md hover:cursor-pointer'>start practicing</button></Link>
                        </div>  
        </div>
        </>
    )
}
export default Preview;