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
            'Basic':'basic',
            'standard': 'standard',
            'premium': 'premium'
        }
        const planName = planMap[selectedPlan?.name] || 'basic'
        const response = await axios.post(`${backendUrl}/api/payment/initiate`,{
            clerkId:user.id,
            phoneNumber:phone,
            plan:planName
        })

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
    const pricingPlans = [
        {
            name: 'Basic',
            price: 'ksh25',
            features: [
                '2 interview session',
                'specific questions for the role you are applying for',
                'feedback on your answers',

            ],
            
        }, {
            name: 'standard',
            price: 'ksh30',
            features: [
                '3 mock interview sessions with our advanced AI interviewer',
                'specific qusestion for the role you are applying for',
                'detailed feedback on your performance',
                'tips and resources to improve your interview skills'

            ]
        }, {
            name: 'premium',
            price: 'ksh50',
            features: [
                ' 6 mock interview sessions with our advanced AI interviewer.',
                 'specific qusestion for the role you are applying for.',
                'detailed feedback on your performance.',
                'tips and resources to improve your interview skills.',
                'priority support and access to exclusive content.'
            ]
        } ,{
            name: 'Bulk [not available yet]',
            price: 'ksh499',
            features: [
                "10 mock interview sessions with our advanced AI interviewer.",
                'specific qusestion for the role you are applying for.',
                'detailed feedback on your performance.',
                'tips and resources to improve your interview skills.',
                'priority support and access to exclusive content.',
                'Track the progress of multiple users and manage their interview preparation in one place.'

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

            <p className="mt-15 text-center text-gray-300 text-3xl md:text-4xl">Our pricing plans are designed to meet your <span className="text-[#EFBF04] font-bold">needs</span> and <span className="text-[#EFBF04] font-bold">budget</span></p>
                {paymentStatus && (
                    <div className="mt-4 text-center">
                        <p className={`text-lg font-semibold ${paymentStatus.status === 'success' ? 'text-green-400' : paymentStatus.status === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {paymentStatus.message}
                        </p>
                    </div>
                )}
            <div className="grid grid-cols-1 mt-15 md:grid-cols-4 gap-3 p-2 md:gap-4 justify-around">
                {pricingPlans.map((plan, index) => (
                    <div key={index} className="border border-gray-300 rounded-md w-60 md:w-70 flex flex-col gap-3 p-4">
                        <h3 className="text-3xl text-[#EFBF04]">{plan.name}</h3>
                        <p className="text-white text-2xl font-semibold">{plan.price}</p>
                        <ul className="list-disc list-inside space-y-2">
                            {plan.features.map((feature, featureIndex) => (
                                <li className="text-gray-300 text-sm" key={featureIndex}>{feature}</li>
                            ))}
                        </ul>
                        <button onClick={() => { setSelectedPlan(plan); setPayModel(true); }} className="bg-[#EFBF04] cursor-pointer text-black font-bold py-2 px-4 rounded-md hover:bg-[#d4a700]">
                            Choose Plan
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
                                    <p>1. you will receive a confirmation email on your payment</p>
                                    <p>2. based on your plan selection, you will be granted access to the selected features and benefits</p>
                                    <p>3. you can start using our services and enjoy the benefits of your chosen plan</p>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-2">
                             <button onClick={handlePaystackPayment} className="p-2 text-white bg-[#FEBF04] rounded-md">
                                {loading ? ('processing') :( selectedPlan ? `Pay ${selectedPlan.price}` : 'No plan selected') }
                             </button>
                             <button className="bg-gray-800 text-white p-2 rounded-md text-2xl">
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