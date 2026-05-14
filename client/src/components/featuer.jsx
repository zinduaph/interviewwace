import { Mic, Stars } from "lucide-react"


const Feature = () => {
    return (
        <>
        <div className="">
            <h1 className="text-2xl flex items-center justify-center mb-4 text-[#EFBF04]">our most popular feature</h1>
           <div className="bg-black border p-8 rounded-md border-gray-700">
             <div className="flex flex-col gap-5 md:flex-row">
                <div className=" flex flex-col gap-3">
                    <Stars className="text-[#EFBF04]" size={40} />
                    <h1 className="text-gray-300 text-3xl">AI chat simulation</h1>
                    <p className="text-white text-normal">A full simulated interview in a chat format — just like the HireVue-style digital assessments now used by Safaricom, <br />
                         Equity Bank, and others. Practice answering under time pressure so you're not caught off guard on the real day.</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-md">
                    <div className="flex flex-col gap-2" >
                        <div className="flex gap-2">
                            <Mic className="text-[#EFBF04]" size={20}/>
                        <h1  className="text-white"> Chat Interview — Safaricom, Sales Role</h1>
                        </div>
                        <p className="font-bold text-white">"Tell me about a time you turned a difficult customer <br /> situation into a positive outcome."</p>
                        <input className="p-2 border text-white border-gray-300 rounded-md focus:outline-none"  type="text" placeholder="Type your answer here and get instant AI feedback..." />
                    </div>
                </div>
            </div>
           </div>
        </div>
        </>
    )
}
export default Feature;