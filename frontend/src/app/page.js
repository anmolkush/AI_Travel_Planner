import HeroSection from "@/components/home/HeroSection";
import TravelForm from "@/components/home/TravelForm";

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10 sm:py-14 animate-fade-in">
      <HeroSection />
      <TravelForm />
    </div>
  );
}
