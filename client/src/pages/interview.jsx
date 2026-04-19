import { useState } from "react"
import Footer from "../components/footer"
import Navbar from "../components/navbar"
import { X } from "lucide-react"
import { useUser } from "@clerk/react"
import axios from "axios"
import { backendUrl } from "../App"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"




const Pricing = () => {
const [payModel,setPayModel] = useState(false)
const [selectedPlan,setSelectedPlan] = useState(null)
const [loading,setLoading] = useState(null)
const [phone,setPhone] =useState('')
const {user} = useUser()
const navigate = useNavigate('')
const [paymentStatus,setPayMentStatus] = useState(null)

// This function is to initiate payment in according to what the user has paid for
const submitPhone = async (e) => {
    e.preventDefault()
    setLoading(true)

    if(!user){
        toast.error('please sign in first')
        return;
    }
    
    try {
        const planMap = {
            'count down interview':'count down interview',
            'chat interview': 'chat interview',
            'mock interview': 'mock interview'
        }
        const planName = planMap[selectedPlan?.name] || 'count down interview'
       

        if (response.data.success){
            toast.success('check your phone for m-pesa prompt')
            setPayModel(false)
            setPayMentStatus({
                status: 'pending',
                message: 'Please check your phone and enter your M-Pesa PIN',
                paymentId: response.data.paymentId
            })
            // the polling here to check for payment
            polling(response.data.paymentId)

           toast.success('M-Pesa prompt sent! Check your phone.');
            
        } else {
            toast.error(response.data.message || 'Failed to initiate payment');
        }
    } catch (error) {
        console.log(error)
        toast.error('Mpesa payment failed')
    } finally {
        setLoading(null)
    }
}
    // this will recive the confarmation on the backend if the user's payment was succesfull
   const polling = (paymentId) => {
     const maxAttempt = 30
     let attempts = 0
    
     const checkStatus = async () => {
        attempts++ ;
        try {
            const response = await axios.get(`${backendUrl}/api/payment/status/${paymentId}` )
            const data = await response.data
            setLoading(true)

            if(data.status === 'completed') {
               setPayMentStatus({
                status: 'success',
                        message: 'Payment successful! you will be redirected to the interviewPage.',
                        mpesaReceipt: data.mpesaReceipt
               })
               toast.success('payment successful interview starts in a few minutes')
               setLoading(false)
               navigate('/interviewPage',{
                state:{paymentId,plan:response.data.plan}
               })
            } else if (attempts < maxAttempt) {
                    setTimeout(checkStatus, 5000); // Check every 5 seconds
            
                }
             
        } catch (error) {
            // if error occurs during polling, we should stop polling and show an error message
                if (attempts >= maxAttempt) {
                    setPayMentStatus({
                        status: 'error',
                        message: 'Payment status check timed out. Please contact support.'
                    });
        } else  {
            setTimeout(checkStatus, 5000);
        }
        }
     }
     // give the user some time to enter the pins
     setTimeout(checkStatus,5000)
   }

   const freeInterview = () => {
    if(!user){
        toast.error('please sign in first')
        return;
    }
    const planMap = {
            'count down interview':'count down interview',
            'chat interview': 'chat interview',
            'mock interview': 'mock interview'
        }
    const planName = planMap[selectedPlan?.name] || 'count down interview' 
    navigate('/interviewPage', {
        state: {plan: planName}
    })
   }
    const pricingPlans = [
        {
            name: 'count down interview',
            price: 'Benefites',
            features: [
                "1.Help you to know to answer questions under pressure",
                "2. Help's you to improve your time management skills during interviews",
                "3. Boost your confidence and reduce anxiety by simulating real interview conditions",


            ],
            
        }, {
            name: 'chat interview',
            price: 'Benefites',
            features: [
                "1. Emulate real interview scenarios to help you practice and improve your interview skills.",
                "2. Provide instant feedback on your responses, helping you identify areas for improvement and build confidence.",
                 "3. chat interview emulates a recruiter asking you questions in a conversational manner, allowing you to practice your communication skills and adapt to different interview styles.",
                 "4. chat interview provide a safe and supportive enviroment for you to practice and refine your interview skills "
            ]
        }, {
            name: 'mock interview [not available yet]',
            price: 'ksh50',
            features: [
                ' 6 mock interview sessions with our advanced AI interviewer.',
                 'specific qusestion for the role you are applying for.',
                'detailed feedback on your performance.',
                'tips and resources to improve your interview skills.',
                'priority support and access to exclusive content.'
            ]
        } 
    ]
    {/** this is the paystack patment function */}

 const handlePaystackPayment = async (e) => {
     e.preventDefault()
     if(!user){
         toast.error('please sign in first')
         return;
     }
     try {
         // Convert price to kobo (multiply by 100) and remove non-numeric chars
         const priceValue = parseInt(selectedPlan.price.replace(/[^0-9]/g, '')) * 100;
         
         // Get user email - Clerk provides email in different possible locations
         const userEmail = user.emailAddresses?.[0]?.emailAddress || user.primaryEmailAddress?.emailAddress || user.email;
         
         console.log('User data for Paystack:', { 
             email: userEmail, 
             clerkId: user.id, 
             fullName: user.fullName,
             allEmails: user.emailAddresses 
         });
         
         if (!userEmail) {
             toast.error('Email not found. Please update your profile.');
             return;
         }
         
         const res = await fetch(`${backendUrl}/api/payment/paystack/init`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ 
                clerkId:user.id,
                 email: userEmail, 
                 amount: priceValue, 
                 plan: selectedPlan.name.toLowerCase() 
             })
         });
         console.log(res)
         const data = await res.json();
         if (data.authorizationUrl) {
             // Store paymentId for later use
             if (data.paymentId) {
                 sessionStorage.setItem('paymentId', data.paymentId);
             }
             window.location.href = data.authorizationUrl;
         } else {
             toast.error(data.error || data.message || 'Failed to initialize payment');
         }
     } catch (error) {
         console.log(error)
         toast.error('Paystack payment failed')
     }
 };




    return (
        <>
        <div className="bg-black min-h-screen">
            <Navbar/>

            <p className="mt-15 text-center text-gray-300 text-3xl md:text-4xl">Choose the interview scenario that best fits your <span className="text-[#EFBF04] font-bold">needs</span> and <span className="text-[#EFBF04] font-bold">goals</span></p>
                {paymentStatus && (
                    <div className="mt-4 text-center">
                        <p className={`text-lg font-semibold ${paymentStatus.status === 'success' ? 'text-green-400' : paymentStatus.status === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {paymentStatus.message}
                        </p>
                    </div>
                )}
            <div className="grid grid-cols-1 mt-15 md:grid-cols-3 gap-3 p-5 md:gap-4 justify-around">
                {pricingPlans.map((plan, index) => (
                    <div key={index} className="border border-gray-700 bg-gray-800/50 rounded-md w-60 md:w-90 flex flex-col gap-3 p-6 shadow-[#EFBF04]/50 shadow-md">
                        <h3 className="text-3xl text-[#EFBF04]">{plan.name}</h3>
                        <p className="text-white text-2xl font-semibold">{plan.price}</p>
                        <ul className="list-disc list-inside space-y-2">
                            {plan.features.map((feature, featureIndex) => (
                                <li className="text-gray-300 text-sm" key={featureIndex}>{feature}</li>
                            ))}
                        </ul>
                        <button onClick={() => { setSelectedPlan(plan); setPayModel(true); }} className="bg-[#EFBF04] cursor-pointer text-black font-bold py-2 px-4 rounded-md hover:bg-[#d4a700]">
                            Get started
                        </button>
                    </div>
                ))}

                {payModel&&(
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-black border-2 border-[#EFBF04] rounded-lg p-8 max-w-md w-80 mt-15 md:mt-5 md:w-full relative">
                            <button onClick={() => setPayModel(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                                <X size={24}/>
                            </button>

                            <h1 className="text-3xl text-[#EFBF04] font-semibold">complete your plan</h1>

                            <p className="text-2xl text-gray-200 font-bold">
                                {selectedPlan ? `${selectedPlan.name} - ${selectedPlan.price}` : 'No plan selected' }
                            </p>

                            <form >
                               <div className="mb-6">
                                 
                                

                               
                               
                               </div>

                               <div >
                                <p className="text-gray-400 text-sm mb-2">
                                    <strong className="text-white">what happens next?</strong>
                                </p>
                                <ul className="text-gray-400 font-semibold text-sm space-y-1 mb-4">
                                    <li>you will be granted access to the selected features and benefits interview</li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-2">
                             <button type="button" onClick={freeInterview} className="p-2 text-white bg-[#FEBF04] hover:cursor-pointer rounded-md">
                                {loading ? ('processing') :( selectedPlan ? ` ${selectedPlan.name}` : 'No plan selected') }
                             </button>
<button type="button" onClick={() => setPayModel(false)} className="bg-gray-800 text-white p-2 rounded-md text-2xl">
                                 cancel
                             </button>
                            </div>
                            </form>

                        </div>

                    </div>
                )}
            </div>
            <Footer />
        </div>
        </>
    )
}
export default Pricing