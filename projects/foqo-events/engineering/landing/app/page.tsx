import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ProblemSection } from "./components/ProblemSection";
import { HowItWorks } from "./components/HowItWorks";
import { PersonalizationSection } from "./components/PersonalizationSection";
import { AnticipationSection } from "./components/AnticipationSection";
import { WaitlistSection } from "./components/WaitlistSection";
import { Footer } from "./components/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <PersonalizationSection />
        <AnticipationSection />
        <WaitlistSection />
      </main>
      <Footer />
    </>
  );
}
