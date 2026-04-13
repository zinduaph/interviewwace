import Content from "../components/content";
import Footer from "../components/footer";
import Hero from "../components/hero";
import Navbar from "../components/navbar";
import Preview from "../components/preview";


// This useEffect is for analzing the user behavior on home page
useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t.contentsquare.net/uxa/33f8d4a0c3ed3.js';
    script.async = true;
    document.head.appendChild(script);
}, []);

const Home = () => {
    return (
        <>
   
        <div className="bg-black min-h-screen">
            <Navbar />
            <Hero />
            <Content />
            <Preview />
            <Footer />
        </div>
        </>
    )
}
export default Home;