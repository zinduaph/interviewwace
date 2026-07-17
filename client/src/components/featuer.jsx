import { Mic, Stars } from "lucide-react"
import chat from "../assets/AIchat.webp"

const Feature = () => {
    return (
        <>
        <div className=" mt-30">
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center justify-center mb-4 text-[#EFBF04]">our most popular feature</h1>
           <div className="bg-black border p-8 rounded-md border-gray-700">
             <div className="flex flex-col gap-5 md:flex-row">
                <div>
                    <img src={chat} className="rounded-md" width={400} alt="" />
                </div>
                <div className=" flex flex-col gap-3">
                    <Stars className="text-[#EFBF04]" size={40} />
                    <h1 className="text-gray-300 text-3xl">AI chat simulation</h1>
                    <p className="text-white text-normal">A full simulated interview in a chat format — just like the HireVue-style digital assessments now used by Safaricom, <br />
                         Equity Bank, and others. Practice answering under time pressure so you're not caught off guard on the real day.</p>
                </div>
                
            </div>
           </div>
        </div>
        </>
    )
}
export default Feature;