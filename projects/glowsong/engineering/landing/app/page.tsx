import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { StatsBar } from "./components/StatsBar";
import { PainSection } from "./components/PainSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { HowItWorks } from "./components/HowItWorks";
import { LatamSection } from "./components/LatamSection";
import { WaitlistSection } from "./components/WaitlistSection";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <PainSection />
        <FeaturesSection />
        <HowItWorks />
        <LatamSection />
        <WaitlistSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
