import Content from "../components/content";
import Footer from "../components/footer";
import Hero from "../components/hero";
import Navbar from "../components/navbar";
import Preview from "../components/preview";

// This useEffect is for analzing the user behavior on home page


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