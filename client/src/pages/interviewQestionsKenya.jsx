

import { Helmet } from "react-helmet";

const InterviewQuestionsKenya = () => {
    return(
        <>
        <Helmet>
            <title>Interview Questions in Kenya | Interviewwace</title>
            <meta name="description" content="Top interview questions in Kenya and how to answer them." />
        </Helmet>
        <div className="p-8 ">
          
          <h1 className="text-3xl mt-3 mb-2  font-semibold">Top Interview questions in kenya</h1>

        <div className="flex flex-col gap-4">
            <div>
                <h2 className="text-3xl font-semi-bold text-[#EFBF04]">1. Can you tell us about yourself and your background?</h2>
            <p>This question is often asked at the beginning of an interview to get to know the candidate better. It allows you to highlight your relevant experience, skills, and achievements that make you a strong fit for the position.</p>
            </div>


            <div>
                <h2 className="text-3xl font-semi-bold text-[#EFBF04]">2. Why do you want to work for our company?</h2>
            <p>This question assesses your motivation and interest in the company. It’s an opportunity to demonstrate that you’ve researched the company and understand its values, culture, and goals.</p>
            </div>
            <div>
                <h2 className="text-3xl font-semi-bold text-[#EFBF04]">3. What are your strengths and weaknesses?</h2>
                <p>This question helps the interviewer understand your self-awareness and ability to reflect on your performance. It’s important to provide honest and constructive answers that show you can identify areas for improvement.</p>
            </div>

           <div>
             <h2 className="text-3xl font-semi-bold text-[#EFBF04]">4. Can you describe a challenging situation you faced at work and how you handled it?</h2>
            <p>This question evaluates your problem-solving skills and ability to manage difficult circumstances. It’s an opportunity to showcase your resilience, communication skills, and decision-making abilities.</p>
           </div>
            <div>
                <h2 className="text-3xl font-semi-bold text-[#EFBF04]">5. Where do you see yourself in five years?</h2>
                <p>This question helps the interviewer understand your career aspirations and long-term goals. It’s an opportunity to demonstrate your ambition and how the position fits into your career trajectory.</p>
            </div>

            <div>
                <h2 className="text-3xl font-semi-bold text-[#EFBF04]">6. Do you have any questions for us?</h2>
            <p>This question gives you the chance to ask about the company, the role, or the team. It shows your interest and engagement in the position.</p>
            </div>

            <div className="">
                <a href="http://interviewwace.com" target="_blank" rel="noopener noreferrer">
                    <button className="bg-[#EFBF04] text-black font-bold py-2 px-4 rounded hover:bg-[#d4a700]">
                        Learn more
                    </button>
                </a>
            </div>
        </div>

        </div>
        </>
    )
}

export default InterviewQuestionsKenya;