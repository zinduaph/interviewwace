

import { useState, useEffect } from 'react';
import wace from '../assets/wace-2.png';
import { useAuth, UserButton, SignInButton } from '@clerk/react';
import { Link } from 'react-router-dom';
const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isSignedIn, userId } = useAuth();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navLinks = ['Product', 'Stories', 'Pricing', 'about', 'Dashboard'];
    
    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border border-gray-200 mx-4 mt-4 rounded-full text-[#EFBF04] shadow-lg shadow-[#EFBF04]/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                       <Link to='/'><img src={wace} width={70} height={60} alt="wace logo" /> </Link> 

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link key={link} to={link === 'Dashboard' ? '/dashboard' : `/${link.toLowerCase()}`} className="relative overflow-hidden h-6 group text-sm  font-medium text-white hover:text-[#EFBF04] transition-colors">
                                    <span className="block group-hover:-translate-y-full transition-transform duration-300">{link}</span>
                                    <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300 text-[#EFBF04]">{link}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            {isSignedIn ? (
                                <>
                                    <UserButton 
                                        afterSignOutUrl="/"
                                        appearance={{
                                            elements: {
                                                avatarBox: "w-9 h-9"
                                            }
                                        }}
                                        
                                    />
                                </>
                            ) : (
                                <>
                                    <SignInButton mode="modal">
                                        <button className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer">
                                            Sign In
                                        </button>
                                    </SignInButton>
                                    <button className="bg-white hover:shadow-[0px_0px_30px_14px] shadow-[0px_0px_30px_7px] hover:shadow-white/50 shadow-white/50 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition duration-300">
                                        Get Started
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button 
                            id="menuToggle" 
                            className="md:hidden text-white p-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div 
                    id="mobileMenu" 
                    className={`md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-t border-slate-800 rounded-b-3xl transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className="px-4 py-6 space-y-4  flex flex-col items-center">
                        {navLinks.map((link) => (
                            <Link 
                                key={link} 
                                to={link === 'Dashboard' ? '/dashboard' : `/${link.toLowerCase()}`}
                                className="hover:text-indigo-400 text-[#EFBF04] text-base font-medium transition-colors" 
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link}
                            </Link>
                        ))}
                        <div className="pt-4 flex flex-col gap-3 w-full max-w-xs">
                            {isSignedIn ? (
                                <UserButton 
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-9 h-9"
                                        }
                                    }}
                                />
                            ) : (
                                <>
                                    <SignInButton mode="modal">
                                        <button 
                                            className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-medium transition w-full cursor-pointer"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Sign In
                                        </button>
                                    </SignInButton>
                                    <button 
                                        className="bg-white hover:shadow-[0px_0px_30px_14px] shadow-[0px_0px_30px_7px] hover:shadow-white/50 shadow-white/50 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition duration-300 w-full"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Get Started
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            {/* Spacer to prevent content from being hidden behind fixed navbar */}
            <div className="h-20"></div>
        </>
    )
}
export default Navbar;