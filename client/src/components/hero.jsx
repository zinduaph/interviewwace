

import './hero.css';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/react';
import { toast } from 'react-hot-toast';
import { backendUrl } from '../App.jsx';
import main from '../assets/Hero.webp'

const Hero = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const [showPopup, setShowPopup] = useState(false);
    const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const checkTermAcceptance = async () => {
                try {
                    const response = await fetch(`${backendUrl}/api/users/accepted/${user.id}`);
                    const data = await response.json();
                    if (data.message === 'User has accepted terms') {
                        setHasAcceptedTerms(true);
                    } else {
                        setShowPopup(true);
                    }
                } catch (error) {
                    console.error('Error checking term acceptance:', error);
                    toast.error('Unable to check privacy preferences. Please try again later.');
                }
            }
            checkTermAcceptance();
        }
    }, [isLoaded, isSignedIn, user, backendUrl]);

    const acceptTerms = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${backendUrl}/api/users/dataprotection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clerkId: user.id }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Unable to save privacy preference');
            }

            setHasAcceptedTerms(true);
            setShowPopup(false);
            toast.success('Privacy preference saved.');
        } catch (error) {
            console.error('Error accepting terms:', error);
            toast.error('Unable to save your preference. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
        <div className="relative min-h-screen flex items-center mt-3 justify-center overflow-hidden">
            {/* Animated Pattern Background */}
            <div className="hero-pattern"></div>
            {/* Gradient Overlay for text readability */}
            <div className="hero-overlay"></div>
            
            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center m-auto gap-4 px-4">
                

                <div className='flex flex-col gap-5 md:gap-4 md:flex-row'>
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

            {showPopup && !hasAcceptedTerms && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="privacy-dialog-title"
                        className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#111111] p-6 text-left shadow-2xl shadow-black/60 sm:p-8"
                    >
                        <div className="mb-6 flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFBF04]/15 text-[#EFBF04]">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 4.4 2.9 8.4 7 10 4.1-1.6 7-5.6 7-10V6l-7-3Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9.5 12 1.7 1.7 3.5-3.5" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#EFBF04]">Your privacy matters</p>
                                <h2 id="privacy-dialog-title" className="mt-2 text-2xl font-semibold tracking-tight text-white">Data protection notice</h2>
                            </div>
                        </div>

                        <p className="text-sm leading-7 text-slate-300 sm:text-base">
                            InterviewWace collects and uses information such as your email and interview responses to provide personalised practice, AI feedback, and account services.
                        </p>
                        <p className="mt-4 text-sm leading-7 text-slate-400">
                            By continuing, you confirm that you have read and agree to our{' '}
                            <Link to="/data-protection" className="font-semibold text-[#EFBF04] underline decoration-[#EFBF04]/50 underline-offset-4 hover:text-white">
                                Data Protection & Privacy page
                            </Link>.
                        </p>

                        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowPopup(false)}
                                className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/40 hover:text-white"
                            >
                                Decide later
                            </button>
                            <button
                                type="button"
                                onClick={acceptTerms}
                                disabled={isSubmitting}
                                className="rounded-lg bg-[#EFBF04] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#d4a900] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Saving preference...' : 'Accept and continue'}
                            </button>
                        </div>
                    </section>
                </div>
            )}

        </div>
        </>
    )
}
export default Hero;