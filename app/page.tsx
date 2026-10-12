import Navbar from "@/components/Navbar";
import HowToOrder from "@/components/HowToOrder";
import Hero from "@/components/Hero";
import SolutionGrid from "@/components/SolutionGrid";
import UseCaseStory from "@/components/UseCaseStory";
import CustomCTA from "@/components/CustomCTA";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export const metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <SolutionGrid />
        <UseCaseStory />
        <HowToOrder />
        <CustomCTA />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
