import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SolutionGrid from "@/components/SolutionGrid";
import UseCaseStory from "@/components/UseCaseStory";
import CardArtworkWarmup from "@/components/CardArtworkWarmup";
import CustomCTA from "@/components/CustomCTA";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

import { publicPageMetadata, SITE_DESCRIPTION, organizationGraph } from '@/lib/seo';
export const metadata = publicPageMetadata('/', 'NFC Business Cards in Lahore, Pakistan', SITE_DESCRIPTION);

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organizationGraph).replace(/</g, "\\u003c")}}/>
      <Navbar />
      <CardArtworkWarmup />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <SolutionGrid />
        <UseCaseStory />
        <CustomCTA />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer showIconCredit />
    </>
  );
}
