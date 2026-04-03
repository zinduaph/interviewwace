
import kenya from '../assets/kenyan.jpg'
import Footer from '../components/footer';
import Navbar from '../components/navbar';
const Stories = () => {
    return (
        <>
        <div className='bg-black min-h-screen'>
            <Navbar />

            <h1 className='text-3xl text-center mt-10 md:text-6xl text-[#EFBF04]'>Success stories</h1>

            <div className='flex flex-col md:flex-row justify-center m-auto w-80 md:w-170 border rounded-md border-[#EFBF04] p-4 shadow-md shadow-[#EFBF04]/70 mt-15 gap-3'>
                <div className=''>
                    <img src={kenya} className='w-70 object-cover rounded-md h-70' alt=" smilling person" />
                </div>
                <div>
                    <h1 className='text-2xl text-[#EFBF04]'>Here about jane's journey</h1>
                    <p className='text-gray-400 w-60 md:w-90'>"After I graduated from university, I had zero trainging in interview skills.
                        I was nervous and unprepared for my fist few interviews, and I kept getting rejected.
                        Then I found Interviewwace, and it was a game-changer. The AI interviewer was so realistic, and the feedback was incredibly helpful".
                    </p>
                    <button className='bg-[#EFBF04] hover:bg-[#EFBF04]/80 mt-2 hover:cursor-pointer font-bold text-black p-2 rounded-md w-40 '>join today</button>
                </div>
            </div>

            <div className='mt-10 text-center text-[#00B612] text-3xl md:text-4xl font-semiblod'>
                <p>Create your own success story today!</p>
            </div>
            <Footer />
        </div>
        </>
    )
}
export default Stories;