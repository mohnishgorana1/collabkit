import BackgroundAura from "@/components/home/BackgroundAura";
import HeroSection from "@/components/home/HeroSection";
import MacOsMockup from "@/components/home/MacOsMockup";
import LogoMarquee from "@/components/home/LogoMarquee";
import BentoGrid from "@/components/home/BentoGrid";
import VerticalTimeline from "@/components/home/VerticalTimeline";
import FeatureCarousel from "@/components/home/FeatureCarousel";
import CtaSection from "@/components/home/CtaSEction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full overflow-hidden relative">
      {/* <BackgroundAura /> */}
      {/* <HeroSection /> */}
      <MacOsMockup />
      {/* <LogoMarquee /> */}
      {/* <BentoGrid /> */}
      {/* <VerticalTimeline /> */}
      {/* <FeatureCarousel /> */}
      <CtaSection />

      <Footer />
    </div>
  );
}