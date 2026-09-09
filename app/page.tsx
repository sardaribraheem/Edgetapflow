import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SolutionGrid from "@/components/SolutionGrid";
import UseCaseStory from "@/components/UseCaseStory";
import CustomCTA from "@/components/CustomCTA";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SolutionGrid />
        <UseCaseStory />
        <CustomCTA />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
